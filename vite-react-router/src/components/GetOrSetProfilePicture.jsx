import { encodeImageToBase64 } from "./EncodeImageBase64";

// Default API base for profile-image endpoints.
const API_BASE_URL = "https://localhost:5001";

/**
 * Normalizes back-end payloads so callers always get a valid data URL.
 * @param {string} rawValue - Base64 string or existing data URL.
 * @param {string} mimeType - Mime type to use when constructing the data URL.
 * @returns {string|null} - Data URL or null when the payload is empty.
 */
const normalizeDataUrl = (rawValue, mimeType = "image/jpeg") => {
    const sanitized = (rawValue || "").trim().replace(/^"|"$/g, "");
    if (!sanitized) return null;
    if (sanitized.startsWith("data:image")) return sanitized;
    return `data:${mimeType};base64,${sanitized}`;
};

/**
 * Picks the first plausible image field returned from the API.
 * @param {object} payload - JSON payload coming from the profile-image endpoint.
 * @returns {string} - Raw base64/image string or empty string when missing.
 */
const readImagePayload = (payload = {}) =>
    payload.imageBase64 ||
    payload.image ||
    payload.value ||
    payload.profileImage ||
    payload.profile_image ||
    payload.imageData ||
    payload.image_data ||
    "";

/**
 * Converts a Blob response into a data URL for display.
 * @param {Blob} blob - Image blob returned by the API.
 * @returns {Promise<string>} Resolved data URL.
 */
const blobToDataUrl = (blob) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

/**
 * Builds the REST endpoint used to get/set the profile image.
 * @param {string} baseUrl - API root (defaults to localhost).
 * @param {string|number} userId - UID pulled from the JWT.
 * @returns {string} Fully-qualified endpoint URL.
 */
const buildEndpoint = (baseUrl, userId) => {
    const trimmedBase = baseUrl?.replace(/\/$/, "") || API_BASE_URL;
    return `${trimmedBase}/api/v2/users/${userId}/profile-image`;
};

/**
 * Adds Authorization header when a JWT is provided.
 * @param {string} token - JWT token.
 * @returns {object} Header fragment ready for fetch().
 */
const buildAuthHeaders = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

/**
 * Fetches the profile image for the supplied user and returns a display-ready data URL.
 * @param {object} options - Options for the request.
 * @param {string} options.userId - UID for the requested profile.
 * @param {string} options.token - JWT used for authorization.
 * @param {string} [options.baseUrl] - Optional override for the API base URL.
 * @param {AbortSignal} [options.signal] - Optional abort signal to cancel the request.
 * @returns {Promise<{src: string, mimeType: string}>} Resolved image metadata.
 */
export const getProfilePicture = async ({ userId, token, baseUrl = API_BASE_URL, signal } = {}) => {
    if (!userId) throw new Error("User id is required");
    if (!token) throw new Error("JWT token is required");

    const endpoint = buildEndpoint(baseUrl, userId);
    const response = await fetch(endpoint, {
        headers: {
            Accept: "application/json, image/*, text/plain",
            ...buildAuthHeaders(token),
        },
        signal,
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || `Request failed (${response.status})`);
    }

    const contentType = (response.headers.get("Content-Type") || "").toLowerCase();
    if (contentType.includes("application/json")) {
        const payload = await response.json();
        const rawValue = readImagePayload(payload);
        if (!rawValue) throw new Error("Response body did not include an image payload");
        const mimeType = payload.mimeType || payload.contentType || payload.content_type || "image/jpeg";
        const dataUrl = normalizeDataUrl(rawValue, mimeType);
        if (!dataUrl) throw new Error("Unable to build data URL from payload");
        return { src: dataUrl, mimeType };
    }

    if (contentType.startsWith("image/")) {
        const blob = await response.blob();
        const dataUrl = await blobToDataUrl(blob);
        return { src: dataUrl, mimeType: contentType };
    }

    const textPayload = (await response.text()) || "";
    const dataUrl = normalizeDataUrl(textPayload, contentType && contentType !== "text/plain" ? contentType : "image/jpeg");
    if (!dataUrl) throw new Error("Empty response body from profile-image endpoint");
    return { src: dataUrl, mimeType: contentType || "image/jpeg" };
};

export const setProfilePicture = async ({ userId, token, file, imageBase64, baseUrl = API_BASE_URL, signal } = {}) => {
    if (!userId) throw new Error("User id is required");
    if (!token) throw new Error("JWT token is required");

    let payload = (imageBase64 || "").trim();
    if (!payload && file) {
        payload = await encodeImageToBase64(file);
    }

    if (!payload) throw new Error("Image data is required");

    const endpoint = buildEndpoint(baseUrl, userId);
    const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...buildAuthHeaders(token),
        },
        body: JSON.stringify({ imageBase64: payload }),
        signal,
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Upload failed");
    }

    return { ok: true };
};
