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
