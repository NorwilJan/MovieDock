// js/home.js
const API_KEY = '40f1982842db35042e8561b13b38d492'; // Your original TMDB API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
const FALLBACK_IMAGE = 'https://via.placeholder.com/150x225?text=No+Image'; // Fallback for missing posters
let currentItem;
let currentSeason = 1;
let currentEpisode = 1;
let currentPages = {
  movies: 1,
  tvShows: 1,
  anime: 1,
  tagalogMovies: 1,
  netflix: 1
};
let isLoading = {
  movies: false,
  tvshows: false,
  anime: false,
  'tagalog-movies': false,
  netflix: false
};
let hasMore = {
  movies: true,
  tvshows: true,
  anime: true,
  'tagalog-movies': true,
  netflix: true
};
let scrollActive = {
  movies: false,
  tvshows: false,
  anime: false,
  'tagalog-movies': false,
  netflix: false
};
let slideshowItems = [];
let currentSlide = 0;
let slideshowInterval;

async function fetchTrending(type, page = 1) {
  try {
    console.log(`Fetching trending ${type} page ${page}...`);
    const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}&page=${page}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    console.log(`Fetched ${data.results?.length || 0} items for ${type}`);
    return data;
  } catch (error) {
    console.error(`Error fetching trending ${type}:`, error);
    showError(`Failed to load ${type}. Check API key or connection.`, `${type}-list`);
    return { results: [] };
  }
}

async function fetchTrendingAnime(page = 1) {
  try {
    console.log(`Fetching anime (movies and TV shows) page ${page}...`);
    // Fetch anime movies
    const movieRes = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_genres=16&with_original_language=ja`
    );
    if (!movieRes.ok) throw new Error(`Movies HTTP ${movieRes.status}`);
    const movieData = await movieRes.json();
    const movies = movieData.results || [];

    // Fetch anime TV shows
    const tvRes = await fetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_genres=16&with_original_language=ja`
    );
    if (!tvRes.ok) throw new Error(`TV HTTP ${tvRes.status}`);
    const tvData = await tvRes.json();
    const tvShows = tvData.results || [];

    // Combine and sort by popularity
    const combined = [...movies, ...tvShows]
      .filter(item => item.poster_path) // Ensure items have posters
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 20); // Limit to 20 items per page
    console.log(`Fetched ${combined.length} anime items (movies: ${movies.length}, TV: ${tvShows.length})`);
    return combined;
  } catch (error) {
    console.error('Error fetching trending anime:', error);
    showError('Failed to load anime. Check API key or connection.', 'anime-list');
    return [];
  }
}

