import React, { useEffect, useMemo, useRef, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import PreviewCards from "./PreviewCards";
import { LoadingState } from './PageStates';

const DEFAULT_FOCUS_KEY = "title";
const DEFAULT_CARD_COUNT = 3;
const TARGET_CARD_WIDTH = 220; 
const CARD_GAP = 16;
const CONTROL_RESERVED_SPACE = 400; 
const FALLBACK_MESSAGE = "No items were given to make the carousel.";

const chunkItems = (items, size) => {
	// Deler listen i mindre pakker saa karussellen kan vise et overskueligt antal kort pr side
	if (!items || !items.length) { // Intet input giver en tom liste tilbage
		return [];
	}

	const normalizedSize = Number.isFinite(size) && size > 0 ? Math.floor(size) : 1; // Sikrer et positivt heltal som sidegroesse
	const chunks = []; // Opsamler de mindre pakker der ender som slides

	for (let index = 0; index < items.length; index += normalizedSize) { // Springer frem i listen med sidegroessen som skridt
		chunks.push(items.slice(index, index + normalizedSize)); // Skubber et udsnit af elementer ind i resultatet
	}

	return chunks; // Returnerer den nye liste af pakker
};

const computeCardsPerSlide = (usableWidth) => {
	// Afgoer hvor mange kort der realistisk kan staa paa en given bredde uden at blive for sma
	if (!Number.isFinite(usableWidth) || usableWidth <= 0) {
		return DEFAULT_CARD_COUNT; // Fald tilbage til en standardvaerdi hvis maalet ikke giver mening
	}

	const footprint = TARGET_CARD_WIDTH + CARD_GAP; // Saadan ser et kort ud sammen med sit mellemrum
	const capacity = Math.floor(usableWidth / footprint); // Hvor mange af disse kan klemmes ind i bredden

	return Math.max(1, capacity || DEFAULT_CARD_COUNT); // Altid mindst eet kort, ellers brug standard
};

const CarouselRenderer = ({ items, focusKey, cardComponent }) => {
	// React komponentnavne skal vaere store for at React forstaar at de er egne komponenter
	const CardComponent = cardComponent || PreviewCards; // Tillader udskiftning af kortkomponent, falder tilbage til PreviewCards
	const containerRef = useRef(null); // Holder peger til omgivende div saa vi kan maale bredde
	const [layout, setLayout] = useState({
		width: TARGET_CARD_WIDTH * DEFAULT_CARD_COUNT, // Raat maalt total bredde vi starter med
		usableWidth: TARGET_CARD_WIDTH * DEFAULT_CARD_COUNT, // Bredde efter der er reserveret plads til kontroller
		cardsPerSlide: DEFAULT_CARD_COUNT // Hvor mange kort vi viser pr slide
	});

	useEffect(() => {
		// Maaler pladsen og regner ud hvor mange kort der kan vaere uden at kontroller overlapper
		const node = containerRef.current; // Aktuel DOM-node for omgivende div
		const getWindowWidth = () =>
			typeof window !== "undefined" ? window.innerWidth : TARGET_CARD_WIDTH * DEFAULT_CARD_COUNT; // Fallback hvis ingen node

		const updateLayout = (width) => {
			const measuredWidth = Number.isFinite(width) && width > 0 ? width : getWindowWidth(); // Brug maalt bredde eller vinduesbredde

			// Pile overlappede kortene tidligere; vi reserverer derfor plads til kontrolknapperne i beregningen
			// Lille skraerm beholder 200 px fri, mellem 300 px, og stor skraerm 400 px sa kontrollerne ikke skjuler kort
			const reserved = measuredWidth < 600 ? 200 : measuredWidth < 1200 ? 300 : CONTROL_RESERVED_SPACE;

			const usableWidth = Math.max(measuredWidth - reserved, TARGET_CARD_WIDTH); // Minimum sikrer at der altid er plads til mindst eet kort
			setLayout({
				width: measuredWidth, // Faktisk bredde vi arbejder med
				usableWidth, // Bredde til kort efter fratraek af kontroller
				cardsPerSlide: computeCardsPerSlide(usableWidth) // Afledt antal kort per slide
			});
		};

		if (!node) { // Hvis referencen mangler, brug vinduesbredden som groft maal
			updateLayout(getWindowWidth());
			return undefined; // Ingen observer at rydde op i
		}

		updateLayout(node.offsetWidth || getWindowWidth()); // Foerste maalning sker straks, saa brugeren ser et rimeligt layout

		if (typeof ResizeObserver !== "undefined") {
			// Lytter paa stoerrelsesaendringer i containeren, fx naar vinduet aendres eller sidebaren aabnes
			const observer = new ResizeObserver((entries) => {
				entries.forEach((entry) => updateLayout(entry.contentRect.width)); // Hver gang bredden aendres beregnes layout igen
			});

			observer.observe(node); // Starter overvagningen paa containeren

			return () => observer.disconnect();
		}

		return undefined;
	}, []);

	const slides = useMemo(
		() => chunkItems(items, layout.cardsPerSlide),
		[items, layout.cardsPerSlide]
	); // Memoiserer siderne saa vi ikke regner dem om hver gang karussellen rerender uden grund
	const cardWidthPx = (() => {
		const { usableWidth, cardsPerSlide } = layout;
		if (!cardsPerSlide) {
			return TARGET_CARD_WIDTH;
		}

		const totalGap = CARD_GAP * Math.max(cardsPerSlide - 1, 0); // Samlet mellemrum mellem kortene paa en side
		const available = Math.max(usableWidth - totalGap, TARGET_CARD_WIDTH); // Faktisk plads til kort efter mellemrum
		const computed = available / cardsPerSlide; // Foreslaaet bredde per kort ud fra plads og antal

		return Math.max(180, Math.floor(computed)); // Saetter en nedre graense saa kortene aldrig bliver for smalle
	})();

	return (
		<div ref={containerRef} style={{ width: "100%" }}> {/* Wrapper der giver os noget at maale paa */}
			<style>{`
				.make-carousel .carousel-indicators { bottom: -40px; }
				.make-carousel .carousel-control-prev-icon, .make-carousel .carousel-control-next-icon { background-color: #d8d8d8ff; border-radius: 25%; margin:8px; }
				.make-carousel .carousel-indicators button { background-color: #6c757d; }
			`}</style>
			<Carousel interval={null} controls={slides.length > 1} indicators={slides.length > 1} className="make-carousel"> {/* interval=null sa brugeren selv styrer skift */}
				{slides.map((slide, slideIndex) => (
					<Carousel.Item key={`slide-${slideIndex}`}> {/* Hver slide faar en noegle for stabilitet */}
						<div className="d-flex justify-content-center gap-3 flex-wrap py-4"> {/* Flex-rad der centrerer kortene og giver luft */}
							{slide.map((entry, entryIndex) => {
								const stableKey =
									entry?.pageId ||
									entry?.id ||
									entry?._id ||
									entry?.slug ||
									entry?.imdbId ||
									entry?.tmdbId ||
									entry?.title ||
									entry?.name ||
									`card-${slideIndex}-${entryIndex}`; // Finder den mest stabile identifikation der findes

								return (
									<div
										key={stableKey}
										style={{
											flex: `0 0 ${cardWidthPx}px`, // Lader flex-boksen holde en fast bredde
											maxWidth: `${cardWidthPx}px`, // Sikrer at kortet ikke vokser ud over maalet
											minWidth: `${cardWidthPx}px` // Sikrer at kortet ikke krymper under maalet
										}}
									>
										<CardComponent item={entry} focusKey={focusKey} /> {/* Render selve kortet med data og fokusnoegle */}
									</div>
								);
							})}
						</div>
					</Carousel.Item>
				))}
			</Carousel>
		</div>
	);
};

/**
 * makeCarousel Component
 * A reusable Bootstrap-driven carousel that lays out preview cards for contributors or titles.
 * @param {Array} items - List of objects representing each card the carousel should render.
 * @param {string} focusKey - Hint about the card context (e.g., "actor" or "movie") that PreviewCards can display.
 * @param {Function} cardComponent - Component function to render each card, defaults to PreviewCards.
 */
export default function makeCarousel(items = null, focusKey = DEFAULT_FOCUS_KEY, cardComponent = PreviewCards) {
	// Behandler null eller undefined som signal om at data er paa vej
	if (items === null || items === undefined) {
		return <LoadingState message="Loading content..." />;
	}

	const safeItems = items; // Her kunne man filtrere for ugyldige elementer hvis noedvendigt

	if (!safeItems.length) {
		return (
			<div className="alert alert-warning text-center my-4" role="status">
				{FALLBACK_MESSAGE}
			</div>
		);
	}

	return <CarouselRenderer items={safeItems} focusKey={focusKey} cardComponent={cardComponent} />; // Sender data og valg af kortkomponent videre til renderer
}