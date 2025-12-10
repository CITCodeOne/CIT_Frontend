import MakeList from "../components/MakeList";
import Container from "react-bootstrap/Container";
import lion from "../pics/lion.jpg";
import girl from "../pics/girl.jpg";
import mike from "../pics/mike.jpg";
import Movie from "../business-logic-layer/data-models/Movie"

//dummy object array
let size = 1;
let demoItems = [];
for(let i = 0; i < size; i++){
    demoItems.push(
        new Movie({
            name : "ep"+i,  
            releaseYear : 1998,
            directors : ['Mike Hunt', 'That Guy']
        })
    )
}


export default function ListPage() {
    return (
        <MakeList
            itemArray={demoItems}
            renderItem={(item) => (
                <>
                    <img src={item.banner} alt={item.name} className="img-fluid py-1 px-1 rounded-4 w-25 object-fit-cover overflow-hidden" />
                    <Container className="overflow-hidden" style={{height: "95%"}}>
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

                    <Container className="bg-warning rounded-end-4" style={{width: "15%"}}>
                        <p className="text-center fs-1 fst-italic fw-bold py-4 overflow-hidden">{item.rating}</p>
                    </Container>
                </>
            )}
        />
    );
}