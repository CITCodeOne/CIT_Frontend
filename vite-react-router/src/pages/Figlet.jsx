import React from 'react';
import { useParams } from 'react-router-dom';
import figlet from 'figlet';

// Importing fonts to ensure they are available
import standard from "figlet/fonts/Standard";
import roman from "figlet/fonts/Roman";
import slant from "figlet/fonts/Slant";
import smkeyboard from "figlet/fonts/Small Keyboard";
import banner3 from "figlet/fonts/Banner3";
// Choose and load a font into standard. figlet will use standard by default
figlet.parseFont('Standard', standard);
figlet.parseFont('Roman', roman);
figlet.parseFont('Slant', slant);
figlet.parseFont('Small Keyboard', smkeyboard);
figlet.parseFont('Banner3', banner3);

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
                                font: 'Banner3',
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
                <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1 }}>
                        {figletText}
                </pre>
        );
}

export default Figlet;
