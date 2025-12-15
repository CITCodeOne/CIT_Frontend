import { useState } from "react";
import { useParams } from "react-router-dom";
import List from "../components/List";
import ListManager from "../components/ListManager";
import Rating from "../components/Rating";
import placeholderImage from "../pics/Image-not-found.png";

export default function UserRatingsList() {
    const { userId } = useParams();

    // dummy auth
    const loggedInUserId = "55";
    const isOwnProfile = userId === loggedInUserId;
    const isLoggedIn = isOwnProfile;

    // ListManager state
    const [showListModal, setShowListModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    // dummy ratings list
    const [ratedTitles, setRatedTitles] = useState([
        {
            titleId: "tt10052520",
            title: "Zootopia 2",
            rating: 5,
            startYear: 2025,
            mediaType: "movie",
            poster: placeholderImage,
        },
        {
            titleId: "tt7366338",
            title: "Surf's Up",
            rating: 10,
            startYear: 2019,
            mediaType: "movie",
            poster: placeholderImage,
        },
        {
            titleId: "tt0903747",
            title: "Breaking Bad",
            rating: 10,
            startYear: 2008,
            mediaType: "tvSeries",
            poster: placeholderImage,
        },
        {
            titleId: "tt1234567",
            title: "My Little Pony: The Movie",
            rating: 1,
            startYear: 2020,
            mediaType: "movie",
            poster: placeholderImage,
        },
        {
            titleId: "tt1233567",
            title: "Shawshank Redemption",
            rating: 3,
            startYear: 1994,
            mediaType: "movie",
            poster: placeholderImage,
        },
    ]);

    // local rating deletion handler
    const [message, setMessage] = useState("");
    const handleRemoveRating = (titleId) => {
        if (!isLoggedIn || !isOwnProfile) {
            setMessage("You must be the profile owner to remove ratings.");
            setTimeout(() => setMessage(""), 2000);
            return;
        }
        setRatedTitles((prev) => prev.filter((r) => r.titleId !== titleId));
        setMessage("Rating removed.");
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

    return (
        <main className="container py-4">
            <h2 className="h4 mb-3">Ratings by user: {userId}</h2>

            {ratedTitles.length === 0 ? (
                <p className="text-muted">This user has not rated any titles yet.</p>
            ) : (
                <List
                    items={ratedTitles}
                    renderItem={(item) => (
                        <div className="d-flex w-100 h-100 bg-white rounded-4 overflow-hidden align-items-center">
                            {/* Poster image */}
                            <img
                                src={item.poster}
                                alt={item.title}
                                className="img-fluid object-fit-cover"
                                style={{ width: "80px", height: "120px", objectFit: "cover" }}
                            />

                            {/* Title, year & media type */}
                            <div className="p-3 d-flex flex-column justify-content-center flex-grow-1">
                                <h3 className="mb-1 fs-5">
                                    {item.title}{" "}
                                    {item.startYear && (
                                        <span className="text-muted">({item.startYear})</span>
                                    )}
                                </h3>
                                <p className="mb-1 text-muted small">{item.mediaType}</p>
                            </div>

                            {/* Rating and Remove button */}
                            <div
                                className="d-flex align-items-center justify-content-center px-3 rounded-end-4"
                                style={{ minWidth: "90px", backgroundColor: "#ffffff" }}
                            >
                                <Rating
                                    initialRating={item.rating}
                                    editable={false}
                                    showNumber={true}
                                />
                                {isOwnProfile && (
                                    <>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary ms-2"
                                            onClick={() => handleAddToList({
                                                id: item.titleId,
                                                name: item.title,
                                                type: 'title'
                                            })}
                                        >
                                            📋
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger ms-2"
                                            onClick={() => handleRemoveRating(item.titleId)}
                                        >
                                            Remove
                                        </button>
                                    </>
                                )}
                            </div>
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

            {/* message popup*/}
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