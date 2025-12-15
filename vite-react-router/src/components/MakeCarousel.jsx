import React, { useEffect, useMemo, useRef, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import PreviewCards from "./PreviewCards";

const DEFAULT_FOCUS_KEY = "title";
const DEFAULT_CARD_COUNT = 3;
const TARGET_CARD_WIDTH = 280; 
const CARD_GAP = 24;
const CONTROL_RESERVED_SPACE = 400; 
const FALLBACK_MESSAGE = "No items were given to make the carousel.";

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

const computeCardsPerSlide = (usableWidth) => {
	if (!Number.isFinite(usableWidth) || usableWidth <= 0) {
		return DEFAULT_CARD_COUNT;
	}

	const footprint = TARGET_CARD_WIDTH + CARD_GAP;
	const capacity = Math.floor(usableWidth / footprint);

	return Math.max(1, capacity || DEFAULT_CARD_COUNT);
};

const CarouselRenderer = ({ items, focusKey, cardComponent }) => {
	// React components must be capitalized when rendered from a variable
	const CardComponent = cardComponent || PreviewCards;
	const containerRef = useRef(null);
	const [layout, setLayout] = useState({
		width: TARGET_CARD_WIDTH * DEFAULT_CARD_COUNT,
		usableWidth: TARGET_CARD_WIDTH * DEFAULT_CARD_COUNT,
		cardsPerSlide: DEFAULT_CARD_COUNT
	});

	useEffect(() => {
		const node = containerRef.current;
		const getWindowWidth = () =>
			typeof window !== "undefined" ? window.innerWidth : TARGET_CARD_WIDTH * DEFAULT_CARD_COUNT;

		const updateLayout = (width) => {
			const measuredWidth = Number.isFinite(width) && width > 0 ? width : getWindowWidth();
			const usableWidth = Math.max(measuredWidth - CONTROL_RESERVED_SPACE, TARGET_CARD_WIDTH);
			setLayout({
				width: measuredWidth,
				usableWidth,
				cardsPerSlide: computeCardsPerSlide(usableWidth)
			});
		};

		if (!node) {
			updateLayout(getWindowWidth());
			return undefined;
		}

		updateLayout(node.offsetWidth || getWindowWidth());

		if (typeof ResizeObserver !== "undefined") {
			const observer = new ResizeObserver((entries) => {
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
		const { usableWidth, cardsPerSlide } = layout;
		if (!cardsPerSlide) {
			return TARGET_CARD_WIDTH;
		}

		const totalGap = CARD_GAP * Math.max(cardsPerSlide - 1, 0);
		const available = Math.max(usableWidth - totalGap, TARGET_CARD_WIDTH);
		const computed = available / cardsPerSlide;

		return Math.max(180, Math.floor(computed));
	})();

	return (
		<div ref={containerRef} style={{ width: "100%" }}>
			<style>{`
				.make-carousel .carousel-indicators { bottom: -40px; }
				.make-carousel .carousel-control-prev-icon, .make-carousel .carousel-control-next-icon { background-color: #d8d8d8ff; border-radius: 25%; margin:8px; }
				.make-carousel .carousel-indicators button { background-color: #6c757d; }
			`}</style>
			<Carousel interval={null} controls={slides.length > 1} indicators={slides.length > 1} className="make-carousel">
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
									<CardComponent item={entry} focusKey={focusKey} />
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
 * A reusable Bootstrap-driven carousel that lays out preview cards for contributors or titles.
 * @param {Array} items - List of objects representing each card the carousel should render.
 * @param {string} focusKey - Hint about the card context (e.g., "actor" or "movie") that PreviewCards can display.
 * @param {Function} cardComponent - Component function to render each card, defaults to PreviewCards.
 */
export default function makeCarousel(items = [], focusKey = DEFAULT_FOCUS_KEY, cardComponent = PreviewCards) {
	const safeItems = Array.isArray(items) ? items : [];

	if (!safeItems.length) {
		return (
			<div className="alert alert-warning text-center my-4" role="status">
				{FALLBACK_MESSAGE}
			</div>
		);
	}

	return <CarouselRenderer items={safeItems} focusKey={focusKey} cardComponent={cardComponent} />;
}