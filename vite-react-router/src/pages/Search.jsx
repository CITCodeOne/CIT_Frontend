// React hooks til state og side-effekter (fx datahentning)
import React, { useEffect, useState } from 'react';
// Router: laes URL-parametre og skift side
import { useLocation, useNavigate } from 'react-router-dom';
// Vores API-klient til backend
import mdb from '../business-logic-layer/ApiClient/ApiClient';
// Kort-komponent til at vise hvert resultat
import PreviewCards from '../components/PreviewCards';
// Standard loading-komponent
import { LoadingState } from '../components/PageStates';
// Lodret stak-layout fra Bootstrap
import Stack from 'react-bootstrap/Stack';
// Billede der vises ved ingen resultater
import NoSearch from '../pics/NoSearch.png';

export default function SearchTitle() {
  const navigate = useNavigate(); // bruges til at gaage til naeste/forrige side
  const location = useLocation(); // giver adgang til nuvaerende URL
  const params = new URLSearchParams(location.search); // parse query string

  const [page, setPage] = useState(parseInt(params.get('page')) || 1); // hvilken side vi er paa
  const [pageSize, setPageSize] = useState(parseInt(params.get('pagesize')) || 8); // hvor mange per side

  const [titleParams, setTitleParams] = useState({}); // soegefiltre for titler
  const [titles, setTitles] = useState([]); // resultater for titler
  const [loadingTitles, setLoadingTitles] = useState(false); // viser at vi henter titler
  const [loadedTitles, setLoadedTitles] = useState(false); // faerdig med at hente titler

  const [individualParams, setIndividualParams] = useState({}); // soegefiltre for personer
  const [individuals, setIndividuals] = useState([]); // resultater for personer
  const [loadingIndividuals, setLoadingIndividuals] = useState(false); // viser at vi henter personer
  const [loadedIndividuals, setLoadedIndividuals] = useState(false); // faerdig med at hente personer

  useEffect(() => {
    setPage(parseInt(params.get('page')) || 1); // laes side fra URL (standard 1)
    setPageSize(parseInt(params.get('pagesize')) || 20); // laes pagesize (standard 20)
    parseSearchParams(); // udtraek filtrene fra URL
  }, [location.search]);

  const parseSearchParams = () => {
    const titleParams = {}; // her samler vi titel-filtre
    const individualParams = {}; // her samler vi person-filtre

    for (const [key, value] of params.entries()) {
      const lowerKey = key.toLowerCase(); // goer noeglen lowercase for nemt match
      if (lowerKey.startsWith('title_')) {
        const paramKey = lowerKey.replace('title_', ''); // fjern praefiks "title_"
        titleParams[paramKey] = value; // gem titel-filter
      } else if (lowerKey.startsWith('individual_')) {
        const paramKey = lowerKey.replace('individual_', ''); // fjern praefiks "individual_"
        individualParams[paramKey] = value; // gem person-filter
      }
    }

    setTitleParams(titleParams); // opdater titel-filtre
    setIndividualParams(individualParams); // opdater person-filtre
    setLoadedTitles(false); // marker at vi skal hente igen
    setLoadedIndividuals(false); // marker at vi skal hente igen
    console.log('Parsed title params:', titleParams);
    console.log('Parsed individual params:', individualParams);
  }

  // Fetch titles based on search params
  useEffect(() => {
    if (Object.keys(titleParams).length === 0) {
      setTitles([]); // ingen filtre -> ingen titelsoegning
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingTitles(true); // vis loader for titler
      try {
        const payload = await mdb.apiv2.titles.search({
          ...titleParams, // saet titel-filtre
          page,           // tilfoej side
          pageSize        // og pagesize
        });
        console.log('Search titles payload:', payload);
        if (cancelled) return;
        setTitles(payload); // gem resultater
      } catch (err) {
        console.error('Search failed:', err);
        if (!cancelled) setTitles([]); // ved fejl, tom liste
      } finally {
        if (!cancelled) {
          setLoadingTitles(false); // stop loader
          setLoadedTitles(true);   // marker faerdig
        }
      }
    })();

    return () => { cancelled = true; };
  }, [titleParams]);

  // Fetch individuals based on search params
  useEffect(() => {
    if (Object.keys(individualParams).length === 0) {
      setIndividuals([]); // ingen filtre -> ingen personsogning
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingIndividuals(true); // vis loader for personer
      try {
        const payload = await mdb.apiv2.individuals.search({
          ...individualParams, // saet person-filtre
          page,           // tilfoej side
          pageSize        // og pagesize

        });
        console.log('Search individuals payload:', payload);
        if (cancelled) return;
        setIndividuals(payload); // gem resultater
      } catch (err) {
        console.error('Search failed:', err);
        if (!cancelled) setIndividuals([]); // ved fejl, tom liste
      } finally {
        if (!cancelled) {
          setLoadingIndividuals(false); // stop loader
          setLoadedIndividuals(true);   // marker faerdig
        }
      }
    })();

    return () => { cancelled = true; };
  }, [individualParams]);

  // If no search params, prompt user to use navbar
  if (params.toString().length === 0) {
    return <div className="p-3">Use the navbar to search.</div>; // ingen filtre i URL -> kort besked
  }

  return (
    <div className="p-3">
      <Stack gap={4}>
        {(loadingTitles || titles.length > 0) && (
          <>
            <h2>Search titles for “{titleParams.name}”</h2> {/* viser titel-soegning */}
            {loadingTitles ? (
              <LoadingState message="Loading Titles..." /> // loader mens titler hentes
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                {titles.map((t) => (
                  <div key={t.pageId ?? t.id ?? t.tconst} className="col">
                    <PreviewCards item={t} /> {/* kort for titel */}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {(loadingIndividuals || individuals.length > 0) && (
          <>
            <h2>Search individuals for “{individualParams.name}”</h2> {/* viser person-soegning */}
            {loadingIndividuals ? (
              <LoadingState message="Loading Individuals..." /> // loader mens personer hentes
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                {individuals.map((ind) => (
                  <div key={ind.pageId ?? ind.id ?? ind.nconst} className="col">
                    <PreviewCards item={ind} /> {/* kort for person */}
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
          <img src={NoSearch} alt="No search results" className="img-fluid mb-3" style={{ maxWidth: '300px' }} /> {/* tomt resultat-billede */}
        </div>
      )}

      {(titles.length > 0 || individuals.length > 0) && (
        <div className="mt-3 d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => {
              const newPage = Math.max(1, (parseInt(params.get('page')) || 1) - 1);
              params.set('page', newPage);
              navigate(`/search?${params.toString()}`); // ga til forrige side
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
              navigate(`/search?${params.toString()}`); // ga til naeste side
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
