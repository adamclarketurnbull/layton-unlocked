// Day-of-week filter for the Food & Essentials page. When a day is chosen,
// every service across the page (pinned support hub, infant essentials,
// Layton Larder, sit-down meals, take-home food, shopping, beyond food)
// that runs on that day is gathered into one combined card grid, and the
// normal page sections are hidden so there's no duplication.
(function () {
  var select = document.getElementById("fe-day-select");
  var results = document.getElementById("fe-day-results");
  var emptyMsg = document.getElementById("fe-day-empty");
  var dataEl = document.getElementById("fe-services-data");
  if (!select || !results || !dataEl) return;

  var services = [];
  try {
    services = JSON.parse(dataEl.textContent) || [];
  } catch (e) {
    services = [];
  }

  var sectionIds = [
    "fe-section-pinned",
    "fe-section-infant",
    "fe-section-sitdown",
    "fe-section-takehome",
    "fe-section-shopping",
    "fe-section-beyond",
  ];

  function setSectionsVisible(visible) {
    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = visible ? "" : "none";
    });
  }

  function cardHtml(s) {
    var unverifiedClass = s.unverified ? " service-card--unverified" : "";
    var html = '<article class="service-card' + unverifiedClass + '">';
    html += "<h3 class=\"service-card__name\">" + s.name + "</h3>";
    if (s.location) html += "<p class=\"service-card__location\">" + s.location + "</p>";
    if (s.hours) html += "<p class=\"service-card__hours\">" + s.hours + "</p>";
    if (s.body) html += "<p class=\"service-card__body\">" + s.body + "</p>";
    if (s.link) {
      html +=
        '<a href="' +
        s.link +
        '" class="link-green" target="_blank" rel="noopener">' +
        (s.linkText || "Find out more →") +
        "</a>";
    }
    html += "</article>";
    return html;
  }

  function applyDay(day) {
    if (day === "All") {
      results.hidden = true;
      results.innerHTML = "";
      emptyMsg.style.display = "none";
      setSectionsVisible(true);
      return;
    }

    setSectionsVisible(false);

    var matched = services.filter(function (s) {
      return Array.isArray(s.days) && s.days.indexOf(day) !== -1;
    });

    if (matched.length === 0) {
      results.hidden = true;
      results.innerHTML = "";
      emptyMsg.style.display = "block";
      return;
    }

    emptyMsg.style.display = "none";
    results.innerHTML = matched.map(cardHtml).join("");
    results.hidden = false;
  }

  select.addEventListener("change", function () {
    applyDay(select.value);
  });
})();
