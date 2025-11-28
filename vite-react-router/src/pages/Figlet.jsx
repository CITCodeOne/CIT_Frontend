import React from 'react';
import { useParams } from 'react-router-dom';
import figlet from 'figlet';

// Importing fonts to ensure they are available
import standard from "figlet/fonts/Standard";
import roman from "figlet/fonts/Roman";
import slant from "figlet/fonts/Slant";
// Choose and load a font into standard. figlet will use standard by default
figlet.parseFont('Standard', standard);
figlet.parseFont('Roman', roman);
figlet.parseFont('Slant', slant);

function Figlet() {
        const { text } = useParams();

        return (
                <FigletBox text={text || 'Hello, World!'} />
        );
}

function FigletBox({ text }) {
        const [figletText, setFigletText] = React.useState('');

        React.useEffect(() => {
                figlet.text(
                        text,
                        {
                                font: 'Slant',
                                horizontalLayout: "default",
                                verticalLayout: "default",
                                width: 180,
                                whitespaceBreak: true,
                        },
                        (err, data) => {
                                if (err) {
                                        console.error('Figlet error:', err);
                                        setFigletText('Error generating figlet text.');
                                        return;
                                }
                                setFigletText(data);
                        });
        }, [text]);

        return (
                <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                        {figletText}
                </pre>
        );
}

export default Figlet;
