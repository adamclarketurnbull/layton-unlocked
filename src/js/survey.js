// Occasional "what's missing in Layton" survey pop-up.
// Shows once per visitor (remembered in localStorage), lets them pick one of
// six options, and posts the choice to /api/survey/vote for tallying.
(function () {
  var STORAGE_KEY = "lu_survey_v1";
  var SHOW_AFTER_MS = 4000;
  var REPEAT_DAYS = 120;

  var popup = document.getElementById("survey-popup");
  if (!popup) return;

  var closeBtn = popup.querySelector(".survey-popup__close");
  var optionsWrap = popup.querySelector(".survey-popup__options");
  var options = popup.querySelectorAll(".survey-popup__option");
  var thanks = popup.querySelector(".survey-popup__thanks");

  function getState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function setState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  var state = getState();
  var repeatMs = REPEAT_DAYS * 24 * 60 * 60 * 1000;
  if (state && state.lastSeen && Date.now() - state.lastSeen < repeatMs) return;

  function openPopup() {
    popup.hidden = false;
    setState({ lastSeen: Date.now() });
  }

  function closePopup() {
    popup.hidden = true;
  }

  var timer = setTimeout(openPopup, SHOW_AFTER_MS);

  closeBtn.addEventListener("click", function () {
    clearTimeout(timer);
    closePopup();
  });

  popup.addEventListener("click", function (e) {
    if (e.target === popup) closePopup();
  });

  options.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var choice = btn.getAttribute("data-choice");
      fetch("/api/survey/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: choice }),
      }).catch(function () {});

      optionsWrap.hidden = true;
      thanks.hidden = false;
      setTimeout(closePopup, 1600);
    });
  });
})();
