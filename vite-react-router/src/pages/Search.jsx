import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import PreviewCards from '../components/PreviewCards';

export default function SearchTitle() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const qParam = params.get('q') || params.get('search') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    // reset to first page when query changes
    setPage(1);
  }, [qParam]);

  useEffect(() => {
    if (!qParam) {
      setResults([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const payload = await mdb.apiv2.titles.list(
          { page, pageSize },
          { queryParams: { name: qParam, page, pageSize } }
        );
        if (cancelled) return;
        setResults(Array.isArray(payload) ? payload : (payload ? [payload] : []));
      } catch (err) {
        console.error('Search failed:', err);
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [qParam, page, pageSize]);

  if (!qParam) {
    return <div className="p-3">Use the navbar search to find titles.</div>;
  }

  return (
    <div className="p-3">
      <h2>Search titles for “{qParam}”</h2>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <>
          {results.length === 0 ? (
            <div>No results</div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
              {results.map((r) => (
                <div key={r.pageId ?? r.id ?? r.tconst} className="col">
                  <PreviewCards item={r} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span>Page {page}</span>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setPage(p => p + 1)}
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