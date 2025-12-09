import React, { useEffect, useState } from 'react';
import lionImage from '../pics/lion.jpg';
import SignInOffcanvas from '../components/SignInOffcanvas';
//Test
function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('https://localhost:5001/api/titles?page=1&pageSize=20');
        if (!res.ok) {
          throw new Error(`Server responded ${res.status}`);
        }
        const data = await res.json();
        setMovies(Array.isArray(data) ? data : data?.items || []);
      } catch (err) {
        setError(err.message || 'Failed to load movies');
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const handleSignIn = (data) => {
    console.log('Sign in data', data);
    setShowAuth(false);
  };

  const handleSignUp = (data) => {
    console.log('Sign up data', data);
    setShowAuth(false);
  };

  return (
    <div>
      <h1>Homepage!</h1>
      <p>Der her er vores mega seje hjemmeskærm med en sej løve</p>
      <img src={lionImage} alt="LIWON" />
      <section style={{ marginTop: '2rem' }}>
        <h2>Film (debug fra API)</h2>
        {loading && <p>Henter film...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
            {JSON.stringify(movies, null, 2)}
          </pre>
        )}
      </section>
      <SignInOffcanvas
        show={showAuth}
        onClose={() => setShowAuth(false)}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
      />
    </div>
  );
}

export default Home;