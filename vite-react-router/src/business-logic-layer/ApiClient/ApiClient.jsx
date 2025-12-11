import fetchSimplified from '../helper-function/fecthSimplyfied';

// Internal helper so every call in this module targets the v2 API segment.
const callV2 = (endpoint, options = {}) => fetchSimplified({
	version: 'v2',
	endpoint,
	...options,
});

const apiv2 = {
	health: {
		status: (options) => callV2('health', options),
	},
	auth: {
		signup: (payload, options) => callV2('auth/signup', {
			method: 'POST',
			body: payload,
			...options,
		}),
		login: (credentials, options) => callV2('auth/login', {
			method: 'POST',
			body: credentials,
			...options,
		}),
	},
	user: {
		// GET: /users/{userId}
		get: (userId, options) => callV2(`users/${userId}`, options),

		// BOOKMARKS
		// GET: /users/{userId}/bookmarks
		getBookmarks: (userId, options) => callV2(`users/${userId}/bookmarks`, options),
		// GET: /users/{userId}/bookmarks/{pageId}
		getBookmark: (userId, pageId, options) => callV2(`users/${userId}/bookmarks/${pageId}`, options),
		// POST: /users/{userId}/bookmarks
		addBookmark: (userId, pageId, options) => callV2(`users/${userId}/bookmarks`, {
			method: 'POST',
			body: { pageId },
			...options,
		}),
		// DELETE: /users/{userId}/bookmarks/{pageId}
		removeBookmark: (userId, pageId, options) => callV2(`users/${userId}/bookmarks/${pageId}`, {
			method: 'DELETE',
			...options,
		}),

		// RATINGS
		// GET: /users/{userId}/ratings
		getRatings: (userId, options) => callV2(`users/${userId}/ratings`, options),
		// GET: /users/{userId}/ratings/{titleId}
		getRating: (userId, titleId, options) => callV2(`users/${userId}/ratings/${titleId}`, options),
		// POST: /users/{userId}/ratings
		addRating: (userId, titleId, rating, options) => callV2(`users/${userId}/ratings`, {
			method: 'POST',
			body: { titleId, rating },
			...options,
		}),
		// PUT: /users/{userId}/ratings/{titleId}
		updateRating: (userId, titleId, rating, options) => callV2(`users/${userId}/ratings/${titleId}`, {
			method: 'PUT',
			body: { rating },
			...options,
		}),
		// DELETE: /users/{userId}/ratings/{titleId}
		removeRating: (userId, titleId, options) => callV2(`users/${userId}/ratings/${titleId}`, {
			method: 'DELETE',
			...options,
		}),

		// PROFILE IMAGE
		// GET: /users/{userId}/profile-image
		getProfileImage: (userId, options) => callV2(`users/${userId}/profile-image`, options),
		// PUT: /users/{userId}/profile-image
		upsertProfileImage: (userId, imageBase64, options) => callV2(`users/${userId}/profile-image`, {
			method: 'PUT',
			body: { imageBase64 },
			...options,
		}),
	},
};

Object.freeze(apiv2.health);
Object.freeze(apiv2.auth);
Object.freeze(apiv2.user);

const mdb = Object.freeze({
	apiv2: Object.freeze(apiv2),
});

export default mdb;
