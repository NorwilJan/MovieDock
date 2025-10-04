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
  tagalogMovies: 1, // Correct key format for page counter
  netflixMovies: 1,
  netflixTV: 1,
  koreanDrama: 1
};
let isLoading = {
  movies: false,
  tvshows: false,
  anime: false,
  'tagalog-movies': false, // Correct key format for loading flag
  'netflix-movies': false,
  'netflix-tv': false,
  'korean-drama': false
};
let slideshowItems = [];
let currentSlide = 0;
let slideshowInterval;

/**
 * Utility function to debounce another function call.
 * Ensures a function is not called until a certain time has passed after the last call.
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
    const movieRes = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_genres=16&with_original_language=ja`
    );
    if (!movieRes.ok) throw new Error(`Movies HTTP ${movieRes.status}`);
    const movieData = await movieRes.json();
    const movies = (movieData.results || []).map(item => ({...item, media_type: 'movie'}));

    const tvRes = await fetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_genres=16&with_original_language=ja`
    );
    if (!tvRes.ok) throw new Error(`TV HTTP ${tvRes.status}`);
    const tvData = await tvRes.json();
    const tvShows = (tvData.results || []).map(item => ({...item, media_type: 'tv'}));

    const combined = [...movies, ...tvShows]
      .filter(item => item.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 20); 

    return { results: combined, total_pages: Math.max(movieData.total_pages || 1, tvData.total_pages || 1) };
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

function addScrollListener(category) {
  const containerId = category + '-list';
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.onscroll = function () {
    if (
      !isLoading[category] &&
      container.scrollLeft + container.clientWidth >= container.scrollWidth - 50
    ) {
      loadMore(category);
    }
  };
}

async function loadMore(category) {
  // Translate category string to the correct key name for currentPages (e.g., 'tvshows' -> 'tvShows')
  let pageKey = category.replace(/-/g, 'Movies').replace('tvshows', 'tvShows');
  
  // Specific key mappings for hyphenated names
  if (category === 'tagalog-movies') pageKey = 'tagalogMovies'; // 🛠️ FIX APPLIED HERE
  if (category === 'netflix-movies') pageKey = 'netflixMovies';
  if (category === 'netflix-tv') pageKey = 'netflixTV';
  if (category === 'korean-drama') pageKey = 'koreanDrama';

  if (isLoading[category]) return;

  isLoading[category] = true;
  const containerId = category + '-list';
  
  showLoading(containerId);
  
  currentPages[pageKey]++;

  try {
    let data;
    if (category === 'movies') {
      data = await fetchTrending('movie', currentPages[pageKey]);
    } else if (category === 'tvshows') {
      data = await fetchTrending('tv', currentPages[pageKey]);
    } else if (category === 'anime') {
      data = await fetchTrendingAnime(currentPages[pageKey]);
    } else if (category === 'tagalog-movies') {
      data = await fetchTagalogMovies(currentPages[pageKey]);
    } else if (category === 'netflix-movies') {
      data = await fetchNetflixMovies(currentPages[pageKey]);
    } else if (category === 'netflix-tv') {
      data = await fetchNetflixTV(currentPages[pageKey]);
    } else if (category === 'korean-drama') {
      data = await fetchKoreanDrama(currentPages[pageKey]);
    }

    const items = data.results || [];
    
    // Stop loading if the API returns no results for the next page
    if (items.length === 0) {
        currentPages[pageKey]--; 
        console.log(`${category} reached end of available content.`);
        document.getElementById(containerId)?.querySelector('.loading')?.remove();
        isLoading[category] = false;
        return;
    }
    
    displayList(items, containerId);

  } catch (error) {
    console.error(`Error loading more for ${category}:`, error);
    showError(`Failed to load more ${category}.`, containerId);
  } finally {
    isLoading[category] = false;
    document.getElementById(containerId)?.querySelector('.loading')?.remove();
  }
}

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

async function init() {
  document.getElementById('empty-message').style.display = 'none';
  
  const apiKeyValid = await testApiKey();
  if (!apiKeyValid) {
      return;
  }

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

    const [moviesData, tvShowsData, animeData, tagalogMoviesData, netflixMoviesData, netflixTVData, koreanDramaData] = await Promise.all([
      fetchTrending('movie', currentPages.movies),
      fetchTrending('tv', currentPages.tvShows),
      fetchTrendingAnime(currentPages.anime),
      fetchTagalogMovies(currentPages.tagalogMovies),
      fetchNetflixMovies(currentPages.netflixMovies),
      fetchNetflixTV(currentPages.netflixTV),
      fetchKoreanDrama(currentPages.koreanDrama)
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

    displayList(movies, 'movies-list');
    displayList(tvShows, 'tvshows-list');
    displayList(anime, 'anime-list');
    displayList(tagalogMovies, 'tagalog-movies-list');
    displayList(netflixMovies, 'netflix-movies-list');
    displayList(netflixTV, 'netflix-tv-list');
    displayList(koreanDrama, 'korean-drama-list');
    
    // Setup infinite scroll listeners
    addScrollListener('movies');
    addScrollListener('tvshows');
    addScrollListener('anime');
    addScrollListener('tagalog-movies');
    addScrollListener('netflix-movies');
    addScrollListener('netflix-tv');
    addScrollListener('korean-drama');

  } catch (error) {
    console.error('Fatal initialization error:', error);
    showError('Failed to load content categories. Please check browser console.', 'empty-message');
    document.getElementById('empty-message').style.display = 'block';
  }
}

init();
