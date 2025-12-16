import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import mdb from '../business-logic-layer/ApiClient/ApiClient';

function Page() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!pageId) {
      setError('Missing pageId');
      return;
    }

    mdb.apiv2.page.getById(pageId)
      .then((pageData) => {
        if (!mounted) return;
        if (!pageData) {
          setError('Empty response');
          return;
        }

        const tconst = pageData.tconst ? String(pageData.tconst).trim() : null;
        const iconst = pageData.iconst ? String(pageData.iconst).trim() : null;

        if (tconst) {
          navigate(`/title/${tconst}`, { replace: true });
        } else if (iconst) {
          navigate(`/individual/${iconst}`, { replace: true });
        } else {
          setError('Response contains neither tconst nor iconst');
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || String(err));
      });

    return () => { mounted = false; };
  }, [pageId, navigate]);

  if (error) return <div>Error: {error}</div>;
}

export default Page;
;
