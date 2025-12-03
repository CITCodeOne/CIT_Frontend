import React from "react";
import MakeCarousel from "../components/MakeCarousel";
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

const cardStyle = {
    background: "#0f172a",
    color: "#f8fafc",
    borderRadius: "12px",
    overflow: "hidden",
    width: "100%",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.35)"
};

const imageStyle = {
    width: "100%",
    height: "180px",
    objectFit: "cover"
};

const contentStyle = {
    padding: "1rem"
};

export default function CarouselPage() {
    return (
        <div style={{ padding: "3rem 5%" }}>
            <MakeCarousel
                itemArray={demoCards}
                renderItem={(card) => (
                    <article style={cardStyle}>
                        <img src={card.img} alt={card.name} style={imageStyle} />
                        <div style={contentStyle}>
                            <p style={{ margin: 0, opacity: 0.65, fontSize: "0.85rem" }}>{card.role}</p>
                            <h3 style={{ margin: "0.35rem 0" }}>{card.name}</h3>
                            <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.35 }}>{card.blurb}</p>
                        </div>
                    </article>
                )}
            />
        </div>
    );
}