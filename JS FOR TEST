// js/home.js
const API_KEY = '40f1982842db35042e8561b13b38d492'; // Your original TMDB API key - UNCHANGED
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
const FALLBACK_IMAGE = 'https://via.placeholder.com/150x225?text=No+Image';
let currentItem;
let currentSeason = 1;
let currentEpisode = 1;
let currentPages = {
  movies: 1,
  tvShows: 1,
  anime: 1,
  tagalogMovies: 1,
  netflixMovies: 1,
  netflixTV: 1,
  koreanDrama: 1
};
let isLoading = {
  movies: false,
  tvshows: false,
  anime: false,
  'tagalog-movies': false,
  'netflix-movies': false,
  'netflix-tv': false,
  'korean-drama': false
};
let slideshowItems = [];
let currentSlide = 0;
let slideshowInterval;
let currentFullView = null; // Tracks the category currently in the full view
let currentFilters = {}; // Stores the active filters for the current full view
let currentCategoryToFilter = null; // Tracks the category targeted by the filter modal

// Simplified Genre IDs for the filter dropdown
const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
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

// --- API FETCH FUNCTIONS (Simplified for the main page load) ---

async function fetchTrending(type, page = 1) {
  try {
    const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}&page=${page}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    if (data.results) {
        data.results.forEach(item => item.media_type = item.media_type || type);
    }
    return data;
  } catch (error) {
    console.error(`Error fetching trending ${type}:`, error);
    showError(`Failed to load ${type}. Check API key or connection.`, `${type}-list`);
    return { results: [], total_pages: 1 };
  }
}

async function fetchTrendingAnime(page = 1) {
  try {
    // Only fetch TV anime for the main page row to keep it simple and consistent
    const tvRes = await fetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_genres=16&with_original_language=ja`
    );
    if (!tvRes.ok) throw new Error(`TV HTTP ${tvRes.status}`);
    const tvData = await tvRes.json();
    const tvShows = (tvData.results || []).map(item => ({...item, media_type: 'tv'}));

    // Limit to 20 for the main row display
    const combined = tvShows
      .filter(item => item.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 20); 

    return { results: combined, total_pages: tvData.total_pages || 1 };
  } catch (error) {
    console.error('Error fetching trending anime:', error);
    showError('Failed to load anime. Check API key or connection.', 'anime-list');
    return { results: [], total_pages: 1 };
  }
}

async function fetchTagalogMovies(page = 1) {
  try {
    const res = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=tl&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_original_language=tl`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.results) {
        data.results.forEach(item => item.media_type = 'movie');
    }
    return data;
  } catch (error) {
    console.error('Error fetching Tagalog movies:', error);
    showError('Failed to load Tagalog movies.', 'tagalog-movies-list');
    return { results: [], total_pages: 1 };
  }
}

async function fetchNetflixMovies(page = 1) {
  try {
    const res = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_watch_providers=8&watch_region=US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.results) {
        data.results.forEach(item => item.media_type = 'movie');
    }
    return data;
  } catch (error) {
    console.error('Error fetching Netflix movies:', error);
    showError('Failed to load Netflix movies.', 'netflix-movies-list');
    return { results: [], total_pages: 1 };
  }
}

async function fetchNetflixTV(page = 1) {
  try {
    const res = await fetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_watch_providers=8&watch_region=US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.results) {
        data.results.forEach(item => item.media_type = 'tv');
    }
    return data;
  } catch (error) {
    console.error('Error fetching Netflix TV:', error);
    showError('Failed to load Netflix TV shows.', 'netflix-tv-list');
    return { results: [], total_pages: 1 };
  }
}

