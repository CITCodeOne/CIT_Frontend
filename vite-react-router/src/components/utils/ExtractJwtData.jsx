// localStorage key used to persist the JWT issued by the backend.
const TOKEN_STORAGE_KEY = "cit.jwt";

/**
 * Decodes the JWT into a plain object.
 * @param {string} token - The raw JWT string (header.payload.signature).
 * @returns {object|null} Parsed claims or null if decoding fails.
 */
const parsePayload = (token) => {
	if (!token) return null;
	const [, payload] = token.split(".");
	if (!payload || typeof globalThis?.atob !== "function") return null;
	const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
	const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
	try {
		return JSON.parse(globalThis.atob(padded));
	} catch (error) {
		console.warn("Failed to decode JWT", error);
		return null;
	}
};

export const parseJwtClaims = parsePayload;

/**
 * Reads the backend-specific UID claim that identifies the user.
 * @param {object|null} claims - Parsed JWT claims.
 * @returns {string} User id or empty string when absent.
 */
export const deriveUserId = (claims) => claims?.uid ?? "";

/**
 * Pulls the username out of the jwt token.
 * @param {object|null} claims - Parsed JWT claims.
 * @returns {string} Username or empty string when not provided.
 */
export const deriveUsername = (claims) =>
	claims?.username ?? claims?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ?? "";

/**
 * Retrieves the persisted JWT from localStorage.
 * @returns {string} JWT token string or an empty string when unavailable.
 */
export const getStoredToken = () => {
	if (typeof window === "undefined") return "";
	return window.localStorage.getItem(TOKEN_STORAGE_KEY) || "";
};

export { TOKEN_STORAGE_KEY };