async function fetchTagalogMovies(page = 1) {
  try {
    console.log(`Fetching Tagalog movies page ${page}...`);
    const res = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=tl&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&with_original_language=tl`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log(`Fetched ${data.results?.length || 0} Tagalog movies`);
    return data;
  } catch (error) {
    console.error('Error fetching Tagalog movies:', error);
    showError('Failed to load Tagalog movies.', 'tagalog-movies-list');
    return { results: [] };
  }
}

async function fetchNetflixContent(page = 1) {
  try {
    console.log(`Fetching Netflix content page ${page}...`);
    const movieRes = await fetch(
      `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_watch_providers=8&watch_region=US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}`
    );
    if (!movieRes.ok) throw new Error(`Movies HTTP ${movieRes.status}`);
    const movieData = await movieRes.json();
    const movies = movieData.results || [];

    const tvRes = await fetch(
      `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_watch_providers=8&watch_region=US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}`
    );
    if (!tvRes.ok) throw new Error(`TV HTTP ${tvRes.status}`);
    const tvData = await tvRes.json();
    const tvShows = tvData.results || [];

    const combined = [...movies, ...tvShows].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    const sliced = combined.slice(0, 20);
    console.log(`Fetched ${sliced.length} Netflix items`);
    return sliced;
  } catch (error) {
    console.error('Error fetching Netflix content:', error);
    showError('Failed to load Netflix content.', 'netflix-list');
    return [];
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

function showError(message, containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    const error = document.createElement('p');
    error.className = 'error-message';
    error.textContent = message;
    container.appendChild(error);
  } else {
    const emptyMessage = document.getElementById('empty-message');
    if (emptyMessage) {
      emptyMessage.textContent = message;
      emptyMessage.style.display = 'block';
      emptyMessage.className = 'error-message';
    }
  }
}

function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const existingLoading = container.querySelector('.loading');
  if (!existingLoading) {
    const loading = document.createElement('p');
    loading.className = 'loading';
    loading.textContent = 'Loading...';
    container.appendChild(loading);
  }
}

function displaySlides() {
  const slidesContainer = document.getElementById('slides');
  const dotsContainer = document.getElementById('dots');
  slidesContainer.innerHTML = '';
  dotsContainer.innerHTML = '';

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
  container.querySelector('.loading')?.remove();
  container.querySelector('.error-message')?.remove();

  if (items.length === 0 && container.innerHTML === '') {
    container.innerHTML = '<p style="color: #ccc; text-align: center;">No content available.</p>';
    return;
  }

  items.forEach(item => {
    const img = document.createElement('img');
    img.src = item.poster_path ? `${IMG_URL}${item.poster_path}` : FALLBACK_IMAGE;
    img.alt = (item.title || item.name || 'Unknown') + (item.media_type ? ` (${item.media_type})` : '');
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

function addLoadMoreButton(containerId, category) {
  const container = document.getElementById(containerId);
  if (!container || container.querySelector('.load-more')) return;
  const button = document.createElement('button');
  button.className = 'load-more';
  button.textContent = 'Show More';
  button.onclick = () => loadMore(category);
  container.appendChild(button);
}

function addLoadMoreIfApplicable(containerId, category) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (container.innerHTML && !container.querySelector('p') && hasMore[category]) {
    addLoadMoreButton(containerId, category);
  }
}

function addScrollListener(category) {
  const containerId = category + '-list';
  const container = document.getElementById(containerId);
  if (!container) return;
  container.onscroll = function () {
    if (
      scrollActive[category] &&
      !isLoading[category] &&
      hasMore[category] &&
      container.scrollLeft + container.clientWidth >= container.scrollWidth - 50
    ) {
      loadMore(category);
    }
  };
}

async function loadMore(category) {
  if (isLoading[category] || !hasMore[category]) return;
  isLoading[category] = true;

  const containerId = category + '-list';
  const container = document.getElementById(containerId);
  const button = container.querySelector('.load-more');

  if (button) {
    button.textContent = 'Loading...';
    button.disabled = true;
  } else {
    showLoading(containerId);
  }

  let pageKey = category.replace(/-/g, '');
  if (pageKey === 'tvshows') pageKey = 'tvShows';
  if (pageKey === 'tagalogmovies') pageKey = 'tagalogMovies';
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
    } else if (category === 'netflix') {
      data = await fetchNetflixContent(currentPages[pageKey]);
    }

    const items = category === 'anime' || category === 'netflix' ? data : data.results || [];

    displayList(items, containerId);

    if (items.length < 20) {
      hasMore[category] = false;
      if (button) {
        button.textContent = 'No More Content';
        button.disabled = true;
      }
    } else if (button) {
      button.remove();
      scrollActive[category] = true;
      addScrollListener(category);
    }
  } catch (error) {
    console.error(`Error loading more for ${category}:`, error);
    showError(`Failed to load more ${category}.`, containerId);
    if (button) {
      button.textContent = 'Show More';
      button.disabled = false;
    }
  } finally {
    isLoading[category] = false;
  }
}

async function showDetails(item) {
  currentItem = item;
  currentSeason = 1;
  currentEpisode = 1;
  document.getElementById('modal-title').textContent = item.title || item.name || 'Unknown';
  document.getElementById('modal-description').textContent = item.overview || 'No description available.';
  document.getElementById('modal-image').src = item.poster_path ? `${IMG_URL}${item.poster_path}` : FALLBACK_IMAGE;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round((item.vote_average || 0) / 2));
  document.getElementById('server').value = 'player.videasy.net';

  const seasonSelector = document.getElementById('season-selector');
  const episodeList = document.getElementById('episode-list');

  if (item.media_type === 'tv' || !item.title) {
    seasonSelector.style.display = 'block';
    const seasons = await fetchSeasonsAndEpisodes(item.id);
    const seasonSelect = document.getElementById('season');
    seasonSelect.innerHTML = '';
    seasons.forEach(season => {
      if (season.season_number === 0) return;
      const option = document.createElement('option');
      option.value = season.season_number;
      option.textContent = `Season ${season.season_number}`;
      seasonSelect.appendChild(option);
    });
    await loadEpisodes();
  } else {
    seasonSelector.style.display = 'none';
    episodeList.innerHTML = '';
  }

  changeServer();
  document.getElementById('modal').style.display = 'flex';
}

async function loadEpisodes() {
  if (!currentItem || (currentItem.media_type !== 'tv' && currentItem.title)) return;
  const seasonNumber = document.getElementById('season').value;
  currentSeason = seasonNumber;
  const episodes = await fetchEpisodes(currentItem.id, seasonNumber);
  const episodeList = document.getElementById('episode-list');
  episodeList.innerHTML = '';

  episodes.forEach(episode => {
    const div = document.createElement('div');
    div.className = 'episode-item';
    const img = episode.still_path
      ? `<img src="${IMG_URL}${episode.still_path}" alt="Episode ${episode.episode_number}" />`
      : '';
    div.innerHTML = `${img}<span>Episode ${episode.episode_number}: ${episode.name || 'Untitled'}</span>`;
    div.onclick = () => {
      currentEpisode = episode.episode_number;
      changeServer();
    };
    episodeList.appendChild(div);
  });
}

function changeServer() {
  if (!currentItem) return;
  const server = document.getElementById('server').value;
  const type = currentItem.media_type || (currentItem.title ? 'movie' : 'tv');
  let embedURL = '';

  if (server === 'vidsrc.cc') {
    embedURL = type === 'tv'
      ? `https://vidsrc.cc/v2/embed/tv/${currentItem.id}/${currentSeason}/${currentEpisode}`
      : `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  } else if (server === 'vidsrc.me') {
    embedURL = type === 'tv'
      ? `https://vidsrc.net/embed/tv/?tmdb=${currentItem.id}&season=${currentSeason}&episode=${currentEpisode}`
      : `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  } else if (server === 'player.videasy.net') {
    embedURL = type === 'tv'
      ? `https://player.videasy.net/tv/${currentItem.id}/${currentSeason}/${currentEpisode}`
      : `https://player.videasy.net/${type}/${currentItem.id}`;
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
}

