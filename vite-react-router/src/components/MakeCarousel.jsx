import { useEffect, useMemo, useRef, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import PreviewCards from "./PreviewCards";

const DEFAULT_FOCUS_KEY = "title";
const DEFAULT_CARD_COUNT = 3;
const TARGET_CARD_WIDTH = 280; 
const CARD_GAP = 24;
const FALLBACK_MESSAGE = "No items were given to make the carousel.";

// Splits the incoming items array into evenly sized chunks (slides) for the carousel.
const chunkItems = (items, size) => {
	if (!Array.isArray(items) || !items.length) {
		return [];
	}

	const normalizedSize = Number.isFinite(size) && size > 0 ? Math.floor(size) : 1;
	const chunks = [];

	for (let index = 0; index < items.length; index += normalizedSize) {
		chunks.push(items.slice(index, index + normalizedSize));
	}

	return chunks;
};

const computeCardsPerSlide = (width) => {
	if (!Number.isFinite(width) || width <= 0) {
		return DEFAULT_CARD_COUNT;
	}

	// Each card occupies its width plus the gap to the next card (its visual "footprint").
	const footprint = TARGET_CARD_WIDTH + CARD_GAP;
	const capacity = Math.floor(width / footprint);

	return Math.max(1, capacity || DEFAULT_CARD_COUNT);
};

const CarouselRenderer = ({ items, focusKey }) => {
	const containerRef = useRef(null);
	const [layout, setLayout] = useState({
		width: TARGET_CARD_WIDTH * DEFAULT_CARD_COUNT,
		cardsPerSlide: DEFAULT_CARD_COUNT
	});

	useEffect(() => {
		const node = containerRef.current;
		const getWindowWidth = () =>
			typeof window !== "undefined" ? window.innerWidth : TARGET_CARD_WIDTH * DEFAULT_CARD_COUNT;

		// Recomputes layout when the container or window width changes.
		const updateLayout = (width) => {
			const measuredWidth = Number.isFinite(width) && width > 0 ? width : getWindowWidth();
			setLayout({
				width: measuredWidth,
				cardsPerSlide: computeCardsPerSlide(measuredWidth)
			});
		};

		if (!node) {
			updateLayout(getWindowWidth());
			return undefined;
		}

		updateLayout(node.offsetWidth || getWindowWidth());

		if (typeof ResizeObserver !== "undefined") {
			// ResizeObserver reads the container's content box width, so even if the
			// carousel lives inside a constrained column, we react to its actual
			// rendered width instead of the global window width.
			const observer = new ResizeObserver((entries) => {
				// We inspect each entry because a single observer could watch multiple
				// nodes; contentRect.width is the precise, post-layout width.
				entries.forEach((entry) => updateLayout(entry.contentRect.width));
			});

			observer.observe(node);

			return () => observer.disconnect();
		}

		return undefined;
	}, []);

	const slides = useMemo(
		() => chunkItems(items, layout.cardsPerSlide),
		[items, layout.cardsPerSlide]
	);
	const cardWidthPx = (() => {
		const { width, cardsPerSlide } = layout;
		if (!cardsPerSlide) {
			return TARGET_CARD_WIDTH;
		}

		// Deduct total gap space first, then divide remaining pixels between cards.
		const totalGap = CARD_GAP * Math.max(cardsPerSlide - 1, 0);
		const available = Math.max(width - totalGap, TARGET_CARD_WIDTH);
		const computed = available / cardsPerSlide;

		return Math.max(180, Math.floor(computed));
	})();

	return (
		<div ref={containerRef} style={{ width: "100%" }}>
			<Carousel interval={null} controls={slides.length > 1} indicators={slides.length > 1}>
				{slides.map((slide, slideIndex) => (
					<Carousel.Item key={`slide-${slideIndex}`}>
						<div className="d-flex justify-content-center gap-3 flex-wrap py-4">
							{slide.map((entry, entryIndex) => (
								<div
									key={`card-${slideIndex}-${entryIndex}`}
									style={{
										flex: `0 0 ${cardWidthPx}px`,
										maxWidth: `${cardWidthPx}px`,
										minWidth: `${cardWidthPx}px`
									}}
								>
									<PreviewCards item={entry} focusKey={focusKey} />
								</div>
							))}
						</div>
					</Carousel.Item>
				))}
			</Carousel>
		</div>
	);
};

/**
 * makeCarousel Component
 * A reusable Bootstrap-driven carousel that lays out preview cards for actors or titles.
 * @param {Array} items - List of objects representing each card the carousel should render.
 * @param {string} focusKey - Hint about the card context (e.g., "actor" or "title") that PreviewCards can display.
 */
export default function makeCarousel(items = [], focusKey = DEFAULT_FOCUS_KEY) {
	const safeItems = Array.isArray(items) ? items : [];

	if (!safeItems.length) {
		return (
			<div className="alert alert-warning text-center my-4" role="status">
				{FALLBACK_MESSAGE}
			</div>
		);
	}

	return <CarouselRenderer items={safeItems} focusKey={focusKey} />;
}