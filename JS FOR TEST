// js/home.js
const API_KEY = '40f1982842db35042e8561b13b38d492'; // Your original TMDB API key - UNCHANGED
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
const FALLBACK_IMAGE = 'https://via.placeholder.com/150x225?text=No+Image';
let currentItem;
let currentSeason = 1;
let currentEpisode = 1;
let slideshowItems = [];
let currentSlide = 0;
let slideshowInterval;

// Store pagination and loading state for each category
let categoryState = {
    movies: { page: 1, isLoading: false, filters: {} },
    tvshows: { page: 1, isLoading: false, filters: {} },
    anime: { page: 1, isLoading: false, filters: {} },
    'tagalog-movies': { page: 1, isLoading: false, filters: {} },
    'netflix-movies': { page: 1, isLoading: false, filters: {} },
    'netflix-tv': { page: 1, isLoading: false, filters: {} },
    'korean-drama': { page: 1, isLoading: false, filters: {} }
};

let currentFullView = null; // Tracks the category currently in the full view
let currentCategoryToFilter = null; // Tracks the category targeted by the filter modal
let scrollPosition = 0; // NEW: To save the scroll position of the full view grid

// Simplified Genre IDs for the filter dropdown
const GENRES = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, 
  { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, 
  { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, 
  { id: 27, name: 'Horror' }, { id: 878, name: 'Science Fiction' }, 
  { id: 53, name: 'Thriller' }, { id: 10749, name: 'Romance' },
  { id: 16, name: 'Animation' }, { id: 9648, name: 'Mystery' }
];

/**
 * Utility function to debounce another function call.
 */
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * 🔑 Function to test API Key validity on startup.
 */
async function testApiKey() {
    try {
        const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1`);
        if (res.status === 401) {
            throw new Error("TMDB API Key is invalid. Please check your key.");
        }
        if (!res.ok) {
            throw new Error(`TMDB API request failed with status: ${res.status}`);
        }
        return true;
    } catch (error) {
        console.error("API Key Test Failed:", error.message);
        const errorMessage = `
            ❌ **Initialization Failed** ❌
            Reason: ${error.message}
            
            Action Required: Check your '${API_KEY}' key on TMDB.
        `;
        showError(errorMessage, 'empty-message');
        document.getElementById('empty-message').style.display = 'block';
        return false;
    }
}

// --- CORE FETCH FUNCTION (Handles all categories and filters) ---

async function fetchCategoryContent(category, page, filters = {}) {
    try {
        const baseParams = `&page=${page}&include_adult=false&include_video=false&sort_by=popularity.desc`;
        // Correctly apply year and genre filters
        const filterParams = `${filters.year ? `&primary_release_year=${filters.year}` : ''}${filters.genre ? `&with_genres=${filters.genre}` : ''}`;
        let fetchURL = '';
        let mediaType = category.includes('movie') ? 'movie' : 'tv';

        if (category === 'movies') {
            fetchURL = `${BASE_URL}/discover/movie?api_key=${API_KEY}${baseParams}${filterParams}`;
        } else if (category === 'tvshows') {
            fetchURL = `${BASE_URL}/discover/tv?api_key=${API_KEY}${baseParams}${filterParams}`;
        } else if (category === 'anime') {
            // Anime base filters: genre 16 and Japanese language, augmented by user filters
            fetchURL = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja${baseParams}${filterParams}`;
        } else if (category === 'tagalog-movies') {
            fetchURL = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=tl${baseParams}${filterParams}`;
        } else if (category === 'netflix-movies') {
            fetchURL = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_watch_providers=8&watch_region=US${baseParams}${filterParams}`;
        } else if (category === 'netflix-tv') {
            fetchURL = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_watch_providers=8&watch_region=US${baseParams}${filterParams}`;
        } else if (category === 'korean-drama') {
            // KDrama base filters: Korean language and Drama genre 18, augmented by user filters
            fetchURL = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ko&with_genres=18${baseParams}${filterParams}`;
        } else {
            throw new Error('Unknown category.');
        }

        const res = await fetch(fetchURL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        // Ensure media_type is set for Discover results
        if (data.results) {
            data.results.forEach(item => item.media_type = item.media_type || mediaType);
        }
        return data;
    } catch (error) {
        console.error(`Error fetching ${category}:`, error);
        return { results: [], total_pages: 1 };
    }
}

// --- UI UTILITIES ---

function removeLoadingAndError(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.querySelector('.loading')?.remove();
        container.querySelector('.error-message')?.remove();
    }
}

