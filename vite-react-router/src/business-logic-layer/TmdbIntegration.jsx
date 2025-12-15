/**
 * TMDB Integration Abstraction Layer
 * 
 * Centralizes all TMDB-related logic for easy switching between:
 * - Direct TMDB API calls (current workaround)
 * - Backend proxy endpoints (when fixed)
 * 
 * TO SWITCH BACK TO BACKEND:
 * 1. Change USE_DIRECT_TMDB to false
 * 2. Ensure backend endpoints are working
 */

import tmdbDirect from './ApiClient/TmdbDirectClient';
import mdb from './ApiClient/ApiClient';

// Set to false when backend TMDB endpoints are fixed
const USE_DIRECT_TMDB = true;

/**
 * Determines if a mediaType represents a TV show
 */
export const isTvShow = (mediaType) => {
    return mediaType === 'tvSeries' || mediaType === 'tvShow';
};

/**
 * Search for a title (movie or TV show) in TMDB
 */
export const searchTitle = async (name, mediaType, year) => {
    if (USE_DIRECT_TMDB) {
        const searchParams = {};
        if (year) {
            searchParams[isTvShow(mediaType) ? 'first_air_date_year' : 'year'] = year;
        }
        return isTvShow(mediaType)
            ? await tmdbDirect.searchTv(name, searchParams)
            : await tmdbDirect.searchMovie(name, searchParams);
    } else {
        const endpoint = isTvShow(mediaType) ? 'tv' : 'movie';
        const params = year ? { query: name, year } : { query: name };
        return await mdb.apiv2.tmdb[endpoint].search(params);
    }
};

/**
 * Get poster URL for a title
 */
export const getTitlePoster = async (name, mediaType, year) => {
    try {
        const searchResults = await searchTitle(name, mediaType, year);
        const posterPath = searchResults?.results?.[0]?.poster_path;
        
        if (!posterPath) return null;
        
        return USE_DIRECT_TMDB 
            ? tmdbDirect.getImageUrl(posterPath)
            : posterPath;
    } catch (err) {
        console.error('Error fetching title poster:', err);
        return null;
    }
};

/**
 * Get profile photo for a person/actor
 */
export const getPersonPhoto = async (name) => {
    try {
        const results = USE_DIRECT_TMDB
            ? await tmdbDirect.searchPerson(name)
            : await mdb.apiv2.tmdb.person.search({ query: name });
        
        const profilePath = results?.results?.[0]?.profile_path;
        if (!profilePath) return null;
        
        return USE_DIRECT_TMDB 
            ? tmdbDirect.getImageUrl(profilePath)
            : profilePath;
    } catch (err) {
        console.error(`Error fetching photo for ${name}:`, err);
        return null;
    }
};

/**
 * Fetch photos for multiple people in parallel
 * @param {Array<string>} names - Array of person names
 * @param {number} limit - Maximum number of photos to fetch
 * @returns {Object} Object keyed by person name with photo URLs as values
 */
export const getMultiplePersonPhotos = async (names, limit = 20) => {
    const photoPromises = names.slice(0, limit).map(async (name) => {
        const photoUrl = await getPersonPhoto(name);
        return photoUrl ? { name, photoUrl } : null;
    });
    
    const results = await Promise.all(photoPromises);
    return Object.fromEntries(
        results.filter(r => r).map(r => [r.name, r.photoUrl])
    );
};

/**
 * Get similar titles (movies or TV shows)
 */
export const getSimilarTitles = async (name, mediaType, year, limit = 20) => {
    try {
        const searchResults = await searchTitle(name, mediaType, year);
        if (!searchResults?.results?.length) return [];
        
        const tmdbId = searchResults.results[0].id;
        
        const similarResults = USE_DIRECT_TMDB
            ? (isTvShow(mediaType) 
                ? await tmdbDirect.getSimilarTv(tmdbId)
                : await tmdbDirect.getSimilarMovies(tmdbId))
            : await mdb.apiv2.tmdb[isTvShow(mediaType) ? 'tv' : 'movie'].similar(tmdbId);
        
        if (!similarResults?.results?.length) return [];
        
        return similarResults.results.slice(0, limit).map(item => {
            const posterPath = item.poster_path 
                ? (USE_DIRECT_TMDB ? tmdbDirect.getImageUrl(item.poster_path) : item.poster_path)
                : null;
            
            const year = item.first_air_date 
                ? new Date(item.first_air_date).getFullYear()
                : item.release_date 
                    ? new Date(item.release_date).getFullYear()
                    : null;
            
            return {
                id: `tmdb-${item.id}`,
                name: item.name || item.title || 'Unknown',
                image: posterPath,
                poster: posterPath,
                startYear: year,
                plot: item.overview || null
            };
        });
    } catch (err) {
        console.error('Error fetching similar titles:', err);
        return [];
    }
};

export default {
    isTvShow,
    searchTitle,
    getTitlePoster,
    getPersonPhoto,
    getMultiplePersonPhotos,
    getSimilarTitles
};
