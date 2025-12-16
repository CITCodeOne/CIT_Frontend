import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useParams } from 'react-router-dom';
import mdb from '../business-logic-layer/ApiClient/ApiClient';

function Page() {
        const pageId = useParams().pageId; // Get pageId from route params
        const navigate = useNavigate(); // initialize navigate function

        // Fetch page data when component mounts or pageId changes
        useEffect(() => {
                console.log(`Fetching data for page ID: ${pageId}`);
                // fetch page data using mdb ApiClient
                const fetchPageData = async () => {
                        try {
                                // fetch page data
                                const data = await mdb.apiv2.page.getById(pageId);
                                // then navigate to title or individual based on if the page has a tconst or iconst
                                if (data.tconst) {
                                        navigate(`/page/${pageId}/title/${data.tconst}`, { replace: true });
                                } else if (data.iconst) {
                                        navigate(`/page/${pageId}/individual/${data.iconst}`, { replace: true });
                                } else {
                                        console.warn('Page data does not contain tconst or iconst');
                                }
                        } catch (error) {
                                console.error('Error fetching page data:', error);
                        }
                };
                fetchPageData();
        }, [pageId]);

        return (
                <Outlet />
        );
}

export default Page;
