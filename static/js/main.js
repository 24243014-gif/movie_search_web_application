// ===== STATE =====
const state = {
    currentQuery: '',
    currentPage: 1,
    totalResults: 0,
    currentType: '',
    currentYear: '',
    currentView: 'grid',
    watchlist: JSON.parse(localStorage.getItem('cineSearch_watchlist') || '[]'),
    isDarkMode: localStorage.getItem('cineSearch_theme') !== 'light',
};

const RESULTS_PER_PAGE = 10;

// ===== DOM ELEMENTS =====
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const typeFilter = document.getElementById('typeFilter');
const yearFilter = document.getElementById('yearFilter');
const resultsSection = document.getElementById('resultsSection');
const trendingSection = document.getElementById('trendingSection');
const moviesGrid = document.getElementById('moviesGrid');
const trendingGrid = document.getElementById('trendingGrid');
const resultsTitle = document.getElementById('resultsTitle');
const resultsMeta = document.getElementById('resultsMeta');
const pagination = document.getElementById('pagination');
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const watchlistPanel = document.getElementById('watchlistPanel');
const watchlistOverlay = document.getElementById('watchlistOverlay');
const watchlistBody = document.getElementById('watchlistBody');
const watchlistCount = document.getElementById('watchlistCount');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const body = document.getElementById('body');
const navbar = document.getElementById('navbar');
const scrollHint = document.getElementById('scrollHint');

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    updateWatchlistCount();
    loadTrending();
    bindEvents();
});

function bindEvents() {
    // Search on Enter key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Live search debounce
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        if (searchInput.value.trim().length >= 3) {
            debounceTimer = setTimeout(() => performSearch(), 600);
        }
    });

    // Filter changes
    typeFilter.addEventListener('change', () => {
        if (state.currentQuery) performSearch();
    });
    yearFilter.addEventListener('change', () => {
        if (state.currentQuery) performSearch();
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            scrollHint.style.opacity = '0';
        } else {
            navbar.classList.remove('scrolled');
            scrollHint.style.opacity = '1';
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeWatchlistPanel();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
    });
}

// ===== SEARCH =====
async function performSearch(page = 1) {
    const query = searchInput.value.trim();
    if (!query) return;

    const type = typeFilter.value;
    const year = yearFilter.value.trim();

    state.currentQuery = query;
    state.currentPage = page;
    state.currentType = type;
    state.currentYear = year;

    // Show results section, hide trending
    resultsSection.style.display = 'block';
    trendingSection.style.display = 'none';
    pagination.style.display = 'none';

    resultsTitle.textContent = `Results for "${query}"`;
    resultsMeta.textContent = 'Searching...';
    moviesGrid.innerHTML = `<div class="spinner-wrapper"><div class="spinner"></div></div>`;

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
        const params = new URLSearchParams({ q: query, page });
        if (type) params.set('type', type);
        if (year) params.set('year', year);

        const response = await fetch(`/api/search?${params}`);
        const data = await response.json();

        if (data.success) {
            state.totalResults = data.total;
            const totalPages = Math.ceil(data.total / RESULTS_PER_PAGE);

            resultsMeta.textContent = `${data.total.toLocaleString()} results found · Page ${page} of ${totalPages}`;
            renderMoviesGrid(data.results, moviesGrid);
            renderPagination(page, totalPages);
        } else {
            resultsMeta.textContent = '';
            moviesGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1;">
                    <span class="no-results-icon">🎭</span>
                    <h3>No results found</h3>
                    <p>${data.error || 'Try a different search term or adjust your filters.'}</p>
                </div>
            `;
        }
    } catch (error) {
        resultsMeta.textContent = '';
        moviesGrid.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1;">
                <span class="no-results-icon">⚠️</span>
                <h3>Something went wrong</h3>
                <p>Unable to reach the server. Please check your connection.</p>
            </div>
        `;
    }
}

