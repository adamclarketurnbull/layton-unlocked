// "What's missing in Layton" survey pop-up.
// Shows once, ever, per visitor. Once they close it (X) or pick an answer,
// it's marked done in localStorage and never shows again on any page.
(function () {
  var STORAGE_KEY = "lu_survey_done";
  var SHOW_AFTER_MS = 4000;

  var popup = document.getElementById("survey-popup");
  if (!popup) return;

  var closeBtn = popup.querySelector(".survey-popup__close");
  var optionsWrap = popup.querySelector(".survey-popup__options");
  var options = popup.querySelectorAll(".survey-popup__option");
  var thanks = popup.querySelector(".survey-popup__thanks");

  function isDone() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function markDone() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {}
  }

  if (isDone()) return;

  function openPopup() {
    if (isDone()) return;
    popup.hidden = false;
  }

  function closePopup() {
    popup.hidden = true;
  }

  var timer = setTimeout(openPopup, SHOW_AFTER_MS);

  closeBtn.addEventListener("click", function () {
    clearTimeout(timer);
    markDone();
    closePopup();
  });

  popup.addEventListener("click", function (e) {
    if (e.target === popup) {
      markDone();
      closePopup();
    }
  });

  options.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var choice = btn.getAttribute("data-choice");
      fetch("/api/survey/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: choice }),
      }).catch(function () {});

      markDone();
      optionsWrap.hidden = true;
      thanks.hidden = false;
      setTimeout(closePopup, 1600);
    });
  });
})();
