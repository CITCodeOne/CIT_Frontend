import React, { useState, useEffect } from 'react';
import MainDisplay from '../components/MainDisplay';
import makeCarousel from '../components/MakeCarousel';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import { formatPlotPre } from '../components/utils/PlotPreFormatter';
import useAuthStatus from '../hooks/useAuthStatus';
import { getStoredToken } from '../components/ExtractJwtData';

function Home() {
  const [featuredTitle, setFeaturedTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [individuals, setIndividuals] = useState([]);
  const [isFeaturedBookmarked, setIsFeaturedBookmarked] = useState(false);
  const [topRatedTitles, setTopRatedTitles] = useState([]);

  const { userId: authUserId, isSignedIn } = useAuthStatus();

  // Toggle bookmark for featured title using ApiClient
  const handleToggleFeaturedBookmark = async () => {
    if (!featuredTitle) return;

    const userId = authUserId ? Number(authUserId) : null;
    if (!userId || !isSignedIn) {
      alert('Please log in to bookmark');
      return;
    }

    const pageId = Number(featuredTitle.id);
    const token = getStoredToken();

    try {
      if (!isFeaturedBookmarked) {
        await mdb.apiv2.user.addBookmark(userId, pageId, { authToken: token });
      } else {
        await mdb.apiv2.user.removeBookmark(userId, pageId, { authToken: token });
      }
      setIsFeaturedBookmarked((prev) => !prev);
    } catch (err) {
      console.error('Failed to toggle bookmark', err);
    }
  };

  // Fetch featured title via ApiClient
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const title = await mdb.apiv2.titles.featured();
        if (cancelled) return;

        setFeaturedTitle(title);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load featured title', err);
        setFeaturedTitle(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch top rated titles via ApiClient
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // GET /api/v2/titles/top/movie?page=1&pageSize=10
        const list = await mdb.apiv2.titles.top('movie', { page: 1, pageSize: 10 });
        if (cancelled) return;

        const top = list
          // exclude the featured title if we have one
          .filter((t) =>
            featuredTitle ? String(t.id) !== String(featuredTitle.id) : true
          )
          .slice();

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

  // Fetch individuals list via ApiClient - popular individuals
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // GET /api/v2/individuals/popular?page=1&pageSize=10
        const list = await mdb.apiv2.individuals.popular({ page: 1, pageSize: 10 });
        if (cancelled) return;

        setIndividuals(list || []);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load popular individuals', err);
        setIndividuals([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div style={{ padding: '1rem' }}>
        <p>Loading...</p>
      </div>
    );
  }
// If no featured title found
  if (!featuredTitle) {
    return (
      <div style={{ padding: '1rem' }}>
        <p>No titles found.</p>
      </div>
    );
  }

  const sections = featuredTitle.plot
    ? [{ content: formatPlotPre(featuredTitle.plot) }]
    : [];

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ margin: '0 0 12px 0' }}>Today&apos;s top pick</h2>

      <MainDisplay
        item={featuredTitle}
        sections={sections}
        bookmark={{
          isBookmarked: isFeaturedBookmarked,
          onToggle: handleToggleFeaturedBookmark,
        }}
      />

      {/* Top rated titles */}
      {topRatedTitles.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Top rated titles</h3>
          {makeCarousel(topRatedTitles, '<media type>')}
        </div>
      )}

      {/* Individuals carousel */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Most popular celebrities</h3>
        {makeCarousel(individuals, '<Contribution Type>')}
      </div>
    </div>
  );
}

export default Home;