import React, { useState } from "react";
import { useParams } from "react-router-dom";
import MakeList from "../components/MakeList";
import girl from "../pics/girl.jpg";
import lion from "../pics/lion.jpg";
import mike from "../pics/mike.jpg";

export default function UserBookmarksList() {
    const { userId } = useParams();

    // Authentication dummy data
    const loggedInUserId = "55";
    const isLoggedIn = userId === loggedInUserId;

    // Dummy data
    const [bookmarkedPages, setBookmarkedPages] = useState([
        {
            pageId: 2,
            title: "Zootopia 2",
            poster: girl,
            time: "2025-12-05T12:26:13.960Z",
        },
        {
            pageId: 5,
            title: "Chernobyl",
            poster: lion,
            time: "2025-12-05T12:28:32.770Z",
        },
        {
            pageId: 1,
            title: "Breaking Bad",
            poster: mike,
            time: "2025-12-05T13:07:52.623Z",
        },
        {
            pageId: 3,
            title: "My Little Pony: The Movie",
            poster: girl,
            time: "2025-12-06T09:15:00.000Z",
        },
    ]);

    // local pageId deletion handler
    const handleRemoveBookmark = (pageId) => {
        if (!isLoggedIn) {
            return;
        }
        setBookmarkedPages((prev) => prev.filter((b) => b.pageId !== pageId));
    };

    return (
        <main className="container py-4">
            <h2 className="h4 mb-3">Bookmarks for user: {userId}</h2>

            {bookmarkedPages.length === 0 ? (
                <p className="text-muted">This user has not bookmarked any titles yet.</p>
            ) : (
                <MakeList
                    itemArray={bookmarkedPages}
                    renderItem={(item) => (
                        <div className="d-flex w-100 h-100 bg-white rounded-4 overflow-hidden align-items-center">
                            {/* Poster image */}
                            <img
                                src={item.poster}
                                alt={item.title}
                                className="img-fluid object-fit-cover"
                                style={{ width: "100px", height: "150px" }}
                            />

                            {/* Added on {date} text */}
                            <div className="p-3 d-flex flex-column justify-content-center flex-grow-1">
                                <h3 className="h5 mb-1">{item.title}</h3>
                                <p className="text-muted small mb-0">
                                    Added on: {new Date(item.time).toLocaleDateString()}
                                </p>
                            </div>
                            {/* Delete button */}
                            {isLoggedIn && (
                                <div className="p-3 ms-auto">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleRemoveBookmark(item.pageId)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                />
            )}
        </main>
    );
}