// ===== RENDER MOVIES GRID =====
function renderMoviesGrid(movies, container) {
    if (!movies || movies.length === 0) {
        container.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1;">
                <span class="no-results-icon">🎭</span>
                <h3>No movies found</h3>
                <p>Try adjusting your search.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    container.className = `movies-grid ${state.currentView === 'list' ? 'list-view' : ''}`;

    movies.forEach((movie, index) => {
        const card = createMovieCard(movie, index);
        container.appendChild(card);
    });
}

function createMovieCard(movie, index) {
    const isInWatchlist = state.watchlist.some(w => w.imdbID === movie.imdbID);
    const hasPoster = movie.Poster && movie.Poster !== 'N/A';

    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.animationDelay = `${index * 0.05}s`;
    card.dataset.imdbId = movie.imdbID;
    card.setAttribute('role', 'article');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${movie.Title} (${movie.Year})`);

    card.innerHTML = `
        <div class="card-poster-wrapper">
            ${hasPoster
                ? `<img class="card-poster" src="${movie.Poster}" alt="${movie.Title} poster" loading="lazy">`
                : `<div class="card-poster-placeholder">
                    <span class="placeholder-icon">🎬</span>
                    <span>No Poster</span>
                   </div>`
            }
            <div class="card-overlay">
                <button class="overlay-btn" onclick="openMovieModal('${movie.imdbID}')">View Details</button>
            </div>
            <span class="card-type-badge">${getTypeLabel(movie.Type)}</span>
            <button
                class="card-watchlist-btn ${isInWatchlist ? 'in-watchlist' : ''}"
                id="wl-btn-${movie.imdbID}"
                onclick="toggleWatchlistFromCard(event, '${movie.imdbID}', '${escapeQuotes(movie.Title)}', '${movie.Year}', '${hasPoster ? movie.Poster : ''}')"
                title="${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}"
                aria-label="${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}"
            >${isInWatchlist ? '❤️' : '🤍'}</button>
        </div>
        <div class="card-info">
            <div class="card-title">${movie.Title}</div>
            <div class="card-year">${movie.Year}</div>
        </div>
    `;

    // Open modal on card click (except buttons)
    card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            openMovieModal(movie.imdbID);
        }
    });

    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openMovieModal(movie.imdbID);
        }
    });

    return card;
}

function getTypeLabel(type) {
    const labels = { movie: '🎬 Movie', series: '📺 Series', episode: '🎞️ Episode' };
    return labels[type] || type || 'Unknown';
}

function escapeQuotes(str) {
    return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ===== PAGINATION =====
function renderPagination(currentPage, totalPages) {
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageNumbers = document.getElementById('pageNumbers');

    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;

    // Generate page numbers
    const pages = getPageRange(currentPage, totalPages);
    pageNumbers.innerHTML = pages.map(p => {
        if (p === '...') return `<span style="color: var(--text-muted); padding: 0 4px;">···</span>`;
        return `<button class="page-num ${p === currentPage ? 'active' : ''}"
            onclick="performSearch(${p})" aria-label="Page ${p}">${p}</button>`;
    }).join('');
}

function getPageRange(current, total) {
    const range = [];
    const delta = 2;
    const left = current - delta;
    const right = current + delta + 1;
    let last;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= left && i < right)) {
            if (last) {
                if (i - last === 2) range.push(last + 1);
                else if (i - last !== 1) range.push('...');
            }
            range.push(i);
            last = i;
        }
    }
    return range;
}

function changePage(direction) {
    const newPage = state.currentPage + direction;
    if (newPage >= 1) {
        performSearch(newPage);
    }
}

// ===== TRENDING =====
async function loadTrending() {
    try {
        const response = await fetch('/api/trending');
        const data = await response.json();

        if (data.success && data.movies.length > 0) {
            renderMoviesGrid(data.movies, trendingGrid);
        } else {
            trendingGrid.innerHTML = `<div class="no-results" style="grid-column: 1/-1;">
                <span class="no-results-icon">📡</span>
                <h3>Could not load trending</h3>
                <p>Search for movies above to get started!</p>
            </div>`;
        }
    } catch (e) {
        trendingGrid.innerHTML = `<div class="no-results" style="grid-column: 1/-1;">
            <span class="no-results-icon">🎬</span>
            <h3>Start exploring!</h3>
            <p>Type a movie name in the search bar above.</p>
        </div>`;
    }
}

// ===== MOVIE MODAL =====
async function openMovieModal(imdbId) {
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    modalContent.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:center; padding: 100px 40px;">
            <div class="spinner"></div>
        </div>
    `;

    try {
        const response = await fetch(`/api/movie/${imdbId}`);
        const data = await response.json();

        if (data.success) {
            renderModal(data.movie);
        } else {
            modalContent.innerHTML = `
                <div class="no-results" style="padding: 80px;">
                    <span class="no-results-icon">⚠️</span>
                    <h3>Movie not found</h3>
                    <p>${data.error || 'Could not load movie details.'}</p>
                </div>
            `;
        }
    } catch (e) {
        modalContent.innerHTML = `
            <div class="no-results" style="padding: 80px;">
                <span class="no-results-icon">⚠️</span>
                <h3>Connection error</h3>
                <p>Could not fetch movie details. Please try again.</p>
            </div>
        `;
    }
}

function renderModal(movie) {
    const hasPoster = movie.Poster && movie.Poster !== 'N/A';
    const isInWatchlist = state.watchlist.some(w => w.imdbID === movie.imdbID);

    // Build ratings
    const ratingsHTML = (movie.Ratings || []).map(r => `
        <div class="rating-card ${r.Source.includes('Internet Movie Database') ? 'imdb-rating' : ''}">
            <div class="rating-source">${r.Source === 'Internet Movie Database' ? '⭐ IMDb' : r.Source === 'Rotten Tomatoes' ? '🍅 RT' : '🎬 ' + r.Source}</div>
            <div class="rating-value">${r.Value}</div>
        </div>
    `).join('');

    // Build genres
    const genreHTML = (movie.Genre || '').split(',').map(g => g.trim()).filter(Boolean).map(g =>
        `<span class="genre-tag">${g}</span>`
    ).join('');

    const imdbUrl = `https://www.imdb.com/title/${movie.imdbID}`;

    modalContent.innerHTML = `
        <div class="modal-hero">
            ${hasPoster ? `<div class="modal-backdrop" style="background-image: url('${movie.Poster}')"></div>` : ''}
            <div class="modal-poster-wrapper">
                ${hasPoster
                    ? `<img class="modal-poster" src="${movie.Poster}" alt="${movie.Title} poster">`
                    : `<div class="modal-poster-placeholder">🎬</div>`
                }
            </div>
            <div class="modal-info">
                <h2 class="modal-title" id="modalTitle">${movie.Title}</h2>
                ${movie.Tagline && movie.Tagline !== 'N/A' ? `<p class="modal-tagline">${movie.Tagline}</p>` : ''}
                <div class="modal-badges">
                    ${movie.Year !== 'N/A' ? `<span class="badge badge-year">📅 ${movie.Year}</span>` : ''}
                    ${movie.Type ? `<span class="badge badge-type">${getTypeLabel(movie.Type)}</span>` : ''}
                    ${movie.Runtime !== 'N/A' ? `<span class="badge badge-runtime">⏱ ${movie.Runtime}</span>` : ''}
                    ${movie.imdbRating !== 'N/A' ? `<span class="badge badge-rating">⭐ ${movie.imdbRating}/10</span>` : ''}
                    ${movie.Rated !== 'N/A' ? `<span class="badge badge-rated">${movie.Rated}</span>` : ''}
                </div>
                ${ratingsHTML ? `<div class="modal-ratings">${ratingsHTML}</div>` : ''}
                <div class="modal-actions">
                    <a href="${imdbUrl}" target="_blank" rel="noopener" class="modal-btn modal-btn-primary">
                        🎬 View on IMDb
                    </a>
                    <button
                        class="modal-btn modal-btn-secondary"
                        id="modalWatchlistBtn"
                        onclick="toggleWatchlistFromModal('${movie.imdbID}', '${escapeQuotes(movie.Title)}', '${movie.Year}', '${hasPoster ? movie.Poster : ''}')"
                    >
                        ${isInWatchlist ? '❤️ Remove from Watchlist' : '🤍 Add to Watchlist'}
                    </button>
                </div>
            </div>
        </div>

        <div class="modal-details">
            ${genreHTML ? `
                <div class="detail-section">
                    <div class="detail-label">Genres</div>
                    <div class="genre-tags">${genreHTML}</div>
                </div>
                <div class="divider"></div>
            ` : ''}

            ${movie.Plot && movie.Plot !== 'N/A' ? `
                <div class="detail-section">
                    <div class="detail-label">Plot</div>
                    <div class="detail-value">${movie.Plot}</div>
                </div>
                <div class="divider"></div>
            ` : ''}

            <div class="detail-grid">
                ${movie.Director && movie.Director !== 'N/A' ? `
                    <div class="detail-section">
                        <div class="detail-label">Director</div>
                        <div class="detail-value">${movie.Director}</div>
                    </div>
                ` : ''}
                ${movie.Writer && movie.Writer !== 'N/A' ? `
                    <div class="detail-section">
                        <div class="detail-label">Writer</div>
                        <div class="detail-value">${movie.Writer}</div>
                    </div>
                ` : ''}
                ${movie.Actors && movie.Actors !== 'N/A' ? `
                    <div class="detail-section">
                        <div class="detail-label">Cast</div>
                        <div class="detail-value">${movie.Actors}</div>
                    </div>
                ` : ''}
                ${movie.Language && movie.Language !== 'N/A' ? `
                    <div class="detail-section">
                        <div class="detail-label">Language</div>
                        <div class="detail-value">${movie.Language}</div>
                    </div>
                ` : ''}
                ${movie.Country && movie.Country !== 'N/A' ? `
                    <div class="detail-section">
                        <div class="detail-label">Country</div>
                        <div class="detail-value">${movie.Country}</div>
                    </div>
                ` : ''}
                ${movie.Awards && movie.Awards !== 'N/A' ? `
                    <div class="detail-section">
                        <div class="detail-label">Awards</div>
                        <div class="detail-value">🏆 ${movie.Awards}</div>
                    </div>
                ` : ''}
                ${movie.BoxOffice && movie.BoxOffice !== 'N/A' ? `
                    <div class="detail-section">
                        <div class="detail-label">Box Office</div>
                        <div class="detail-value">💰 ${movie.BoxOffice}</div>
                    </div>
                ` : ''}
                ${movie.Released && movie.Released !== 'N/A' ? `
                    <div class="detail-section">
                        <div class="detail-label">Released</div>
                        <div class="detail-value">📅 ${movie.Released}</div>
                    </div>
                ` : ''}
                ${movie.imdbVotes && movie.imdbVotes !== 'N/A' ? `
                    <div class="detail-section">
                        <div class="detail-label">IMDb Votes</div>
                        <div class="detail-value">👥 ${movie.imdbVotes}</div>
                    </div>
                ` : ''}
                ${movie.totalSeasons && movie.totalSeasons !== 'N/A' ? `
                    <div class="detail-section">
                        <div class="detail-label">Total Seasons</div>
                        <div class="detail-value">📺 ${movie.totalSeasons} Seasons</div>
                    </div>
                ` : ''}
            </div>

            ${movie.Production && movie.Production !== 'N/A' ? `
                <div class="divider"></div>
                <div class="detail-section">
                    <div class="detail-label">Production</div>
                    <div class="detail-value">🎥 ${movie.Production}</div>
                </div>
            ` : ''}
        </div>
    `;
}

function closeModal(event) {
    if (event && event.target !== modalOverlay) return;
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

// ===== WATCHLIST =====
function toggleWatchlistFromCard(event, imdbId, title, year, poster) {
    event.stopPropagation();
    const item = { imdbID: imdbId, Title: title, Year: year, Poster: poster };
    toggleWatchlistItem(item);

    // Update card button
    const btn = document.getElementById(`wl-btn-${imdbId}`);
    if (btn) {
        const inWatchlist = state.watchlist.some(w => w.imdbID === imdbId);
        btn.textContent = inWatchlist ? '❤️' : '🤍';
        btn.className = `card-watchlist-btn ${inWatchlist ? 'in-watchlist' : ''}`;
        btn.setAttribute('title', inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist');
        btn.style.transform = 'scale(1.4)';
        setTimeout(() => btn.style.transform = '', 300);
    }
}

function toggleWatchlistFromModal(imdbId, title, year, poster) {
    const item = { imdbID: imdbId, Title: title, Year: year, Poster: poster };
    toggleWatchlistItem(item);

    // Update modal button
    const btn = document.getElementById('modalWatchlistBtn');
    if (btn) {
        const inWatchlist = state.watchlist.some(w => w.imdbID === imdbId);
        btn.innerHTML = inWatchlist ? '❤️ Remove from Watchlist' : '🤍 Add to Watchlist';
    }

    // Update card button if visible
    const cardBtn = document.getElementById(`wl-btn-${imdbId}`);
    if (cardBtn) {
        const inWatchlist = state.watchlist.some(w => w.imdbID === imdbId);
        cardBtn.textContent = inWatchlist ? '❤️' : '🤍';
        cardBtn.className = `card-watchlist-btn ${inWatchlist ? 'in-watchlist' : ''}`;
    }
}

function toggleWatchlistItem(item) {
    const index = state.watchlist.findIndex(w => w.imdbID === item.imdbID);
    const isAdding = index === -1;

    if (isAdding) {
        state.watchlist.unshift(item);
        showToast(`❤️ Added "${item.Title}" to Watchlist`, 'success');
    } else {
        state.watchlist.splice(index, 1);
        showToast(`Removed "${item.Title}" from Watchlist`, 'error');
    }

    localStorage.setItem('cineSearch_watchlist', JSON.stringify(state.watchlist));
    updateWatchlistCount();

    if (watchlistPanel.classList.contains('open')) {
        renderWatchlistPanel();
    }
}

function updateWatchlistCount() {
    watchlistCount.textContent = state.watchlist.length;
    if (state.watchlist.length > 0) {
        watchlistCount.style.transform = 'scale(1.3)';
        setTimeout(() => watchlistCount.style.transform = '', 300);
    }
}

function renderWatchlistPanel() {
    if (state.watchlist.length === 0) {
        watchlistBody.innerHTML = `
            <div class="watchlist-empty">
                <div class="watchlist-empty-icon">🎬</div>
                <p><strong>Your watchlist is empty</strong></p>
                <p style="font-size: 14px; color: var(--text-muted);">Click the 🤍 on any movie to save it here.</p>
            </div>
        `;
        return;
    }

    watchlistBody.innerHTML = state.watchlist.map(movie => `
        <div class="watchlist-item" onclick="openMovieModal('${movie.imdbID}'); closeWatchlistPanel();">
            ${movie.Poster
                ? `<img class="watchlist-thumb" src="${movie.Poster}" alt="${movie.Title}" loading="lazy">`
                : `<div class="watchlist-thumb" style="display:flex;align-items:center;justify-content:center;font-size:20px;border-radius:8px;background:var(--bg-secondary);">🎬</div>`
            }
            <div class="watchlist-item-info">
                <div class="watchlist-item-title">${movie.Title}</div>
                <div class="watchlist-item-year">${movie.Year}</div>
            </div>
            <button
                class="watchlist-remove"
                onclick="event.stopPropagation(); removeFromWatchlist('${movie.imdbID}')"
                title="Remove from Watchlist"
                aria-label="Remove ${movie.Title} from Watchlist"
            >✕</button>
        </div>
    `).join('');
}

function removeFromWatchlist(imdbId) {
    const item = state.watchlist.find(w => w.imdbID === imdbId);
    if (item) toggleWatchlistItem(item);
}

function toggleWatchlistPanel() {
    const isOpen = watchlistPanel.classList.contains('open');
    if (!isOpen) {
        renderWatchlistPanel();
        watchlistPanel.classList.add('open');
        watchlistOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    } else {
        closeWatchlistPanel();
    }
}

function closeWatchlistPanel(event) {
    if (event && event.target !== watchlistOverlay) return;
    watchlistPanel.classList.remove('open');
    watchlistOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

// ===== VIEW MODE =====
function setView(view) {
    state.currentView = view;
    document.getElementById('gridViewBtn').classList.toggle('active', view === 'grid');
    document.getElementById('listViewBtn').classList.toggle('active', view === 'list');
    moviesGrid.className = `movies-grid ${view === 'list' ? 'list-view' : ''}`;
}

// ===== FILTERS =====
function clearFilters() {
    yearFilter.value = '';
    typeFilter.value = '';
    state.currentYear = '';
    state.currentType = '';
    if (state.currentQuery) performSearch();
}

// ===== THEME =====
function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    applyTheme();
}

function applyTheme() {
    if (state.isDarkMode) {
        body.className = 'dark-mode';
        themeIcon.textContent = '🌙';
        localStorage.setItem('cineSearch_theme', 'dark');
    } else {
        body.className = 'light-mode';
        themeIcon.textContent = '☀️';
        localStorage.setItem('cineSearch_theme', 'light');
    }
}

// ===== TOAST =====
let toastTimer;
function showToast(message, type = '') {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
