/* ==========================================================================
   Steel Atlas Digest Archive — Client-side application
   Handles digest listing, search, filtering, pagination, and detail views
   ========================================================================== */

(function () {
  'use strict';

  const DIGESTS_PER_PAGE = 20;
  const DATA_PATH = '/data/digests.json';

  // --- State ---
  let allDigests = [];
  let filteredDigests = [];
  let currentPage = 1;
  let currentFilter = 'all';
  let searchQuery = '';
  let searchIndex = null; // simple inverted index

  // --- Utilities ---

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatShortDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  function getYear(dateStr) {
    return dateStr.substring(0, 4);
  }

  function extractExcerpt(synopsis, maxLen) {
    if (!synopsis) return '';
    // Strip HTML tags
    var text = synopsis.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > maxLen) {
      text = text.substring(0, maxLen).replace(/\s+\S*$/, '') + '...';
    }
    return text;
  }

  function generateTitle(digest) {
    if (digest.is_weekly_report) {
      return 'Weekly Digest & Pattern Analysis — ' + formatShortDate(digest.date);
    }
    // Try to pull a title from key_themes
    if (digest.key_themes && digest.key_themes.length > 0) {
      return 'Daily Digest — ' + formatShortDate(digest.date);
    }
    return 'Daily Digest — ' + formatShortDate(digest.date);
  }

  // --- Search Index ---

  function buildSearchIndex(digests) {
    // Build a simple search structure: for each digest, store searchable text
    return digests.map(function (d, i) {
      var text = [
        d.date || '',
        d.synopsis ? d.synopsis.replace(/<[^>]+>/g, ' ') : '',
        (d.key_themes || []).join(' '),
        (d.documents || []).map(function (doc) { return (doc.title || '') + ' ' + (doc.author || ''); }).join(' ')
      ].join(' ').toLowerCase();
      return { index: i, text: text };
    });
  }

  function searchDigests(query) {
    if (!query || !searchIndex) return allDigests.slice();
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var results = [];
    searchIndex.forEach(function (entry) {
      var matches = terms.every(function (term) {
        return entry.text.indexOf(term) !== -1;
      });
      if (matches) {
        results.push(allDigests[entry.index]);
      }
    });
    return results;
  }

  // --- Rendering: Digest List (index.html) ---

  function renderDigestList() {
    var listEl = document.getElementById('digestList');
    if (!listEl) return;

    // Apply filter
    var digests = filteredDigests;
    if (currentFilter === 'weekly') {
      digests = digests.filter(function (d) { return d.is_weekly_report; });
    } else if (currentFilter === 'daily') {
      digests = digests.filter(function (d) { return !d.is_weekly_report; });
    }

    if (digests.length === 0) {
      if (searchQuery) {
        listEl.innerHTML = '<div class="no-results"><p>No digests match "<strong>' +
          escapeHtml(searchQuery) + '</strong>"</p></div>';
      } else {
        listEl.innerHTML =
          '<div class="empty-state">' +
          '<h2>No digests yet</h2>' +
          '<p>Digests will appear here once the daily automation runs and the site is rebuilt.</p>' +
          '</div>';
      }
      updatePagination(0);
      return;
    }

    // Pagination
    var totalPages = Math.ceil(digests.length / DIGESTS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages;
    var start = (currentPage - 1) * DIGESTS_PER_PAGE;
    var pageDigests = digests.slice(start, start + DIGESTS_PER_PAGE);

    // Group by year
    var groups = {};
    pageDigests.forEach(function (d) {
      var year = getYear(d.date);
      if (!groups[year]) groups[year] = [];
      groups[year].push(d);
    });

    var html = '';
    var years = Object.keys(groups).sort().reverse();
    years.forEach(function (year) {
      html += '<div class="digest-year-group">';
      html += '<div class="year-heading">' + year + '</div>';
      groups[year].forEach(function (d) {
        var title = generateTitle(d);
        var excerpt = extractExcerpt(d.synopsis, 180);
        var badge = d.is_weekly_report
          ? '<span class="digest-type-badge weekly">Weekly</span>'
          : '<span class="digest-type-badge">Daily</span>';

        html += '<article class="digest-item">';
        html += '<a href="/digest.html?date=' + encodeURIComponent(d.date) + '" class="digest-item-link">';
        html += '<div class="digest-item-date">' + formatDate(d.date) + badge + '</div>';
        html += '<div class="digest-item-title">' + escapeHtml(title) + '</div>';
        html += '<div class="digest-item-excerpt">' + escapeHtml(excerpt) + '</div>';
        html += '<div class="digest-item-meta">' + d.document_count + ' articles analyzed' +
          (d.priority_count ? ' &middot; ' + d.priority_count + ' priority' : '') + '</div>';
        html += '</a>';
        html += '</article>';
      });
      html += '</div>';
    });

    listEl.innerHTML = html;
    updatePagination(digests.length);
    updateSearchMeta(digests.length);
  }

  function updatePagination(total) {
    var paginationEl = document.getElementById('pagination');
    if (!paginationEl) return;

    var totalPages = Math.ceil(total / DIGESTS_PER_PAGE);
    if (totalPages <= 1) {
      paginationEl.style.display = 'none';
      return;
    }

    paginationEl.style.display = 'flex';
    document.getElementById('pageInfo').textContent = 'Page ' + currentPage + ' of ' + totalPages;
    document.getElementById('prevPage').disabled = (currentPage <= 1);
    document.getElementById('nextPage').disabled = (currentPage >= totalPages);
  }

  function updateSearchMeta(count) {
    var metaEl = document.getElementById('searchMeta');
    if (!metaEl) return;

    if (searchQuery) {
      metaEl.textContent = count + ' digest' + (count !== 1 ? 's' : '') + ' found for "' + searchQuery + '"';
    } else {
      metaEl.textContent = count + ' digest' + (count !== 1 ? 's' : '') + ' in archive';
    }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Rendering: Single Digest (digest.html) ---

  function renderDigestDetail() {
    var contentEl = document.getElementById('digestContent');
    if (!contentEl) return;

    var params = new URLSearchParams(window.location.search);
    var date = params.get('date');
    if (!date) {
      contentEl.innerHTML = '<div class="empty-state"><h2>No digest specified</h2><p><a href="/">Return to archive</a></p></div>';
      return;
    }

    // Find the digest
    var digest = allDigests.find(function (d) { return d.date === date; });
    if (!digest) {
      contentEl.innerHTML = '<div class="empty-state"><h2>Digest not found</h2><p>No digest exists for ' +
        escapeHtml(date) + '.</p><p><a href="/">Return to archive</a></p></div>';
      return;
    }

    // Update page title
    document.title = generateTitle(digest) + ' — Steel Atlas Digest Archive';

    var html = '';

    // Header
    html += '<div class="digest-header">';
    html += '<h1 class="digest-title">' + escapeHtml(generateTitle(digest)) + '</h1>';
    html += '<div class="digest-date">' + formatDate(digest.date) + '</div>';
    html += '<div class="digest-stats">';
    html += '<span class="digest-stat"><strong>' + digest.document_count + '</strong>&nbsp;articles analyzed</span>';
    if (digest.priority_count) {
      html += '<span class="digest-stat"><strong>' + digest.priority_count + '</strong>&nbsp;priority</span>';
    }
    if (digest.is_weekly_report) {
      html += '<span class="digest-stat"><span class="digest-type-badge weekly">Weekly Report</span></span>';
    }
    html += '</div>';

    // Key themes
    if (digest.key_themes && digest.key_themes.length > 0) {
      html += '<div class="digest-themes">';
      digest.key_themes.forEach(function (theme) {
        html += '<span class="theme-tag">' + escapeHtml(theme) + '</span>';
      });
      html += '</div>';
    }
    html += '</div>';

    // Body (raw HTML from the synopsis)
    html += '<div class="digest-body">';
    html += digest.synopsis || '<p>No content available.</p>';
    html += '</div>';

    // Citations / source articles
    if (digest.documents && digest.documents.length > 0) {
      html += '<div class="citations-section">';
      html += '<h3>Source Articles (' + digest.documents.length + ')</h3>';
      html += '<ul class="citations-list">';
      digest.documents.forEach(function (doc) {
        var title = doc.title || 'Untitled';
        var author = doc.author || '';
        var source = doc.source || '';
        var priority = doc.is_priority ? ' <span class="digest-type-badge weekly">Priority</span>' : '';
        html += '<li>';
        html += '<strong>' + escapeHtml(title) + '</strong>' + priority;
        if (author) html += ' &mdash; ' + escapeHtml(author);
        html += '</li>';
      });
      html += '</ul>';
      html += '</div>';
    }

    // Navigation to previous/next
    var currentIndex = allDigests.findIndex(function (d) { return d.date === date; });
    html += '<hr>';
    html += '<div style="display:flex;justify-content:space-between;font-family:var(--font-sans);font-size:0.85rem;margin-top:1.5rem;">';
    if (currentIndex < allDigests.length - 1) {
      var prev = allDigests[currentIndex + 1];
      html += '<a href="/digest.html?date=' + encodeURIComponent(prev.date) + '">&larr; ' + formatShortDate(prev.date) + '</a>';
    } else {
      html += '<span></span>';
    }
    if (currentIndex > 0) {
      var next = allDigests[currentIndex - 1];
      html += '<a href="/digest.html?date=' + encodeURIComponent(next.date) + '">' + formatShortDate(next.date) + ' &rarr;</a>';
    } else {
      html += '<span></span>';
    }
    html += '</div>';

    contentEl.innerHTML = html;
  }

  // --- Event Handlers ---

  function initListPage() {
    // Search
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
      var debounceTimer;
      searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          searchQuery = searchInput.value.trim();
          filteredDigests = searchDigests(searchQuery);
          currentPage = 1;
          renderDigestList();
        }, 200);
      });
    }

    // Filter tabs
    var tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        currentFilter = tab.getAttribute('data-filter');
        currentPage = 1;
        renderDigestList();
      });
    });

    // Pagination
    var prevBtn = document.getElementById('prevPage');
    var nextBtn = document.getElementById('nextPage');
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        if (currentPage > 1) {
          currentPage--;
          renderDigestList();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        currentPage++;
        renderDigestList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // --- Initialize ---

  function init() {
    fetch(DATA_PATH)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load digests');
        return res.json();
      })
      .then(function (data) {
        // Sort by date descending (newest first)
        allDigests = (data.digests || data || []).sort(function (a, b) {
          return b.date.localeCompare(a.date);
        });
        searchIndex = buildSearchIndex(allDigests);
        filteredDigests = allDigests.slice();

        // Determine which page we're on
        if (document.getElementById('digestList')) {
          initListPage();
          renderDigestList();
        } else if (document.getElementById('digestContent')) {
          renderDigestDetail();
        }
      })
      .catch(function (err) {
        console.error('Error loading digests:', err);
        var target = document.getElementById('digestList') || document.getElementById('digestContent');
        if (target) {
          target.innerHTML =
            '<div class="empty-state">' +
            '<h2>No digests available</h2>' +
            '<p>Run <code>python3 build_site.py</code> to generate the digest archive, then redeploy.</p>' +
            '</div>';
        }
      });
  }

  // --- Subscribe Form ---
  function initSubscribeForm() {
    var form = document.getElementById('subscribeForm');
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function() {
        form.querySelector('.subscribe-input-group').style.display = 'none';
        document.getElementById('subscribeSuccess').style.display = 'block';
      }).catch(function() {
        alert('Something went wrong. Please try again.');
      });
    });
  }

  // Run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { init(); initSubscribeForm(); });
  } else {
    init();
    initSubscribeForm();
  }

})();
