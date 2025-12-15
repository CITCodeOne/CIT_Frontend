/**
 * FetchSimplified Module
 *
 * This module provides a simplified, high-level interface for making HTTP requests
 * to the application's backend API. It abstracts away the complexities of URL construction,
 * authentication, content-type handling, and response parsing, while providing
 * consistent error handling and support for different API versions.
 *
 * Key features:
 * - Automatic URL construction for different API versions (legacy /api and v2 /api/v2)
 * - Built-in authentication header management with Bearer tokens
 * - Automatic JSON serialization/deserialization
 * - Query parameter handling
 * - Request abortion support via AbortSignal
 * - Comprehensive error handling with detailed error information
 * - Support for both secure (HTTPS) and insecure (HTTP) connections for development
 *
 * The module is designed to be used by higher-level API client modules (like ApiClient.jsx)
 * to provide a consistent, reliable way to communicate with the backend.
 */

/**
 * Base URL for secure (HTTPS) API connections.
 * Used in production and when secure=true is specified.
 * Points to the local development server on port 5001.
 */
const API_BASE_URL_SECURE = "https://localhost:5001";

/**
 * Base URL for insecure (HTTP) API connections.
 * Used for development environments where HTTPS is not required.
 * Points to the local development server on port 5000.
 */
const API_BASE_URL_INSECURE = "http://localhost:5000";