function showError(message, containerId) {
  removeLoadingAndError(containerId);
  const container = document.getElementById(containerId);
  if (container) {
    const error = document.createElement('p');
    error.className = 'error-message';
    error.style.whiteSpace = 'pre-wrap';
    error.textContent = message;
    container.appendChild(error);
  }
}

function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (container.querySelector('.loading')) return;
  
  container.querySelector('.error-message')?.remove();
  
  const loading = document.createElement('p');
  loading.className = 'loading';
  loading.textContent = 'Loading...';
  container.appendChild(loading);
}

// --- SLIDESHOW LOGIC ---

function displaySlides() {
  const slidesContainer = document.getElementById('slides');
  const dotsContainer = document.getElementById('dots');
  
  slidesContainer.innerHTML = '';
  dotsContainer.innerHTML = '';
  removeLoadingAndError('slides');

  if (slideshowItems.length === 0) {
    slidesContainer.innerHTML = '<h1 class="loading">No featured content available</h1>';
    return;
  }

  slideshowItems.forEach((item, index) => {
    if (!item.backdrop_path) return;
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
    slide.innerHTML = `<h1>${item.title || item.name || 'Unknown'}</h1>`;
    slide.onclick = () => showDetails(item);
    slidesContainer.appendChild(slide);

    const dot = document.createElement('span');
    dot.className = 'dot';
    if (index === currentSlide) dot.className += ' active';
    dot.onclick = () => {
      currentSlide = index;
      showSlide();
    };
    dotsContainer.appendChild(dot);
  });

  showSlide();
}

function showSlide() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  if (slides.length === 0) return;
  slides.forEach((slide, index) => {
    slide.style.transform = `translateX(-${currentSlide * 100}%)`;
  });
  dots.forEach((dot, index) => {
    dot.className = index === currentSlide ? 'dot active' : 'dot';
  });
  clearInterval(slideshowInterval);
  slideshowInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide();
  }, 5000);
}

function changeSlide(n) {
  const slides = document.querySelectorAll('.slide');
  if (slides.length === 0) return;
  currentSlide = (currentSlide + n + slides.length) % slides.length;
  showSlide();
}

