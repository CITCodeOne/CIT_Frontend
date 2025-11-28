import React, { useState } from 'react';
import lionImage from '../pics/lion.jpg';
import Button from 'react-bootstrap/Button';
import SignInOffcanvas from '../components/SignInOffcanvas';

function Home() {
  const [showAuth, setShowAuth] = useState(false);

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
      <div style={{ marginTop: '1rem' }}>
        <Button variant="success" onClick={() => setShowAuth(true)}>Sign up</Button>
      </div>
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