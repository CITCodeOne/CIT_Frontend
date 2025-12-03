import { useCallback, useEffect, useMemo, useState } from "react";
import "../style/makeCarousel.css";

const defaultBreakpoints = [
	{ width: 1280, items: 5 },
	{ width: 1024, items: 4 },
	{ width: 768, items: 3 },
	{ width: 640, items: 2 },
	{ width: 0, items: 1 }
];

const chunkItems = (items, size) => {
	if (!size || size < 1) {
		return [items];
	}

	const chunks = [];

	for (let index = 0; index < items.length; index += size) {
		chunks.push(items.slice(index, index + size));
	}

	return chunks.length ? chunks : [[]];
};

const resolveItemsPerSlide = (width, breakpoints) => {
	for (const point of breakpoints) {
		if (width >= point.width) {
			return point.items;
		}
	}

	return 1;
};

export default function MakeCarousel({
	itemArray = [],
	breakpoints = defaultBreakpoints,
	renderItem,
	showControls = true,
	showDots = true,
	loop = true,
	autoPlay = false,
	autoPlayInterval = 5000,
	ariaLabel = "Carousel"
}) {
	const sortedBreakpoints = useMemo(
		() => [...breakpoints].sort((a, b) => b.width - a.width),
		[breakpoints]
	);

	const getInitialItemsPerSlide = () => {
		if (typeof window === "undefined") {
			return sortedBreakpoints[0]?.items || 1;
		}

		return resolveItemsPerSlide(window.innerWidth, sortedBreakpoints);
	};

	const [itemsPerSlide, setItemsPerSlide] = useState(getInitialItemsPerSlide);
	const [activeIndex, setActiveIndex] = useState(0);

	const slides = useMemo(
		() => chunkItems(itemArray, itemsPerSlide),
		[itemArray, itemsPerSlide]
	);

	const navigate = useCallback(
		(direction) => {
			if (!slides.length) {
				return;
			}

			setActiveIndex((prev) => {
				const next = prev + direction;

				if (loop) {
					return (next + slides.length) % slides.length;
				}

				return Math.min(Math.max(next, 0), slides.length - 1);
			});
		},
		[loop, slides.length]
	);

	useEffect(() => {
		const handleResize = () => {
			setItemsPerSlide(resolveItemsPerSlide(window.innerWidth, sortedBreakpoints));
		};

		window.addEventListener("resize", handleResize);

		return () => window.removeEventListener("resize", handleResize);
	}, [sortedBreakpoints]);

	useEffect(() => {
		setActiveIndex(0);
	}, [itemsPerSlide, itemArray.length]);

	useEffect(() => {
		if (!autoPlay || slides.length <= 1) {
			return undefined;
		}

		const timer = setInterval(() => navigate(1), autoPlayInterval);

		return () => clearInterval(timer);
	}, [autoPlay, autoPlayInterval, navigate, slides.length]);

	const renderCard = (item, index) => {
		if (typeof renderItem === "function") {
			return renderItem(item, index);
		}

		return item;
	};

	const disablePrev = !loop && activeIndex === 0;
	const disableNext = !loop && activeIndex === slides.length - 1;

	return (
		<div className="make-carousel" aria-label={ariaLabel} role="region">
			{showControls && (
				<button
					className="make-carousel__control make-carousel__control--prev"
					type="button"
					onClick={() => navigate(-1)}
					disabled={disablePrev}
					aria-label="Previous slide"
				>
					‹
				</button>
			)}

			<div className="make-carousel__viewport">
				<div
					className="make-carousel__track"
					style={{ transform: `translateX(-${activeIndex * 100}%)` }}
				>
					{slides.map((slideItems, slideIndex) => (
						<div className="make-carousel__slide" key={`slide-${slideIndex}`}>
							{slideItems.map((item, itemIndex) => (
								<div
									className="make-carousel__card-wrapper"
									key={`item-${slideIndex}-${itemIndex}`}
								>
									{renderCard(item, slideIndex * itemsPerSlide + itemIndex)}
								</div>
							))}
						</div>
					))}
				</div>
			</div>

			{showControls && (
				<button
					className="make-carousel__control make-carousel__control--next"
					type="button"
					onClick={() => navigate(1)}
					disabled={disableNext}
					aria-label="Next slide"
				>
					›
				</button>
			)}

			{showDots && slides.length > 1 && (
				<div className="make-carousel__dots" role="tablist">
					{slides.map((_, dotIndex) => (
						<button
							type="button"
							key={`dot-${dotIndex}`}
							className={`make-carousel__dot${
								dotIndex === activeIndex ? " make-carousel__dot--active" : ""
							}`}
							onClick={() => setActiveIndex(dotIndex)}
							aria-label={`Go to slide ${dotIndex + 1}`}
							aria-controls={`slide-${dotIndex}`}
						/>
					))}
				</div>
			)}
		</div>
	);
}