// --- MAIN PAGE LIST DISPLAY ---

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clear the container completely before displaying new filtered results
  container.innerHTML = ''; 
  removeLoadingAndError(containerId);

  if (items.length === 0) {
    container.innerHTML = '<p style="color: #ccc; text-align: center; width: 100%;">No content matches your filters.</p>';
    return;
  }

  items.forEach(item => {
    const img = document.createElement('img');
    img.src = item.poster_path ? `${IMG_URL}${item.poster_path}` : FALLBACK_IMAGE;
    img.alt = (item.title || item.name || 'Unknown') + (item.media_type ? ` (${item.media_type})` : '');
    img.setAttribute('data-id', item.id);
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

// --- FULL VIEW / INFINITE SCROLL LOGIC ---

function updateFilterButtons(category, filters) {
    const row = document.getElementById(`${category}-row`);
    const filterBtn = row.querySelector('.filter-btn');
    const clearBtn = row.querySelector('.clear-filter-btn');
    
    const isFiltered = filters.year || filters.genre;

    if (isFiltered) {
        // Use an indicator for active filter
        const genreName = filters.genre ? (GENRES.find(g => g.id == filters.genre)?.name || 'Genre') : '';
        const yearText = filters.year || '';
        
        // Ensure to always show the filter icon with the text
        filterBtn.textContent = `Filtered ${genreName} ${yearText}`.trim();
        filterBtn.style.background = 'red';
        filterBtn.style.color = 'white';
        clearBtn.style.display = 'inline-block';
    } else {
        filterBtn.innerHTML = '<i class="fas fa-filter"></i> Filter';
        filterBtn.style.background = '#444';
        filterBtn.style.color = '#fff';
        clearBtn.style.display = 'none';
    }
}

async function loadRowContent(category, filters = {}) {
    const state = categoryState[category];
    if (state.isLoading) return;

    state.isLoading = true;
    const containerId = `${category}-list`;
    showLoading(containerId);

    // Fetch only the first page for the main row preview
    const data = await fetchCategoryContent(category, 1, filters);
    
    // Update the state with the applied filters
    state.filters = filters;

    displayList(data.results.slice(0, 15), containerId); // Limit to 15 for the row view
    updateFilterButtons(category, filters);
    
    state.isLoading = false;
    document.getElementById(containerId)?.querySelector('.loading')?.remove();
}

function clearFilters(category) {
    // Reset filters and load the original content
    categoryState[category].filters = {};
    loadRowContent(category);
}


function openFullView(category) {
    currentFullView = category;
    const filters = categoryState[category].filters; // Use currently applied row filters
    
    // Create and display a new modal/container for full view
    const fullViewContainer = document.createElement('div');
    fullViewContainer.id = 'full-view-modal';
    fullViewContainer.className = 'search-modal';
    fullViewContainer.style.display = 'flex';
    document.body.appendChild(fullViewContainer);

    const title = category.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    fullViewContainer.innerHTML = `
        <span class="close" onclick="closeFullView()" style="color: red;">&times;</span>
        <h2 style="text-transform: uppercase;">${title}</h2>
        <div class="results" id="${category}-full-list"></div>
    `;

    // Reset pagination to 0 so the first call increments it to page 1
    categoryState[category].page = 0; 
    loadMoreFullView(category, filters);
    
    const listContainer = document.getElementById(`${category}-full-list`);
    listContainer.onscroll = function () {
        // Save the scroll position whenever the user scrolls
        scrollPosition = listContainer.scrollTop; 
        
        if (
            !categoryState[category].isLoading &&
            listContainer.scrollTop + listContainer.clientHeight >= listContainer.scrollHeight - 50
        ) {
            loadMoreFullView(category, filters);
        }
    };
}

function closeFullView() {
    const modal = document.getElementById('full-view-modal');
    if (modal) modal.remove();
    currentFullView = null;
    scrollPosition = 0; // Reset scroll position when closing the full view
}

// Helper to display images in the grid (similar to search results)
function displayFullList(items, containerId) {
  const container = document.getElementById(containerId);
  items.forEach(item => {
    if (container.querySelector(`img[data-id="${item.id}"]`)) return;

    const img = document.createElement('img');
    img.src = item.poster_path ? `${IMG_URL}${item.poster_path}` : FALLBACK_IMAGE;
    img.alt = item.title || item.name || 'Unknown';
    img.setAttribute('data-id', item.id);
    
    // 📢 CHANGE: Only close the movie details modal, NOT the full view modal
    img.onclick = () => showDetails(item, true); 
    
    container.appendChild(img);
  });
}

async function loadMoreFullView(category, filters) {
  const state = categoryState[category];
  const containerId = `${category}-full-list`;
  const container = document.getElementById(containerId); 

  if (state.isLoading) return;

  state.isLoading = true;
  
  showLoading(containerId);
  
  state.page++; 
  let currentPage = state.page;

  try {
    const data = await fetchCategoryContent(category, currentPage, filters);

    const items = data.results || [];
    
    // Check for end of content
    if (items.length === 0) {
        if (currentPage > 1) { 
            state.page--; // Decrement if we tried to scroll past the last page
        }
        console.log(`${category} reached end of available content or found no content matching filter.`);
        
        document.getElementById(containerId)?.querySelector('.loading')?.remove();
        state.isLoading = false;
        
        // Show a "no results" message only if no items were ever loaded into the container.
        if (container.children.length === 0) {
            container.innerHTML = '<p style="color: #ccc; text-align: center; width: 100%;">No content matches your active filter in the full view.</p>';
        }
        
        return;
    }
    
    displayFullList(items, containerId);

  } catch (error) {
    console.error(`Error loading more for ${category}:`, error);
    showError(`Failed to load more ${category}.`, containerId);
    state.page--; // Decrement page on fetch error
  } finally {
    state.isLoading = false;
    document.getElementById(containerId)?.querySelector('.loading')?.remove();
    
    // Restore scroll position after content loads (only needed for the first load)
    if (currentPage === 1 && scrollPosition > 0) {
        container.scrollTop = scrollPosition;
    }
  }
}

// --- FILTER MODAL LOGIC ---

function populateFilterOptions() {
    const yearSelect = document.getElementById('filter-year');
    const genreSelect = document.getElementById('filter-genre');
    
    // Clear previous options
    yearSelect.innerHTML = '<option value="">Any Year</option>';
    genreSelect.innerHTML = '<option value="">Any Genre</option>';
    
    // Populate Years (last 20 years)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 20; i++) {
        const year = currentYear - i;
        const option = new Option(year, year);
        yearSelect.appendChild(option);
    }
    
    // Populate Genres
    GENRES.forEach(genre => {
        const option = new Option(genre.name, genre.id);
        genreSelect.appendChild(option);
    });
}

function openFilterModal(category) {
    currentCategoryToFilter = category;
    
    const title = category.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    document.getElementById('filter-modal-title').textContent = `Filter ${title}`;
    
    // Load current filters into the dropdowns
    const currentFilters = categoryState[category].filters;
    document.getElementById('filter-year').value = currentFilters.year || '';
    document.getElementById('filter-genre').value = currentFilters.genre || '';
    
    document.getElementById('filter-modal').style.display = 'flex';
}

/**
 * 📢 FINAL REVISED FUNCTION: Updates filters and IMMEDIATELY auto-opens the full view.
 */
function applyFilters() {
    const year = document.getElementById('filter-year').value;
    const genre = document.getElementById('filter-genre').value;
    const category = currentCategoryToFilter;

    // 1. Close the filter modal
    document.getElementById('filter-modal').style.display = 'none';
    
    const newFilters = { year: year, genre: genre };

    // 2. Update the filter state and the visual button indicator
    categoryState[category].filters = newFilters;
    updateFilterButtons(category, newFilters);
    
    // 3. IMMEDIATELY open the full view as requested.
    openFullView(category);
}

// --- DETAILS MODAL LOGIC ---

async function fetchSeasonsAndEpisodes(tvId) {
  try {
    const res = await fetch(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.seasons || [];
  } catch (error) {
    console.error('Error fetching seasons:', error);
    return [];
  }
}

async function fetchEpisodes(tvId, seasonNumber) {
  try {
    const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.episodes || [];
  } catch (error) {
    console.error('Error fetching episodes:', error);
    return [];
  }
}

// 📢 CHANGE: Added optional parameter to indicate if the full view is open
async function showDetails(item, isFullViewOpen = false) {
  currentItem = item;
  currentSeason = 1;
  currentEpisode = 1;
  document.getElementById('modal-title').textContent = item.title || item.name || 'Unknown';
  document.getElementById('modal-description').textContent = item.overview || 'No description available.';
  document.getElementById('modal-image').src = item.poster_path ? `${IMG_URL}${item.poster_path}` : FALLBACK_IMAGE;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round((item.vote_average || 0) / 2));
  document.getElementById('server').value = 'player.videasy.net'; // Default server

  const seasonSelector = document.getElementById('season-selector');
  const episodeList = document.getElementById('episode-list');
  const isTVShow = item.media_type === 'tv' || (item.name && !item.title);

  if (isTVShow) {
    seasonSelector.style.display = 'block';
    const seasons = await fetchSeasonsAndEpisodes(item.id);
    const seasonSelect = document.getElementById('season');
    seasonSelect.innerHTML = '';
    
    seasons.filter(s => s.season_number > 0).forEach(season => {
      const option = document.createElement('option');
      option.value = season.season_number;
      option.textContent = `Season ${season.season_number}`;
      seasonSelect.appendChild(option);
    });
    
    currentSeason = seasons.find(s => s.season_number > 0)?.season_number || 1;
    seasonSelect.value = currentSeason;
    
    await loadEpisodes();
  } else {
    seasonSelector.style.display = 'none';
    episodeList.innerHTML = '';
  }

  changeServer();
  document.getElementById('modal').style.display = 'flex';
  
  // 📢 NEW: Hide the full view modal temporarily if it was open
  if (isFullViewOpen) {
      document.getElementById('full-view-modal').style.display = 'none';
  }
}

async function loadEpisodes() {
  if (!currentItem) return;
  const seasonNumber = document.getElementById('season').value;
  currentSeason = seasonNumber;
  const episodes = await fetchEpisodes(currentItem.id, seasonNumber);
  const episodeList = document.getElementById('episode-list');
  episodeList.innerHTML = '';
  currentEpisode = 1; 

  episodes.forEach(episode => {
    const div = document.createElement('div');
    div.className = 'episode-item';
    const img = episode.still_path
      ? `<img src="${IMG_URL}${episode.still_path}" alt="Episode ${episode.episode_number} thumbnail" />`
      : '';
    div.innerHTML = `${img}<span>E${episode.episode_number}: ${episode.name || 'Untitled'}</span>`;
    div.onclick = () => {
      currentEpisode = episode.episode_number;
      changeServer();
      document.querySelectorAll('.episode-item').forEach(e => e.classList.remove('active'));
      div.classList.add('active');
    };
    episodeList.appendChild(div);
  });
  
  if (episodes.length > 0) {
      episodeList.querySelector('.episode-item')?.click();
  }
}

function changeServer() {
  if (!currentItem) return;
  const server = document.getElementById('server').value;
  const type = currentItem.media_type || (currentItem.title ? 'movie' : 'tv');
  let embedURL = '';

  if (server === 'vidsrc.cc') {
    embedURL = type === 'tv'
      ? `https://vidsrc.cc/v2/embed/tv/${currentItem.id}/${currentSeason}/${currentEpisode}`
      : `https://vidsrc.cc/v2/embed/movie/${currentItem.id}`;
  } else if (server === 'vidsrc.me') {
    embedURL = type === 'tv'
      ? `https://vidsrc.net/embed/tv/?tmdb=${currentItem.id}&season=${currentSeason}&episode=${currentEpisode}`
      : `https://vidsrc.net/embed/movie/?tmdb=${currentItem.id}`;
  } else if (server === 'player.videasy.net') {
    embedURL = type === 'tv'
      ? `https://player.videasy.net/tv/${currentItem.id}/${currentSeason}/${currentEpisode}`
      : `https://player.videasy.net/movie/${currentItem.id}`;
  }

  document.getElementById('modal-video').src = embedURL;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('modal-video').src = '';
  document.getElementById('episode-list').innerHTML = '';
  document.getElementById('season-selector').style.display = 'none';
  
  // 📢 NEW: If the full view modal was open before, show it again.
  const fullViewModal = document.getElementById('full-view-modal');
  if (fullViewModal) {
      fullViewModal.style.display = 'flex';
  }
}


// --- SEARCH MODAL LOGIC ---

function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
}

