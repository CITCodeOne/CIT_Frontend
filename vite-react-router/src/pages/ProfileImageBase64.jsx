import { useState } from "react";
import { getProfilePicture } from "../components/GetOrSetProfilePicture";

export default function ProfileImageBase64() {
    const [input, setInput] = useState("");
    const [previewSrc, setPreviewSrc] = useState(null);
    const [status, setStatus] = useState("Paste base64 and press Preview");

    const handlePreview = () => {
        try {
            const { src } = getProfilePicture({ base64: input });
            setPreviewSrc(src);
            setStatus("Previewing image");
        } catch (error) {
            setPreviewSrc(null);
            setStatus(error.message || "Unable to build image");
        }
    };

    return (
        <div style={{ maxWidth: "640px", margin: "2rem auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h1>Base64 Image Preview</h1>
            <p>Paste any base64-encoded image (with or without a <code>data:image</code> prefix) and preview it instantly.</p>

            <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                Encoded Image
                <textarea
                    rows={6}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="data:image/jpeg;base64,/9j/4AAQSk..."
                    style={{ resize: "vertical" }}
                />
            </label>
            <button type="button" onClick={handlePreview} disabled={!input.trim()}>
                Preview Image
            </button>

            <p>Status: {status}</p>

            {previewSrc ? (
                <img
                    src={previewSrc}
                    alt="Preview"
                    style={{ width: "100%", maxWidth: "360px", borderRadius: "0.75rem", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
                />
            ) : (
                <div style={{ padding: "2rem", border: "1px dashed #ccc", borderRadius: "0.75rem", textAlign: "center", color: "#777" }}>
                    No image loaded yet.
                </div>
            )}
        </div>
    );
}
