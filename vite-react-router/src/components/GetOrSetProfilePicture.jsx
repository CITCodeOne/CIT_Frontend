import { encodeImageToBase64 } from "./EncodeImageBase64";

const API_BASE_URL = "https://localhost:5001";

const normalizeDataUrl = (rawValue, mimeType = "image/jpeg") => {
    const sanitized = (rawValue || "").trim().replace(/^"|"$/g, "");
    if (!sanitized) return null;
    if (sanitized.startsWith("data:image")) return sanitized;
    return `data:${mimeType};base64,${sanitized}`;
};

/**
 * Builds an image source from a base64 payload.
 * @param {object} options
 * @param {string} options.base64 - Raw base64 string, data URL.
 * @param {string} [options.mimeType] - Optional mime type override.
 * @returns {{src: string, mimeType: string}} Data URL representation.
 */
export const getProfilePicture = ({ base64, mimeType = "image/jpeg" } = {}) => {
    const dataUrl = normalizeDataUrl(base64, mimeType);
    if (!dataUrl) throw new Error("Profile image payload is empty");
    return { src: dataUrl, mimeType };
};

const buildEndpoint = (baseUrl, userId) => {
    const trimmedBase = baseUrl?.replace(/\/$/, "") || API_BASE_URL;
    return `${trimmedBase}/api/v2/users/${userId}/profile-image`;
};

const buildAuthHeaders = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

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
