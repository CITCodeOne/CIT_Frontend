import React from 'react';
import lionImage from '../pics/lion.jpg';

function Home() {
  return (
    <div>
      <h1>Homepage!</h1>
      <p>Der her er vores mega seje hjemmeskærm med en sej løve</p>
      <img src={lionImage} alt="LIWON" />
    </div>
  );
}

export default Home;