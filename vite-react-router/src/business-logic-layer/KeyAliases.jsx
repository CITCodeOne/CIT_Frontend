/**
 * KeyAliases Module
 *
 * This module provides a centralized system for normalizing and mapping Data Transfer Object (DTO)
 * field names to domain object property names. It handles the common problem of API responses
 * using different naming conventions  than the frontend
 * domain models.
 * This is done since we have made a lot of itterations on the backend API and we want to keep
 * the frontend working without having to refactor all the domain models every time.
 * Fallback if no alias is found, to catch any missed fields. 
 *
 * The normalizeKey function is used throughout the application to ensure consistent
 * property mapping when transforming raw API responses into application domain objects.
 * This approach allows the frontend to use consistent property names regardless of
 * how the backend API names its fields.
 */

/**
 * Key aliases for Title entities.
 * Maps various DTO field names to standardized Title property names.
 *
 * Normalization rules applied:
 * - Underscores and hyphens are removed
 * - Case is normalized to lowercase for lookup
 * - Aliases map to camelCase property names used in Title domain objects
 */
export const TITLE_KEY_ALIASES = {
    avgrating: "rating",
    iconst: "id",
    mediatype: "mediaType",
    numvotes: "numVotes",
    plotpre: "plot",
    poster: "image",
    releasedate: "releaseDate",
    runtimeminutes: "runtime",
    season: "seasonNumb",
    episodenumber: "episodeNumb",
    parentid: "seriesLink",
    seriesid: "seriesLink",
    seriesname: "seriesName",
    startyear: "startYear",
    endyear: "endYear",
    tconst: "id",
    titleid: "id",
    votecount: "numVotes",
    primaryname: "name",
    pageid: "pageId",
    pagelink: "pageId",
};

export const INDIVIDUAL_KEY_ALIASES = {
    iconst: "id",
    nconst: "id",
    namerating: "rating",
    primaryname: "name",
    birthyear: "birthYear",
    deathyear: "deathYear",
    knownfor: "knownFor",
    pageid: "pageId",
    pagelink: "pageId",
};

/**
 * Key aliases for User entities.
 * Maps authentication and user profile DTO fields to User domain properties.
 * Handles user account data, profile information, and user statistics.
 */
export const USER_KEY_ALIASES = {
    userid: "id",
    uid: "id",
    id: "id",
    name: "name",
    username: "name",
    email: "email",
    time: "createdAt",
    createdat: "createdAt",
    ratingscount: "ratingsCount",
    bookmarkscount: "bookmarksCount",
    visitedpages: "visitedPages",
    role: "role",
    profileimage: "image",
    profileimagebase64: "image",
};

/**
 * Key aliases for Rating entities.
 * Maps user rating DTO fields to Rating domain properties.
 * Handles user-submitted ratings for titles.
 */
export const RATING_KEY_ALIASES = {
    userid: "userId",
    user: "userId",
    titleid: "titleId",
    tconst: "titleId",
    id: "titleId",
    rating: "rating",
    time: "time",
    reviewtext: "reviewText",
};

export const BOOKMARK_KEY_ALIASES = {
    userid: "userId",
    pageid: "pageId",
    pagelink: "pageId",
    titleid: "titleId",
    tconst: "titleId",
    individualid: "individualId",
    nconst: "individualId",
    time: "time",
};

/**
 * Normalizes a raw key from a DTO to a standardized domain property name.
 *
 * This function implements the core key normalization logic used throughout the application.
 * It handles common API naming variations by:
 * 1. Converting the key to a compact, lowercase lookup key (removing _ and -)
 * 2. Checking if there's a specific alias mapping for that key
 * 3. Falling back to simple camelCase conversion if no alias exists
 *
 * The normalization process allows the frontend to use consistent property names
 * regardless of how the backend API formats its field names.
 *
 * @param {Object} aliases - The alias mapping object for the specific entity type
 *                          (e.g., USER_KEY_ALIASES, TITLE_KEY_ALIASES)
 * @param {string} rawKey - The raw field name from the DTO/API response
 * @returns {string} The normalized property name to use in domain objects
 *
 * @example
 * // With USER_KEY_ALIASES = { userid: "id", email: "email" }
 * normalizeKey(USER_KEY_ALIASES, "user_id")     // returns "id"
 * normalizeKey(USER_KEY_ALIASES, "email")       // returns "email"
 * normalizeKey(USER_KEY_ALIASES, "firstName")   // returns "firstName" (fallback)
 */
export const normalizeKey = (aliases, rawKey) => {
    // Convert raw key to string and handle null/undefined
    const compact = (rawKey ?? "").toString();

    // Create lookup key by removing underscores/hyphens and lowercasing
    // This normalizes different naming conventions
    const lookupKey = compact.replace(/[_\-]/g, "").toLowerCase();

    // Create fallback by converting first character to lowercase
    // This handles PascalCase -> camelCase conversion for unmapped keys
    const fallback = compact.charAt(0).toLowerCase() + compact.slice(1);

    // Return the mapped alias if it exists, otherwise use the fallback
    return aliases[lookupKey] ?? fallback;
};
