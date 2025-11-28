import React from 'react';
import { useParams } from 'react-router-dom';
import figlet from 'figlet';

// Importing fonts to ensure they are available
import standard from "figlet/fonts/Standard";
import roman from "figlet/fonts/Roman";
// Choose and load a font into standard. figlet will use standard by default
figlet.parseFont("Standard", roman);

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
                                font: 'Standard',
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
                <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight:1}}>
                        {figletText}
                </pre>
        );
}

export default Figlet;
