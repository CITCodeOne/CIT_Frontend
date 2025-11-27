import React from 'react';
import { Link } from 'react-router-dom';
function Navbar() {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/">Hjem</Link>
        </li>
        <li>
          <Link to="/about">Om</Link>
        </li>
        <li>
          <Link to="/CompAndProps">Components And Props</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;