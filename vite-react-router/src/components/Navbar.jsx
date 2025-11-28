import react from 'react';
import { Outlet } from 'react-router-dom';

function Navbar() {
        return (
                <div>
                        <nav>
                                <h2>Navbar Component</h2>
                        </nav>
                        <Outlet />
                </div>
        );
}

export default Navbar;
