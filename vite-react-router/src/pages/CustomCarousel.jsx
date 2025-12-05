import React from "react";
import makeCarousel from "../components/MakeCarousel";
import lion from "../pics/lion.jpg";
import girl from "../pics/girl.jpg";
import mike from "../pics/mike.jpg";

const demoCards = [
    {
        id: 1,
        name: "Alex Mercer",
        role: "Space Rogue",
        img: lion,
        blurb: "Knows how to get into trouble on distant moons."
    },
    {
        id: 2,
        name: "Maya Ortiz",
        role: "Galactic Medic",
        img: girl,
        blurb: "Saves the crew with steady hands and sarcasm."
    },
    {
        id: 3,
        name: "Mike Lawson",
        role: "Ship Engineer",
        img: mike,
        blurb: "Keeps the jump drive alive with duct tape and grit."
    },
    {
        id: 4,
        name: "Nova Quinn",
        role: "Navigator",
        img: girl,
        blurb: "Can thread asteroid fields before breakfast."
    },
    {
        id: 5,
        name: "Theo Briggs",
        role: "Security Chief",
        img: lion,
        blurb: "Sees danger three parsecs away."
    }
];

export default function CarouselPage() {
    return <div style={{ padding: "3rem 5%" }}>{makeCarousel(demoCards, "actor")}</div>;
}