// Importer React og to hooks: useState gemmer vaerdier, useEffect koerer ekstra arbejde som at hente data
import React, { useState, useEffect } from 'react';
// Importer en komponent der viser det store fremhaevede element oeverst
import MainDisplay from '../components/MainDisplay';
// Importer en helper der laver en vandret liste (et "carousel")
import makeCarousel from '../components/MakeCarousel';
// Importer vores API-klient til at tale med backend om titler, brugere osv.
import mdb from '../business-logic-layer/ApiClient/ApiClient';
// Importer en helper der henter plakater fra TMDB (ekstern filmdatabse)
import tmdb from '../business-logic-layer/TmdbIntegration';
// Importer et reservebillede hvis vi mangler en plakat
import placeholderImage from '../pics/Image-not-found.png';
// Importer en lille formatter der rydder op i resume-teksten
import { formatPlotPre } from '../components/utils/PlotPreFormatter';
// Importer en hook der fortaeller om brugeren er logget ind og hvilket id de har
import useAuthStatus from '../hooks/useAuthStatus';
// Importer en helper der henter det gemte login-token fra storage
import { getStoredToken } from '../components/utils/ExtractJwtData';
// Importer en lille komponent der viser en spinner mens der hentes data
import { LoadingState } from '../components/PageStates';

