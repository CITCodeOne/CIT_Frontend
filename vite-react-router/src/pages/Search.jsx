import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import PreviewCards from '../components/PreviewCards';
import Stack from 'react-bootstrap/Stack';

export default function SearchTitle() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [page, setPage] = useState(parseInt(params.get('page')) || 1);
  const [pageSize, setPageSize] = useState(parseInt(params.get('pagesize')) || 8);

  const [titleParams, setTitleParams] = useState({});
  const [titles, setTitles] = useState([]);
  const [loadingTitles, setLoadingTitles] = useState(false);

  const [individualParams, setIndividualParams] = useState({});
  const [individuals, setIndividuals] = useState([]);
  const [loadingIndividuals, setLoadingIndividuals] = useState(false);

  useEffect(() => {
    setPage(parseInt(params.get('page')) || 1);
    setPageSize(parseInt(params.get('pagesize')) || 20);
    parseSearchParams();
  }, [location.search]);

  const parseSearchParams = () => {
    const titleParams = {};
    const individualParams = {};

    for (const [key, value] of params.entries()) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.startsWith('title_')) {
        const paramKey = lowerKey.replace('title_', '');
        titleParams[paramKey] = value;
      } else if (lowerKey.startsWith('individual_')) {
        const paramKey = lowerKey.replace('individual_', '');
        individualParams[paramKey] = value;
      }
    }

    setTitleParams(titleParams);
    setIndividualParams(individualParams);
    console.log('Parsed title params:', titleParams);
    console.log('Parsed individual params:', individualParams);
  }

  // Fetch titles based on search params
  useEffect(() => {
    if (Object.keys(titleParams).length === 0) {
      setTitles([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingTitles(true);
      try {
        const payload = await mdb.apiv2.titles.search({
          ...titleParams, // spread title search params
          page,           // add page
          pageSize        // and pageSize
        });
        console.log('Search titles payload:', payload);
        if (cancelled) return;
        setTitles(Array.isArray(payload) ? payload : (payload ? [payload] : []));
      } catch (err) {
        console.error('Search failed:', err);
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoadingTitles(false);
      }
    })();

    return () => { cancelled = true; };
  }, [titleParams]);

  // Fetch individuals based on search params
  useEffect(() => {
    if (Object.keys(individualParams).length === 0) {
      setIndividuals([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingIndividuals(true);
      try {
        const payload = await mdb.apiv2.individuals.search({
          ...individualParams, // spread individual search params
          page,           // add page
          pageSize        // and pageSize

        });
        console.log('Search individuals payload:', payload);
        if (cancelled) return;
        setIndividuals(Array.isArray(payload) ? payload : (payload ? [payload] : []));
      } catch (err) {
        console.error('Search failed:', err);
        if (!cancelled) setIndividuals([]);
      } finally {
        if (!cancelled) setLoadingIndividuals(false);
      }
    })();

    return () => { cancelled = true; };
  }, [individualParams]);

  // If no search params, prompt user to use navbar
  if (params.toString().length === 0) {
    return <div className="p-3">Use the navbar to search.</div>;
  }

  return (
    <div className="p-3">
      <Stack gap={4}>
        <h2>Search titles for “{titleParams.name}”</h2>

        {loadingTitles ? (
          <div>Loading Titles...</div>
        ) : (
          <>
            {titles.length === 0 ? (
              <div>No results</div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                {titles.map((t) => (
                  <div key={t.pageId ?? t.id ?? t.tconst} className="col">
                    <PreviewCards item={t} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <h2>Search individuals for “{individualParams.name}”</h2>

        {loadingIndividuals ? (
          <div>Loading Individuals...</div>
        ) : (
          <>
            {individuals.length === 0 ? (
              <div>No results</div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                {individuals.map((ind) => (
                  <div key={ind.pageId ?? ind.id ?? ind.nconst} className="col">
                    <PreviewCards item={ind} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Stack>

      <div className="mt-3 d-flex align-items-center gap-2">
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => {
            const newPage = Math.max(1, (parseInt(params.get('page')) || 1) - 1);
            params.set('page', newPage);
            navigate(`/search?${params.toString()}`);
          }}
          disabled={page <= 1}
        >
          Prev
        </button>
        <span>Page {page}</span>
        <button
          className="btn btn-sm btn-secondary"
          onClick={() => {
            const newPage = (parseInt(params.get('page')) || 1) + 1;
            params.set('page', newPage);
            navigate(`/search?${params.toString()}`);
          }}
          disabled={titles.length < pageSize}
        >
          Next
        </button>
      </div>
    </div>
  );
}
