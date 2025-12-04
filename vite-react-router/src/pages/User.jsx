import React from 'react';
import MainDisplay from '../components/MainDisplay';

function User() {
    // Example data for an actor
    const actorData = {
        name: 'Morgan Freeman',
        poster: 'https://image.tmdb.org/t/p/w500/jPsLqiYGSofU4s6BjrxnefMfabb.jpg',
        bio: 'Morgan Freeman is an American actor, director, and narrator. He has appeared in a range of film genres portraying character roles and is particularly known for his distinctive deep voice.',
        birthYear: 1937,
        knownFor: [
            'The Shawshank Redemption (1994)',
            'Se7en (1995)',
            'Bruce Almighty (2003)',
            'The Dark Knight Trilogy (2005-2012)',
            'Million Dollar Baby (2004)'
        ]
    };

    return (
        <MainDisplay type="actor" data={actorData} />
    );
}

export default User;
