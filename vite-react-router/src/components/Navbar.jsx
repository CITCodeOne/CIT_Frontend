import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
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
        const [showSignIn, setShowSignIn] = useState(false);
        const { isSignedIn, username, profileInitial, syncAuthState, handleLogout, userId } = useAuthStatus();
        return (
                <div className="min-vh-100 d-flex flex-column">
                        <Navbar expand="lg" className="bg-body-tertiary">
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
                                                        <NavDropdown.Item as={Link} to="/user/:userId">User</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/user/:userId/bookmarks">Bookmarks</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/page/:pageId">Page</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/page/title/:titleId">Title</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/search">Search</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/userbanner">User Banner</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/about">About</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/test">Test Main Display</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/test-rating">Test Rating</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/test-bookmark">Test Bookmark</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/test-user-profile">Test User Profile</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/profile-image-base64">Profile Image (Base64)</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/list">List Component</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/compandprops">Comp & Props</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/customcarousel">Custom Carousel</NavDropdown.Item>
                                                        <NavDropdown.Item as={Link} to="/figlet/:text">Figlet</NavDropdown.Item>

                                                        <NavDropdown.Item as={Link} to="*">Not Found</NavDropdown.Item>

                                                </NavDropdown>
                                                <div className="d-flex justify-content-between flex-grow-1">
                                                        <Form className="d-flex flex-grow-1">
                                                                <Form.Control
                                                                        type="search"
                                                                        placeholder="Search"
                                                                        className="me-2"
                                                                        aria-label="Search"
                                                                />
                                                                <Button variant="outline-success Cbutton">Search</Button>
                                                        </Form>
                                                        <div className="d-flex align-items-center justify-content-end" style={{ minWidth: 120 }}>
                                                                {/* Profile*/}
                                                                {isSignedIn ? (
                                                                        <NavDropdown
                                                                                title={
                                                                                        <div className="d-flex align-items-center">
                                                                                                <span
                                                                                                        style={{
                                                                                                                display: 'inline-block',
                                                                                                                width: 40,
                                                                                                                height: 40,
                                                                                                                borderRadius: '50%',
                                                                                                                background: '#ccc',
                                                                                                                textAlign: 'center',
                                                                                                                lineHeight: '40px',
                                                                                                                fontWeight: 'bold',
                                                                                                                color: '#fff',
                                                                                                                fontSize: 20
                                                                                                        }}
                                                                                                >
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
                                                                                <NavDropdown.Item as={Link} to={`/userpage/${userId}`}>Profile</NavDropdown.Item>
                                                                                <NavDropdown.Divider />
                                                                                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                                                                        </NavDropdown>
                                                                ) : (
                                                                        <div className="d-flex align-items-center gap-2">
                                                                                <Button variant="primary" onClick={() => setShowSignIn(true)}>
                                                                                        Sign in
                                                                                </Button>
                                                                        </div>
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
                                <Outlet />
                        </Container>
                </div>
        );
}


