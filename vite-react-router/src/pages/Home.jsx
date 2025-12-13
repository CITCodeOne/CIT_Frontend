import React, { useState, useEffect } from 'react';
import MainDisplay from '../components/MainDisplay';
import SignInOffcanvas from '../components/SignInOffcanvas';
import lionImage from '../pics/lion.jpg';

// Toggle this to true to use only dummy data
const USE_DUMMY_ONLY = true;

/*
  Dummy data - this page expects backend to provide an endpoint consisting of a 
  list of newest released titles + the TitlePreviewDTO properties.
*/
const dummyTitlePreviews = [
  {
    id: '1',
    name: 'The Lion King',
    mediaType: 'Movie',
    avgRating: 9.0,
    releaseDate: '1994-06-24T00:00:00Z',
    poster: lionImage,
    plotPre: 'Lion prince cast out afar',
  },
  {
    id: '2',
    name: 'Planet Earth',
    mediaType: 'Series',
    avgRating: 9.6,
    releaseDate: '2006-03-05T00:00:00Z',
    poster: lionImage,
    plotPre: 'Documentary series about p',
  },
  {
    id: '3',
    name: 'Zootopia 2',
    mediaType: 'Movie',
    avgRating: 7.8,
    releaseDate: '2025-01-15T00:00:00Z',
    poster: lionImage,
    plotPre: 'Fox and bunny solve city,',
  },
];

// helper to format plot preview strings with "..."
const formatPlotPre = (s) => {
  if (!s) return '';
  if (/\u2026$|\.{3}$/.test(s.trim())) return s.trim();
  return s.trim() + '...';
};

function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const [featuredTitle, setFeaturedTitle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // DEV mode: use dummy data only
    if (USE_DUMMY_ONLY) {
      const latest = dummyTitlePreviews.reduce((a, b) =>
        new Date(a.releaseDate) > new Date(b.releaseDate) ? a : b
      );
      if (mounted) {
        setFeaturedTitle(latest);
        setLoading(false);
      }
      return () => {
        mounted = false;
      };
    }

    // PROD mode: backend only, no dummy fallback
    const endpoint = '/api/v2/titles?sort=releaseDate_desc&limit=20';

    async function fetchLatest() {
      try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        const item = Array.isArray(data) ? data[0] : data;
        if (mounted) setFeaturedTitle(item || null);
      } catch (err) {
        console.error('Failed to load latest titles', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchLatest();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
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

  if (!featuredTitle)
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

  // Normalize avgRating to 0–10 (if <=5 assume 0–5 input)
  const rawAvg = featuredTitle.avgRating ?? 0;
  const avgOn10 = rawAvg <= 5 ? rawAvg * 2 : rawAvg;

  const header = {
    image: featuredTitle.poster || lionImage,
    title: featuredTitle.name,
    subtitle: `${featuredTitle.mediaType} · ${new Date(
      featuredTitle.releaseDate
    ).toLocaleDateString('da-DK')}`,
    rating: avgOn10,
    showBookmark: false,
  };

  // Pass plot preview into MainDisplay
  const sections = featuredTitle.plotPre
    ? [
        {
          content: formatPlotPre(featuredTitle.plotPre),
        },
      ]
    : [];

  return (
    <div style={{ padding: '1rem' }}>
      <MainDisplay header={header} metadata={[]} sections={sections} />
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