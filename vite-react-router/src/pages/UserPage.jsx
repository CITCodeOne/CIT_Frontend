import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserBanner from "../components/UserBanner";
import Rating from "../components/Rating";
import defaultAvatar from "../pics/DefaultProfilePicture.jpg";
import girl from "../pics/girl.jpg";
import lion from "../pics/lion.jpg";
import mike from "../pics/mike.jpg";

export default function UserPage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null); // for avatar file input

    // dummy user
    const apiUser = {
        uconst: userId,
        username: "PixelPirat_47",
        email: "pixelpirat47@moonmail.net",
        createdAt: "2023-01-10T12:00:00Z",
        bookmarksCount: 12,
        role: "Admin",
        avatarUrl: null,
    };

    // dummy ratings list
    const ratedTitles = [
        {
            titleId: "tt10052520",
            title: "Zootopia 2",
            rating: 9,
            startYear: 2025,
            mediaType: "movie",
            poster: girl,
        },
        {
            titleId: "tt7366338",
            title: "Chernobyl",
            rating: 1,
            startYear: 2019,
            mediaType: "tvSeries",
            poster: lion,
        },
        {
            titleId: "tt0903747",
            title: "Breaking Bad",
            rating: 10,
            startYear: 2008,
            mediaType: "tvSeries",
            poster: mike,
        },
        {
            titleId: "tt1234567",
            title: "My Little Pony: The Movie",
            rating: 7,
            startYear: 2020,
            mediaType: "movie",
            poster: girl,
        },
    ];

    // get latest 3 ratings
    const latestRatedTitles = ratedTitles.slice(0, 3);

    // bookmarks as state so we can delete them
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

    const latestBookmarks = bookmarkedPages.slice(0, 3);

    const [avatarUrl, setAvatarUrl] = useState(apiUser.avatarUrl);
    const [isEditMode, setIsEditMode] = useState(false);
    const [shareMessage, setShareMessage] = useState("");

    // dummy auth 
    const loggedInUserId = "55";
    const isLoggedIn = true;
    const isOwnProfile = isLoggedIn && loggedInUserId === userId;

    const handleToggleEditMode = () => {
        if (!isOwnProfile) return;
        setIsEditMode((prev) => !prev);
    };

    // share profile handler - copies profile URL to clipboard or shows fallback message
    const handleShareClick = async () => {
        const profileUrl = window.location.href;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(profileUrl);
                setShareMessage("Profile link copied to clipboard!");
                setTimeout(() => setShareMessage(""), 2000);
            } else {
                setShareMessage("Could not copy profile link.");
                setTimeout(() => setShareMessage(""), 4000);
            }
        } catch {
            setShareMessage("Could not copy profile link.");
            setTimeout(() => setShareMessage(""), 4000);
        }
    };

    // avatar click handler
    const handleAvatarClick = () => {
        if (!isOwnProfile || !isEditMode) return;
        fileInputRef.current?.click();
    };

    // avatar file change handler
    const handleAvatarFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const newUrl = URL.createObjectURL(file);
        setAvatarUrl(newUrl);
    };

    // navigate to user's full ratings list
    const handleBrowseAllRatings = () => {
        navigate(`/userpage/${userId}/ratings`);
    };

    // navigate to user's full bookmarks list
    const handleBrowseAllBookmarks = () => {
        navigate(`/userpage/${userId}/bookmarks`);
    };

    // delete bookmark handler (using dummy auth)
    const handleDeleteBookmark = (pageId) => {
        if (!isLoggedIn) {
            setShareMessage("You must be logged in to remove bookmarks.");
            setTimeout(() => setShareMessage(""), 2500);
            return;
        }

        if (!isOwnProfile) {
            setShareMessage("You can only remove bookmarks from your own profile.");
            setTimeout(() => setShareMessage(""), 2500);
            return;
        }

        setBookmarkedPages((prev) => prev.filter((b) => b.pageId !== pageId));
        setShareMessage("Bookmark removed.");
        setTimeout(() => setShareMessage(""), 2000);
    };

    return (
        <main className="container py-4">
            {/* avatar change */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="d-none"
                onChange={handleAvatarFileChange}
            />

            <UserBanner
                username={apiUser.username}
                email={apiUser.email}
                createdAt={apiUser.createdAt}
                ratingsCount={ratedTitles.length}
                bookmarksCount={apiUser.bookmarksCount}
                avatarUrl={avatarUrl || defaultAvatar}
                role={apiUser.role}
                isOwnProfile={isOwnProfile}
                isEditMode={isEditMode}
                onEditClick={handleToggleEditMode}
                onAvatarClick={handleAvatarClick}
                onShareClick={handleShareClick}
            />

            {/* latest ratings */}
            <section className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="h5 mb-0">Latest ratings</h3>
                    {ratedTitles.length > 3 && (
                        <button
                            type="button"
                            className="btn btn-link p-0"
                            onClick={handleBrowseAllRatings}
                        >
                            Browse all ratings
                        </button>
                    )}
                </div>

                {latestRatedTitles.length === 0 ? (
                    <p className="text-muted">This user has not rated any titles yet.</p>
                ) : (
                    <div className="list-group">
                        {latestRatedTitles.map((item) => (
                            <div
                                key={item.titleId}
                                className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2"
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <img
                                        src={item.poster}
                                        alt={item.title}
                                        style={{
                                            width: "50px",
                                            height: "75px",
                                            objectFit: "cover",
                                            borderRadius: "4px",
                                        }}
                                    />
                                    <div>
                                        <div className="fw-semibold">
                                            {item.title}{" "}
                                            {item.startYear && (
                                                <span className="text-muted">({item.startYear})</span>
                                            )}
                                        </div>
                                        <div className="text-muted small">{item.mediaType}</div>
                                    </div>
                                </div>

                                <Rating
                                    initialRating={item.rating}
                                    editable={false}
                                    showNumber={true}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* latest bookmarks */}
            <section className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="h5 mb-0">Latest bookmarks</h3>
                    {bookmarkedPages.length > 0 && (
                        <button
                            type="button"
                            className="btn btn-link p-0"
                            onClick={handleBrowseAllBookmarks}
                        >
                            Browse all bookmarks
                        </button>
                    )}
                </div>

                {latestBookmarks.length === 0 ? (
                    <p className="text-muted">This user has not bookmarked any titles yet.</p>
                ) : (
                    <div className="list-group">
                        {latestBookmarks.map((item) => (
                            <div
                                key={item.pageId}
                                className="list-group-item d-flex align-items-center gap-3"
                            >
                                <img
                                    src={item.poster}
                                    alt={item.title}
                                    style={{
                                        width: "50px",
                                        height: "75px",
                                        objectFit: "cover",
                                        borderRadius: "4px",
                                    }}
                                />
                                <div className="fw-semibold">{item.title}</div>

                                {/* delete button shown only to profile owner */}
                                {isOwnProfile && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger ms-auto"
                                        onClick={() => handleDeleteBookmark(item.pageId)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* bottom-centered share profile-message */}
            {shareMessage && (
                <div
                    className="position-fixed bottom-0 start-50 translate-middle-x bg-dark text-light px-4 py-3 rounded-3 shadow"
                    style={{
                        zIndex: 1080,
                        fontSize: "1rem",
                        textAlign: "center",
                        marginBottom: "2rem",
                    }}
                >
                    {shareMessage}
                </div>
            )}
        </main>
    );
}