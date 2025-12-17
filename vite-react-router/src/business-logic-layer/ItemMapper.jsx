/**
 * ItemMapper Module
 *
 * This module provides data transformation functions that convert raw JSON API responses
 * into structured domain objects. It acts as the bridge between the external API data
 * format and the internal application data model, ensuring type safety and consistentformat.
 */

import { Movie, TvEpisode, TvSeries, Individual, MiscMedia, User } from "./DataClasses";
import { TITLE_KEY_ALIASES, INDIVIDUAL_KEY_ALIASES, USER_KEY_ALIASES, RATING_KEY_ALIASES, BOOKMARK_KEY_ALIASES, normalizeKey } from "./KeyAliases";

/**
 * Creates an appropriate title domain object instance based on the media type.
 *
 * This factory function determines which specific title class (Movie, TvEpisode, TvSeries)
 * should be instantiated based on the media type string from the API response.
 * For unrecognized media types, it falls back to a generic MiscMedia object.
 *
 * @param {string} mediaType - The media type string from the API (e.g., "movie", "tvepisode")
 * @returns {Movie|TvEpisode|TvSeries|MiscMedia} An instance of the appropriate title class
 */
const createTitleInstance = (mediaType) => {
    // Normalize the media type to lowercase for case-insensitive comparison
    switch ((mediaType || "").toLowerCase()) {
        case "movie":
            return new Movie();
        case "tvepisode":
            return new TvEpisode();
        case "tvseries":
            return new TvSeries();
        default:
            // For unknown media types, create a generic media object
            // Pass the original media type for reference
            return new MiscMedia({ mediaType: mediaType || "unknown" });
    }
};

/**
 * Normalizes genre data from various API formats into a consistent array of strings.
 *
 * API responses may provide genres deepending on version:
 * - Array of strings: ["Action", "Drama"]
 * - Array of objects: [{name: "Action"}, {Name: "Drama"}]
 * - Other formats that need standardization
 *
 * This function ensures all genres are returned as an array of strings,
 * handling different object property naming conventions.
 *
 * @param {unknown} value - The raw genre data from the API
 * @returns {unknown} Normalized genre data (array of strings if input was array, otherwise unchanged)
 */
const normalizeGenres = (value) => {
    // Only process arrays; return other types unchanged
    if (!Array.isArray(value)) return value;

    return value.map((genre) => {
        // If it's already a string, use it as-is
        if (typeof genre === "string") return genre;

        // If it's an object, try to extract the name using common property names
        if (genre && typeof genre === "object") return genre.name ?? genre.Name ?? "n/a";

        // For any other type, return a default value
        return "n/a";
    });
};

/**
 * Maps raw JSON title data from API responses to structured Title domain objects.
 *
 * This function transforms an array of raw title data
 * into an array of properly typed title objects (Movie, TvEpisode, TvSeries, or MiscMedia).
 *
 * - Filters out titles released before 1920 (likely data errors)
 * - Normalizes field names using TITLE_KEY_ALIASES
 * - Handles special cases for dates, genres, and ratings
 * - Skips invalid or missing values
 *
 * @param {Array<Object>} JSONarr - Array of raw title objects from API response
 * @returns {Array<Movie|TvEpisode|TvSeries|MiscMedia>} Array of mapped title domain objects
 */
export function MapTitle(JSONarr = []) {
    const itemArr = [];
    // Minimum release year to filter out likely data errors from the origional dataset
    const minReleaseYear = 1920;

    // Process each item in the input array
    for (let item of JSONarr) {
        // Determine media type from the item, checking multiple possible property names
        const mediaType = (item?.mediaType ?? item?.MediaType ?? "").toString();

        // Create the appropriate title instance based on media type
        const titleItem = createTitleInstance(mediaType);

        // Iterate through all properties of the raw item
        Object.entries(item || {}).forEach(([rawKey, rawValue]) => {
            // Skip null, undefined, or "N/A" values
            if (rawValue === undefined || rawValue === null || rawValue === "N/A") {
                return;
            }

            // Normalize the key using the title aliases
            const key = normalizeKey(TITLE_KEY_ALIASES, rawKey);

            // Skip if the normalized key doesn't exist in the target object
            if (!(key in titleItem)) return;

            let value = rawValue;

            // Special handling for release dates
            if (key === "releaseDate") {
                // Extract just the date part (YYYY-MM-DD) from ISO datetime strings
                value = value.toString().split("T")[0];
                // Extract the year for validation
                const year = Number(value.split("-")[0]);
                // Skip titles released before the minimum year (likely data errors)
                if (year && year < minReleaseYear) {
                    return;
                }
            }

            // Special handling for genres
            if (key === "genres") {
                value = normalizeGenres(value);
            }

            // Special handling for ratings - skip "N/A" rating values
            if (key === "rating" && value === "N/A") {
                return;
            }

            // Assign the processed value to the title object
            titleItem[key] = value;
        });

        // Ensure the media type is set on the object
        // Use the determined media type, or fall back to existing/default values
        titleItem.mediaType = mediaType || titleItem.mediaType || "unknown";

        // Add the processed title to the result array
        itemArr.push(titleItem);
    }

    return itemArr;
}

