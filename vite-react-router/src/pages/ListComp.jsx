import MakeList from "../components/MakeList";
import Container from "react-bootstrap/container";
import lion from "../pics/lion.jpg";
import girl from "../pics/girl.jpg";
import mike from "../pics/mike.jpg";

const demoItems = [
    {
        id: 1,
        name: "Richard Nixon",
        img: lion,
        description: "People have got to know whether or not their President is a crook. Well, I'm not a crook. I've earned everything I've got. When the President does it, that means it's not illegal. You don't know how to lie. If you can't lie, you'll never go anywhere. I was not lying. I said things that later on seemed to be untrue.",
        rating: "3.1"
    },
    {
        id: 2,
        name: "Richard Nixon",
        img: lion,
        description: "People have got to know whether or not their President is a crook. Well, I'm not a crook. I've earned everything I've got. When the President does it, that means it's not illegal. You don't know how to lie. If you can't lie, you'll never go anywhere. I was not lying. I said things that later on seemed to be untrue.",
        rating: "3"
    },
    {
        id: 3,
        name: "Richard Nixon",
        img: lion,
        description: "People have got to know whether or not their President is a crook. Well, I'm not a crook. I've earned everything I've got. When the President does it, that means it's not illegal. You don't know how to lie. If you can't lie, you'll never go anywhere. I was not lying. I said things that later on seemed to be untrue.",
        rating: "3.1"
    },
    {
        id: 4,
        name: "Richard Nixon",
        img: lion,
        description: "People have got to know whether or not their President is a crook. Well, I'm not a crook. I've earned everything I've got. When the President does it, that means it's not illegal. You don't know how to lie. If you can't lie, you'll never go anywhere. I was not lying. I said things that later on seemed to be untrue.",
        rating: "3.1"
    },
    {
        id: 5,
        name: "Richard Nixon",
        img: lion,
        description: "People have got to know whether or not their President is a crook. Well, I'm not a crook. I've earned everything I've got. When the President does it, that means it's not illegal. You don't know how to lie. If you can't lie, you'll never go anywhere. I was not lying. I said things that later on seemed to be untrue.",
        rating: "3.1"
    },
    {
        id: 6,
        name: "Richard Nixon",
        img: lion,
        description: "People have got to know whether or not their President is a crook. Well, I'm not a crook. I've earned everything I've got. When the President does it, that means it's not illegal. You don't know how to lie. If you can't lie, you'll never go anywhere. I was not lying. I said things that later on seemed to be untrue.",
        rating: "3.1"
    },
    {
        id: 7,
        name: "Richard Nixon",
        img: lion,
        description: "People have got to know whether or not their President is a crook. Well, I'm not a crook. I've earned everything I've got. When the President does it, that means it's not illegal. You don't know how to lie. If you can't lie, you'll never go anywhere. I was not lying. I said things that later on seemed to be untrue.",
        rating: "3.1"
    },
    {
        id: 8,
        name: "Richard Nixon",
        img: lion,
        description: "People have got to know whether or not their President is a crook. Well, I'm not a crook. I've earned everything I've got. When the President does it, that means it's not illegal. You don't know how to lie. If you can't lie, you'll never go anywhere. I was not lying. I said things that later on seemed to be untrue.",
        rating: "3.1"
    },
    {
        id: 9,
        name: "Richard Nixon",
        img: lion,
        description: "People have got to know whether or not their President is a crook. Well, I'm not a crook. I've earned everything I've got. When the President does it, that means it's not illegal. You don't know how to lie. If you can't lie, you'll never go anywhere. I was not lying. I said things that later on seemed to be untrue.",
        rating: "3.1"
    },
    {
        id: 10,
        name: "Richard Nixon",
        img: lion,
        description: "People have got to know whether or not their President is a crook. Well, I'm not a crook. I've earned everything I've got. When the President does it, that means it's not illegal. You don't know how to lie. If you can't lie, you'll never go anywhere. I was not lying. I said things that later on seemed to be untrue.",
        rating: "3.1"
    },
];


export default function ListPage() {
    return (
        <MakeList
            itemArray={demoItems}
            renderItem={(item) => (
                <>
                    <img src={item.img} alt={item.name} className="img-fluid py-1 px-1 rounded-4 w-25 object-fit-cover overflow-hidden" />

                    <Container className="overflow-hidden" style={{height: "95%"}}>
                        <h3 className="mb-0">{item.name}</h3>
                        <p className="lh-sm">{item.description}</p>
                    </Container>

                    <Container className="bg-warning rounded-end-4" style={{width: "15%"}}>
                        <p className="text-center fs-1 fst-italic fw-bold py-4">{item.rating}</p>
                    </Container>
                </>
            )}
        />
    );
}