/**
 * Simplifies talking to legacy (/api) and v2 (/api/v2) endpoints.
 *
 * This function provides a unified interface for making HTTP requests to the backend API.
 * It handles URL construction, authentication, request body serialization, and response parsing
 * automatically, allowing callers to focus on the business logic rather than HTTP details.
 *
 * The function supports both legacy API endpoints (/api) and the newer v2 endpoints (/api/v2),
 * automatically constructing the correct URL based on the version parameter.
 *
 * @param {Object} options Configuration object for the request
 * @param {string} [options.version="v1"] API version segment, determines the API prefix. "v2" uses "/api/v2", everything else uses "/api"
 * @param {string} options.endpoint Relative endpoint path (e.g. "users/123") or full path including the API prefix (e.g. "api/v2/users/123").
 *                                  Leading slashes are automatically handled.
 * @param {string} [options.authToken] Bearer token to include in Authorization header. When provided, adds "Authorization: Bearer {token}" header.
 * @param {Record<string, unknown>} [options.queryParams={}] Query parameters to append to the URL. Values are automatically converted to strings.
 *                                                           Undefined/null values are ignored.
 * @param {unknown} [options.body] Request payload to send. Automatically JSON-serialized for non-GET/HEAD methods. Ignored for GET/HEAD requests.
 * @param {string} [options.method="GET"] HTTP method to use (GET, POST, PUT, DELETE, etc.)
 * @param {boolean} [options.secure=true] Whether to use HTTPS (true) or HTTP (false). Controls which base URL is used.
 * @param {AbortSignal} [options.signal] AbortSignal for cancelling the request. Can be used to implementing request timeouts or user cancellation.
 * @param {HeadersInit} [options.headers={}] Additional headers to include in the request. Merged with automatically generated headers.
 * @returns {Promise<unknown>} Parsed JSON response body, or null if response body is empty. For non-JSON responses, returns the raw text content.
 * @throws {Error} Throws when:
 *                 - No endpoint is provided
 *                 - The HTTP response is not ok (status >= 400)
 *                 - JSON parsing fails for JSON responses
 *                 The error object includes status code and parsed error payload when available.
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
    // Validate required parameters
    if (!endpoint) {
        throw new Error("fetchSimplified: endpoint is required");
    }

    // Determine the base URL based on security preference
    // Remove trailing slashes to ensure consistent URL construction
    const resolvedBaseUrl = (secure ? API_BASE_URL_SECURE : API_BASE_URL_INSECURE).replace(/\/$/, "");

    // Normalize and validate the API version
    // Convert to lowercase and trim whitespace for consistent comparison
    const normalizedVersion = typeof version === "string" ? version.trim().toLowerCase() : "";

    // Determine API prefix based on version
    // v2 uses "/api/v2", all other versions (including "v1" and legacy) use "/api"
    const apiPrefix = normalizedVersion === "v2" ? "/api/v2" : "/api";

    // Clean up the endpoint path
    // Remove leading slashes to prevent double slashes in the final URL
    const trimmedEndpoint = endpoint.replace(/^\/+/, "");

    // Normalize the API prefix (remove leading slashes)
    const normalizedApiPrefix = apiPrefix.replace(/^\/+/, "");

    // Construct the full path
    // If the endpoint already starts with "api/", use it as-is (allows full control)
    // Otherwise, prepend the appropriate API prefix
    const path = /^api\//i.test(trimmedEndpoint)
        ? trimmedEndpoint
        : `${normalizedApiPrefix}/${trimmedEndpoint}`;

    // Create the full URL using the URL constructor for proper encoding
    const url = new URL(path, resolvedBaseUrl);

    // Append query parameters to the URL
    // Only include parameters that have defined, non-null values
    // Convert all values to strings as required by URLSearchParams
    Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
        }
    });

    // Construct request headers
    // Automatically add Content-Type for requests with bodies
    // Automatically add Authorization header when authToken is provided
    // Merge with any additional headers provided by the caller
    const headers = {
        // Add Content-Type header only when sending a request body
        ...(body !== undefined && body !== null ? { "Content-Type": "application/json" } : {}),
        // Add Authorization header when authentication token is provided
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        // Include any additional headers from the caller
        ...extraHeaders,
    };

    // Make the HTTP request using the native fetch API
    // Only include the body for methods that typically send data (not GET/HEAD)
    const response = await fetch(url.toString(), {
        method,
        headers,
        // Conditionally include the request body
        // Serialize to JSON for methods that send data
        body: body !== undefined && body !== null && method !== "GET" && method !== "HEAD" ? JSON.stringify(body) : undefined,
        signal, // Pass through the abort signal if provided
    });

    // Check if the response indicates an error (HTTP status >= 400)
    if (!response.ok) {
        // Create a detailed error message including status code and text
        const error = new Error(`fetchSimplified: ${response.status} ${response.statusText}`);
        error.status = response.status; // Attach status code for programmatic handling
        // Attempt to parse error response body for additional error details
        error.payload = await safeParseJson(response);
        throw error;
    }

    // Parse and return the successful response
    return safeParseJson(response);
}

/**
 * Safely parses the response body as JSON, with fallback handling for different content types.
 *
 * This helper function handles the complexities of response parsing:
 * - Returns null for empty responses
 * - Returns raw text for non-JSON content types
 * - Attempts JSON parsing for JSON responses
 * - Provides detailed error information when JSON parsing fails
 *
 * @param {Response} response The fetch Response object to parse
 * @returns {Promise<unknown>} Parsed response data:
 *                             - null for empty responses
 *                             - string for non-JSON content
 *                             - parsed object/array for valid JSON
 * @throws {Error} Throws when JSON parsing fails, including the parse error and raw text
 */
async function safeParseJson(response) {
    // Read the response as text first to handle all content types
    const text = await response.text();

    // Return null for empty responses
    if (!text) {
        return null;
    }

    // Check the Content-Type header to determine how to handle the response
    const contentType = response.headers.get('content-type') || '';

    // For non-JSON content types, return the raw text
    // This handles cases like plain text, HTML, or other formats
    if (!contentType.toLowerCase().includes('application/json')) {
        return text;
    }

    // Attempt to parse as JSON for JSON content types
    try {
        return JSON.parse(text);
    } catch (error) {
        // JSON parsing failed - create a detailed error with context
        const parseError = new Error("fetchSimplified: Response is not valid JSON");
        parseError.cause = error; // Attach the original parsing error
        parseError.raw = text; // Include the raw response text for debugging
        throw parseError;
    }
}