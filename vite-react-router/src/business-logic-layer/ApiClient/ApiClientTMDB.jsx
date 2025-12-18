import fetchSimplified from "../helper-function/FetchSimplified";

// Default TMDB append list used by the proxy for person details
export const tmdbDefaults = {
	personAppend: "external_ids,images,combined_credits",
	movieAppend: "credits,images"
};

// Helper to call the TMDB proxy endpoints under /api/v2/tmdb
const callTMDB = (endpoint, options = {}) => fetchSimplified({
	version: "v2",
	endpoint: `tmdb/${String(endpoint).replace(/^\/+/, "")}`,
	...options
});

const tmdbApi = {
	/**
	 * Search people (actors, crew, etc.) via TMDB proxy
	 * @param {string} query - Person name to search for
	 * @param {object} queryParams - Extra query params (e.g., page)
	 * @param {object} options - fetchSimplified options (authToken, signal, etc.)
	 */
	searchPerson: (query, queryParams = {}, options = {}) => {
		if (!query || !query.trim()) {
			return Promise.resolve({ results: [] });
		}
		// backend exposes person search at `person/search`
		return callTMDB("person/search", {
			queryParams: { query, ...queryParams },
			...options
		});
	},

	/**
	 * Search TMDB for movie posters via proxy.
	 * @param {string} query - Movie title to search for.
	 * @param {object} options - fetchSimplified options (authToken, signal, etc.).
	 * @returns {Promise<Array<{title: string, posterUrl: string}>>}
	 */
	getMoviePosters: (query, options = {}) => {
		if (!query || !query.trim()) {
			return Promise.resolve([]);
		}
		return callTMDB("movie/posters", {
			queryParams: { query },
			...options
		});
	},

	/**
	 * Get person details via TMDB proxy
	 * @param {string|number} id - TMDB person id
	 * @param {object} queryParams - Optional params (append overrides default)
	 * @param {object} options - fetchSimplified options
	 */
	getPerson: (id, queryParams = {}, options = {}) => {
		if (!id) return Promise.resolve(null);
		const { append = tmdbDefaults.personAppend, ...rest } = queryParams;
		return callTMDB(`person/${id}`, {
			queryParams: { append, ...rest },
			...options
		});
	},

	/**
	 * Search for movies/titles via TMDB proxy
	 * @param {string} query - Movie title to search for
	 * @param {object} queryParams - Extra query params (e.g., page, year)
	 * @param {object} options - fetchSimplified options (authToken, signal, etc.)
	 */
	// Search movies via backend proxy at `movie/search`
	searchMovie: (query, queryParams = {}, options = {}) => {
		if (!query || !query.trim()) {
			return Promise.resolve({ results: [] });
		}
		return callTMDB("movie/search", {
			queryParams: { query, ...queryParams },
			...options
		});
	},

	// Search TV shows via backend proxy at `tv/search`
	searchTv: (query, queryParams = {}, options = {}) => {
		if (!query || !query.trim()) {
			return Promise.resolve({ results: [] });
		}
		return callTMDB("tv/search", {
			queryParams: { query, ...queryParams },
			...options
		});
	},

	/**
	 * Get movie details via TMDB proxy by IMDb ID
	 * @param {string} imdbId - IMDb ID (e.g., "tt0111161")
	 * @param {object} queryParams - Optional params (append overrides default)
	 * @param {object} options - fetchSimplified options
	 */
	/**
	 * Find by IMDb id via backend `find` endpoint and return first movie result
	 */
	getMovieByImdb: async (imdbId, queryParams = {}, options = {}) => {
		if (!imdbId) return Promise.resolve(null);
		const { append = tmdbDefaults.movieAppend, ...rest } = queryParams;
		// backend exposes `/api/v2/tmdb/find?imdbId=...`
		const resp = await callTMDB(`find`, {
			queryParams: { imdbId, ...rest },
			...options
		});
		// Expect response shape similar to TMDB find: { movie_results: [...] }
		if (!resp) return null;
		return resp.movie_results?.[0] || null;
	},

	/**
	 * Direct wrapper for backend `find` endpoint — returns full find response
	 */
	findByImdb: (imdbId, options = {}) => {
		if (!imdbId) return Promise.resolve(null);
		return callTMDB('find', { queryParams: { imdbId }, ...options });
	},

	// Movie similar titles via backend `movie/{id}/similar`
	getMovieSimilar: (id, queryParams = {}, options = {}) => {
		if (!id) return Promise.resolve({ results: [] });
		return callTMDB(`movie/${id}/similar`, { queryParams: { ...queryParams }, ...options });
	},

	// TV similar titles via backend `tv/{id}/similar`
	getTvSimilar: (id, queryParams = {}, options = {}) => {
		if (!id) return Promise.resolve({ results: [] });
		return callTMDB(`tv/${id}/similar`, { queryParams: { ...queryParams }, ...options });
	},

	/**
	 * Get movie details via TMDB proxy by TMDB ID
	 * @param {string|number} tmdbId - TMDB movie id
	 * @param {object} queryParams - Optional params (append overrides default)
	 * @param {object} options - fetchSimplified options
	 */
	getMovie: (tmdbId, queryParams = {}, options = {}) => {
		if (!tmdbId) return Promise.resolve(null);
		const { append = tmdbDefaults.movieAppend, ...rest } = queryParams;
		return callTMDB(`movie/${tmdbId}`, {
			queryParams: { append, ...rest },
			...options
		});
	}

	
};

export default tmdbApi;
