import fetchSimplified from '../helper-function/FetchSimplified';
import { MapTitle, MapIndividual } from '../ItemMapper';
import { normalizeKey, USER_KEY_ALIASES, RATING_KEY_ALIASES, BOOKMARK_KEY_ALIASES } from '../KeyAliases';
import { User } from '../DataClasses';

// Internal helper so every call in this module targets the v2 API segment.
const callV2 = (endpoint, options = {}) => fetchSimplified({
	version: 'v2',
	endpoint,
	...options,
});

const toArray = (data) => Array.isArray(data) ? data : (data ? [data] : []);

const mapTitles = (payload) => {
	const mapped = MapTitle(toArray(payload));
	return Array.isArray(payload) ? mapped : mapped[0] ?? null;
};

const mapIndividuals = (payload) => {
	const mapped = MapIndividual(toArray(payload));
	return Array.isArray(payload) ? mapped : mapped[0] ?? null;
};
const mapUser = (dto) => {
	if (!dto) return null;
	const user = new User();
	Object.entries(dto).forEach(([rawKey, value]) => {
		if (value === undefined || value === null) return;
		const key = normalizeKey(USER_KEY_ALIASES, rawKey);
		if (key in user) {
			user[key] = value;
		}
	});

	if (user.ratingsCount === 0 && Array.isArray(user.ratings)) {
		user.ratingsCount = user.ratings.length;
	}
	if (user.bookmarksCount === 0 && Array.isArray(user.bookmarks)) {
		user.bookmarksCount = user.bookmarks.length;
	}
	return user;
};

const mapRatings = (payload) => toArray(payload).map((dto) => {
	const rating = { userId: null, titleId: null, rating: null, time: null };
	Object.entries(dto || {}).forEach(([rawKey, value]) => {
		if (value === undefined || value === null) return;
		const key = normalizeKey(RATING_KEY_ALIASES, rawKey);
		if (key in rating) {
			rating[key] = value;
		}
	});
	return rating;
});

const mapSingleRating = (payload) => mapRatings(payload)[0] ?? null;

const mapBookmarks = (payload) => toArray(payload).map((dto) => {
	const bookmark = { userId: null, pageId: null, titleId: null, individualId: null, time: null };
	Object.entries(dto || {}).forEach(([rawKey, value]) => {
		if (value === undefined || value === null) return;
		const key = normalizeKey(BOOKMARK_KEY_ALIASES, rawKey);
		if (key in bookmark) {
			bookmark[key] = value;
		}
	});
	return bookmark;
});

const mapSingleBookmark = (payload) => mapBookmarks(payload)[0] ?? null;

const apiv2 = {
	health: {
		status: (options) => callV2('health', options),
	},
	titles: {
		// GET: /titles?page=1&pageSize=20
		list: ({ page = 1, pageSize = 20 } = {}, options) => callV2('titles', {
			queryParams: { page, pageSize },
			...options,
		}).then(mapTitles),
		// GET: /titles/{id}
		getById: (id, options) => callV2(`titles/${id}`, options).then(mapTitles),
		// GET: /titles/{id}/ratings
		getRatings: (id, options) => callV2(`titles/${id}/ratings`, options).then(mapRatings),
		// GET: /titles/{id}/individuals
		getIndividuals: (id, options) => callV2(`titles/${id}/individuals`, options).then(mapIndividuals),
	},
	individuals: {
		// GET: /individuals?page=1&pageSize=20
		list: ({ page = 1, pageSize = 20 } = {}, options) => callV2('individuals', {
			queryParams: { page, pageSize },
			...options,
		}).then(mapIndividuals),
		// GET: /individuals/{id}
		getById: (id, options) => callV2(`individuals/${id}`, options).then(mapIndividuals),
		// GET: /individuals/{id}/titles
		getTitles: (id, options) => callV2(`individuals/${id}/titles`, options).then(mapTitles),
	},
	auth: {
		// POST: /auth/signup
		signup: (payload, options) => callV2('auth/signup', {
			method: 'POST',
			body: payload,
			...options,
		}),
		// POST: /auth/login
		login: (credentials, options) => callV2('auth/login', {
			method: 'POST',
			body: credentials,
			...options,
		}),
	},
	user: {
		// GET: /users/{userId}
		get: (userId, options) => callV2(`users/${userId}`, options).then(mapUser),

		// BOOKMARKS
		// GET: /users/{userId}/bookmarks
		getBookmarks: (userId, options) => callV2(`users/${userId}/bookmarks`, options).then(mapBookmarks),
		// GET: /users/{userId}/bookmarks/{pageId}
		getBookmark: (userId, pageId, options) => callV2(`users/${userId}/bookmarks/${pageId}`, options).then(mapSingleBookmark),
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
		getRatings: (userId, options) => callV2(`users/${userId}/ratings`, options).then(mapRatings),
		// GET: /users/{userId}/ratings/{titleId}
		getRating: (userId, titleId, options) => callV2(`users/${userId}/ratings/${titleId}`, options).then(mapSingleRating),
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
Object.freeze(apiv2.titles);
Object.freeze(apiv2.individuals);
Object.freeze(apiv2.auth);
Object.freeze(apiv2.user);

const mdb = Object.freeze({
	apiv2: Object.freeze(apiv2),
});

export default mdb;
