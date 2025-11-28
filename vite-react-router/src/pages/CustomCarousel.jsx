import React from "react";
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import lion from '../pics/lion.jpg';
import girl from '../pics/girl.jpg';
import mike from '../pics/mike.jpg';

export default function CarouselPage() {
    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <h1>Carousel Page</h1>
            <Carousel>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src={lion}
                        alt="First slide"
                    />
                    <Carousel.Caption>
                        <h3>1</h3>
                        <p>Rawr.</p>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src={girl}
                        alt="Second slide"
                    />
                    <Carousel.Caption>
                        <h3>2</h3>
                        <p>Me when someone does something.</p>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src={mike}
                        alt="Third slide"
                    />
                    <Carousel.Caption>
                        <h3>3</h3>
                        <p>MIKE.</p>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>
        </div>
    );
}