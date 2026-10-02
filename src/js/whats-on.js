// Filters the "Regular activities" grid by category and/or day, then caps how
// many cards show at once (3 rows' worth on desktop, 9 cards on mobile) with
// a "Show more" button to reveal the rest of the filtered set.
(function () {
  var catSelect = document.getElementById('wo-filter-category');
  var daySelect = document.getElementById('wo-filter-day');
  var grid = document.getElementById('wo-activities-grid');
  var emptyMsg = document.getElementById('wo-activities-empty');
  var showMoreBtn = document.getElementById('wo-activities-show-more');

  if (!catSelect || !daySelect || !grid) return;

  var MOBILE_BREAKPOINT = '(max-width: 820px)';
  var MOBILE_CAP = 9;
  var ROWS_ON_DESKTOP = 3;

  var expanded = false; // whether "Show more" has been clicked for the current filter set

  function getDesktopColumnCount() {
    var cols = getComputedStyle(grid).getPropertyValue('grid-template-columns')
      .trim().split(/\s+/).filter(Boolean).length;
    return cols > 0 ? cols : 4;
  }

  function getCap() {
    var isMobile = window.matchMedia(MOBILE_BREAKPOINT).matches;
    return isMobile ? MOBILE_CAP : getDesktopColumnCount() * ROWS_ON_DESKTOP;
  }

  function applyFilters() {
    var cat = catSelect.value;
    var day = daySelect.value;
    var matched = [];

    Array.prototype.forEach.call(grid.querySelectorAll('.wo-card'), function (card) {
      var cardDay = card.getAttribute('data-day');
      var cardCats = (card.getAttribute('data-categories') || '').split(',');

      var dayMatch = day === 'All' || cardDay === day;
      var catMatch = cat === 'All' || cardCats.indexOf(cat) !== -1;

      if (dayMatch && catMatch) {
        matched.push(card);
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });

    if (emptyMsg) emptyMsg.style.display = matched.length === 0 ? 'block' : 'none';

    applyCap(matched);
  }

  function applyCap(matched) {
    var cap = getCap();
    var showAll = expanded || matched.length <= cap;

    matched.forEach(function (card, i) {
      var withinCap = showAll || i < cap;
      card.style.display = withinCap ? '' : 'none';
    });

    if (showMoreBtn) {
      var remaining = matched.length - cap;
      if (!showAll && remaining > 0) {
        showMoreBtn.style.display = '';
        showMoreBtn.textContent = 'Show more (' + remaining + ')';
      } else {
        showMoreBtn.style.display = 'none';
      }
    }
  }

  catSelect.addEventListener('change', function () { expanded = false; applyFilters(); });
  daySelect.addEventListener('change', function () { expanded = false; applyFilters(); });

  if (showMoreBtn) {
    showMoreBtn.addEventListener('click', function () {
      expanded = true;
      applyFilters();
    });
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyFilters, 150);
  });

  applyFilters();
})();
