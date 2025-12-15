/**
 * TEMPORARY WORKAROUND: Direct TMDB API Client
 * 
 * This bypasses the broken backend TMDB proxy and calls TMDB API directly.
 * 
 * Configuration is loaded from tmdbApiConfig.json (gitignored).
 * Use tmdbApiConfig.example.json as a template.
 * 
 * TODO: Remove this file once backend /api/v2/tmdb/movie endpoints are working
 */

// Try to load tmdbApiConfig.json, fallback to environment variable
let tmdbConfig = { apiKey: import.meta.env.VITE_TMDB_API_KEY };
try {
    const config = await import('../../../tmdbApiConfig.json');
    tmdbConfig = config.default?.tmdb || config.tmdb || tmdbConfig;
} catch (error) {
    console.warn('tmdbApiConfig.json not found, using environment variable or hardcoded fallback');
}

const TMDB_API_KEY = tmdbConfig.apiKey || '1e9eb1fdefa6a2d8c83ca92e5e5198ca';
const TMDB_BASE_URL = tmdbConfig.baseUrl || 'https://api.themoviedb.org/3';

/**
 * Generic TMDB API fetch helper
 */
async function tmdbFetch(endpoint, params = {}) {
    try {
        const searchParams = new URLSearchParams({
            api_key: TMDB_API_KEY,
            ...params
        });
        const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${searchParams}`);
        
        if (!response.ok) {
            console.warn(`TMDB API call failed: ${endpoint} (${response.status})`);
            return { results: [] };
        }
        return await response.json();
    } catch (error) {
        console.error(`TMDB API error: ${endpoint}`, error);
        return { results: [] };
    }
}

/**
 * Search helper for queries
 */
async function search(type, query, params = {}) {
    if (!query?.trim()) return { results: [] };
    return tmdbFetch(`/search/${type}`, { query: query.trim(), ...params });
}

// Public API methods
export const searchMovieDirect = (query, params = {}) => search('movie', query, params);
export const searchTvDirect = (query, params = {}) => search('tv', query, params);
export const searchPersonDirect = (query, params = {}) => search('person', query, params);

export async function getSimilarMoviesDirect(tmdbId) {
    return tmdbId ? tmdbFetch(`/movie/${tmdbId}/similar`) : { results: [] };
}

export async function getSimilarTvDirect(tmdbId) {
    return tmdbId ? tmdbFetch(`/tv/${tmdbId}/similar`) : { results: [] };
}

export async function getMovieByImdbDirect(imdbId) {
    if (!imdbId) return null;
    
    const data = await tmdbFetch(`/find/${imdbId}`, { external_source: 'imdb_id' });
    return data?.movie_results?.[0] || null;
}

export function getTmdbImageUrl(path, size = 'w500') {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export default {
    searchMovie: searchMovieDirect,
    searchTv: searchTvDirect,
    searchPerson: searchPersonDirect,
    getSimilarMovies: getSimilarMoviesDirect,
    getSimilarTv: getSimilarTvDirect,
    getMovieByImdb: getMovieByImdbDirect,
    getImageUrl: getTmdbImageUrl
};
