/**
 * TMDB Integration Abstraction Layer (proxy-only)
 *
 * Centralizes TMDB-related logic to use the backend proxy under `/api/v2/tmdb`.
 */

import mdb from './ApiClient/ApiClient';

/**
 * Determines if a mediaType represents a TV show
 */
export const isTvShow = (mediaType) => {
    return mediaType === 'tvSeries' || mediaType === 'tvShow';
};

/**
 * Search for a title (movie or TV show) in TMDB via backend proxy
 */
export const searchTitle = async (name, mediaType, year) => {
    const searchParams = {};
    if (year) {
        searchParams[isTvShow(mediaType) ? 'first_air_date_year' : 'year'] = year;
    }
    return isTvShow(mediaType)
        ? await mdb.tmdb.searchTv(name, searchParams)
        : await mdb.tmdb.searchMovie(name, searchParams);
};

/**
 * Helper: build TMDB image URL for a given poster/profile path
 */
export function getImageUrl(path, size = 'w500') {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

/**
 * Get poster URL for a title
 */
export const getTitlePoster = async (name, mediaType, year) => {
    try {
        const searchResults = await searchTitle(name, mediaType, year);
        const posterPath = searchResults?.results?.[0]?.poster_path;

        if (!posterPath) return null;

        return getImageUrl(posterPath);
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
        const results = await mdb.tmdb.searchPerson(name, { page: 1 });

        const profilePath = results?.results?.[0]?.profile_path;
        if (!profilePath) return null;

        return getImageUrl(profilePath);
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

        const similarResults = isTvShow(mediaType)
            ? await mdb.tmdb.getTvSimilar(tmdbId)
            : await mdb.tmdb.getMovieSimilar(tmdbId);

        if (!similarResults?.results?.length) return [];

        return similarResults.results.slice(0, limit).map(item => {
            const posterPath = item.poster_path ? getImageUrl(item.poster_path) : null;

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
