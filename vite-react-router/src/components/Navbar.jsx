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

export default function NavbarLayout() {
        const [showSignIn, setShowSignIn] = useState(false);
        const [isSignedIn, setIsSignedIn] = useState(false);
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
                                                        <Nav.Link as={Link} to="/figlet/figgyyyyy">Home</Nav.Link>
                                                        {
                                                                /*Udkommenteret vise hvordan man definere links til en side samt tekst 
                                                                
                                                                <Nav.Link as={Link} to="/about">How to website</Nav.Link>
                                                                */
                                                        }

                                                        {/*Hvordan man laver en drop down menu i nav-baren 
              <NavDropdown title=" ⋮ " id="navbarScrollingDropdown" className="no-caret">
                <NavDropdown.Item as={Link} to="/CompAndProps">Random pictures</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/Carousel">
                  Carousel
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/">
                  Noget endnu sejere her?
                </NavDropdown.Item>
              </NavDropdown>
              */}

                                                        {/* Hvordan man disabler et link, aner ikke om vi kommer til at bruge det.
              <Nav.Link href="#" disabled>
                Link
              </Nav.Link>
              */}

                                                </Nav>
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
                                                                                                P
                                                                                        </span>
                                                                                }
                                                                                id="profile-dropdown"
                                                                                align="end"
                                                                        >
                                                                                <NavDropdown.Item as={Link} to="#profile">Profile</NavDropdown.Item>
                                                                                <NavDropdown.Item as={Link} to="#settings">Settings</NavDropdown.Item>
                                                                                <NavDropdown.Divider />
                                                                                <NavDropdown.Item onClick={() => setIsSignedIn(false)}>Logout</NavDropdown.Item>
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
                                        setIsSignedIn(true);
                                        setShowSignIn(false);
                                }}
                        />
                        <Container
                                fluid
                                className="flex-grow-1 overflow-auto py-3 ContainerCstyle"
                        >
                                <Outlet />
                        </Container>
                </div>
        );
}


