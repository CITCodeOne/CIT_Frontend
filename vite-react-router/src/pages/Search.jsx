import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import PreviewCards from '../components/PreviewCards';
import { LoadingState } from '../components/PageStates';
import Stack from 'react-bootstrap/Stack';
import NoSearch from '../pics/NoSearch.png';

export default function SearchTitle() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [page, setPage] = useState(parseInt(params.get('page')) || 1);
  const [pageSize, setPageSize] = useState(parseInt(params.get('pagesize')) || 8);

  const [titleParams, setTitleParams] = useState({});
  const [titles, setTitles] = useState([]);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [loadedTitles, setLoadedTitles] = useState(false);

  const [individualParams, setIndividualParams] = useState({});
  const [individuals, setIndividuals] = useState([]);
  const [loadingIndividuals, setLoadingIndividuals] = useState(false);
  const [loadedIndividuals, setLoadedIndividuals] = useState(false);

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
    setLoadedTitles(false);
    setLoadedIndividuals(false);
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
        setTitles(payload);
      } catch (err) {
        console.error('Search failed:', err);
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) {
          setLoadingTitles(false);
          setLoadedTitles(true);
        }
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
        setIndividuals(payload);
      } catch (err) {
        console.error('Search failed:', err);
        if (!cancelled) setIndividuals([]);
      } finally {
        if (!cancelled) {
          setLoadingIndividuals(false);
          setLoadedIndividuals(true);
        }
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
        {(loadingTitles || titles.length > 0) && (
          <>
            <h2>Search titles for “{titleParams.name}”</h2>
            {loadingTitles ? (
              <LoadingState message="Loading Titles..." />
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

        {(loadingIndividuals || individuals.length > 0) && (
          <>
            <h2>Search individuals for “{individualParams.name}”</h2>
            {loadingIndividuals ? (
              <LoadingState message="Loading Individuals..." />
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

      {(Object.keys(titleParams).length > 0 || Object.keys(individualParams).length > 0) && loadedTitles && loadedIndividuals && titles.length === 0 && individuals.length === 0 && (
        <div className="text-center mt-4">
          <h2 className="text-danger">Uh-oh! </h2>
          <h3>Film Flamingo searched everywhere, but couldn’t find what you were looking for.</h3>
          <img src={NoSearch} alt="No search results" className="img-fluid mb-3" style={{ maxWidth: '300px' }} />
        </div>
      )}

      {(titles.length > 0 || individuals.length > 0) && (
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
            disabled={titles.length < pageSize && individuals.length < pageSize}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
