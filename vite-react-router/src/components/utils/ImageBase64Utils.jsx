/**
 * Converts a single file into a Base64 data URL string.
 * @param {File} file - Browser File object selected from an <input type="file">.
 * @returns {Promise<string>} Resolves with the Base64 data URL once reading completes.
 */
export function encodeImageToBase64(file) {
  return new Promise((resolve, reject) => { // create a Promise to handle async FileReader
    if (!file) { // checks if file is null or undefined
      reject(new Error("No file provided")); // reject the Promise if no file is given
      return;
    }

    const reader = new FileReader(); // instantiate FileReader to read file contents
    reader.onloadend = () => resolve(reader.result); // data URL already encoded as Base64
    reader.onerror = () => reject(reader.error); // reject Promise on read error
    reader.readAsDataURL(file); // start reading file as Base64 data URL
  });
}

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
