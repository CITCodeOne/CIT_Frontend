/**
 * Converts a single file into a Base64 data URL string.
 * @param {File} file - Browser File object selected from an <input type="file">.
 * @returns {Promise<string>} Resolves with the Base64 data URL once reading completes.
 */
export function encodeImageToBase64(file) {
	return new Promise((resolve, reject) => { // Promise goer async fil-laesning let at bruge med async/await
		if (!file) { // ingen fil valgt af brugeren
			reject(new Error("No file provided"));
			return;
		}

		const reader = new FileReader(); // browser-vaerktoej der kan laese filer fra <input type="file">
		reader.onloadend = () => resolve(reader.result); // reader.result er en data-URL med Base64, klar til upload
		reader.onerror = () => reject(reader.error); // send teknisk fejl videre sa UI kan vise besked
		reader.readAsDataURL(file); // starter laesning som data-URL (inkl. mime-type + Base64)
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
	// Finder mimetype og selve data-delen hvis teksten er en fuld data-URL
	const [, mimeType = "application/octet-stream", data = base64] =
		base64.match(/^data:(.+);base64,(.*)$/) || [];

	const byteString = window.atob(data); // Base64 tilbage til binaer tekststreng
	const len = byteString.length; // antal byte der skal skrives
	const bytes = new Uint8Array(len); // buffer til at holde rigtige byte-vaerdier

	for (let i = 0; i < len; i += 1) { // omsaet hvert tegn til tilsvarende byte
		bytes[i] = byteString.charCodeAt(i);
	}

	return new File([bytes], fileName, { type: mimeType }); // lav et File-objekt der kan uploades eller bruges som blob
}
