// Eleventy filters used by the event pages (src/events/event.njk).
module.exports = function (eleventyConfig) {
  // ---- Event page helpers (used by src/events/event.njk) ----

  // Google Maps search link from a venue object {name, street, locality, postcode}
  eleventyConfig.addFilter("mapsUrl", (v) => {
    if (!v) return "#";
    const q = [v.name, v.street, v.locality, v.postcode].filter(Boolean).join(", ");
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
  });

  // Date label for an event card. One day: "Fri 23 Oct". Several days: "Mon 19 - Thu 22 Oct".
  eleventyConfig.addFilter("dateRange", (e) => {
    if (!e || !e.date) return "";
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const a = new Date(e.date + "T00:00:00");
    if (!e.endDate || e.endDate === e.date) return `${days[a.getDay()]} ${a.getDate()} ${months[a.getMonth()]}`;
    const b = new Date(e.endDate + "T00:00:00");
    const left = a.getMonth() === b.getMonth() ? `${days[a.getDay()]} ${a.getDate()}` : `${days[a.getDay()]} ${a.getDate()} ${months[a.getMonth()]}`;
    return `${left} - ${days[b.getDay()]} ${b.getDate()} ${months[b.getMonth()]}`;
  });

  // Date label for a featured card when one event page has several dated entries
  // (e.g. a craft club on Mon 2 and Fri 6 Nov). Lists only the dates still to come:
  // "Mon 2 & Fri 6 Nov". Falls back to the single-event label for one date or more than three.
  eleventyConfig.addFilter("sessionDates", (e, upcomingList) => {
    if (!e || !e.date) return "";
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const one = (iso, withMonth) => {
      const d = new Date(iso + "T00:00:00");
      return `${days[d.getDay()]} ${d.getDate()}${withMonth ? " " + months[d.getMonth()] : ""}`;
    };
    const group = e.page ? (upcomingList || []).filter((x) => x.page === e.page && !x.endDate) : [];
    if (group.length < 2 || group.length > 3 || e.endDate) {
      const a = new Date(e.date + "T00:00:00");
      if (!e.endDate || e.endDate === e.date) return one(e.date, true);
      const b = new Date(e.endDate + "T00:00:00");
      const left = a.getMonth() === b.getMonth() ? one(e.date, false) : one(e.date, true);
      return `${left} - ${one(e.endDate, true)}`;
    }
    const dates = group.map((x) => x.date).sort();
    const sameMonth = dates.every((d) => d.slice(0, 7) === dates[0].slice(0, 7));
    const parts = dates.map((d, i) => one(d, !sameMonth || i === dates.length - 1));
    return parts.length === 2 ? parts.join(" & ") : parts.slice(0, -1).join(", ") + " & " + parts[parts.length - 1];
  });

  // schema.org Event JSON-LD for an entry in _data/eventPages.json.
  // One object for a single date, an array when the page covers several sessions.
  eleventyConfig.addFilter("eventJsonLd", (ev) => {
    const site = "https://laytonunlocked.com";
    const pageUrl = `${site}/events/${ev.slug}/`;
    const image = ev.posters && ev.posters[0] ? site + ev.posters[0].src : undefined;

    const place = (s) => {
      const name = s.venueName || (ev.venue && ev.venue.name);
      const street = s.street || (!s.venueName && ev.venue && ev.venue.street) || undefined;
      const locality = s.locality || (ev.venue && ev.venue.locality) || "Blackpool";
      const postcode = s.postcode || (!s.venueName && ev.venue && ev.venue.postcode) || undefined;
      const address = { "@type": "PostalAddress", addressLocality: locality, addressCountry: "GB" };
      if (street) address.streetAddress = street;
      if (postcode) address.postalCode = postcode;
      return { "@type": "Place", name, address };
    };

    const offers = (s) => {
      const url = s.bookingUrl || (ev.offers && ev.offers.url) || pageUrl;
      const list = ev.offersList || (ev.offers ? [{ price: ev.offers.price }] : []);
      return list.map((o) => {
        const offer = {
          "@type": "Offer",
          price: String(o.price),
          priceCurrency: "GBP",
          url,
          availability: "https://schema.org/InStock",
        };
        if (o.name) offer.name = o.name;
        return offer;
      });
    };

    const events = ev.sessions.map((s) => {
      const out = {
        "@context": "https://schema.org",
        "@type": "Event",
        name: s.name ? `${ev.seriesName}: ${s.name}` : ev.title,
        description: s.blurb || ev.summary,
        startDate: s.start,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: place(s),
        url: pageUrl,
      };
      if (s.end) out.endDate = s.end;
      if (image) out.image = [image];
      const o = offers(s);
      if (o.length) out.offers = o;
      if (ev.organiser) {
        out.organizer = { "@type": "Organization", name: ev.organiser.name };
        if (ev.organiser.url) out.organizer.url = ev.organiser.url;
      }
      return out;
    });

    const json = JSON.stringify(events.length === 1 ? events[0] : events);
    return json.replace(/</g, "\\u003c");
  });
};
