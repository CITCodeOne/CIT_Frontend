import React from 'react';
import lion from '../pics/lion.jpg';
import girl from '../pics/girl.jpg';
import mike from '../pics/mike.jpg';
import sponge from '../pics/sponge.jpg';

function RandPic({ picNumb }) {
    // Function to select an image based on the prop
    const getImage = (picNumb) => {
        switch (picNumb) {
            case '1':
                return lion;
            case '2':
                return girl;
            case '3':
                return mike;
            case '4':
                return sponge;
            default:
                return null;
        }
    };

    const selectedImage = getImage(picNumb);

    return (
        <div>
            {selectedImage ? (
                <img src={selectedImage} alt={`Image ${picNumb}`} style={{ width: '300px', height: 'auto' }} />
            ) : (
                <p>Ups der skete noget med koden så der er ikke noget billede</p>
            )}
        </div>
    );
}

export default RandPic;