async function searchTMDB() {
  const query = document.getElementById('search-input').value;
  if (!query.trim()) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const container = document.getElementById('search-results');
    container.innerHTML = '';
    data.results.forEach(item => {
      const img = document.createElement('img');
      img.src = item.poster_path ? `${IMG_URL}${item.poster_path}` : FALLBACK_IMAGE;
      img.alt = item.title || item.name || 'Unknown';
      img.onclick = () => {
        closeSearchModal();
        showDetails(item);
      };
      container.appendChild(img);
    });
  } catch (error) {
    console.error('Error searching:', error);
    showError('Search failed. Try again.', 'search-results');
  }
}

async function init() {
  console.log('Initializing site...');
  document.getElementById('empty-message').style.display = 'none';

  try {
    showLoading('slides');
    showLoading('movies-list');
    showLoading('tvshows-list');
    showLoading('anime-list');
    showLoading('tagalog-movies-list');
    showLoading('netflix-list');

    const [moviesData, tvShowsData, anime, tagalogMoviesData, netflixContent] = await Promise.all([
      fetchTrending('movie', currentPages.movies),
      fetchTrending('tv', currentPages.tvShows),
      fetchTrendingAnime(currentPages.anime),
      fetchTagalogMovies(currentPages.tagalogMovies),
      fetchNetflixContent(currentPages.netflix)
    ]);

    const movies = moviesData.results || [];
    const tvShows = tvShowsData.results || [];
    const tagalogMovies = tagalogMoviesData.results || [];

    slideshowItems = [
      ...movies.slice(0, 3),
      tvShows[0] || {},
      anime[0] || {},
      tagalogMovies[0] || {},
      netflixContent[0] || {}
    ].filter(item => item.backdrop_path && (item.title || item.name));

    displaySlides();

    displayList(movies, 'movies-list');
    addLoadMoreIfApplicable('movies-list', 'movies');

    displayList(tvShows, 'tvshows-list');
    addLoadMoreIfApplicable('tvshows-list', 'tvshows');

    displayList(anime, 'anime-list');
    addLoadMoreIfApplicable('anime-list', 'anime');

    displayList(tagalogMovies, 'tagalog-movies-list');
    addLoadMoreIfApplicable('tagalog-movies-list', 'tagalog-movies');

    displayList(netflixContent, 'netflix-list');
    addLoadMoreIfApplicable('netflix-list', 'netflix');

    console.log('Initialization complete.');
  } catch (error) {
    console.error('Error initializing:', error);
    showError('Failed to load content. Please refresh or check your connection.', 'empty-message');
  }
}

init();