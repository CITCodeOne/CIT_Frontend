import MapToMovie from "../business-logic-layer/data-mappings/MapToMovie";
import { useEffect, useState } from 'react';

export default function FetchTest(testId) {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await fetch('https://localhost:5001/api/v2/titles/' + testId);
                if (!res.ok) {
                    throw new Error(`Server responded ${res.status}`);
                }
                
                const data = await res.json();
                setMovies(Array.isArray(data) ? data : data?.items || []);

            } catch (err) { }
        };
        fetchMovies();
    }, [])

    return items;
}