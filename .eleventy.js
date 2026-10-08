module.exports = function (eleventyConfig) {
  // Do not publish the images README as a page
  eleventyConfig.ignores.add("src/images/README.md");

  // Static passthroughs
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");

  // Human readable date filter, e.g. "Fri 2 Oct 2026"
  eleventyConfig.addFilter("humanDate", (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate + "T00:00:00");
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  });

  eleventyConfig.addFilter("shortDate", (isoDate) => {
    if (!isoDate) return "";
    const d = new Date(isoDate + "T00:00:00");
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  });

  // Find one item in an array by a field value, e.g. events | findBy("slug", pinnedEvent)
  eleventyConfig.addFilter("json", (obj) => JSON.stringify(obj));

  eleventyConfig.addFilter("filterBy", (arr, field, value) =>
    (arr || []).filter((item) => item[field] === value)
  );

  eleventyConfig.addFilter("findBy", (arr, field, value) =>
    (arr || []).find((item) => item[field] === value)
  );

  eleventyConfig.addFilter("slugify", (str) =>
    String(str)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );

  // Only keep events today or in the future, soonest first
  eleventyConfig.addFilter("upcoming", (events) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (events || [])
      .filter((e) => new Date(e.date + "T00:00:00") >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  });

  // Event page helpers (maps link + JSON-LD)
  require("./eventFilters.js")(eleventyConfig);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};
