import React from 'react';
import figlet from 'figlet';
import standard from 'figlet/fonts/Standard';
import flamingoImage from '../pics/404notfound.png';

figlet.parseFont('Standard', standard);

function NotFound() {
        const [figletText, setFigletText] = React.useState('');
        const [figletFontSize, setFigletFontSize] = React.useState('1.5rem');

        React.useEffect(() => {
                figlet.text(
                        'ERROR 404',
                        {
                                font: 'Standard',
                                horizontalLayout: 'default',
                                verticalLayout: 'default',
                                width: 200,
                                whitespaceBreak: false,
                        },
                        (err, data) => {
                                if (err) {
                                        console.error('Figlet error:', err);
                                        setFigletText('ERROR 404');
                                        setFigletFontSize('min(1.5rem, calc(100vw / 10))');
                                        return;
                                }
                                const asciiText = data;
                                setFigletText(asciiText);
                                const longestLine = asciiText
                                        .split('\n')
                                        .reduce((max, line) => Math.max(max, line.length), 1);
                                setFigletFontSize(`min(1.5rem, calc(100vw / ${longestLine}))`);
                        },
                );
        }, []);

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
                                        fontFamily: 'monospace',
                                        whiteSpace: 'pre',
                                        lineHeight: 1,
                                        textAlign: 'center',
                                        color: 'red',
                                        margin: 0,
                                        overflow: 'hidden',
                                        fontSize: figletFontSize,
                                        maxWidth: '100vw',
                                }}
                        >
                                {figletText}
                        </pre>
                        <p>The page you are looking for does not exist.</p>
                        <img src={flamingoImage} alt="Flamingo" style={{ maxWidth: '1200px', marginTop: '1rem' }} />
                </div>
        );
}

export default NotFound;