async function fetchKoreanDrama(page = 1) {
  try {
    const res = await fetch(
      // Targeting TV, Korean language (ko), Drama genre (18)
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ko&with_genres=18&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.results) {
        // Assume TV type for this category
        data.results.forEach(item => item.media_type = 'tv');
    }
    return data;
  } catch (error) {
    console.error('Error fetching Korean Drama:', error);
    showError('Failed to load Korean Drama.', 'korean-drama-list');
    return { results: [], total_pages: 1 };
  }
}

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
  if (!container) {
    console.error(`Container ${containerId} not found`);
    return;
  }
  
  removeLoadingAndError(containerId);

  if (items.length === 0 && container.children.length === 0) {
    container.innerHTML = '<p style="color: #ccc; text-align: center;">No content available.</p>';
    return;
  }

  items.forEach(item => {
    if (container.querySelector(`img[data-id="${item.id}"]`)) return;

    const img = document.createElement('img');
    img.src = item.poster_path ? `${IMG_URL}${item.poster_path}` : FALLBACK_IMAGE;
    img.alt = (item.title || item.name || 'Unknown') + (item.media_type ? ` (${item.media_type})` : '');
    img.setAttribute('data-id', item.id);
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

// --- FULL VIEW / INFINITE SCROLL LOGIC ---

// Helper function to map hyphenated category string to camelCase page key
function getPageKey(category) {
    const keyMap = {
        'movies': 'movies', 'tvshows': 'tvShows', 'anime': 'anime', 
        'tagalog-movies': 'tagalogMovies', 'netflix-movies': 'netflixMovies', 
        'netflix-tv': 'netflixTV', 'korean-drama': 'koreanDrama'
    };
    return keyMap[category];
}

function openFullView(category) {
    currentFullView = category;
    currentFilters = {}; // Reset filters when using the "Show More" link
    
    // Create and display a new modal/container for full view
    const fullViewContainer = document.createElement('div');
    fullViewContainer.id = 'full-view-modal';
    fullViewContainer.className = 'search-modal'; // Re-use search-modal CSS for full screen
    fullViewContainer.style.display = 'flex';
    document.body.appendChild(fullViewContainer);

    // Dynamic title based on category
    const title = category.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    fullViewContainer.innerHTML = `
        <span class="close" onclick="closeFullView()" style="color: red;">&times;</span>
        <h2 style="text-transform: uppercase;">${title}</h2>
        <div class="results" id="${category}-full-list"></div>
    `;

    // Initialize/reset pagination and fetch the first page of content
    resetPagination(category);
    loadMoreFullView(category, currentFilters);
    
    // Setup infinite scroll for the full view
    const listContainer = document.getElementById(category + '-full-list');
    listContainer.onscroll = function () {
        if (
            !isLoading[category] &&
            listContainer.scrollTop + listContainer.clientHeight >= listContainer.scrollHeight - 50
        ) {
            loadMoreFullView(category, currentFilters);
        }
    };
}

function closeFullView() {
    const modal = document.getElementById('full-view-modal');
    if (modal) modal.remove();
    currentFullView = null;
    currentFilters = {};
}

function resetPagination(category) {
    const pageKey = getPageKey(category);
    if (pageKey) {
        currentPages[pageKey] = 0; // Will be incremented to 1 in loadMoreFullView
    }
    isLoading[category] = false;
}

// Helper to display images in the grid (similar to search results)
function displayFullList(items, containerId) {
  const container = document.getElementById(containerId);
  items.forEach(item => {
    // Prevent duplicates in the infinite list
    if (container.querySelector(`img[data-id="${item.id}"]`)) return;

    const img = document.createElement('img');
    img.src = item.poster_path ? `${IMG_URL}${item.poster_path}` : FALLBACK_IMAGE;
    img.alt = item.title || item.name || 'Unknown';
    img.setAttribute('data-id', item.id);
    img.onclick = () => {
        closeFullView(); // Close full view before showing details
        showDetails(item);
    };
    container.appendChild(img);
  });
}

async function loadMoreFullView(category, filters) {
  const pageKey = getPageKey(category);

  if (!pageKey || isLoading[category]) return;

  isLoading[category] = true;
  const containerId = category + '-full-list';
  
  showLoading(containerId);
  
  currentPages[pageKey]++;
  let currentPage = currentPages[pageKey];

  try {
    let data;
    const baseParams = `&page=${currentPage}&include_adult=false&include_video=false&sort_by=popularity.desc`;
    let fetchURL = '';
    
    // Add filters to the URL
    const filterParams = `${filters.year ? `&primary_release_year=${filters.year}` : ''}${filters.genre ? `&with_genres=${filters.genre}` : ''}`;
    
    // Determine the API endpoint based on category and filters
    if (category === 'movies') {
        fetchURL = `${BASE_URL}/discover/movie?api_key=${API_KEY}${baseParams}${filterParams}`;
    } else if (category === 'tvshows') {
        fetchURL = `${BASE_URL}/discover/tv?api_key=${API_KEY}${baseParams}${filterParams}`;
    } else if (category === 'anime') {
        // Anime filtering is limited to the existing logic + year/genre filter
        fetchURL = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja${baseParams}${filterParams}`;
    } else if (category === 'tagalog-movies') {
        fetchURL = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=tl${baseParams}${filterParams}`;
    } else if (category === 'netflix-movies') {
        fetchURL = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_watch_providers=8&watch_region=US${baseParams}${filterParams}`;
    } else if (category === 'netflix-tv') {
        fetchURL = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_watch_providers=8&watch_region=US${baseParams}${filterParams}`;
    } else if (category === 'korean-drama') {
        fetchURL = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ko&with_genres=18${baseParams}${filterParams}`;
    } else {
        throw new Error('Unknown category for full view.');
    }
    
    const res = await fetch(fetchURL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();

    const items = data.results || [];
    
    if (items.length === 0) {
        currentPages[pageKey]--; 
        console.log(`${category} reached end of available content.`);
        document.getElementById(containerId)?.querySelector('.loading')?.remove();
        isLoading[category] = false;
        return;
    }
    
    // Assign media_type if missing, as discover calls don't always include it
    items.forEach(item => item.media_type = item.media_type || (category.includes('movie') ? 'movie' : 'tv'));
    
    displayFullList(items, containerId);

  } catch (error) {
    console.error(`Error loading more for ${category}:`, error);
    showError(`Failed to load more ${category}.`, containerId);
  } finally {
    isLoading[category] = false;
    document.getElementById(containerId)?.querySelector('.loading')?.remove();
  }
}

// --- FILTER MODAL LOGIC ---

function populateFilterOptions() {
    const yearSelect = document.getElementById('filter-year');
    const genreSelect = document.getElementById('filter-genre');
    
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
    
    // Reset selections on open
    document.getElementById('filter-year').value = currentFilters.year || '';
    document.getElementById('filter-genre').value = currentFilters.genre || '';
    
    document.getElementById('filter-modal').style.display = 'flex';
}

function applyFilters() {
    const year = document.getElementById('filter-year').value;
    const genre = document.getElementById('filter-genre').value;
    
    document.getElementById('filter-modal').style.display = 'none';
    
    // Update global filter state
    currentFilters = { year: year, genre: genre };

    // Close any existing full view and open a new one with filters
    closeFullView();
    openFullView(currentCategoryToFilter);
}


// --- DETAILS MODAL LOGIC ---

async function showDetails(item) {
  currentItem = item;
  currentSeason = 1;
  currentEpisode = 1;
  document.getElementById('modal-title').textContent = item.title || item.name || 'Unknown';
  document.getElementById('modal-description').textContent = item.overview || 'No description available.';
  document.getElementById('modal-image').src = item.poster_path ? `${IMG_URL}${item.poster_path}` : FALLBACK_IMAGE;
  // Rating out of 5 stars (10/2)
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
    
    // Filter out season 0 (Specials) and populate the dropdown
    seasons.filter(s => s.season_number > 0).forEach(season => {
      const option = document.createElement('option');
      option.value = season.season_number;
      option.textContent = `Season ${season.season_number}`;
      seasonSelect.appendChild(option);
    });
    
    // Set the initial season to the first available season, or 1
    currentSeason = seasons.find(s => s.season_number > 0)?.season_number || 1;
    seasonSelect.value = currentSeason;
    
    await loadEpisodes();
  } else {
    seasonSelector.style.display = 'none';
    episodeList.innerHTML = '';
  }

  changeServer();
  document.getElementById('modal').style.display = 'flex';
}

async function loadEpisodes() {
  if (!currentItem) return;
  const seasonNumber = document.getElementById('season').value;
  currentSeason = seasonNumber;
  const episodes = await fetchEpisodes(currentItem.id, seasonNumber);
  const episodeList = document.getElementById('episode-list');
  episodeList.innerHTML = '';
  currentEpisode = 1; // Reset episode when season changes

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
      // Optional: highlight selected episode
      document.querySelectorAll('.episode-item').forEach(e => e.classList.remove('active'));
      div.classList.add('active');
    };
    episodeList.appendChild(div);
  });
  
  // Auto-select and load the first episode
  if (episodes.length > 0) {
      episodeList.querySelector('.episode-item')?.click();
  }
}

function changeServer() {
  if (!currentItem) return;
  const server = document.getElementById('server').value;
  // Determine type from media_type property
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

// Debounced version of searchTMDB
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
}, 300); // 300ms debounce delay

// --- INITIALIZATION ---

async function init() {
  document.getElementById('empty-message').style.display = 'none';
  
  const apiKeyValid = await testApiKey();
  if (!apiKeyValid) {
      return;
  }
  
  populateFilterOptions(); // Populate year and genre dropdowns

  // Set up listeners for the new Show More and Filter buttons
  document.querySelectorAll('.show-more-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openFullView(link.getAttribute('data-category'));
    });
  });

  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      openFilterModal(button.getAttribute('data-category'));
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

    // Fetch only the first page for the main row display
    const [moviesData, tvShowsData, animeData, tagalogMoviesData, netflixMoviesData, netflixTVData, koreanDramaData] = await Promise.all([
      fetchTrending('movie', 1),
      fetchTrending('tv', 1),
      fetchTrendingAnime(1),
      fetchTagalogMovies(1),
      fetchNetflixMovies(1),
      fetchNetflixTV(1),
      fetchKoreanDrama(1)
    ]);

    const movies = moviesData.results || [];
    const tvShows = tvShowsData.results || [];
    const anime = animeData.results || [];
    const tagalogMovies = tagalogMoviesData.results || [];
    const netflixMovies = netflixMoviesData.results || [];
    const netflixTV = netflixTVData.results || [];
    const koreanDrama = koreanDramaData.results || [];

    // Combine for slideshow
    slideshowItems = [
      ...movies.slice(0, 2),
      ...tvShows.slice(0, 2),
      anime[0] || {},
      tagalogMovies[0] || {},
      netflixMovies[0] || {}, 
      netflixTV[0] || {},
      koreanDrama[0] || {} 
    ].filter(item => item.backdrop_path && (item.title || item.name));

    displaySlides();

    // Display the initial rows (no infinite scroll here anymore)
    displayList(movies, 'movies-list');
    displayList(tvShows, 'tvshows-list');
    displayList(anime, 'anime-list');
    displayList(tagalogMovies, 'tagalog-movies-list');
    displayList(netflixMovies, 'netflix-movies-list');
    displayList(netflixTV, 'netflix-tv-list');
    displayList(koreanDrama, 'korean-drama-list');
    
  } catch (error) {
    console.error('Fatal initialization error:', error);
    showError('Failed to load content categories. Please check browser console.', 'empty-message');
    document.getElementById('empty-message').style.display = 'block';
  }
}

init();
