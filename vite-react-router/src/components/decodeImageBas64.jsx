/**
 * Decodes a Base64 (optionally data URL) string into a File.
 * @param {string} base64 - Raw Base64 content or full data URL string.
 * @param {string} [fileName="image.png"] - Optional filename for the returned File object.
 * @returns {File} Browser File reconstructed from the Base64 payload.
 */
export function decodeBase64Image(base64, fileName = "image.png") {
	if (!base64) {
		throw new Error("No Base64 string provided");
	}
	// Extract MIME type and data portion from data URL if present
	const [, mimeType = "application/octet-stream", data = base64] =
		base64.match(/^data:(.+);base64,(.*)$/) || [];

	const byteString = window.atob(data); // decode Base64 to binary string
	const len = byteString.length; // get length of binary string
	const bytes = new Uint8Array(len); // create byte array

	for (let i = 0; i < len; i += 1) { // populate byte array
		bytes[i] = byteString.charCodeAt(i); // get byte value at each position
	}

	return new File([bytes], fileName, { type: mimeType }); // create and return File object
}
