const API_BASE_URL_SECURE = "https://localhost:5001";
const API_BASE_URL_INSECURE = "http://localhost:5000";

/**
 * Simplifies talking to legacy (/api) and v2 (/api/v2) endpoints.
 * @param {Object} options Config for the request.
 * @param {string} [options.version="v1"] API version segment, e.g. "v1" or "v2".
 * @param {string} options.endpoint Relative endpoint (e.g. "users/123") or full path including the api prefix (e.g. "api/v2/users/123").
 * @param {string} [options.authToken] Bearer token added as Authorization header when provided.
 * @param {Record<string, unknown>} [options.queryParams] Query parameters appended to the URL.
 * @param {unknown} [options.body] Payload serialized as JSON for non-GET/HEAD methods.
 * @param {string} [options.method="GET"] HTTP method to use, e.g. GET, POST, PUT, DELETE.
 * @param {boolean} [options.secure=true] When true uses https://localhost:5001, otherwise http://localhost:5000.
 * @param {AbortSignal} [options.signal] Optional signal to abort the request.
 * @param {HeadersInit} [options.headers] Additional headers merged into the request.
 * @returns {Promise<unknown>} Parsed JSON response or null when the body is empty.
 * @throws {Error} Throws when the response is not ok or the payload cannot be parsed as JSON.
 */
export default async function fetchSimplified({
    version = "v1",
    endpoint = "",
    authToken,
    queryParams = {},
    body,
    method = "GET",
    secure = true,
    signal,
    headers: extraHeaders = {},
}) {
    if (!endpoint) {
        throw new Error("fetchSimplified: endpoint is required");
    }

    const resolvedBaseUrl = (secure ? API_BASE_URL_SECURE : API_BASE_URL_INSECURE).replace(/\/$/, "");
    const normalizedVersion = typeof version === "string" ? version.trim().toLowerCase() : "";
    const apiPrefix = normalizedVersion === "v2" ? "/api/v2" : "/api";

    const trimmedEndpoint = endpoint.replace(/^\/+/, "");
    const normalizedApiPrefix = apiPrefix.replace(/^\/+/, "");
    const path = /^api\//i.test(trimmedEndpoint)
        ? trimmedEndpoint
        : `${normalizedApiPrefix}/${trimmedEndpoint}`;
    const url = new URL(path, resolvedBaseUrl);

    Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
        }
    });

    const headers = {
        ...(body !== undefined && body !== null ? { "Content-Type": "application/json" } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...extraHeaders,
    };

    const response = await fetch(url.toString(), {
        method,
        headers,
        body: body !== undefined && body !== null && method !== "GET" && method !== "HEAD" ? JSON.stringify(body) : undefined,
        signal,
    });

    if (!response.ok) {
        const error = new Error(`fetchSimplified: ${response.status} ${response.statusText}`);
        error.status = response.status;
        error.payload = await safeParseJson(response);
        throw error;
    }

    return safeParseJson(response);
}

async function safeParseJson(response) {
    const text = await response.text();
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        const parseError = new Error("fetchSimplified: Response is not valid JSON");
        parseError.cause = error;
        parseError.raw = text;
        throw parseError;
    }
}