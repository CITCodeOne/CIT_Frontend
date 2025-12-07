import React from "react";
import makeCarousel from "../components/MakeCarousel";
import lion from "../pics/lion.jpg";
import girl from "../pics/girl.jpg";
import mike from "../pics/mike.jpg";

// Demo data for carousel testing - it shows two carousels (titles and contributors)
// This is how the data can be used to filter out different types for different carousels/scenarios

const demoCards = [
    {
        id: 1,
        name: "Alex Mercer",
        role: "Stormtrooper",
        type: "Contributor",
        contributionType: "Actor",
        img: lion,
        blurb: "Knows how to get into trouble on distant moons."
    },
    {
        id: 2,
        name: "Zootopia 2",
        role: "",
        type: "Title",
        mediaType: "Movie",
        img: girl,
        blurb: "Brave rabbit cop Judy Hopps and her friend, the fox Nick Wilde, team up again to crack a new case, the most perilous and intricate of their careers."
    },
    {
        id: 3,
        name: "Mike Lawson",
        role: "Darth Vader",
        type: "Contributor",
        contributionType: "Producer",
        img: mike,
        blurb: "Keeps the jump drive alive with duct tape and grit."
    },
    {
        id: 4,
        name: "Nova Quinn",
        role: "Princess Leia",
        type: "Contributor",
        contributionType: "Actress",
        img: girl,
        blurb: "Can thread asteroid fields before breakfast."
    },
    {
        id: 5,
        name: "Breaking Bad",
        role: "",
        type: "Title",
        mediaType: "Series",
        img: lion,
        blurb: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student to secure his family's future."
    },
    {
      id: 6,
      name: "Bryan Cranston",
      role: "Walter White",
      type: "Contributor",
      contributionType: "Actor",
      img: mike,
      blurb: "Portrayed Walter White in Breaking Bad."
    }
];

export default function CustomCarouselFilterTest() {

  const titleItems = demoCards.filter(
    (item) => item.type === "Title" && (item.mediaType === "Movie" || item.mediaType === "Series")
  );

  const contributorItems = demoCards.filter(
    (item) => item.type === "Contributor"
  );

  return (
    <div style={{ padding: "3rem 5%" }}>
      {makeCarousel(titleItems, "Similar titles")}
      {makeCarousel(contributorItems, "Cast & Crew")}
    </div>
  );
}