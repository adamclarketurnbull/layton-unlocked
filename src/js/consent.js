// Cookie consent + Google Analytics 4 loader.
// Nothing from Google Analytics is loaded until the visitor clicks Accept.
// Choice is remembered in localStorage under "lu_consent" ("granted" or "denied").
(function () {
  var script = document.currentScript;
  var GA_ID = script && script.getAttribute("data-ga-id");
  var KEY = "lu_consent";

  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setChoice(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }

  function loadAnalytics() {
    if (!GA_ID || window.__luGaLoaded) return;
    window.__luGaLoaded = true;
    window["ga-disable-" + GA_ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
  }

  function clearAnalyticsCookies() {
    var host = location.hostname;
    var parts = host.split(".");
    var domains = ["", host, "." + host];
    if (parts.length > 2) domains.push("." + parts.slice(-2).join("."));
    else domains.push("." + host);
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (name === "_ga" || name.indexOf("_ga_") === 0 || name === "_gid" || name.indexOf("_gat") === 0) {
        domains.forEach(function (d) {
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + (d ? "; domain=" + d : "");
        });
      }
    });
  }

  var banner;

  function buildBanner() {
    banner = document.createElement("div");
    banner.id = "lu-consent";
    banner.className = "consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie choices");
    banner.hidden = true;
    banner.innerHTML =
      '<p class="consent__text">We would like to use analytics cookies to see how people use this site, so we can make it better. ' +
      'No adverts, and nothing is sold. <a href="/privacy-policy/">Privacy policy</a></p>' +
      '<div class="consent__buttons">' +
      '<button type="button" class="consent__btn consent__btn--decline" data-choice="denied">Decline</button>' +
      '<button type="button" class="consent__btn consent__btn--accept" data-choice="granted">Accept</button>' +
      "</div>";
    banner.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("[data-choice]");
      if (!btn) return;
      choose(btn.getAttribute("data-choice"));
    });
    document.body.appendChild(banner);
  }

  function showBanner() {
    if (!banner) buildBanner();
    banner.hidden = false;
  }

  function choose(value) {
    setChoice(value);
    if (banner) banner.hidden = true;
    if (value === "granted") {
      loadAnalytics();
    } else {
      if (GA_ID) window["ga-disable-" + GA_ID] = true;
      clearAnalyticsCookies();
    }
  }

  function addFooterLink() {
    var footer = document.querySelector(".footer__inner");
    if (!footer) return;
    var p = document.createElement("p");
    p.className = "footer__cookie";
    p.innerHTML = '<button type="button" class="footer__cookie-btn" data-cookie-settings>Cookie settings</button> &middot; <a href="/privacy-policy/">Privacy policy</a>';
    footer.appendChild(p);
  }

  function init() {
    addFooterLink();
    var choice = getChoice();
    if (choice === "granted") loadAnalytics();
    else if (choice !== "denied") showBanner();

    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-cookie-settings]");
      if (t) showBanner();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
