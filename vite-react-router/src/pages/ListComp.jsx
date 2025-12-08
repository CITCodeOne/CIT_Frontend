import MakeList from "../components/MakeList";
import Container from "react-bootstrap/container";
import lion from "../pics/lion.jpg";
import girl from "../pics/girl.jpg";
import mike from "../pics/mike.jpg";

//dummy object array
let size = 200;
let demoItems = [];
for(let i = 0; i < size; i++){
    demoItems.push({
        id: i,
        name: "Richard Nixon",
        img: lion,
        description: "I'm for demoCRAZY!",
        rating: 7.8
    })
}




export default function ListPage() {
    return (
        <MakeList
            itemArray={demoItems}
            renderItem={(item) => (
                <>
                    <img src={item.img} alt={item.name} className="img-fluid py-1 px-1 rounded-4 w-25 object-fit-cover overflow-hidden" />
                    <Container className="overflow-hidden" style={{height: "95%"}}>
                        <h2>{item.id}</h2>
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