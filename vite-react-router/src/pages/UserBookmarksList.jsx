import React from "react";
import { useParams } from "react-router-dom";
import MakeList from "../components/MakeList";
import girl from "../pics/girl.jpg";
import lion from "../pics/lion.jpg";
import mike from "../pics/mike.jpg";

export default function Bookmarks() {
  const { userId } = useParams();

  // Dummy data 
  const bookmarkedPages = [
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
  ];

  return (
    <main className="container py-4">
      <h2 className="h4 mb-3">Bookmarks for user: {userId}</h2>

      <MakeList
        itemArray={bookmarkedPages}
        renderItem={(item) => (
          <div className="d-flex w-100 h-100 bg-white rounded-4 overflow-hidden">
            {/* Poster Image */}
            <img
              src={item.poster}
              alt={item.title}
              className="img-fluid object-fit-cover"
              style={{ width: "100px" }}
            />

            {/* Text Content */}
            <div className="p-3 d-flex flex-column justify-content-center">
              <h3 className="h5 mb-1">{item.title}</h3>
              <p className="text-muted small mb-0">
                Added on: {new Date(item.time).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      />
    </main>
  );
}