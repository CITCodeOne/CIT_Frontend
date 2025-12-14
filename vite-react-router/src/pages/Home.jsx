import React, { useState, useEffect } from 'react';
import { formatPlotPre } from '../components/utils/PlotPreFormatter';
import MainDisplay from '../components/MainDisplay';
import SignInOffcanvas from '../components/SignInOffcanvas';
import makeCarousel from '../components/MakeCarousel';
import lionImage from '../pics/lion.jpg';

/* Toggle this to true to use only dummy data for local testing */
const USE_DUMMY_ONLY = true;

/* Dummy top 5 titles by rating list */
const dummyTitlePreviews = [
  {
    id: '1',
    name: 'The Lion King',
    mediaType: 'Movie',
    avgRating: 9.0,
    releaseDate: '1994-06-24T00:00:00Z',
    poster: lionImage,
    plotPre: formatPlotPre('Lion prince cast out afar'),
  },
  {
    id: '2',
    name: 'Planet Earth',
    mediaType: 'Series',
    avgRating: 9.6,
    releaseDate: '2006-03-05T00:00:00Z',
    poster: lionImage,
    plotPre: formatPlotPre('Documentary series about p'),
  },
  {
    id: '3',
    name: 'Zootopia 2',
    mediaType: 'Movie',
    avgRating: 7.8,
    releaseDate: '2025-01-15T00:00:00Z',
    poster: lionImage,
    plotPre: formatPlotPre('Fox and bunny solve city.'),
  },
  {
    id: '4',
    name: 'IT Chapter 3',
    mediaType: 'Movie',
    avgRating: 5.4,
    releaseDate: '2024-01-15T00:00:00Z',
    poster: lionImage,
    plotPre: formatPlotPre('Clown returns to terrorize town'),
  },
  {
    id: '5',
    name: 'The Conjuring: Last Rites',
    mediaType: 'Movie',
    avgRating: 5.4,
    releaseDate: '2024-08-01T00:00:00Z',
    poster: lionImage,
    plotPre: formatPlotPre('Paranormal investigators face new evil'),
  },
];

/* Dummy individuals for carousel filtered by highest nameRating testing */
const dummyIndividuals = [
  {
    id: 'nm0001',
    name: 'Teri DiRocco',
    nameRating: 9.2,
  },
  {
    id: 'nm0002',
    name: 'Sam Actor',
    nameRating: 8.7,
  },
  {
    id: 'nm0003',
    name: 'Alex Star',
    nameRating: 8.3,
  },
  {
    id: 'nm0004',
    name: 'Jamie Lead',
    nameRating: 7.9,
  },
];

