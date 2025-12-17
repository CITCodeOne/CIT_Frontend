import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import PreviewCards from '../components/PreviewCards';

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const qParam = params.get('q') || params.get('search') || '';
  const typeParam = params.get('type') || 'title'; // 'title' | 'individual'

  const [type, setType] = useState(typeParam);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

const searchParams = {
        titleSearchTerm: qParam	
    };

  useEffect(() => {
    setType(typeParam);
  }, [typeParam]);

  useEffect(() => {
    setPage(1);
  }, [qParam, typeParam]);

  useEffect(() => {
    if (!qParam) {
      setResults([]);
      return;
    }

    console.log('[Search] effect run', { qParam, type, page });

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let payload;

        if (type === 'individual' && mdb.apiv2.individuals?.search) {
          console.log('[Search] individual search request', { name: qParam });
          payload = await mdb.apiv2.individuals.search(qParam);
          console.log(
            '[Search] individual search response',
            Array.isArray(payload) ? payload.length : payload
          );
        } else {
          // TITLE SEARCH – use GET /titles?name={qParam}&page={page}&pageSize={pageSize}
          console.log('[Search] title list request', {
            name: qParam,
            page,
            pageSize,
          });

          payload = await mdb.apiv2.titles.list(searchParams);

          console.log(
            '[Search] title list response',
            Array.isArray(payload) ? payload.length : payload
          );
        }

        if (cancelled) return;
        const arr = Array.isArray(payload) ? payload : (payload ? [payload] : []);
        console.log('[Search] final mapped results length', arr.length);
        setResults(arr);
      } catch (err) {
        console.error('Search failed:', err);
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [qParam, type, page]);

  const onTypeChange = (newType) => {
    const qs = new URLSearchParams({
      q: qParam,
      type: newType,
    }).toString();
    console.log('[Search] type change', { from: type, to: newType, url: `/search?${qs}` });
    navigate(`/search?${qs}`);
  };

  if (!qParam) {
    return <div className="p-3">Use the navbar search to find titles or individuals.</div>;
  }

  const getPersonImage = (person) =>
    person.primaryImageUrl ||
    person.imageUrl ||
    person.profilePath ||
    '/src/pics/Image-not-found.png';

  return (
    <div className="p-3">
      <h2>Search results for “{qParam}”</h2>

      <div className="mb-3 d-flex gap-3 align-items-center">
        <div>
          <label className="me-3">
            <input
              type="radio"
              name="searchType"
              checked={type === 'title'}
              onChange={() => onTypeChange('title')}
            />{' '}
            Title
          </label>
          <label>
            <input
              type="radio"
              name="searchType"
              checked={type === 'individual'}
              onChange={() => onTypeChange('individual')}
            />{' '}
            Individual
          </label>
        </div>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <>
          {results.length === 0 ? (
            <div>No results</div>
          ) : type === 'title' ? (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
              {results.map((r) => (
                <div key={r.pageId ?? r.id ?? r.tconst} className="col">
                  <PreviewCards item={r} />
                </div>
              ))}
            </div>
          ) : (
            <div className="row justify-content-center">
              <div className="col-12 col-md-8 col-lg-6">
                <ul className="list-group">
                  {results.map((person) => (
                    <li
                      key={person.id ?? person.personId}
                      class early
                      className="list-group-item d-flex align-items-center"
                    >
                      <a
                        href={`/individual/${person.id ?? person.personId}`}
                        className="d-flex align-items-center text-decoration-none text-reset w-100"
                      >
                        <img
                          src={getPersonImage(person)}
                          alt={person.name ?? person.fullName ?? 'Person'}
                          className="rounded-circle me-3"
                          style={{ width: 56, height: 56, objectFit: 'cover' }}
                        />
                        <div>
                          <div className="fw-semibold">
                            {person.name ?? person.fullName ?? '(no name)'}
                          </div>
                          {person.knownForTitle && (
                            <div className="text-muted small">
                              {person.knownForTitle}
                            </div>
                          )}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-3 d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span>Page {page}</span>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setPage((p) => p + 1)}
              disabled={results.length < pageSize}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}