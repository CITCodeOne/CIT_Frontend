import React from "react";
import { useParams } from "react-router-dom";
import MakeList from "../components/MakeList";
import Rating from "../components/Rating";
import girl from "../pics/girl.jpg";
import lion from "../pics/lion.jpg";
import mike from "../pics/mike.jpg";

export default function UserRatingsPage() {
  // dummy username
  const username = "PixelPirat_47";

  // dummy ratings list
  const ratedTitles = [
    { titleId: "tt10052520", title: "Zootopia 2", rating: 9, startYear: 2025, mediaType: "movie", poster: girl },
    { titleId: "tt7366338",  title: "Chernobyl", rating: 1, startYear: 2019, mediaType: "tvSeries", poster: lion },
    { titleId: "tt0903747",  title: "Breaking Bad", rating: 10, startYear: 2008, mediaType: "tvSeries", poster: mike },
    { titleId: "tt1234567",  title: "My Little Pony: The Movie", rating: 7, startYear: 2020, mediaType: "movie", poster: girl },
  ];

  // returns a list of all the user's ratings
  return (
    <main className="container py-4">
      <h2 className="h4 mb-3">All ratings by user: {username}</h2>

      <MakeList
        itemArray={ratedTitles}
        renderItem={(item) => (
          <div
            className="d-flex w-100 h-100 rounded-4"
            style={{ backgroundColor: "#ffffff" }} 
          >
            <img
              src={item.poster}
              alt={item.title}
              className="img-fluid py-1 px-1 rounded-start-4"
              style={{ width: "80px", height: "120px", objectFit: "cover" }}
            />

            <div className="flex-grow-1 overflow-hidden px-2 d-flex flex-column justify-content-center">
              <h3 className="mb-1 fs-5">
                {item.title}{" "}
                {item.startYear && (
                  <span className="text-muted">({item.startYear})</span>
                )}
              </h3>
              <p className="mb-1 text-muted small">{item.mediaType}</p>
            </div>

            <div
              className="d-flex align-items-center justify-content-center px-3 rounded-end-4"
              style={{ minWidth: "90px", backgroundColor: "#ffffff" }}
            >
              <Rating
                initialRating={item.rating}
                editable={false}
                showNumber={true}
              />
            </div>
          </div>
        )}
      />
    </main>
  );
}   