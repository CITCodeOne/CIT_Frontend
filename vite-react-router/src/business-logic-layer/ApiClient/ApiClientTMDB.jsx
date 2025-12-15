import fetchSimplified from "../helper-function/FetchSimplified";

// Default TMDB append list used by the proxy for person details
export const tmdbDefaults = {
	personAppend: "external_ids,images,combined_credits"
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
		return callTMDB("person", {
			queryParams: { query, ...queryParams },
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
	}
};

export default tmdbApi;
