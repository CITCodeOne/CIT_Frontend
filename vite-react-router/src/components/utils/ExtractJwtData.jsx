// Hjaelpefunktioner til at laese det mest grundlaeggende ud af en JWT fra backend.
// Token gemmes i browserens localStorage under noeglen her, naar en bruger logger ind.
// Formaal: hente simpelt bruger-id og brugernavn uden ekstra API-kald, sa UI hurtigt kender brugeren.
const TOKEN_STORAGE_KEY = "cit.jwt";

/**
 * Decodes the JWT into a plain object.
 * @param {string} token - The raw JWT string (header.payload.signature).
 * @returns {object|null} Parsed claims or null if decoding fails.
 */
const parsePayload = (token) => {
	// JWT er delt i tre stykker med punktummer; payload er midterstykket med info om brugeren
	if (!token) return null;
	const [, payload] = token.split(".");
	if (!payload) return null;

	// JWT bruger en URL-venlig Base64; vi normaliserer tilbage til standard, sa browseren kan afkode den
	const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
	// Base64 kraever padding med '=' i blokke af 4 tegn; padEnd sikrer korrekt laengde
	const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
	try {
		// atob laver Base64 til tekst; JSON.parse laver teksten til et almindeligt JS-objekt
		return JSON.parse(atob(padded));
	} catch (error) {
		// Fejl her betyder som regel at token er beskadiget eller manuelt aendret
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
// Finder brugerens id i claims; tom streng hvis det mangler, sa UI undgaar undefined-fejl
export const deriveUserId = (claims) => claims?.uid ?? "";

/**
 * Pulls the username out of the jwt token.
 * @param {object|null} claims - Parsed JWT claims.
 * @returns {string} Username or empty string when not provided.
 */
export const deriveUsername = (claims) =>
	// Forsoger flere mulige feltnavne: det korte 'username' eller den aeldre WS-Fed URI
	claims?.username ?? claims?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ?? "";

/**
 * Retrieves the persisted JWT from localStorage.
 * @returns {string} JWT token string or an empty string when unavailable.
 */
export const getStoredToken = () => {
	// Returnerer tom streng hvis intet token er gemt; goer kaldere simple at skrive
	return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
};

// Eksporter noeglen sa alle dele af appen bruger samme navn i localStorage
export { TOKEN_STORAGE_KEY };
