import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import MainDisplay from '../components/MainDisplay';
import makeCarousel from '../components/MakeCarousel';
import useAuthStatus from '../hooks/useAuthStatus';
import { getStoredToken } from '../components/ExtractJwtData';

export default function Title() {
    const { titleId, pageId } = useParams();
    const [data, setData] = useState(null);
    const [titlecast, setTitleCast] = useState([]);
    const [similartitles, setSimilarTitles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const { isSignedIn, userId } = useAuthStatus();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const pageData = await mdb.apiv2.page.getById(pageId);
                if (cancelled) return;

                const title = await mdb.apiv2.titles.getById(pageData.tconst.trim());
                if (cancelled) return;

                setData({ ...title, pageId: pageData.pageId });

                const pageIdNum = Number(pageData.pageId);
                if (isSignedIn && userId && !isNaN(pageIdNum)) {
                    try {
                        await mdb.apiv2.user.getBookmark(userId, pageIdNum);
                        setIsBookmarked(true);
                    } catch {
                        setIsBookmarked(false);
                    }
                }

                const inds = await mdb.apiv2.titles.getIndividuals(pageData.tconst.trim());
                const sim = await mdb.apiv2.titles.getSimilar(pageData.tconst.trim());
                if (cancelled) return;
                setTitleCast(inds || []);
                setSimilarTitles(sim || []);
            } catch (e) {
                if (!cancelled) setData(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [titleId, pageId, isSignedIn, userId]);

    const handleBookmarkToggle = async (newState) => {
        if (!isSignedIn || !userId) return;

        const pageIdNum = Number(pageId ?? data?.pageId);
        if (isNaN(pageIdNum)) {
            console.error('Invalid pageId:', pageId, data?.pageId);
            return;
        }

        const token = getStoredToken();
        const options = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        try {
            if (newState) {
                await mdb.apiv2.user.addBookmark(userId, pageIdNum, options);
            } else {
                await mdb.apiv2.user.removeBookmark(userId, pageIdNum, options);
            }
            setIsBookmarked(newState);
        } catch (err) {
            console.error('Bookmark toggle failed:', err);
        }
    };

    if (loading) return <div>Loading…</div>;
    if (!data) return <div>Not found</div>;

    const sections = [
        data.plot && { title: 'Plot', content: data.plot },
        data.genres && { title: 'Genres', content: data.genres.join(', ') },
        data.runtime && { title: 'Runtime', content: `${data.runtime} min` },
        data.releaseDate && { title: 'Release date', content: data.releaseDate },
    ].filter(Boolean);

    return (
        <div className="p-3">
            <MainDisplay
                item={data}
                sections={sections}
                disableLink={true}
                bookmark={
                    isSignedIn && data?.pageId && data.pageId !== 'n/a' && !isNaN(Number(data.pageId))
                        ? { isBookmarked, onToggle: handleBookmarkToggle }
                        : undefined
                }
            />
            {titlecast.length > 0 && (
                <>
                    <h3>Cast & crew</h3>
                    {makeCarousel(titlecast, 'actor')}
                </>
            )}
            {similartitles.length > 0 && (
                <>
                    <h3>Similar titles</h3>
                    {makeCarousel(similartitles, 'title')}
                </>
            )}
        </div>
    );
}