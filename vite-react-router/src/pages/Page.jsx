import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useParams } from 'react-router-dom';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import useAuthStatus from '../hooks/useAuthStatus';
import { getStoredToken } from '../components/utils/ExtractJwtData';
import { LoadingState } from '../components/PageStates';

function Page() {
        const pageId = useParams().pageId; // Get pageId from route params
        const { userId: authUserId, isSignedIn } = useAuthStatus();
        const navigate = useNavigate(); // initialize navigate function
        const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'

        // Fetch page data when component mounts or pageId changes
        useEffect(() => {
                let cancelled = false;
                async function fetchPageData() {
                        if (!pageId) return;
                        setStatus('loading');
                        try {
                                const data = await mdb.apiv2.page.getById(pageId);

                                if (cancelled) return;

                                // then navigate to title or individual based on if the page has a tconst or iconst
                                if (data && data.tconst) {
                                        setStatus('success');
                                        navigate(`/page/${pageId}/title/${data.tconst}`, { replace: true });
                                } else if (data && data.iconst) {
                                        setStatus('success');
                                        navigate(`/page/${pageId}/individual/${data.iconst}`, { replace: true });
                                } else {
                                        console.warn('Page data does not contain tconst or iconst');
                                        setStatus('error');
                                        // Navigate to a non-matching route so the global `*` NotFound route renders
                                        navigate('/404', { replace: true });
                                }

                                // If the user is signed in, record a visit for this page.
                                try {
                                        const token = getStoredToken();
                                        if (isSignedIn && authUserId) {
                                                mdb.apiv2.user.addVisit(authUserId, pageId, { authToken: token })
                                                        .catch((err) => {
                                                                console.debug('Failed to record visit:', err);
                                                        });
                                        }
                                } catch (err) {
                                        console.debug('Error while attempting to record visit:', err);
                                }
                        } catch (error) {
                                if (cancelled) return;
                                console.error('Error fetching page data:', error);
                                setStatus('error');
                                navigate('/404', { replace: true });
                        }
                }

                fetchPageData();

                return () => {
                        cancelled = true;
                };
        }, [pageId, isSignedIn, authUserId, navigate]);

        // While loading, show the PageStates loading indicator.
        if (status === 'loading') return <LoadingState message="Loading page..." />;

        // If an error occurred we redirected to NotFound; don't render the Outlet.
        if (status === 'error') return null;

        // On success (or already on a nested path), render the child route
        return <Outlet />;
}

export default Page;
