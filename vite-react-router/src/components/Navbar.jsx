import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/Cstyle.css';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import SignInOffcanvas from './SignInOffcanvas';
import useAuthStatus from '../hooks/useAuthStatus';

export default function NavbarLayout() {
        // State to control SignInOffcanvas visibility
        const [showSignIn, setShowSignIn] = useState(false);
        // Custom hook to get authentication status and user info
        const { isSignedIn, username, profileInitial, syncAuthState, handleLogout, userId } = useAuthStatus();
        // For navbar search input
        const [searchQ, setSearchQ] = useState('');
        // For navigation on search
        const navigate = useNavigate();
        // Submit search handler for search form submission
        const onSearchSubmit = (e) => {
                e?.preventDefault(); // Stop the browser from reloading the page
                const q = (searchQ || '').trim(); // Trim whitespace from search query to avoid empty searches
                if (!q) return; // Do nothing if search query is empty
                navigate(`/search?q=${encodeURIComponent(q)}`);
        };

        return (
                <div className="min-vh-100 d-flex flex-column">
                        <Navbar expand="lg" className="bg-body-tertiary CNavbar-shadow">
                                <Container fluid className='NavbarCstyle'>
                                        <Navbar.Brand as={Link} to="/" className='Clogo'>CIT-MDB</Navbar.Brand>
                                        <Navbar.Toggle aria-controls="navbarScroll" />
                                        <Navbar.Collapse id="navbarScroll">
                                                <Nav
                                                        className="me-auto my-2 my-lg-0"
                                                        style={{ maxHeight: '100px' }}
                                                        navbarScroll
                                                >
                                                </Nav>
                                                <NavDropdown title=" ⋮⋮⋮ " id="navbarScrollingDropdown" className="no-caret Cmakescrollable">
                                                        <NavDropdown.Item as={Link} to="/">Home</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/search">Search</NavDropdown.Item>
                                                        <NavDropdown.Divider />
                                                        <NavDropdown.Item as={Link} to="/about">About</NavDropdown.Item>
                                                </NavDropdown>
                                                <div className="d-flex justify-content-between flex-grow-1">
                                                        {/* Search form */}
                                                        <Form className="d-flex flex-grow-1" onSubmit={onSearchSubmit}>
                                                                <Form.Control
                                                                        placeholder="Search"
                                                                        className="me-2"
                                                                        value={searchQ}
                                                                        onChange={(e) => setSearchQ(e.target.value)} // Update state on input change
                                                                />
                                                                <Button variant="outline-success Cbutton" type="submit">Search</Button>
                                                        </Form>
                                                        <div className="d-flex align-items-center justify-content-end" style={{ minWidth: 120 }}>
                                                                {/* Profile*/}
                                                                {isSignedIn ? (
                                                                        <NavDropdown
                                                                                title={
                                                                                        <div className="d-flex align-items-center">
                                                                                                <span className="profile-avatar">
                                                                                                        {profileInitial}
                                                                                                </span>
                                                                                                {username && (
                                                                                                        <span className="ms-2 fw-semibold text-dark">
                                                                                                                {username}
                                                                                                        </span>
                                                                                                )}
                                                                                        </div>
                                                                                }
                                                                                id="profile-dropdown"
                                                                                align="end"
                                                                        >
                                                                                <NavDropdown.Item as={Link} to={`/user/${userId}`}>Profile</NavDropdown.Item>
                                                                                <NavDropdown.Divider />
                                                                                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                                                                        </NavDropdown>
                                                                ) : (
                                                                        <Button variant="primary" onClick={() => setShowSignIn(true)}>
                                                                                Sign in
                                                                        </Button>
                                                                )}
                                                        </div>
                                                </div>
                                        </Navbar.Collapse>
                                </Container>
                        </Navbar>
                        <SignInOffcanvas
                                show={showSignIn}
                                onClose={() => setShowSignIn(false)}
                                onSignIn={() => {
                                        setShowSignIn(false);
                                        syncAuthState();
                                }}
                        />
                        <Container
                                fluid
                                className="flex-grow-1 py-3 ContainerCstyle overflow-auto"
                        >
                                <div style={{ backgroundColor: '#f8f9fa', paddingBottom: '2rem', borderRadius: '8px' }}>
                                        <Outlet />
                                </div>
                        </Container>
                </div>
        );
}


