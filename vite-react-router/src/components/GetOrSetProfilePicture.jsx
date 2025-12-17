import fetchSimplified from "../business-logic-layer/helper-function/FetchSimplified";
import { encodeImageToBase64 } from "./utils/ImageBase64Utils";

export const normalizeDataUrl = (rawValue, mimeType = "image/jpeg") => { // Default to JPEG
    const sanitized = (rawValue || "").trim().replace(/^"|"$/g, ""); // Remove surrounding quotes
    if (!sanitized) return null; // Empty payload
    if (sanitized.startsWith("data:image")) return sanitized; // Already a data URL
    // Treat file/HTTP paths and blob URLs as external resources and return as-is
    if (
        sanitized.startsWith("/") ||
        sanitized.startsWith("http") ||
        sanitized.startsWith("./") ||
        sanitized.startsWith("../") ||
        sanitized.startsWith("blob:")
    ) return sanitized; // It's a path, URL, or object URL
    return `data:${mimeType};base64,${sanitized}`; // Construct data URL
};

/**
 * Builds an image source from a base64 payload.
 * @param {object} options
 * @param {string} options.base64 - Raw base64 string, data URL.
 * @param {string} [options.mimeType] - Optional mime type override.
 * @returns {{src: string, mimeType: string}} Data URL representation.
 */
export const getProfilePicture = ({ base64, mimeType = "image/jpeg" } = {}) => {
    const dataUrl = normalizeDataUrl(base64, mimeType); //creates data url from base64 string
    if (!dataUrl) throw new Error("Profile image payload is empty"); // Handle empty payload
    return { src: dataUrl, mimeType }; // Return data URL and mime type
};

export const setProfilePicture = async ({ userId, token, file, imageBase64, secure = true, signal } = {}) => {
    if (!userId) throw new Error("User id is required");
    if (!token) throw new Error("JWT token is required");

    let payload = (imageBase64 || "").trim();
    if (!payload && file) {
        payload = await encodeImageToBase64(file);
    }

    if (!payload) throw new Error("Image data is required");

    try {
        await fetchSimplified({
            version: "v2",
            endpoint: `users/${userId}/profile-image`,
            authToken: token,
            body: { imageBase64: payload },
            method: "PUT",
            secure,
            signal,
        });
    } catch (error) {
        const message = error?.payload?.message || error?.message || "Upload failed";
        const uploadError = new Error(message);
        uploadError.cause = error;
        throw uploadError;
    }

    return { ok: true };
};
