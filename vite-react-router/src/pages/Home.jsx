import React, { useState, useEffect } from 'react';
import MainDisplay from '../components/MainDisplay';
import SignInOffcanvas from '../components/SignInOffcanvas';
import makeCarousel from '../components/MakeCarousel';
import mdb from '../business-logic-layer/ApiClient/ApiClient';

/* helper to format plot preview strings with "..." */
const formatPlotPre = (s) => {
  if (!s) return '';
  const trimmed = String(s).trim();
  if (/\u2026$|\.{3}$/.test(trimmed)) return trimmed;
  return trimmed + '...';
};

function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const [featuredTitle, setFeaturedTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [individuals, setIndividuals] = useState([]);
  const [isFeaturedBookmarked, setIsFeaturedBookmarked] = useState(false);
  const [topRatedTitles, setTopRatedTitles] = useState([]);

  // Toggle bookmark for featured title using ApiClient
  const handleToggleFeaturedBookmark = async () => {
    if (!featuredTitle) return;

    const userId = 55;
    const pageId = Number(featuredTitle.id);

    try {
      if (!isFeaturedBookmarked) {
        await mdb.apiv2.user.addBookmark(userId, pageId);
      } else {
        await mdb.apiv2.user.removeBookmark(userId, pageId);
      }
      setIsFeaturedBookmarked((prev) => !prev);
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    }
  };

  // Fetch featured title: GET /api/v2/titles/tt0052520 via ApiClient
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // This calls GET {{WebService_HostAddress}}/api/v2/titles/tt0052520
        const data = await mdb.apiv2.titles.getById('tt0052520');
        if (cancelled) return;
        setFeaturedTitle(data || null);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load latest titles', err);
        setFeaturedTitle(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Top rated section: use backend list
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // GET /api/v2/titles?page=1&pageSize=10
        const list = await mdb.apiv2.titles.list({ page: 1, pageSize: 10 });
        if (cancelled) return;

        const arr = Array.isArray(list) ? list : [];

        const top = arr
          // exclude the featured title if we have one
          .filter((t) =>
            featuredTitle ? String(t.id) !== String(featuredTitle.id) : true
          )
          .slice()
          // sort by rating (MapTitle already mapped "rating")
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

        setTopRatedTitles(top);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load top rated titles', err);
        setTopRatedTitles([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [featuredTitle]);

  // Fetch individuals list via ApiClient
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // GET /api/v2/individuals?page=1&pageSize=10
        const list = await mdb.apiv2.individuals.list({ page: 1, pageSize: 10 });
        if (cancelled) return;

        const sorted = (list || [])
          .slice()
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
          .slice(0, 10);

        setIndividuals(sorted);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load individuals', err);
        setIndividuals([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '1rem' }}>
        <p>Loading...</p>
        <SignInOffcanvas
          show={showAuth}
          onClose={() => setShowAuth(false)}
          onSignIn={() => setShowAuth(false)}
          onSignUp={() => setShowAuth(false)}
        />
      </div>
    );
  }

  if (!featuredTitle) {
    return (
      <div style={{ padding: '1rem' }}>
        <p>No titles found.</p>
        <SignInOffcanvas
          show={showAuth}
          onClose={() => setShowAuth(false)}
          onSignIn={() => setShowAuth(false)}
          onSignUp={() => setShowAuth(false)}
        />
      </div>
    );
  }

  const titleRating = featuredTitle.rating ?? 0;

  const header = {
    image: featuredTitle.image,
    title: featuredTitle.name,
    subtitle: [
      featuredTitle.mediaType,
      featuredTitle.releaseDate
        ? new Date(featuredTitle.releaseDate).toLocaleDateString('da-DK')
        : '',
    ]
      .filter(Boolean)
      .join(' · '),
    rating: titleRating,
    showBookmark: true,
    isBookmarked: isFeaturedBookmarked,
    onBookmarkToggle: handleToggleFeaturedBookmark,
  };

  const sections = featuredTitle.plot
    ? [{ content: formatPlotPre(featuredTitle.plot) }]
    : [];

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ margin: '0 0 12px 0' }}>Today&apos;s top pick</h2>

      <MainDisplay header={header} metadata={[]} sections={sections} />

      {/* Top rated titles */}
      {topRatedTitles.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Top rated titles</h3>
          {makeCarousel(topRatedTitles, 'title')}
        </div>
      )}

      {/* Individuals carousel */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Most popular celebrities</h3>
        {makeCarousel(individuals, '<Contribution Type>')}
      </div>

      <SignInOffcanvas
        show={showAuth}
        onClose={() => setShowAuth(false)}
        onSignIn={() => setShowAuth(false)}
        onSignUp={() => setShowAuth(false)}
      />
    </div>
  );
}

export default Home;