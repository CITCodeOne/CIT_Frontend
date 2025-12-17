/**
 * API Client Module for CIT Frontend Application
 *
 * This module provides a structured interface for interacting with the backend API.
 * It abstracts away the details of HTTP requests, authentication, and data mapping,
 * allowing components and hooks to easily fetch and manipulate data from the server.
 *
 * The module is organized around API versions (currently v2) and resource types
 * (titles, individuals, users, auth, health). Each resource type contains methods
 * for common CRUD operations, with automatic data transformation from DTOs to
 * application-specific data structures.
 */

import fetchSimplified from '../helper-function/FetchSimplified';
import { MapTitle, MapIndividual, mapTitles, mapIndividuals, mapUser, mapRatings, mapSingleRating, mapBookmarks, mapSingleBookmark } from '../ItemMapper';
import tmdb from './ApiClientTMDB';

/**
 * Internal helper function that wraps fetchSimplified to target the v2 API segment.
 * This ensures all API calls in this module use the correct API version prefix.
 *
 * @param {string} endpoint - The relative endpoint path (e.g., 'titles', 'users/123')
 * @param {Object} options - Additional options passed to fetchSimplified
 * @returns {Promise<unknown>} The response from the API call
 */
const callV2 = (endpoint, options = {}) => fetchSimplified({
	version: 'v2',
	endpoint,
	...options,
});




