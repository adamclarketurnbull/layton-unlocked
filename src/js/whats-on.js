// Filters the "Regular activities" grid by category and/or day.
// Cards are rendered server-side (see whats-on.njk); this just shows/hides them.
(function () {
  var catSelect = document.getElementById('wo-filter-category');
  var daySelect = document.getElementById('wo-filter-day');
  var grid = document.getElementById('wo-activities-grid');
  var emptyMsg = document.getElementById('wo-activities-empty');

  if (!catSelect || !daySelect || !grid) return;

  function applyFilters() {
    var cat = catSelect.value;
    var day = daySelect.value;
    var visibleCount = 0;

    Array.prototype.forEach.call(grid.querySelectorAll('.wo-card'), function (card) {
      var cardDay = card.getAttribute('data-day');
      var cardCats = (card.getAttribute('data-categories') || '').split(',');

      var dayMatch = day === 'All' || cardDay === day;
      var catMatch = cat === 'All' || cardCats.indexOf(cat) !== -1;

      var show = dayMatch && catMatch;
      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    if (emptyMsg) emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  catSelect.addEventListener('change', applyFilters);
  daySelect.addEventListener('change', applyFilters);
})();
