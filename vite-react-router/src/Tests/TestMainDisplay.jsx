import React from 'react';
import MainDisplay from '../components/MainDisplay';

function TestMainDisplay() {
    // Test data for a title
    const movieData = {
        title: 'The Shawshank Redemption',
        banner: 'https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
        plot: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        rating: 9.3,
        year: 1994,
        genres: ['Drama', 'Crime'],
        actors: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton', 'William Sadler'],
        directors: ['Frank Darabont']
    };

    // Test data for an actor
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
        <div>
            <h1 style={{ textAlign: 'center', padding: '2rem' }}>MainDisplay Component Test</h1>
            
            <div style={{ borderBottom: '3px solid #1f90f3', margin: '2rem 0' }}></div>
            
            <h2 style={{ textAlign: 'center', color: '#1f90f3' }}>Title Display Example</h2>
            <MainDisplay type="title" data={movieData} />
            
            <div style={{ borderBottom: '3px solid #1f90f3', margin: '3rem 0' }}></div>
            
            <h2 style={{ textAlign: 'center', color: '#1f90f3' }}>Actor Display Example</h2>
            <MainDisplay type="actor" data={actorData} />
        </div>
    );
}

export default TestMainDisplay;
