import React, { useState, useEffect } from 'react';
import MainDisplay from '../components/MainDisplay';
import makeCarousel from '../components/MakeCarousel';
import mdb from '../business-logic-layer/ApiClient/ApiClient';
import tmdb from '../business-logic-layer/TmdbIntegration';
import placeholderImage from '../pics/Image-not-found.png';
import { formatPlotPre } from '../components/utils/PlotPreFormatter';
import useAuthStatus from '../hooks/useAuthStatus';
import { getStoredToken } from '../components/utils/ExtractJwtData';
import { LoadingState } from '../components/PageStates';

function Home() {
  const [featuredTitle, setFeaturedTitle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [individuals, setIndividuals] = useState(null);
  const [tmdbPoster, setTmdbPoster] = useState(null);
  const [isFeaturedBookmarked, setIsFeaturedBookmarked] = useState(false);
  const [topRatedTitles, setTopRatedTitles] = useState(null);
  const [actionMovies, setActionMovies] = useState(null);
  const [classicMovies, setClassicMovies] = useState(null);
  const [topTvSeriesList, setTopTvSeriesList] = useState(null);
  const [familyPicks, setFamilyPicks] = useState(null);
  const [userBookmarks, setUserBookmarks] = useState(null);
  const [userRatings, setUserRatings] = useState(null);

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
          console.log('Home: fetched featuredTitle', title);
        // Try to fetch TMDB poster for featured title (mirror Title page behavior)
        try {
          if (title?.name && title?.mediaType) {
            const posterUrl = await tmdb.getTitlePoster(title.name, title.mediaType, title.startYear);
            if (posterUrl) setTmdbPoster(posterUrl);
            console.log('Home: tmdb poster for featured', posterUrl);
          }
        } catch (err) {
          console.error('Home: error fetching TMDB poster for featured', err);
        }
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
        // GET /api/v2/titles/top/movie?page=1&pageSize=25
        const list = await mdb.apiv2.titles.top('movie', { page: 1, pageSize: 25 });
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

  // Fetch Action movies (recent-ish, well-rated)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const params = {
          mediaType: 'movie',
          genre: 'Action',
          minRating: 6.5,
          minYear: 2015,
          page: 1,
          pageSize: 25,
        };

        const list = await mdb.apiv2.titles.search(params);
        if (cancelled) return;

        const filtered = list.filter((t) =>
          featuredTitle ? String(t.id) !== String(featuredTitle.id) : true
        );

        setActionMovies(filtered);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load action movies', err);
        setActionMovies([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [featuredTitle]);

  // Fetch classic movies (older, notable)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const params = {
          mediaType: 'movie',
          maxYear: 1999,
          minRating: 7.0,
          page: 1,
          pageSize: 25,
        };

        const list = await mdb.apiv2.titles.search(params);
        if (cancelled) return;

        setClassicMovies(list || []);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load classic movies', err);
        setClassicMovies([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch highly rated TV series
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const params = {
          mediaType: 'tvSeries',
          minRating: 8.0,
          page: 1,
          pageSize: 25,
        };

        const list = await mdb.apiv2.titles.search(params);
        if (cancelled) return;

        setTopTvSeriesList(list || []);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load top TV series', err);
        setTopTvSeriesList([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch family-friendly picks
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const params = {
          mediaType: 'movie',
          genre: 'Family',
          isAdult: false,
          minRating: 6.0,
          page: 1,
          pageSize: 25,
        };

        const list = await mdb.apiv2.titles.search(params);
        if (cancelled) return;

        setFamilyPicks(list || []);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load family picks', err);
        setFamilyPicks([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch signed-in user's bookmarks and ratings (if any)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!isSignedIn || !authUserId) {
          // Not signed in: set to empty arrays to avoid loading state
          setUserBookmarks([]);
          setUserRatings([]);
          return;
        }

        const token = getStoredToken();
        const authOptions = token ? { authToken: token } : undefined;

        // Bookmarks
        try {
          const bookmarks = await mdb.apiv2.user.getBookmarks(authUserId, { queryParams: { page: 1, pageSize: 25 }, ...(authOptions || {}) });

          let enriched = [];
          if (Array.isArray(bookmarks) && bookmarks.length > 0) {
            enriched = await Promise.all(
              bookmarks.map(async (b) => {
                try {
                  const pageRef = await mdb.apiv2.page.getById(b.pageId, authOptions);
                  const tconst = pageRef?.tconst ? String(pageRef.tconst).trim() : null;
                  const iconst = pageRef?.iconst ? String(pageRef.iconst).trim() : null;

                  if (tconst) {
                    const title = await mdb.apiv2.titles.getById(tconst, authOptions);
                    return {
                      pageId: b.pageId,
                      title: title?.name ?? title?.title ?? 'Unknown',
                      image: title?.image || placeholderImage,
                      plot: title?.plot ?? '',
                      mediaType: title?.mediaType ?? 'movie',
                    };
                  }

                  if (iconst) {
                    const individual = await mdb.apiv2.individuals.getById(iconst, authOptions);
                    return {
                      pageId: b.pageId,
                      title: individual?.name ?? 'Unknown',
                      image: individual?.image || placeholderImage,
                      plot: individual?.bio ?? '',
                      mediaType: 'individual',
                    };
                  }

                  return {
                    pageId: b.pageId,
                    title: pageRef?.name ?? pageRef?.title ?? 'Unknown',
                    image: pageRef?.image ?? placeholderImage,
                    plot: pageRef?.plot ?? '',
                    mediaType: pageRef?.mediaType ?? 'unknown',
                  };
                } catch (err) {
                  return {
                    pageId: b.pageId,
                    title: 'Unknown',
                    image: placeholderImage,
                    plot: '',
                    mediaType: 'unknown',
                  };
                }
              })
            );
          }

          if (!cancelled) setUserBookmarks(enriched);
        } catch (err) {
          if (!cancelled) setUserBookmarks([]);
          console.error('Failed to load user bookmarks', err);
        }

        // Ratings / reviews
        try {
          const ratings = await mdb.apiv2.user.getRatings(authUserId, { queryParams: { page: 1, pageSize: 25 }, ...(authOptions || {}) });

          let enrichedRatings = [];
          if (Array.isArray(ratings) && ratings.length > 0) {
            enrichedRatings = await Promise.all(
              ratings.map(async (r) => {
                try {
                  const title = await mdb.apiv2.titles.getById(r.titleId, authOptions);
                  return {
                    titleId: r.titleId,
                    pageId: title?.pageId ?? null,
                    title: title?.name ?? title?.title ?? 'Unknown',
                    image: title?.image ?? placeholderImage,
                    plot: title?.plot ?? '',
                    mediaType: title?.mediaType ?? 'movie',
                    rating: r.rating,
                    reviewText: r.reviewText ?? null,
                    time: r.time ?? null,
                  };
                } catch (err) {
                  return {
                    titleId: r.titleId,
                    pageId: null,
                    title: 'Unknown',
                    image: placeholderImage,
                    plot: '',
                    mediaType: 'unknown',
                    rating: r.rating,
                    reviewText: r.reviewText ?? null,
                    time: r.time ?? null,
                  };
                }
              })
            );
          }

          if (!cancelled) setUserRatings(enrichedRatings);
        } catch (err) {
          if (!cancelled) setUserRatings([]);
          console.error('Failed to load user ratings', err);
        }
      } catch (outerErr) {
        if (!cancelled) {
          setUserBookmarks([]);
          setUserRatings([]);
        }
        console.error('Failed to load user data for homepage', outerErr);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, authUserId]);

  // Fetch individuals list via ApiClient - popular individuals
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // GET /api/v2/individuals/popular?page=1&pageSize=25
        const list = await mdb.apiv2.individuals.popular({ page: 1, pageSize: 25 });
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
  if (loading) return <LoadingState />;
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
        image={tmdbPoster || featuredTitle?.image || placeholderImage}
        sections={sections}
      />

      {/* Intro / blurb under featured */}
      <div style={{ marginTop: 16, marginBottom: 8, color: '#495057' }}>
        <p style={{ margin: 0 }}>
          Discover more great movies and shows below - curated categories, trending
          picks, and your own bookmarks and reviews when signed in.
        </p>
      </div>
      <hr style={{ borderColor: '#e9ecef', marginTop: 12 }} />

      {/* Top rated titles */}
      {topRatedTitles && topRatedTitles.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 6px 0' }}>Top rated titles</h3>
          <p style={{ margin: '0 0 12px 0', color: '#6c757d' }}>Highly-rated movies picked by our community.</p>
          {makeCarousel(topRatedTitles, '<media type>')}
        </div>
      )}

      <hr style={{ borderColor: '#f1f3f5', marginTop: 24 }} />

      {/* Action movies */}
      {actionMovies && actionMovies.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 6px 0' }}>Recent action picks</h3>
          <p style={{ margin: '0 0 12px 0', color: '#6c757d' }}>Fast-paced adventures and blockbuster thrills.</p>
          {makeCarousel(actionMovies, '<media type>')}
        </div>
      )}

      <hr style={{ borderColor: '#f1f3f5', marginTop: 24 }} />

      {/* Top TV series */}
      {topTvSeriesList && topTvSeriesList.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 6px 0' }}>Highly rated TV series</h3>
          <p style={{ margin: '0 0 12px 0', color: '#6c757d' }}>Binge-worthy shows with top ratings.</p>
          {makeCarousel(topTvSeriesList, '<media type>')}
        </div>
      )}

      <hr style={{ borderColor: '#f1f3f5', marginTop: 24 }} />

      {/* Classic movies */}
      {classicMovies && classicMovies.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 6px 0' }}>Classic favourites</h3>
          <p style={{ margin: '0 0 12px 0', color: '#6c757d' }}>Timeless films from past decades.</p>
          {makeCarousel(classicMovies, '<media type>')}
        </div>
      )}

      <hr style={{ borderColor: '#f1f3f5', marginTop: 24 }} />

      {/* Family picks */}
      {familyPicks && familyPicks.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 6px 0' }}>Family-friendly picks</h3>
          <p style={{ margin: '0 0 12px 0', color: '#6c757d' }}>Feel-good movies for family viewing.</p>
          {makeCarousel(familyPicks, '<media type>')}
        </div>
      )}

      <hr style={{ borderColor: '#f1f3f5', marginTop: 24 }} />

      {/* User bookmarks (signed-in only) */}
      {isSignedIn && userBookmarks && userBookmarks.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 6px 0' }}>Your bookmarks</h3>
          <p style={{ margin: '0 0 12px 0', color: '#6c757d' }}>Quick access to pages you've saved.</p>
          {makeCarousel(userBookmarks, '<bookmark>')}
        </div>
      )}

      <hr style={{ borderColor: '#f1f3f5', marginTop: 24 }} />

      {/* User reviews/ratings (signed-in only) */}
      {isSignedIn && userRatings && userRatings.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 6px 0' }}>Your recent reviews</h3>
          <p style={{ margin: '0 0 12px 0', color: '#6c757d' }}>With great taste comes great reviews - here are your latest thoughts.</p>
          {makeCarousel(userRatings, '<your review>')}
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