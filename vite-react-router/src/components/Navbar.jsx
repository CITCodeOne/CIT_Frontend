import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/Cstyle.css';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Stack from 'react-bootstrap/Stack';
import Dropdown from 'react-bootstrap/Dropdown';
import SignInOffcanvas from './SignInOffcanvas';
import useAuthStatus from '../hooks/useAuthStatus';
import mdb from '../business-logic-layer/ApiClient/ApiClient.jsx';

export default function NavbarLayout() {
        const [showSignIn, setShowSignIn] = useState(false);
        const { isSignedIn, username, profileInitial, syncAuthState, handleLogout, userId } = useAuthStatus();
        const [searchTitlesResult, setSearchTitlesResult] = useState(null);
        const [searchIndividualsResult, setSearchIndividualsResult] = useState(null);
        const [showDropdown, setShowDropdown] = useState(false);

        const handleSearchChange = async (e) => {
                const query = e.target.value;
                if (query.length === 0) {
                        setSearchTitlesResult(null);
                        setSearchIndividualsResult(null);
                        setShowDropdown(false);
                        return; // Skip empty queries
                }
                // Implement search logic here, e.g., update state or make API calls
                console.log('Search query:', query);
                // Perform search for titles and individuals and once both are done, hide dropdown if no results
                const [titlesResults, individualsResults] = await Promise.all([searchTitles(query), searchIndividuals(query)]);
                setShowDropdown((titlesResults && titlesResults.length > 0) || (individualsResults && individualsResults.length > 0));
        };

        const searchTitles = async (query) => {
                const searchParams = {
                        name: query,	// Optional: search in title names
                        page: 1,                  	// Optional: page number
                        pageSize: 3              	// Optional: items per page
                };

                try {
                        const results = await mdb.apiv2.titles.search(searchParams);
                        console.log('Search results:', results);
                        setSearchTitlesResult(results);
                        setShowDropdown(results && results.length > 0);
                        return results;
                } catch (error) {
                        console.error('Search failed:', error);
                        return [];
                }
        };

        const searchIndividuals = async (query) => {
                const searchParams = {
                        name: query,	// Optional: search in title names
                        page: 1,                  	// Optional: page number
                        pageSize: 3              	// Optional: items per page
                };

                try {
                        const results = await mdb.apiv2.individuals.search(searchParams);
                        console.log('Search results:', results);
                        setSearchIndividualsResult(results);
                        setShowDropdown(results && results.length > 0);
                        return results;
                } catch (error) {
                        console.error('Search failed:', error);
                        return [];
                }
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
                                                        <Stack>
                                                                <Form.Control
                                                                        id="navbar-search"
                                                                        name="search"
                                                                        type="search"
                                                                        placeholder="Search"
                                                                        className="me-2"
                                                                        aria-label="Search"
                                                                        onChange={(e) => handleSearchChange(e)}
                                                                        onFocus={() => {
                                                                                if ((searchTitlesResult && searchTitlesResult.length > 0) || (searchIndividualsResult && searchIndividualsResult.length > 0)) setShowDropdown(true);
                                                                        }}
                                                                />
                                                                {/* Dropdown for search results
                                                                        The Menu is shown dependent on the showDropdown state
                                                                        the rootCloseEvent is set to mousedown to close the dropdown when clicking outside
                                                                        the onToggle updates the showDropdown state and is required for rootCloseEvent to work when controlling visibility manually
                                                                */}
                                                                <Dropdown
                                                                        show={showDropdown && ((searchTitlesResult && searchTitlesResult.length > 0) || (searchIndividualsResult && searchIndividualsResult.length > 0))} // NOTE: Control visibility via state
                                                                        onToggle={(next) => setShowDropdown(next)} // NOTE: Use show and onToggle to control visibility
                                                                        className="Csearch-dropdown"
                                                                >
                                                                        <Dropdown.Menu
                                                                                rootCloseEvent="mousedown" // NOTE: Use rootCloseEvent to close on outside click
                                                                                className="Csearch-dropdown-menu"
                                                                        >
                                                                                {searchTitlesResult && searchTitlesResult.length > 0 && (
                                                                                        <>
                                                                                                <Dropdown.Header>Titles</Dropdown.Header>
                                                                                                {searchTitlesResult.map((title) => (
                                                                                                        <Dropdown.Item
                                                                                                                as={Link}
                                                                                                                to={`/page/${title.pageId}/title/${title.id}`}
                                                                                                                key={title.id}
                                                                                                                onClick={() => setShowDropdown(false)}
                                                                                                        >
                                                                                                                {title.name} ({title.year})
                                                                                                        </Dropdown.Item>
                                                                                                ))}
                                                                                        </>
                                                                                )}
                                                                                {searchTitlesResult && searchTitlesResult.length > 0 && searchIndividualsResult && searchIndividualsResult.length > 0 && (
                                                                                        <Dropdown.Divider />
                                                                                )}
                                                                                {searchIndividualsResult && searchIndividualsResult.length > 0 && (
                                                                                        <>
                                                                                                <Dropdown.Header>Individuals</Dropdown.Header>
                                                                                                {searchIndividualsResult.map((individual) => (
                                                                                                        <Dropdown.Item
                                                                                                                as={Link}
                                                                                                                to={`/page/${individual.pageId}/individual/${individual.id}`}
                                                                                                                key={individual.id}
                                                                                                                onClick={() => setShowDropdown(false)}
                                                                                                        >
                                                                                                                {individual.name}
                                                                                                        </Dropdown.Item>
                                                                                                ))}
                                                                                        </>
                                                                                )}
                                                                        </Dropdown.Menu>
                                                                </Dropdown>
                                                        </Stack>
                                                        <Button variant="outline-success Cbutton">Search</Button>
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
                                                                                <NavDropdown.Item as={Link} to={`/user/visited`}>My visits</NavDropdown.Item>
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
                </div >
        );
}