const apiv2 = {
	/**
	 * Health check endpoints for monitoring API availability and status.
	 * Returns ok status if the API server is reachable and functioning.
	 */
	health: {
		/**
		 * Performs a health check on the API server.
		 * Returns basic status information about the server's health.
		 *
		 * @param {Object} options - Additional fetch options (authToken, etc.)
		 * @returns {Promise<Object>} Health status response
		 */
		status: (options) => callV2('health', options),
	},
	/**
	 * Endpoints for managing title resources (movies, TV shows, etc.).
	 * Titles are the main content entities in the application.
	 */
	titles: {
		// GET: /titles?page=1&pageSize=20
		/**
		 * Retrieves a paginated list of titles.
		 * Supports pagination parameters to control the number of results
		 * and which page to retrieve.
		 *
		 * @param {Object} params - Pagination parameters
		 * @param {number} params.page - Page number (default: 1)
		 * @param {number} params.pageSize - Number of items per page (default: 20)
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Array>} Array of mapped title objects
		 */
		list: ({ page = 1, pageSize = 20 } = {}, options) => callV2('titles', {
			queryParams: { page, pageSize },
			...options,
		}).then(mapTitles),

		// GET: /titles/{id}
		/**
		 * Retrieves a single title by its ID.
		 * Returns detailed information about a specific title.
		 *
		 * @param {string|number} id - The unique identifier of the title
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Object|null>} Mapped title object or null if not found
		 */
		getById: (id, options) => callV2(`titles/${id}`, options).then(mapTitles),

		// GET: /titles/{id}/ratings
		/**
		 * Retrieves all ratings for a specific title.
		 * Returns user ratings/reviews associated with the title.
		 *
		 * @param {string|number} id - The unique identifier of the title
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Array>} Array of rating objects for the title
		 */

		getRatings: (id, options) => callV2(`titles/${id}/ratings`, options).then(mapRatings),
		// GET: /titles/{id}/individuals
		/**
		 * Retrieves individuals (cast/crew) associated with a title.
		 * Returns people who worked on or appeared in the title.
		 *
		 * @param {string|number} id - The unique identifier of the title
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Array>} Array of individual objects associated with the title
		 */
		getIndividuals: (id, options) => callV2(`titles/${id}/individuals`, options).then(mapIndividuals),

		// GET: /titles/{id}/similar
		/**
		 * Retrieves movies similar to the given title based on overlapping genres.
		 * Returns titles with similar genre profiles, including overlap count.
		 *
		 * @param {string} id - Title ID (tt...) to find similar movies for
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Array>} Array of similar title objects with genre overlap information
		 */
		getSimilar: (id, options) => callV2(`titles/${id}/similar`, options).then(mapTitles),

		// GET: /titles/{id}/page
		/**
		 * Retrieves the page reference for a given title.
		 * Returns the PageReferenceDTO for the title or 404 if not found.
		 *
		 * @param {string|number} id - The unique identifier of the title
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Object|null>} PageReferenceDTO or null if not found
		 */
		getPageByTitle: (id, options) => callV2(`titles/${id}/page`, options),
		// GET: /titles/top/{mediaType}?page=1&pageSize=20
		/**
		 * Retrieves top rated titles by media type.
		 * Returns paginated list of top rated movies or TV series.
		 *
		 * @param {string} mediaType - The media type ('movie' or 'tvSeries')
		 * @param {Object} params - Pagination parameters
		 * @param {number} params.page - Page number (default: 1)
		 * @param {number} params.pageSize - Number of items per page (default: 20)
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Array>} Array of mapped title objects
		 */
		top: (mediaType, { page = 1, pageSize = 20 } = {}, options) => callV2(`titles/top/${mediaType}`, {
			queryParams: { page, pageSize },
			...options,
		}).then(mapTitles),

		// GET: /titles/featured
		/**
		 * Retrieves a featured title.
		 * Returns a curated highlighted title.
		 *
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Object|null>} Mapped title object or null if not found
		 */
		featured: (options) => callV2('titles/featured', options).then(mapTitles),

		// POST: /titles/search
		/**
		 * Searches titles with flexible parameters.
		 * Supports filtering by rating, genre, media type, title term, year range, adult content,
		 * and sorting options with pagination.
		 *
		 * @param {Object} parameters - Search parameters
		 * @param {number} [parameters.minRating] - Minimum average rating
		 * @param {string} [parameters.genre] - Genre to filter by
		 * @param {string} [parameters.mediaType] - Media type ('movie', 'tvSeries', etc.)
		 * @param {string} [parameters.titleSearchTerm] - Title name search term
		 * @param {number} [parameters.minYear] - Minimum release year
		 * @param {number} [parameters.maxYear] - Maximum release year
		 * @param {boolean} [parameters.isAdult] - Filter adult content
		 * @param {string} [parameters.sortBy] - Sort field ('year', 'title', or default 'rating')
		 * @param {boolean} [parameters.sortDescending] - Sort direction
		 * @param {number} parameters.page - Page number (required)
		 * @param {number} parameters.pageSize - Items per page (required)
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Array>} Array of mapped title objects
		 */
		search: (parameters, options) => callV2('titles/search', {
			queryParams: parameters,
			...options,
		}).then(mapTitles),

	},/*
	__________________________________________
	|| Example usage of the search endpoint:||
	__________________________________________

	const searchTitles = async () => {
    	const searchParams = {
        minRating: 7.0,           	// Optional: minimum average rating
        genre: 'Action',          	// Optional: filter by genre
        mediaType: 'movie',       	// Optional: 'movie', 'tvSeries', etc.
        titleSearchTerm: 'Batman',	// Optional: search in title names
        minYear: 2000,            	// Optional: minimum release year
        maxYear: 2020,            	// Optional: maximum release year
        isAdult: false,           	// Optional: filter adult content
        sortBy: 'year',           	// Optional: 'year', 'title', or omit for rating
        sortDescending: true,     	// Optional: sort direction
        page: 1,                  	// Optional: page number
        pageSize: 20              	// Optional: items per page
    };

    try {
        const results = await mdb.apiv2.titles.search(searchParams);
        console.log('Search results:', results);
        // results will be an array of mapped Title objects
    } catch (error) {
        console.error('Search failed:', error);
    } */



	/**
	 * Endpoints for managing individual resources (actors, directors, etc.).
	 * Individuals represent people in the entertainment industry.
	 */
	individuals: {
		// GET: /individuals?page=1&pageSize=20
		/**
		 * Retrieves a paginated list of individuals.
		 * Supports pagination to browse through the database of people.
		 *
		 * @param {Object} params - Pagination parameters
		 * @param {number} params.page - Page number (default: 1)
		 * @param {number} params.pageSize - Number of items per page (default: 20)
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Array>} Array of mapped individual objects
		 */
		list: ({ page = 1, pageSize = 20 } = {}, options) => callV2('individuals', {
			queryParams: { page, pageSize },
			...options,
		}).then(mapIndividuals),

		// GET: /individuals/popular?page=1&pageSize=20
		/**
		 * Retrieves a paginated list of the most popular individuals ordered by NameRating.
		 * Filters out individuals where NameRating is null.
		 *
		 * @param {Object} params - Pagination parameters
		 * @param {number} params.page - Page number (default: 1)
		 * @param {number} params.pageSize - Number of items per page (default: 20)
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Array>} Array of mapped individual objects
		 */
		popular: ({ page = 1, pageSize = 20 } = {}, options) => callV2('individuals/popular', {
			queryParams: { page, pageSize },
			...options,
		}).then(mapIndividuals),

		// GET: /individuals/{id}
		/**
		 * Retrieves a single individual by their ID.
		 * Returns detailed information about a specific person.
		 *
		 * @param {string|number} id - The unique identifier of the individual
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Object|null>} Mapped individual object or null if not found
		 */

		getById: (id, options) => callV2(`individuals/${id}`, options).then(mapIndividuals),
		// GET: /individuals/{id}/titles
		/**
		 * Retrieves all titles associated with an individual.
		 * Returns movies/TV shows that this person worked on or appeared in.
		 *
		 * @param {string|number} id - The unique identifier of the individual
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Array>} Array of title objects associated with the individual
		 */

		getTitles: (id, options) => callV2(`individuals/${id}/titles`, options).then(mapTitles),
		// GET: /individuals/{id}/popular-actors
		/**
		 * Retrieves popular actors related to a given individual or title.
		 * Returns co-actors or cast members based on the provided ID.
		 *
		 * @param {string} id - Individual ID (nm...) or Title ID (tt...) to find related popular actors
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Array>} Array of popular actor objects (IndividualFullDTO)
		 */

		getPopularActors: (id, options) => callV2(`individuals/${id}/popular-actors`, options).then(mapIndividuals),
		// GET: /individuals/co-actors?name={name}
		/**
		 * Finds co-actors for a given actor name, sorted by collaboration count.
		 * Returns actors who have worked with the specified actor.
		 *
		 * @param {string} actorName - Name of the actor to find co-actors for
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Array>} Array of co-actor objects with collaboration counts
		 */
		getCoActors: (actorName, options) => callV2('individuals/co-actors', {
			queryParams: { name: actorName },
			...options,
		}).then(mapIndividuals),
		// GET: /individuals/search?name={name}
		/**
		 * Searches for individuals by name and returns their contributions to titles.
		 * Performs case-insensitive partial matching. Returns all individuals if name is empty.
		 *
		 * @param {string} [name] - Name to search for (optional, returns all if empty)
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Array>} Array of individual search results with contributions
		 */
		search: (name, options) => callV2('individuals/search', {
			queryParams: name ? { name } : {},
			...options,
		}).then(mapIndividuals),
	},

	/**
	 * Authentication endpoints for user login and registration.
	 * Handles user account creation and session establishment.
	 */
	auth: {
		// POST: /auth/signup
		/**
		 * Creates a new user account.
		 * Registers a new user with the provided information.
		 *
		 * @param {Object} payload - User registration data
		 * @param {string} payload.username - Desired username
		 * @param {string} payload.email - User's email address
		 * @param {string} payload.password - User's password
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Object>} Authentication response with user data and tokens
		 */
		signup: (payload, options) => callV2('auth/signup', {
			method: 'POST',
			body: payload,
			...options,
		}),

		// POST: /auth/login
		/**
		 * Authenticates an existing user.
		 * Logs in a user with their credentials and returns authentication tokens.
		 *
		 * @param {Object} credentials - User login credentials
		 * @param {string} credentials.username - User's username or email
		 * @param {string} credentials.password - User's password
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Object>} Authentication response with user data and tokens
		 */
		login: (credentials, options) => callV2('auth/login', {
			method: 'POST',
			body: credentials,
			...options,
		}),
	},
	/**
 * Page endpoints for retrieving page resources.
 */
	page: {
		// GET: /page/{pageId}
		/**
		 * Retrieves a page by id (raw DTO).
		 *
		 * @param {string|number} pageId - The id of the page
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Object|null>} Page DTO or null
		 */
		getById: (pageId, options) => callV2(`pages/${pageId}`, options),
	},

	/**
	 * User management endpoints for profile data, bookmarks, and ratings.
	 * Provides comprehensive user account management functionality.
	 */
	user: {
		// GET: /users/{userId}
		/**
		 * Retrieves a user's profile information.
		 * Returns detailed user data including ratings and bookmarks counts.
		 *
		 * @param {string|number} userId - The unique identifier of the user
		 * @param {Object} options - Additional fetch options (usually includes authToken)
		 * @returns {Promise<User|null>} Mapped User instance or null if not found
		 */
		get: (userId, options) => callV2(`users/${userId}`, options).then(mapUser),

		// BOOKMARKS
		// GET: /users/{userId}/bookmarks
		/**
		 * Retrieves all bookmarks for a user.
		 * Returns a list of titles/pages that the user has bookmarked.
		 *
		 * @param {string|number} userId - The unique identifier of the user
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Array>} Array of bookmark objects
		 */
		getBookmarks: (userId, options) => callV2(`users/${userId}/bookmarks`, options).then(mapBookmarks),

		// GET: /users/{userId}/bookmarks/{pageId}
		/**
		 * Retrieves a specific bookmark for a user.
		 * Checks if a particular page/title is bookmarked by the user.
		 *
		 * @param {string|number} userId - The unique identifier of the user
		 * @param {string|number} pageId - The identifier of the bookmarked page
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Object|null>} Bookmark object or null if not found
		 */
		getBookmark: (userId, pageId, options) => callV2(`users/${userId}/bookmarks/${pageId}`, options).then(mapSingleBookmark),

		// POST: /users/{userId}/bookmarks
		/**
		 * Adds a new bookmark for a user.
		 * Creates a bookmark association between the user and a page/title.
		 *
		 * @param {string|number} userId - The unique identifier of the user
		 * @param {string|number} pageId - The identifier of the page to bookmark
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Object>} Created bookmark object
		 */
		addBookmark: (userId, pageId, options) => callV2(`users/${userId}/bookmarks`, {
			method: 'POST',
			body: { pageId },
			...options,
		}),

		// DELETE: /users/{userId}/bookmarks/{pageId}
		/**
		 * Removes a bookmark for a user.
		 * Deletes the bookmark association between the user and a page/title.
		 *
		 * @param {string|number} userId - The unique identifier of the user
		 * @param {string|number} pageId - The identifier of the bookmarked page to remove
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<void>} Resolves when bookmark is successfully removed
		 */
		removeBookmark: (userId, pageId, options) => callV2(`users/${userId}/bookmarks/${pageId}`, {
			method: 'DELETE',
			...options,
		}),

		// RATINGS
		// GET: /users/{userId}/ratings
		/**
		 * Retrieves all ratings submitted by a user.
		 * Returns a list of all title ratings the user has given.
		 *
		 * @param {string|number} userId - The unique identifier of the user
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Array>} Array of rating objects
		 */
		getRatings: (userId, options) => callV2(`users/${userId}/ratings`, options).then(mapRatings),

		// GET: /users/{userId}/ratings/{titleId}
		/**
		 * Retrieves a specific rating given by a user to a title.
		 * Returns the user's rating for a particular title if it exists.
		 *
		 * @param {string|number} userId - The unique identifier of the user
		 * @param {string|number} titleId - The identifier of the rated title
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Object|null>} Rating object or null if not found
		 */
		getRating: (userId, titleId, options) => callV2(`users/${userId}/ratings/${titleId}`, options).then(mapSingleRating),
		// POST: /users/{userId}/ratings
		/**
		 * Adds a new rating (and optional review) for a user.
		 * Creates a rating association between the user and a title.
		 *
		 * @param {string|number} userId - The unique identifier of the user
		 * @param {string|number} titleId - The identifier of the title to rate
		 * @param {number} rating - The rating value (typically 1-5 or 1-10 scale)
		 * @param {string} reviewText - Optional review text content
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Object>} Created rating object
		 */
		addRating: (userId, titleId, rating, reviewText = null, options) => callV2(`users/${userId}/ratings`, {
			method: 'POST',
			body: reviewText ? { titleId, rating, reviewText } : { titleId, rating },
			...options,
		}),

		// PUT: /users/{userId}/ratings/{titleId}
		/**
		 * Updates an existing rating (and optional review) for a user.
		 * Modifies the rating value and/or review text for a title that the user has already rated.
		 *
		 * @param {string|number} userId - The unique identifier of the user
		 * @param {string|number} titleId - The identifier of the title being rated
		 * @param {number} rating - The new rating value
		 * @param {string} reviewText - Optional review text content
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Object>} Updated rating object
		 */
		updateRating: (userId, titleId, rating, reviewText = null, options) => callV2(`users/${userId}/ratings/${titleId}`, {
			method: 'PUT',
			body: reviewText ? { rating, reviewText } : { rating },
			...options,
		}),		// DELETE: /users/{userId}/ratings/{titleId}
		/**
		 * Removes a rating for a user.
		 * Deletes the rating association between the user and a title.
		 *
		 * @param {string|number} userId - The unique identifier of the user
		 * @param {string|number} titleId - The identifier of the rated title to remove
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<void>} Resolves when rating is successfully removed
		 */
		removeRating: (userId, titleId, options) => callV2(`users/${userId}/ratings/${titleId}`, {
			method: 'DELETE',
			...options,
		}),

		// PROFILE IMAGE
		// GET: /users/{userId}/profile-image
		/**
		 * Retrieves a user's profile image.
		 * Returns the base64-encoded image data for the user's avatar.
		 *
		 * @param {string|number} userId - The unique identifier of the user
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Object>} Response containing image data
		 */
		//getProfileImage: (userId, options) => callV2(`users/${userId}/profile-image`, options),

		// PUT: /users/{userId}/profile-image
		/**
		 * Updates or sets a user's profile image.
		 * Uploads a new profile image for the user, replacing any existing one.
		 *
		 * @param {string|number} userId - The unique identifier of the user
		 * @param {string} imageBase64 - Base64-encoded image data
		 * @param {Object} options - Additional fetch options
		 * @returns {Promise<Object>} Response confirming image update
		 */
		upsertProfileImage: (userId, imageBase64, options) => callV2(`users/${userId}/profile-image`, {
			method: 'PUT',
			body: { imageBase64 },
			...options,
		}),
	}


};

// Freeze the API objects to prevent accidental modifications
// This ensures the API structure remains immutable and prevents
// runtime errors from modifying the API interface
Object.freeze(apiv2.health);
Object.freeze(apiv2.titles);
Object.freeze(apiv2.individuals);
Object.freeze(apiv2.auth);
Object.freeze(apiv2.user);

/**
 * Main database/API client export object.
 * This is the primary interface that components and hooks should use
 * to interact with the backend API. The structure provides organized
 * access to all API endpoints through a consistent, immutable interface.
 *
 * Usage example:
 * import mdb from './ApiClient';
 * const titles = await mdb.apiv2.titles.list({ page: 1, pageSize: 10 });
 */
const mdb = Object.freeze({
	apiv2: Object.freeze(apiv2),
	tmdb: Object.freeze(tmdb),
});

export default mdb;
