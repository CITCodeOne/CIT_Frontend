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

	const [, mimeType = "application/octet-stream", data = base64] =
		base64.match(/^data:(.+);base64,(.*)$/) || [];

	const byteString = window.atob(data);
	const len = byteString.length;
	const bytes = new Uint8Array(len);

	for (let i = 0; i < len; i += 1) {
		bytes[i] = byteString.charCodeAt(i);
	}

	return new File([bytes], fileName, { type: mimeType });
}
