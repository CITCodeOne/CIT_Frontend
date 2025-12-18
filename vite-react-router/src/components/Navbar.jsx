import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/Cstyle.css';
import Container from 'react-bootstrap/Container';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Stack from 'react-bootstrap/Stack';
import SignInOffcanvas from './SignInOffcanvas';
import useAuthStatus from '../hooks/useAuthStatus';
import mdb from '../business-logic-layer/ApiClient/ApiClient.jsx';

export default function NavbarLayout() {
        // State to control SignInOffcanvas visibility
        const [showSignIn, setShowSignIn] = useState(false);
        // Custom hook to get authentication status and user info
        const { isSignedIn, username, profileInitial, syncAuthState, handleLogout, userId } = useAuthStatus();
        const [query, setQuery] = useState('');
        const [searchTitlesResult, setSearchTitlesResult] = useState(null);
        const [searchIndividualsResult, setSearchIndividualsResult] = useState(null);
        const [showDropdown, setShowDropdown] = useState(false);
        const [searchEntity, setSearchEntity] = useState('All');
        const navigate = useNavigate();

        const handleSearchChange = async (e) => {
                const query = e.target.value;
                setQuery(query);
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
                        if (results.length !== 0) setShowDropdown(true);
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
                        if (results.length !== 0) setShowDropdown(true);
                        return results;
                } catch (error) {
                        console.error('Search failed:', error);
                        return [];
                }
        };

        const handleSearch = async () => {
                // Implement search submission logic here, e.g., navigate to search results page
                console.log('Search submitted for query:', query);
                let searchPath = '/search';
                // Append query parameters based on selected entity type
                switch (searchEntity) {
                        case 'Titles':
                                searchPath += `?title_name=${encodeURIComponent(query)}`;
                                break;
                        case 'Individuals':
                                searchPath += `?individual_name=${encodeURIComponent(query)}`;
                                break;
                        case 'All':
                        default:
                                searchPath += `?title_name=${encodeURIComponent(query)}&individual_name=${encodeURIComponent(query)}`;
                                break;
                }
                navigate(searchPath);
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
                                                <div className="d-flex justify-content-between flex-grow-1">
                                                        <Stack >
                                                                <InputGroup >
                                                                        <DropdownButton
                                                                                variant="outline-secondary Cbutton"
                                                                                title={searchEntity}
                                                                                id="input-group-dropdown-1"
                                                                                onToggle={(next) => setShowDropdown(!next)} // Close quicksearch dropdown when selecting entity type
                                                                        >
                                                                                <Dropdown.Header>Search In</Dropdown.Header>
                                                                                <Dropdown.Item onClick={() => setSearchEntity('All')}>All</Dropdown.Item>
                                                                                <Dropdown.Item onClick={() => setSearchEntity('Titles')}>Titles</Dropdown.Item>
                                                                                <Dropdown.Item onClick={() => setSearchEntity('Individuals')}>Individuals</Dropdown.Item>
                                                                                <Dropdown.Divider />
                                                                                <Dropdown.Item as={Link} to={'/search'}>Advanced Search</Dropdown.Item>
                                                                        </DropdownButton>
                                                                        <Form.Control
                                                                                id="navbar-search"
                                                                                name="search"
                                                                                type="search"
                                                                                placeholder="Search"
                                                                                aria-label="Search"
                                                                                onChange={(e) => handleSearchChange(e)}
                                                                                onFocus={() => {
                                                                                        if ((searchTitlesResult && searchTitlesResult.length > 0) || (searchIndividualsResult && searchIndividualsResult.length > 0)) setShowDropdown(true);
                                                                                }}
                                                                                onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter') {
                                                                                                handleSearch();
                                                                                        }
                                                                                }}
                                                                                autoComplete="off"
                                                                        />
                                                                        <Button variant="outline-success Cbutton" onClick={() => handleSearch()}>Search</Button>
                                                                </InputGroup >
                                                                {/* Dropdown for search results
                                                                        The Menu is shown dependent on the showDropdown state
                                                                        the rootCloseEvent is set to mousedown to close the dropdown when clicking outside
                                                                        the onToggle updates the showDropdown state and is required for rootCloseEvent to work when controlling visibility manually*/}
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
                                                                                                                {title.name} ({title.mediaType})
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
                                                                                                                {individual.name} ({individual.birthYear ? individual.birthYear : 'N/A'}
                                                                                                                {(individual.deathYear && individual.deathYear) !== "n/a" ? ` - ${individual.deathYear}` : ''})
                                                                                                        </Dropdown.Item>
                                                                                                ))}
                                                                                        </>
                                                                                )}
                                                                        </Dropdown.Menu>
                                                                </Dropdown>
                                                        </Stack>
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
                                                                                <NavDropdown.Item as={Link} to={`/user/visited`}>Visits</NavDropdown.Item>
                                                                                <NavDropdown.Item as={Link} to={`/user/${userId}/ratings`}>Ratings</NavDropdown.Item>
                                                                                <NavDropdown.Item as={Link} to={`/user/${userId}/bookmarks`}>Bookmarks</NavDropdown.Item>
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


