import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import mdb from '../business-logic-layer/ApiClient/ApiClient'; // to access images
import MainDisplay from '../components/MainDisplay'; // to display title info
import makeCarousel from '../components/MakeCarousel'; // to create carousels for displaying cast and similar titles
import useAuthStatus from '../hooks/useAuthStatus'; // to manage user authentication status
import { getStoredToken } from '../components/ExtractJwtData';
import BookmarkButton from '../components/BookmarkButton'; // to handle bookmarking functionality

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
                // Fetch page data first
                const pageData = await mdb.apiv2.page.getById(pageId);
                if (cancelled) return;
                console.log('Fetched page data:', pageData);

                // Fetch full title data using tconst
                const title = await mdb.apiv2.titles.getById(pageData.tconst.trim());
                if (cancelled) return;

                // Merge pageId into title data
                setData({ ...title, pageId: pageData.pageId });
                console.log('Fetched title data:', { ...title, pageId: pageData.pageId });

                // Use pageId from pageData for bookmark check
                const pageIdNum = Number(pageData.pageId);
                if (isSignedIn && userId && !isNaN(pageIdNum)) {
                    try {
                        await mdb.apiv2.user.getBookmark(userId, pageIdNum);
                        setIsBookmarked(true);
                    } catch {
                        setIsBookmarked(false);
                    }
                }

                // Use tconst for cast/similar
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
            {console.log('Bookmark condition check:', {
                isSignedIn,
                pageId: data?.pageId,
                notNa: data?.pageId !== 'n/a',
                isNumber: !isNaN(Number(data?.pageId)),
                overall: isSignedIn && data?.pageId && data.pageId !== 'n/a' && !isNaN(Number(data.pageId))
            })}

            <MainDisplay
                item={data}
                sections={sections}
                disableLink={true}
                bookmark={
                    isSignedIn && data?.pageId && data.pageId !== 'n/a' && !isNaN(Number(data.pageId))
                        ? { isBookmarked, onToggle: handleBookmarkToggle }
                        : undefined  // Hide button if pageId invalid
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