import React from 'react';
import RandPic from '../components/RandPic';



function CompAndProps() {
  const randomPicNumb = Math.floor(Math.random() * 4) + 1;
  return (
    <div>
      <h1>Simple eksempel i koden på hvordan man parser en prop til en component</h1>
      <RandPic picNumb={randomPicNumb.toString()} /> {/* Pass the random number as a prop */}
    </div>
  );
}

export default CompAndProps;