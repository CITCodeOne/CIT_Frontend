import { useCallback, useEffect, useMemo, useState } from "react";
import Container from "react-bootstrap/Container";


/*
const defaultBreakpoints = [
    { width: 1280, items: 5 },
    { width: 1024, items: 4 },
    { width: 768, items: 3 },
    { width: 640, items: 2 },
    { width: 0, items: 1 }
];
*/

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

/*
const resolveItemsPerSlide = (width, breakpoints) => {
    for (const point of breakpoints) {
        if (width >= point.width) {
            return point.items;
        }
    }

    return 1;
};
*/

export default function MakeList({
    itemArray = [],
    renderItem
}) {
    /*
    const sortedBreakpoints = useMemo(
        () => [...breakpoints].sort((a, b) => b.width - a.width),
        [breakpoints]
    );

    const getInitialItemsPerSlide = () => {
        if (typeof window === "undefined") {
            return sortedBreakpoints[0]?.items || 1;
        }

        return resolveItemsPerSlide(window.innerWidth, sortedBreakpoints);
    };*/

    //const [itemsPerSlide, setItemsPerSlide] = useState(getInitialItemsPerSlide);
    //const [activeIndex, setActiveIndex] = useState(0);


    /*
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

    */

    const [itemsListed, setListedItems] = useState([]);
    
    const items = useMemo(
        () => chunkItems(itemArray, itemsListed),
        [itemArray, itemsListed]
    );

    const renderListItem = (item, index) => {
        if (typeof renderItem === "function") {
            return renderItem(item, index);
        }

        return item;
    };


    //const disablePrev = !loop && activeIndex === 0;
    //const disableNext = !loop && activeIndex === slides.length - 1;

    return (
        <>
            {items.map((listItems, listIndex) => (
                <Container className="overflow-auto " style={{height: "88vh"}} key={`list-${listIndex}`}>
                    {listItems.map((item, itemIndex) => (
                        <Container className="d-flex my-2 bg-success rounded-4 px-0" style={{height: "120px"}} key={`item-${listIndex}-${itemIndex}`} >
                            {renderListItem(item, listIndex * listItems + itemIndex)}
                        </Container>
                    ))}
                </Container>
            ))}
        </>
    );
}