function Home() {
  // Gemt fremhaevet film/serie vi viser oeverst
  const [featuredTitle, setFeaturedTitle] = useState(null);
  // Om siden stadig henter data; starter som true fordi intet er hentet endnu
  const [loading, setLoading] = useState(true);
  // Liste over kendte personer til et carousel
  const [individuals, setIndividuals] = useState(null);
  // Plakat-URL hentet fra TMDB (ekstern tjeneste)
  const [tmdbPoster, setTmdbPoster] = useState(null);
  // Om den fremhaevede titel er bogmaerket af den loggede bruger
  const [isFeaturedBookmarked, setIsFeaturedBookmarked] = useState(false);
  // Liste over hoejt-ratede titler til et carousel
  const [topRatedTitles, setTopRatedTitles] = useState(null);
  // Liste over actionfilm
  const [actionMovies, setActionMovies] = useState(null);
  // Liste over top TV-serier
  const [topTvSeriesList, setTopTvSeriesList] = useState(null);
  // Liste over familievenlige valg
  const [familyPicks, setFamilyPicks] = useState(null);
  // Den loggede brugers bogmaerker (hvis nogle)
  const [userBookmarks, setUserBookmarks] = useState(null);
  // Den loggede brugers ratings/anmeldelser (hvis nogle)
  const [userRatings, setUserRatings] = useState(null);

  // Hent bruger-id og loginstatus via auth-hook; kaldes authUserId for tydelighed
  const { userId: authUserId, isSignedIn } = useAuthStatus();

  // Toggl bogmaerke for den fremhaevede titel via API-klienten
  // REMOVED - efter en refaktorering

  // Hent fremhaevet titel via API-klienten
  useEffect(() => {
    // Setup: start hentning af den fremhaevede titel og evt. en TMDB-plakat
    // Vi bruger et lokalt `cancelled`-flag saa igangvaerende arbejde ikke
    // proever at opdatere state efter komponenten er fjernet
    let cancelled = false;

    // NOTE: Hvis vi ville afbryde selve netvaerkskaldet (ikke bare ignorere svaret),
    // kunne vi bruge en AbortController:
    // const controller = new AbortController();
    // giv `controller.signal` til fetch/API-klient der stoetter det
    // og kald `controller.abort()` i cleanup

    (async () => {
      try {
        // Hent den fremhaevede titel fra backend
        const title = await mdb.apiv2.titles.featured();
        // Hvis cleanup allerede er koert, stop her
        if (cancelled) return;

        // Gem den fremhaevede titel i state saa UI kan vise den
        setFeaturedTitle(title);
        console.log('Home: fetched featuredTitle', title);

        // Forsog at hente en bedre plakat fra TMDB.
        // Vi tjekker `cancelled` efter hvert await saa vi ikke opdaterer efter unmount.
        try {
          if (title?.name && title?.mediaType) {
            const posterUrl = await tmdb.getTitlePoster(title.name, title.mediaType, title.startYear);
            if (cancelled) return; // stop hvis cleanup er sket
            if (posterUrl) setTmdbPoster(posterUrl); // hvis vi har en plakat, brug den
            console.log('Home: tmdb poster for featured', posterUrl);
          }
        } catch (err) {
          // Plakat-fejl — log og fortsaet. Ingen state-aendring hvis cancelled.
          console.error('Home: error fetching TMDB poster for featured', err);
        }
      } catch (err) {
        // Hvis cleanup er sket, ignorer fejl fra det asynkrone forloeb.
        if (cancelled) return;
        console.error('Failed to load featured title', err);
        setFeaturedTitle(null); // nul betyder ingen fremhaevede titel
      } finally {
        // Opdater kun loading hvis cleanup ikke er sket
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      // Cleanup: saet cancelled saa igangvaerende async stopper foer state-aendring
      cancelled = true;
      // Hvis du bruger AbortController, kald `controller.abort()` her
    };
  }, []);

  // Hent top-rated titler via API-klienten
  useEffect(() => {
    // Lokalt flag der stopper arbejde hvis komponenten forsvinder foer svaret kommer
    let cancelled = false;

    (async () => {
      try {
        // Kald: GET /api/v2/titles/top/movie?page=1&pageSize=25
        const list = await mdb.apiv2.titles.top('movie', { page: 1, pageSize: 25 });
        // Hvis vi skulle stoppe (unmounted), saa afbryd stille
        if (cancelled) return;

        const top = list
          // udelad den fremhaevede titel hvis vi har en
          .filter((t) =>
            featuredTitle ? String(t.id) !== String(featuredTitle.id) : true
          )
          .slice();

        // Gem den rensede liste til karussellen
        setTopRatedTitles(top);
      } catch (err) {
        // Hvis cleanup er sket, ignorer arbejdet
        if (cancelled) return;
        console.error('Failed to load top rated titles', err);
        // Saet til tom saa UI ved der intet er
        setTopRatedTitles([]);
      }
    })();

    return () => {
      // Cleanup: fortael asynkrone kald at de skal stoppe med at opdatere state
      cancelled = true;
    };
  }, [featuredTitle]);

  // Hent actionfilm (nyere og fornuftigt rated)
  useEffect(() => {
    // Lokalt stop-flag til cleanup
    let cancelled = false;

    (async () => {
      try {
        // Byg filtre til at finde actionfilm
        const params = {
          mediaType: 'movie',
          genre: 'Action',
          minRating: 6.5,
          minYear: 2015,
          page: 1,
          pageSize: 25,
        };

        // Sporg backend om actionfilm der matcher
        const list = await mdb.apiv2.titles.search(params);
        // Stop hvis cleanup er koert
        if (cancelled) return;

        // Undgaa at vise den fremhaevede titel to gange
        const filtered = list.filter((t) =>
          featuredTitle ? String(t.id) !== String(featuredTitle.id) : true
        );

        // Gem listen til karussellen
        setActionMovies(filtered);
      } catch (err) {
        // Ignorer hvis cleanup er sket
        if (cancelled) return;
        console.error('Failed to load action movies', err);
        // Brug tom liste saa UI ikke haenger
        setActionMovies([]);
      }
    })();

    return () => {
      // Cleanup: signaler at async ikke maa opdatere state
      cancelled = true;
    };
  }, [featuredTitle]);

  // Hent TV-serier med hoej rating
  useEffect(() => {
    // Lokalt flag der forhindrer opdatering efter unmount
    let cancelled = false;

    (async () => {
      try {
        // Filtre for TV-serier med hoej rating
        const params = {
          mediaType: 'tvSeries',
          minRating: 8.0,
          page: 1,
          pageSize: 25,
        };

        // Hent listen over TV-serier
        const list = await mdb.apiv2.titles.search(params);
        // Stop hvis komponenten er unmounted
        if (cancelled) return;

        // Gem listen (eller tom) til karussellen
        setTopTvSeriesList(list || []);
      } catch (err) {
        // Stop hvis cleanup er sket
        if (cancelled) return;
        console.error('Failed to load top TV series', err);
        // Ved fejl, saet til tom for at undgaa null senere
        setTopTvSeriesList([]);
      }
    })();

    return () => {
      // Cleanup: saet stop-flag
      cancelled = true;
    };
  }, []);

  // Hent familievenlige valg
  useEffect(() => {
    // Stop-flag til cleanup
    let cancelled = false;

    (async () => {
      try {
        // Filtre for familievenlige film
        const params = {
          mediaType: 'movie',
          genre: 'Family',
          isAdult: false,
          minRating: 6.0,
          page: 1,
          pageSize: 25,
        };

        // Hent familie-film
        const list = await mdb.apiv2.titles.search(params);
        // Hvis unmounted, stop
        if (cancelled) return;

        // Gem listen til karussellen (eller tom hvis null)
        setFamilyPicks(list || []);
      } catch (err) {
        // Ignorer hvis cleanup er sket
        if (cancelled) return;
        console.error('Failed to load family picks', err);
        // Ved fejl, saet tom liste
        setFamilyPicks([]);
      }
    })();

    return () => {
      // Cleanup: saet stop-flag
      cancelled = true;
    };
  }, []);

  // Hent bogmaerker og ratings for logget bruger (hvis findes)
  useEffect(() => {
    // Lokalt stop-flag saa vi ikke opdaterer efter unmount
    let cancelled = false;

    (async () => {
      try {
        // Hvis ikke logget ind: brug tomme lister og stop tidligt
        if (!isSignedIn || !authUserId) {
          // Ikke logget ind: saet til tomme arrays saa vi ikke viser loading
          setUserBookmarks([]);
          setUserRatings([]);
          return;
        }

        // Hent gemt token saa vi kan lave autoriserede kald
        const token = getStoredToken();
        // Hvis der er token, saettes authOptions; ellers undefined
        const authOptions = token ? { authToken: token } : undefined;

        // Bookmarks
        try {
          // Hent brugerens bogmaerker (foerste side, 25 stk)
          const bookmarks = await mdb.apiv2.user.getBookmarks(authUserId, { queryParams: { page: 1, pageSize: 25 }, ...(authOptions || {}) });

          // Byg en liste med laesbare felter: titel, billede, tekst og type
          let enriched = [];
          if (bookmarks.length > 0) {
            enriched = await Promise.all(
              bookmarks.map(async (b) => {
                try {
                  // Hvert bogmaerke er en "page"; hent detaljer om siden
                  const pageRef = await mdb.apiv2.page.getById(b.pageId, authOptions);
                  // tconst = titel, iconst = person
                  const tconst = pageRef?.tconst ? String(pageRef.tconst).trim() : null;
                  const iconst = pageRef?.iconst ? String(pageRef.iconst).trim() : null;

                  if (tconst) {
                    // Hvis titel: hent titel-detaljer til visning
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
                    // Hvis person: hent person-detaljer til visning
                    const individual = await mdb.apiv2.individuals.getById(iconst, authOptions);
                    return {
                      pageId: b.pageId,
                      title: individual?.name ?? 'Unknown',
                      image: individual?.image || placeholderImage,
                      plot: individual?.bio ?? '',
                      mediaType: 'individual',
                    };
                  }

                  // Fallback hvis vi ikke kan se typen
                  return {
                    pageId: b.pageId,
                    title: pageRef?.name ?? pageRef?.title ?? 'Unknown',
                    image: pageRef?.image ?? placeholderImage,
                    plot: pageRef?.plot ?? '',
                    mediaType: pageRef?.mediaType ?? 'unknown',
                  };
                } catch (err) {
                  // Hvis berigelse fejler, brug en sikker placeholder
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

          // Gem den berigede liste hvis vi stadig er mounted
          if (!cancelled) setUserBookmarks(enriched);
        } catch (err) {
          // Ved fejl: nulstil bogmaerker og log (medmindre unmounted)
          if (!cancelled) setUserBookmarks([]);
          console.error('Failed to load user bookmarks', err);
        }

        // Ratings / reviews
        try {
          // Hent brugerens ratings (side 1, 25 stk)
          const ratings = await mdb.apiv2.user.getRatings(authUserId, { queryParams: { page: 1, pageSize: 25 }, ...(authOptions || {}) });

          // Byg ratings med laesbare felter
          let enrichedRatings = [];
          if (ratings.length > 0) {
            enrichedRatings = await Promise.all(
              ratings.map(async (r) => {
                try {
                  // Hent titeldetaljer for den ratede titel
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
                  // Hvis berigelse fejler, brug en sikker placeholder-rating
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

          // Gem ratings hvis vi stadig er mounted
          if (!cancelled) setUserRatings(enrichedRatings);
        } catch (err) {
          // Ved fejl: nulstil ratings hvis vi stadig er mounted
          if (!cancelled) setUserRatings([]);
          console.error('Failed to load user ratings', err);
        }
      } catch (outerErr) {
        // Fang uventede fejl i hele bogmaerke/rating-blokken
        if (!cancelled) {
          setUserBookmarks([]);
          setUserRatings([]);
        }
        console.error('Failed to load user data for homepage', outerErr);
      }
    })();

    return () => {
      // Cleanup: signaler stop for fremtidige state-opdateringer fra async
      cancelled = true;
    };
  }, [isSignedIn, authUserId]);

  // Hent liste over populaere personer via API-klienten
  useEffect(() => {
    // Stop-flag til cleanup
    let cancelled = false;

    (async () => {
      try {
        // Kald: GET /api/v2/individuals/popular?page=1&pageSize=25
        const list = await mdb.apiv2.individuals.popular({ page: 1, pageSize: 25 });
        // Stop hvis unmounted
        if (cancelled) return;

        // Gem listen (eller tom) til karussellen
        setIndividuals(list || []);
      } catch (err) {
        // Ignorer hvis cleanup er sket
        if (cancelled) return;
        console.error('Failed to load popular individuals', err);
        // Ved fejl, brug tom liste
        setIndividuals([]);
      }
    })();

    return () => {
      // Cleanup: saet stop-flag
      cancelled = true;
    };
  }, []);

  // Vis loading-tilstand
  // Hvis vi stadig henter hoveddata, vis en loading-komponent
  if (loading) return <LoadingState />;
// Hvis der ikke findes en fremhaevet titel
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
        // Giv data for den fremhaevede titel til MainDisplay
        item={featuredTitle}
        // Brug TMDB-plakat hvis vi har den, ellers titel-billede, ellers placeholder
        image={tmdbPoster || featuredTitle?.image || placeholderImage}
        // Send formateret resume-tekst (hvis den findes) til visning
        sections={sections}
      />

      {/* Kort intro under den fremhaevede sektion */}
      <div style={{ marginTop: 16, marginBottom: 8, color: '#495057' }}>
        <p style={{ margin: 0 }}>
          Discover more great movies and shows below - curated categories, trending
          picks, and your own bookmarks and reviews when signed in.
        </p>
      </div>
      <hr style={{ borderColor: '#e9ecef', marginTop: 12 }} />

      {/* Top-rated titler */}
      {topRatedTitles && topRatedTitles.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 6px 0' }}>Top rated titles</h3>
          <p style={{ margin: '0 0 12px 0', color: '#6c757d' }}>Highly-rated movies picked by our community.</p>
          {/* Lav en karussel med top-rated titler */}
          {makeCarousel(topRatedTitles, '<media type>')}
        </div>
      )}

      {/* Karussel med personer */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Most popular celebrities</h3>
        <p style={{ margin: '0 0 12px 0', color: '#6c757d' }}>Famous individuals making waves in the industry.</p>
        {/* Karussel for populaere personer */}
        {makeCarousel(individuals, '<Contribution Type>')}
      </div>

      <hr style={{ borderColor: '#f1f3f5', marginTop: 24 }} />

      {/* Actionfilm */}
      {actionMovies && actionMovies.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 6px 0' }}>Recent action picks</h3>
          <p style={{ margin: '0 0 12px 0', color: '#6c757d' }}>Fast-paced adventures and blockbuster thrills.</p>
          {/* Karussel for actionfilm */}
          {makeCarousel(actionMovies, '<media type>')}
        </div>
      )}

      <hr style={{ borderColor: '#f1f3f5', marginTop: 24 }} />

      {/* Top TV-serier */}
      {topTvSeriesList && topTvSeriesList.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 6px 0' }}>Highly rated TV series</h3>
          <p style={{ margin: '0 0 12px 0', color: '#6c757d' }}>Binge-worthy shows with top ratings.</p>
          {/* Karussel for TV-serier */}
          {makeCarousel(topTvSeriesList, '<media type>')}
        </div>
      )}

      <hr style={{ borderColor: '#f1f3f5', marginTop: 24 }} />

      {/* Familievalg */}
      {familyPicks && familyPicks.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 6px 0' }}>Family-friendly picks</h3>
          <p style={{ margin: '0 0 12px 0', color: '#6c757d' }}>Feel-good movies for family viewing.</p>
          {/* Karussel for familie-film */}
          {makeCarousel(familyPicks, '<media type>')}
        </div>
      )}

      <hr style={{ borderColor: '#f1f3f5', marginTop: 24 }} />

      {/* Brugerens bogmaerker (kun hvis logget ind) */}
      {isSignedIn && userBookmarks && userBookmarks.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 6px 0' }}>Your bookmarks</h3>
          <p style={{ margin: '0 0 12px 0', color: '#6c757d' }}>Quick access to pages you've saved.</p>
          {/* Karussel med brugerens gemte sider */}
          {makeCarousel(userBookmarks, '<bookmark>')}
        </div>
      )}

      <hr style={{ borderColor: '#f1f3f5', marginTop: 24 }} />

      {/* Brugerens anmeldelser/ratings (kun logget ind) */}
      {isSignedIn && userRatings && userRatings.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 6px 0' }}>Your reviews</h3>
          <p style={{ margin: '0 0 12px 0', color: '#6c757d' }}>With great taste comes great reviews - here are your latest thoughts.</p>
          {/* Karussel med brugerens anmeldelser */}
          {makeCarousel(userRatings, '<your review>')}
        </div>
      )}
    </div>
  );
  
}

export default Home;