// Setup
function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const [featuredTitle, setFeaturedTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [individuals, setIndividuals] = useState([]);
  const [isFeaturedBookmarked, setIsFeaturedBookmarked] = useState(false);
  const [topRatedTitles, setTopRatedTitles] = useState([]);

  // Toggle bookmark for featured title
  const handleToggleFeaturedBookmark = async () => {
    // In DEV mode, just toggle local state (no backend call)
    if (USE_DUMMY_ONLY) {
      setIsFeaturedBookmarked((prev) => !prev);
      return;
    }

    if (!featuredTitle) return;

    try {
      // When not bookmarked, call POST /api/v2/users/55/bookmarks with pageId
      if (!isFeaturedBookmarked) {
        const res = await fetch('/api/v2/users/55/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pageId: Number(featuredTitle.id),
          }),
        });
        if (!res.ok) throw new Error('Failed to add bookmark');
      } else {
        // Delete bookmark call
      }

      setIsFeaturedBookmarked((prev) => !prev);
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    }
  };

  // Fetch featured title
  useEffect(() => {
    // DEV mode: use dummy data only
    if (USE_DUMMY_ONLY) {
      const latest = dummyTitlePreviews.reduce((a, b) =>
        new Date(a.releaseDate) > new Date(b.releaseDate) ? a : b
      );
      setFeaturedTitle(latest);
      setLoading(false);
      return;
    }

    // PROD mode: fetch from backend
    const endpoint = '/api/v2/titles?sort=releaseDate_desc&limit=10';
    const controller = new AbortController();
    let ignore = false;

    async function fetchLatest() {
      try {
        const res = await fetch(endpoint, { signal: controller.signal });
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        const item = Array.isArray(data) ? data[0] : data;
        if (ignore) return;
        setFeaturedTitle(item || null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to load latest titles', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchLatest();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  // Fetch top rated titles (exclude featured)
  useEffect(() => {
    if (!featuredTitle) {
      setTopRatedTitles([]);
      return;
    }

    // DEV mode: derive from dummyTitlePreviews
    if (USE_DUMMY_ONLY) {
      const top = dummyTitlePreviews
        .filter((t) => t.id !== featuredTitle.id) // exclude featured
        .slice()
        .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
      setTopRatedTitles(top);
      return;
    }

    // PROD mode: fetch from backend
    const endpoint = '/api/v2/titles?sort=avgRating_desc&limit=15';
    const controller = new AbortController();
    let ignore = false;

    async function fetchTopRated() {
      try {
        const res = await fetch(endpoint, { signal: controller.signal });
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        if (ignore) return;
        const list = Array.isArray(data) ? data : [];
        const filtered = list.filter(
          (t) => String(t.id) !== String(featuredTitle.id)
        );
        setTopRatedTitles(filtered);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to load top rated titles', err);
        if (!ignore) setTopRatedTitles([]);
      }
    }

    fetchTopRated();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [featuredTitle]);

  // Fetch individuals for carousel
  useEffect(() => {
    // DEV mode: use dummy individuals only
    if (USE_DUMMY_ONLY) {
      const mapped = dummyIndividuals
        .slice()
        .sort((a, b) => (b.nameRating ?? 0) - (a.nameRating ?? 0))
        .map((p) => ({
          id: p.id,
          name: p.name,
          nameRating: p.nameRating,
        }));
      setIndividuals(mapped);
      return;
    }

    // PROD mode: backend only
    const endpoint = '/api/v2/individuals?limit=10';
    const controller = new AbortController();
    let ignore = false;

    // Fetch individuals
    async function fetchIndividuals() {
      try {
        const res = await fetch(endpoint, { signal: controller.signal });
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        if (ignore) return;
        const list = Array.isArray(data) ? data : [];
        // sort by nameRating, highest first, take top 10
        const sorted = list
          .slice()
          .sort((a, b) => (b.nameRating ?? 0) - (a.nameRating ?? 0))
          .slice(0, 10)
          .map((p) => ({
            id: p.id,
            name: p.name,
            nameRating: p.nameRating,
          }));
        setIndividuals(sorted);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to load individuals', err);
        if (!ignore) setIndividuals([]);
      }
    }

    fetchIndividuals();
    return () => {
      ignore = true;
      controller.abort();
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

  const avgOn10 = featuredTitle.avgRating ?? 0;

  // Header setup for MainDisplay (featured title)
  const header = {
    image: featuredTitle.poster || lionImage,
    title: featuredTitle.name,
    subtitle: `${featuredTitle.mediaType} · ${new Date(
      featuredTitle.releaseDate
    ).toLocaleDateString('da-DK')}`,
    rating: avgOn10,
    showBookmark: true,
    isBookmarked: isFeaturedBookmarked,
    onBookmarkToggle: handleToggleFeaturedBookmark,
  };

  const sections = featuredTitle.plotPre
    ? [{ content: formatPlotPre(featuredTitle.plotPre) }]
    : [];

  return (
    <div style={{ padding: '1rem' }}>
      {/* Render featured movie card */}
      <h2 style={{ margin: '0 0 12px 0' }}>Featured today</h2>

      <MainDisplay header={header} metadata={[]} sections={sections} />

      {/* Render top rated movies carousel */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Top rated movies</h3>
        {makeCarousel(topRatedTitles, 'movie')}
      </div>

      {/* Render individuals carousel */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Most popular celebrities</h3>
        {makeCarousel(individuals, 'Contribution type?')}
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