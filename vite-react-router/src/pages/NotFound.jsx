import React from 'react';
import flamingoImage from '../pics/404notfound.png';
import figlet from 'figlet';
import standard from 'figlet/importable-fonts/Standard.js';

figlet.parseFont('Standard', standard);

function NotFound() {
        const asciiArt = figlet.textSync('ERROR 404', {
                font: 'Standard',
        });

        return (
                <div
                        style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '100vh',
                                textAlign: 'center',
                                padding: '1.5rem',
                        }}
                >
                        <pre
                                style={{
                                        fontSize: 'clamp(0.5rem, 2vw, 1rem)',
                                        fontWeight: 'bold',
                                        color: '#dc3545',
                                        margin: '0 0 1rem 0',
                                        fontFamily: 'monospace',
                                        lineHeight: '1',
                                }}
                        >
                                {asciiArt}
                        </pre>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
                        <p style={{ fontSize: '1.1rem', color: '#666' }}>The page you are looking for does not exist.</p>
                        <img src={flamingoImage} alt="404 Error" style={{ maxWidth: '100%', width: '600px', marginTop: '2rem' }} />
                </div>
        );
}

export default NotFound;