function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
  document.getElementById('search-input').value = '';
}

const debouncedSearchTMDB = debounce(async () => {
  const query = document.getElementById('search-input').value;
  const container = document.getElementById('search-results');
  container.innerHTML = '';
  
  if (!query.trim()) return;

  container.innerHTML = '<p class="loading">Searching...</p>';

  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    container.innerHTML = ''; // Clear loading
    data.results
      .filter(item => item.media_type !== 'person' && item.poster_path)
      .forEach(item => {
        const img = document.createElement('img');
        img.src = item.poster_path ? `${IMG_URL}${item.poster_path}` : FALLBACK_IMAGE;
        img.alt = item.title || item.name || 'Unknown';
        img.onclick = () => {
          closeSearchModal();
          showDetails(item);
        };
        container.appendChild(img);
      });
      
    if (container.children.length === 0) {
        container.innerHTML = '<p style="color: #ccc; text-align: center; margin-top: 20px;">No results found.</p>';
    }

  } catch (error) {
    console.error('Error searching:', error);
    showError('Search failed. Try again.', 'search-results');
  }
}, 300);

// --- INITIALIZATION ---

async function init() {
  document.getElementById('empty-message').style.display = 'none';
  
  const apiKeyValid = await testApiKey();
  if (!apiKeyValid) {
      return;
  }
  
  populateFilterOptions(); 

  // Set up listeners for the new control buttons
  document.querySelectorAll('.show-more-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openFullView(link.getAttribute('data-category'));
    });
  });

  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default link behavior if applicable
      openFilterModal(button.getAttribute('data-category'));
    });
  });
  
  document.querySelectorAll('.clear-filter-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default link behavior if applicable
      clearFilters(button.getAttribute('data-category'));
    });
  });


  try {
    // Show loading for all sections initially
    showLoading('slides');
    showLoading('movies-list');
    showLoading('tvshows-list');
    showLoading('anime-list');
    showLoading('tagalog-movies-list');
    showLoading('netflix-movies-list');
    showLoading('netflix-tv-list');
    showLoading('korean-drama-list');

    // Fetch and display all rows concurrently (no filters applied yet)
    const [moviesData, tvShowsData, animeData, tagalogMoviesData, netflixMoviesData, netflixTVData, koreanDramaData] = await Promise.all([
      fetchCategoryContent('movies', 1),
      fetchCategoryContent('tvshows', 1),
      fetchCategoryContent('anime', 1),
      fetchCategoryContent('tagalog-movies', 1),
      fetchCategoryContent('netflix-movies', 1),
      fetchCategoryContent('netflix-tv', 1),
      fetchCategoryContent('korean-drama', 1)
    ]);

    // Prepare data for the slideshow (using the initial page 1 results)
    const allResults = [
        ...moviesData.results, ...tvShowsData.results, ...animeData.results,
        ...tagalogMoviesData.results, ...netflixMoviesData.results, ...netflixTVData.results,
        ...koreanDramaData.results
    ].filter(item => item && item.backdrop_path);

    // Create unique slideshow items from the fetched results
    slideshowItems = allResults.slice(0, 7);
    displaySlides();

    // Display the initial rows (limited to 15 items)
    displayList(moviesData.results.slice(0, 15), 'movies-list');
    displayList(tvShowsData.results.slice(0, 15), 'tvshows-list');
    displayList(animeData.results.slice(0, 15), 'anime-list');
    displayList(tagalogMoviesData.results.slice(0, 15), 'tagalog-movies-list');
    displayList(netflixMoviesData.results.slice(0, 15), 'netflix-movies-list');
    displayList(netflixTVData.results.slice(0, 15), 'netflix-tv-list');
    displayList(koreanDramaData.results.slice(0, 15), 'korean-drama-list');
    
  } catch (error) {
    console.error('Fatal initialization error:', error);
    showError('Failed to load content categories. Please check browser console.', 'empty-message');
    document.getElementById('empty-message').style.display = 'block';
  }
}

init();
