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

function MakeList({
    itemArray = [],
    areaWidth = "100",
    areaHeight = "0",
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
                <Container className="overflow-auto" style={{
                                                        height: "30vh",
                                                        width: areaWidth+"%",
                                                        position: "relative",
                                                        top: areaHeight+"%",
                                                        left: "0%"
                                                        }}
                                                        key={`list-${listIndex}`}>
                    {listItems.map((item, itemIndex) => (
                        <Container className="d-flex my-2 bg-success rounded-4 px-0" style={{ height: "100px" }} key={`item-${listIndex}-${itemIndex}`} >
                            {renderListItem(item, listIndex * listItems + itemIndex)}
                        </Container>
                    ))}
                </Container>
            ))}
        </>
    );
}





export default function ItemList({
    itemsRecieved = []
}) {
    return (
        <MakeList
            itemArray={itemsRecieved}
            areaWidth= "100"
            areaHeight= "60"
            renderItem={(item) => (
                <>
                    <img src={item.banner} alt={item.name} className="img-fluid py-1 px-1 rounded-4 w-25 object-fit-cover overflow-hidden" />
                    <Container className="overflow-hidden" style={{ height: "95%" }}>
                        <h3 className="mb-0">{item.name}</h3>
                        <p className="lh-sm">{item.plot}</p>
                        {item.directors && item.directors.length > 0 && (
                            <Container className="d-flex">
                                Directors: &nbsp;
                                {item.directors.map((dir, index) => (
                                    <p key={index}>{dir},&nbsp;</p>
                                ))}
                            </Container>
                        )}
                        <p>{item.releaseYear}</p>
                    </Container>
                    <Container className="bg-warning rounded-end-4" style={{ width: "15%" }}>
                        <p className="text-center fs-1 fst-italic fw-bold py-4 overflow-hidden">{item.rating}</p>
                    </Container>
                </>
            )}
        />
    );
}