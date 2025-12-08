import { useMemo, useState } from "react";
import Container from "react-bootstrap/Container";

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

export default function MakeList({
    itemArray = [],
    renderItem
}) {
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