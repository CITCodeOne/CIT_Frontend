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

/*Default size values*/
const defaultSizing = {
    aH: "88",
    aW: "100",
    aYP: "0",
    aXP: "0",
    iH: "100"
};
/* ----------------- */

function MakeList({
    itemArray = [],
    listSizing = defaultSizing,
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
                    height: listSizing.aH + "vh",
                    width: listSizing.aW + "%",
                    position: "relative",
                    top: listSizing.aYP + "%",
                    left: listSizing.aXP + "%"
                }}
                    key={`list-${listIndex}`}>
                    {listItems.map((item, itemIndex) => (
                        <Container className="d-flex my-2 bg-success rounded-4 px-0" style={{ height: listSizing.iH + "px" }} key={`item-${listIndex}-${itemIndex}`} >
                            {renderListItem(item, listIndex * listItems + itemIndex)}
                        </Container>
                    ))}
                </Container>
            ))}
        </>
    );
}

export default function ItemList({
    itemsRecieved = [],
    sizeSettings = defaultSizing,
}) {
    return (
        <MakeList
            itemArray={itemsRecieved}
            listSizing={sizeSettings}
            renderItem={(item) => (
                <>
                    <img src={item.poster} className="img-fluid py-1 px-1 rounded-4 w-25 object-fit-cover overflow-hidden" />
                    <Container className="overflow-hidden" style={{ height: "95%" }}>
                        <h3 className="overflow-hidden mb-0" style={{ height: "40%", whiteSpace: "nowrap" }}>{item.name}</h3>
                        <p className="overflow-hidden lh-sm" style={{ position: "relative", height: "45%", width: "98%", left: "3%", top: "-6%" }}>
                            {item.plot}
                        </p>
                        <Container className="overflow-hidden" style={{ whiteSpace: "nowrap", width: "70%", position: "relative", top: "-27%", left: "-18%" }}>
                            {item.genres && item.genres.length > 0 && (
                                <Container className="d-flex">
                                    Genres: &nbsp;
                                    {item.genres.map((gen, index) => (
                                        <p key={index}>{gen},&nbsp;</p>
                                    ))}
                                </Container>
                            )}
                        </Container>
                        <p className="text-end" style={{position: "relative", top: "-67%",}}>Released: {item.releaseDate}</p>
                        
                    </Container>
                    <Container className="bg-warning rounded-end-4" style={{ width: "15%" }}>
                        <p className="text-center fs-1 fst-italic fw-bold py-4 overflow-hidden">{item.rating}</p>
                    </Container>
                </>
            )}
        />
    );
}