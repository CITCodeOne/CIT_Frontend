import { useState } from "react";
import { useParams } from "react-router-dom";
import RowComp from "../components/RowList";
import ListManager from "../components/ListManager";
import placeholderImage from "../pics/Image-not-found.png";

export default function UserBookmarksList() {
    const { userId } = useParams();

    // dummy auth
    const loggedInUserId = "55";
    const isOwnProfile = userId === loggedInUserId;
    const isLoggedIn = isOwnProfile;

    // ListManager state
    const [showListModal, setShowListModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // dummy bookmarks list
    const [bookmarkedPages, setBookmarkedPages] = useState([
        {
            pageId: 2,
            title: "Zootopia 2",
            poster: placeholderImage,
            time: "2025-12-05T12:26:13.960Z",
            plotPre: "In a city of anthropomorph",
        },
        {
            pageId: 5,
            title: "Surf's Up",
            poster: placeholderImage,
            time: "2025-12-05T12:28:32.770Z",
            plotPre: "A documentary-style look ",
        },
        {
            pageId: 1,
            title: "Breaking Bad",
            poster: placeholderImage,
            time: "2025-12-05T13:07:52.623Z",
            plotPre: "A high school chemistry t",
        },
        {
            pageId: 3,
            title: "My Little Pony: The Movie",
            poster: placeholderImage,
            time: "2025-12-06T09:15:00.000Z",
            plotPre: "When a dark force threate",
        },
    ]);

    // helper to format plot preview strings with "..."
    const formatPlotPre = (s) => {
        if (!s) return "";
        if (/\u2026$|\.{3}$/.test(s.trim())) return s.trim();
        return s.trim() + "...";
    };

    // local bookmark deletion handler
    const [message, setMessage] = useState("");
    const handleRemoveBookmark = (pageId) => {
        if (!isLoggedIn || !isOwnProfile) {
            setMessage("You must be the profile owner to remove bookmarks.");
            setTimeout(() => setMessage(""), 2000);
            return;
        }
        setBookmarkedPages((prev) => prev.filter((b) => b.pageId !== pageId));
        setMessage("Bookmark removed.");
        setTimeout(() => setMessage(""), 1500);
    };

    // Handle opening the list modal
    const handleAddToList = (item) => {
        setSelectedItem(item);
        setShowListModal(true);
    };

    // Handle success when added to list
    const handleListSuccess = (result) => {
        if (result.action === 'created') {
            setMessage(`Created list "${result.listName}" and added ${result.itemName}!`);
        } else {
            setMessage(`Added ${result.itemName} to "${result.listName}"!`);
        }
        setTimeout(() => setMessage(""), 2000);
    };

    // Handle error when adding to list
    const handleListError = (error) => {
        setMessage(`Error: ${error}`);
        setTimeout(() => setMessage(""), 2000);
    };

    // returns a list of all the user's bookmarks
    return (
        <main className="container py-4">
            <h2 className="h4 mb-3">Bookmarks for user: {userId}</h2>

            {bookmarkedPages.length === 0 ? (
                <p className="text-muted">This user has not bookmarked any titles yet.</p>
            ) : (
                <RowComp
                    variant="list"
                    items={bookmarkedPages}
                    renderItem={(item) => (
                        <div className="d-flex w-100 h-100 bg-white rounded-4 overflow-hidden align-items-center">

                            {/* Poster image */}
                            <img
                            
                                src={item.poster}
                                alt={item.title}
                                className="img-fluid object-fit-cover"
                                style={{ width: "80px", height: "120px", objectFit: "cover" }}
                            />

                            {/* Title, added on {date} & plot preview */}
                            <div className="p-3 d-flex flex-column justify-content-center flex-grow-1">
                                <h3 className="h5 mb-1">{item.title}</h3>
                                <p className="text-muted small mb-0">
                                    {formatPlotPre(item.plotPre)}
                                </p>
                                <div className="text-muted small mt-2">
                                    Added on: {new Date(item.time).toLocaleDateString()}
                                </div>
                            </div>

                            {/* Delete button */}
                            {isLoggedIn && (
                                <div className="p-3 ms-auto d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => handleAddToList({
                                            id: `tt${item.pageId}`,
                                            name: item.title,
                                            type: 'title'
                                        })}
                                    >
                                        📋 Add to List
                                    </button>
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

            {/* ListManager Modal */}
            {selectedItem && (
                <ListManager
                    show={showListModal}
                    onHide={() => setShowListModal(false)}
                    itemType={selectedItem.type}
                    itemId={selectedItem.id}
                    itemName={selectedItem.name}
                    userId={loggedInUserId}
                    onSuccess={handleListSuccess}
                    onError={handleListError}
                />
            )}

            {/* message popup */}
            {message && (
                <div
                    className="position-fixed bottom-0 start-50 translate-middle-x bg-dark text-light px-4 py-2 rounded-3 shadow"
                    style={{ zIndex: 1080, marginBottom: "1.5rem" }}
                >
                    {message}
                </div>
            )}
        </main>
    );
}