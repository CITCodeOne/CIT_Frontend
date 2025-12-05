import React from 'react';

/**
 * MainDisplay Component
 * 
 * A reusable component that displays detailed information for titles (movies/shows) or actors.
 * 
 * @param {string} type - Either 'title' or 'actor' to determine display layout
 * @param {object} data - Object containing all the information to display
 */
function MainDisplay({ type, data }) {
    // Destructure data with default fallback values to prevent errors if data is missing
    const {
        // Title/Movie properties
        title = 'No Title Available',
        banner = null,
        plot = 'No plot information available.',
        rating = null,
        year = null,
        genres = [],
        actors = [],
        directors = [],
        // Actor properties
        name = 'No Name Available',
        poster = null,
        bio = null,
        birthYear = null,
        knownFor = []
    } = data || {};

    return (
        // Use existing ContainerCstyle class for consistent padding across the app
        <div className="ContainerCstyle" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            
            {/* Header Section - Display title or actor name with year/birth year */}
            <div style={{ marginBottom: '2rem' }}>
                <h1>{type === 'title' ? title : name}</h1>
                {/* Show birth year only for actors */}
                {type === 'actor' && birthYear && (
                    <p style={{ fontSize: '1.1rem', color: '#666' }}>Born: {birthYear}</p>
                )}
                {/* Show release year only for titles */}
                {type === 'title' && year && (
                    <p style={{ fontSize: '1.1rem', color: '#666' }}>Year: {year}</p>
                )}
            </div>

            {/* Banner/Poster Image Section - Only display if image exists */}
            {(banner || poster) && (
                <div style={{ marginBottom: '2rem' }}>
                    <img 
                        src={banner || poster} 
                        alt={type === 'title' ? title : name}
                        style={{ 
                            width: '100%', 
                            maxHeight: '400px', 
                            objectFit: 'cover',  // Crop to fit while maintaining aspect ratio
                            borderRadius: '8px'
                        }} 
                    />
                </div>
            )}

            {/* Main Content Section - Different content based on type */}
            <div style={{ marginBottom: '2rem' }}>
                {/* TITLE/MOVIE DISPLAY */}
                {type === 'title' && (
                    <>
                        {/* Rating display with star emoji and app accent color */}
                        {rating && (
                            <div style={{ marginBottom: '1rem' }}>
                                <h3>Rating</h3>
                                <p style={{ fontSize: '1.2rem', color: '#1f90f3' }}>⭐ {rating}/10</p>
                            </div>
                        )}
                        
                        {/* Plot/storyline description */}
                        {plot && (
                            <div style={{ marginBottom: '1rem' }}>
                                <h3>Plot</h3>
                                <p style={{ lineHeight: '1.6' }}>{plot}</p>
                            </div>
                        )}

                        {/* Genre tags - displayed as styled badges */}
                        {genres && genres.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <h3>Genres</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {genres.map((genre, index) => (
                                        <span 
                                            key={index}
                                            style={{
                                                backgroundColor: '#1f90f3',  // App accent color
                                                color: 'white',
                                                padding: '0.3rem 0.8rem',
                                                borderRadius: '5px',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cast list - only show if actors exist */}
                        {actors && actors.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <h3>Cast</h3>
                                <ul>
                                    {actors.map((actor, index) => (
                                        <li key={index}>{actor}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Directors - handles singular/plural heading */}
                        {directors && directors.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <h3>Director{directors.length > 1 ? 's' : ''}</h3>
                                <p>{directors.join(', ')}</p>
                            </div>
                        )}
                    </>
                )}

                {/* ACTOR DISPLAY */}
                {type === 'actor' && (
                    <>
                        {/* Actor biography/description */}
                        {bio && (
                            <div style={{ marginBottom: '1rem' }}>
                                <h3>Biography</h3>
                                <p style={{ lineHeight: '1.6' }}>{bio}</p>
                            </div>
                        )}

                        {/* List of notable works */}
                        {knownFor && knownFor.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <h3>Known For</h3>
                                <ul>
                                    {knownFor.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default MainDisplay;
