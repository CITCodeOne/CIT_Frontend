import React from 'react';
import MainDisplay from '../components/MainDisplay';

function Title() {
    // Example data for a title/movie
    const titleData = {
        title: 'The Shawshank Redemption',
        banner: 'https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
        plot: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        rating: 9.3,
        year: 1994,
        genres: ['Drama', 'Crime'],
        actors: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton', 'William Sadler'],
        directors: ['Frank Darabont']
    };

    return (
        <MainDisplay type="title" data={titleData} />
    );
}

export default Title;
