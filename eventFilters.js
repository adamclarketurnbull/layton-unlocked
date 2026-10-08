// Eleventy filters used by the event pages (src/events/event.njk).
module.exports = function (eleventyConfig) {
  // ---- Event page helpers (used by src/events/event.njk) ----

  // Google Maps search link from a venue object {name, street, locality, postcode}
  eleventyConfig.addFilter("mapsUrl", (v) => {
    if (!v) return "#";
    const q = [v.name, v.street, v.locality, v.postcode].filter(Boolean).join(", ");
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
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
