import mdb from "../../business-logic-layer/ApiClient/ApiClient";
import { encodeImageToBase64 } from "./ImageBase64Utils";

/**
 * Normalizes a variety of profile-image representations into a usable data URL
 * or returns file/URL values unchanged.
 *
 * Accepted inputs:
 * - A full data URL (e.g. "data:image/jpeg;base64,...") → returned as-is
 * - A raw base64 string (no data: prefix) → converted to a data URL using the
 *   provided `mimeType` (defaults to `image/jpeg`)
 * - File-system or HTTP paths ("/path", "http://...", "./...", "../..."),
 *   and object URLs ("blob:...") → returned as-is so callers can pass them
 *   straight to `img.src` without forcing a conversion
 * - Empty or falsy → returns `null` to indicate absence of an image
 *
 * Why this helper exists:
 * - Backends, local storage, and upload widgets may supply profile images in
 *   different shapes; normalizing here centralizes edge-case handling and
 *   prevents duplicated logic across components.
 */
export const normalizeDataUrl = (rawValue, mimeType = "image/jpeg") => {
    // Ryd op i input: fjern mellemrum og eventuelle citattegn der kan komme fra copy-paste
    // Trim whitespace and remove optional surrounding quotes that sometimes
    // appear when values are serialized or pasted by users.
    const sanitized = (rawValue || "").trim().replace(/^"|"$/g, "");

    // Ingen billedvaerdi: returner null sa UI kan vise placeholder i stedet for at fejle
    // Empty payloads are explicitly represented as `null` by this helper so
    // callers can detect absence of an image vs. a failing conversion.
    if (!sanitized) return null;

    // Hvis streng allerede ligner en data-URL, sa brug den direkte uden at aendre metadata
    // If the value already looks like a data URL, use it directly. This avoids
    // re-wrapping an already-correct value and preserves any metadata present
    // in the prefix (e.g. mime subtype).
    if (sanitized.startsWith("data:image")) return sanitized;

    // URL- eller sti-vaerdier skal ikke konverteres; de kan bruges direkte i <img src>
    // Treat common path and URL prefixes as external resources. Returning them
    // unchanged makes the helper safe to use in image `src` attributes where
    // either a remote URL or a data URL is acceptable.
    // Added when we ran into issues with blob URLs as well.
    if (
        sanitized.startsWith("/") ||
        sanitized.startsWith("http") ||
        sanitized.startsWith("./") ||
        sanitized.startsWith("../") ||
        sanitized.startsWith("blob:")
    ) return sanitized;

    // Naar der kun er selve base64-strengen, wrap den som data-URL med angivet mime-type
    // Otherwise assume the caller provided a raw base64 payload and construct
    // a data URL using the requested mime type. This is the most common case
    // when the backend stores only the base64 payload to save space.
    return `data:${mimeType};base64,${sanitized}`;
};

/**
 * Builds an image source from a base64 payload.
 * @param {object} options
 * @param {string} options.base64 - Raw base64 string, data URL.
 * @param {string} [options.mimeType] - Optional mime type override.
 * @returns {{src: string, mimeType: string}} Data URL representation.
 */
/**
 * Helper to produce an object suitable for assignment to an <img> `src` and to
 * carry the mime type alongside the resolved value.
 *
 * Throws on empty payloads to make callers explicitly handle missing state
 * (often a UI component will show a placeholder image instead).
 */
export const getProfilePicture = ({ base64, mimeType = "image/jpeg" } = {}) => {
    // Samler al normalisering et sted, sa komponenter kan kalde enkelt helper
    // Normalize any of the accepted input shapes to a usable src value.
    const dataUrl = normalizeDataUrl(base64, mimeType);

    // Fejl tidligt hvis ingen billeddata; goer det tydeligt for kalder hvad der mangler
    // If normalization returns `null`, the caller passed no image — make the
    // failure explicit by throwing so upstream code can decide how to recover.
    if (!dataUrl) throw new Error("Profile image payload is empty");

    // Return both the resolved `src` and the mime type so UI or upload helpers
    // can make decisions (e.g. show "image/jpeg" or use when uploading).
    return { src: dataUrl, mimeType };
};

/**
 * Uploads (sets) the user's profile image.
 *
 * Parameters:
 * - `userId` (required): user identifier used in the API path
 * - `token` (required): JWT token used for Authorization (Bearer)
 * - `file` (optional): File/Blob selected by an <input type="file"> control
 * - `imageBase64` (optional): pre-encoded base64 payload (string) to send
 * - `secure` (optional): whether to use the secure API base URL
 * - `signal` (optional): AbortSignal to cancel the request
 *
 * Behavior notes and edge cases:
 * - The function accepts either a raw base64 string or a File. If a File is
 *   provided, it is converted to base64 using `encodeImageToBase64`.
 * - If both `imageBase64` and `file` are supplied, `imageBase64` takes
 *   precedence (the `file` is ignored).
 * - The function throws informative errors for missing inputs so callers can
 *   surface appropriate UI messages instead of failing silently.
 */
export const setProfilePicture = async ({ userId, token, file, imageBase64, secure = true, signal } = {}) => {
    if (!userId) throw new Error("User id is required");
    if (!token) throw new Error("JWT token is required");

    // Brug allerede-encoded base64 hvis tilgaengelig; ellers laes fil og encod den
    // Prefer an already-encoded base64 payload; otherwise, read the provided
    // File/Blob and encode it. `encodeImageToBase64` is intentionally
    // delegated to a shared util so we do not duplicate file-reading logic.
    let payload = (imageBase64 || "").trim();
    if (!payload && file) {
        payload = await encodeImageToBase64(file);
    }

    if (!payload) throw new Error("Image data is required");

    try {
        // Sender base64 direkte til backend via api-klienten
        // Using the apiClient wrapper to upsert the profile image.
        await mdb.apiv2.user.upsertProfileImage(userId, payload, token);
    } catch (error) {
        // Normalize the thrown error to provide a clear, user-friendly
        // message while preserving the original error as `cause` for
        // debugging by callers.
        const message = error?.payload?.message || error?.message || "Upload failed";
        const uploadError = new Error(message);
        uploadError.cause = error;
        throw uploadError;
    }

    return { ok: true };
};