/**
 * Maps raw JSON individual data from API responses.
 *
 * This function transforms an array of raw individual data into an array of Individual objects.
 * It applies key normalization and basic data validation to ensure consistent object structure.
 *
 * The mapping is simpler than titles since individuals don't have the same complexity
 * of media types, dates, or special field transformations.
 * Is added to maintain consistency in data handling across entity types.
 *
 * @param {Array<Object>} JSONarr - Array of raw individual objects from API response
 * @returns {Array<Individual>} Array of mapped Individual domain objects
 */
export function MapIndividual(JSONarr = []) {
    const itemArr = [];

    // Process each item in the input array
    for (let item of JSONarr) {
        // Create a new Individual instance for each item
        const individualItem = new Individual();

        // Iterate through all properties of the raw item
        Object.entries(item || {}).forEach(([rawKey, value]) => {
            // Skip null, undefined, or "N/A" values
            if (value === undefined || value === null || value === "N/A") {
                return;
            }

            // Normalize the key using the individual aliases
            const key = normalizeKey(INDIVIDUAL_KEY_ALIASES, rawKey);

            // Skip if the normalized key doesn't exist in the target object
            if (!(key in individualItem)) return;

            // Assign the value directly (no special transformations needed for individuals)
            individualItem[key] = value;
        });

        // Add the processed individual to the result array
        itemArr.push(individualItem);
    }

    return itemArr;
}

/**
 * Ensures the input is an array. If it's already an array, returns it as-is.
 * If it's a single item, wraps it in an array. If null/undefined, returns empty array.
 * This is done to normalize API responses that may return single objects or arrays.
 *
 * @param {unknown} data - The data to convert to an array
 * @returns {Array} An array containing the data
 */
const toArray = (data) => Array.isArray(data) ? data : (data ? [data] : []);

/**
 * Maps raw title data from the API to application-specific title objects.
 * Uses the MapTitle function from ItemMapper to transform DTOs.
 * Handles both single title and array of titles responses.
 *
 * @param {Object|Array} payload - Raw title data from API (single or array)
 * @returns {Object|Array|null} Mapped title object(s) or null if no data
 */
export const mapTitles = (payload) => {
    const mapped = MapTitle(toArray(payload));
    return Array.isArray(payload) ? mapped : mapped[0] ?? null;
};

/**
 * Maps raw individual data from the API to application-specific individual objects.
 * Uses the MapIndividual function from ItemMapper to transform DTOs.
 * Handles both single individual and array of individuals responses.
 *
 * @param {Object|Array} payload - Raw individual data from API (single or array)
 * @returns {Object|Array|null} Mapped individual object(s) or null if no data
 */
export const mapIndividuals = (payload) => {
    const mapped = MapIndividual(toArray(payload));
    return Array.isArray(payload) ? mapped : mapped[0] ?? null;
};

/**
 * Maps a raw user DTO from the API to a User instance.
 * Uses key aliases to handle different naming conventions between frontend and backend.
 *
 * @param {Object} dto - Raw user data from API
 * @returns {User|null} Mapped User instance or null if no data
 */
export const mapUser = (dto) => {
    if (!dto) return null;
    const user = new User();
    Object.entries(dto).forEach(([rawKey, value]) => {
        if (value === undefined || value === null) return;
        const key = normalizeKey(USER_KEY_ALIASES, rawKey);
        if (key in user) {
            user[key] = value;
        }
    });

    // If ratingsCount is 0 but we have ratings array, calculate the count
    if (user.ratingsCount === 0 && Array.isArray(user.ratings)) {
        user.ratingsCount = user.ratings.length;
    }
    // Similarly for bookmarks
    if (user.bookmarksCount === 0 && Array.isArray(user.bookmarks)) {
        user.bookmarksCount = user.bookmarks.length;
    }
    return user;
};

/**
 * Maps raw rating data from the API to application-specific rating objects.
 * Uses key aliases to normalize field names and ensures consistent structure.
 *
 * @param {Object|Array} payload - Raw rating data from API (single or array)
 * @returns {Array} Array of mapped rating objects
 */
export const mapRatings = (payload) => toArray(payload).map((dto) => {
    const rating = { userId: null, titleId: null, rating: null, time: null, reviewText: null };
    Object.entries(dto || {}).forEach(([rawKey, value]) => {
        if (value === undefined || value === null) return;
        const key = normalizeKey(RATING_KEY_ALIASES, rawKey);
        if (key in rating) {
            rating[key] = value;
        }
    });
    return rating;
});

/**
 * Maps a single rating DTO to a rating object.
 * Useful when expecting a single rating response.
 *
 * @param {Object} payload - Raw rating data from API
 * @returns {Object|null} Mapped rating object or null if no data
 */
export const mapSingleRating = (payload) => mapRatings(payload)[0] ?? null;

/**
 * Maps raw bookmark data from the API to application-specific bookmark objects.
 * Uses key aliases to normalize field names and ensures consistent structure.
 *
 * @param {Object|Array} payload - Raw bookmark data from API (single or array)
 * @returns {Array} Array of mapped bookmark objects
 */
export const mapBookmarks = (payload) => toArray(payload).map((dto) => {
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

/**
 * Maps a single bookmark DTO to a bookmark object.
 * Useful when expecting a single bookmark response.
 *
 * @param {Object} payload - Raw bookmark data from API
 * @returns {Object|null} Mapped bookmark object or null if no data
 */
export const mapSingleBookmark = (payload) => mapBookmarks(payload)[0] ?? null;