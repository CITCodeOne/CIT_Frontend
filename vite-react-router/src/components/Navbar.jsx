import { useState, useEffect } from 'react'; // Hooks til lokal state og lifecycle
import { Link, Outlet, useNavigate } from 'react-router-dom'; // Router helpers til navigation og links
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap basis-styles
import '../style/Cstyle.css'; // Egen stil der overskriver/udvider bootstrap
import Container from 'react-bootstrap/Container'; // Layout container
import InputGroup from 'react-bootstrap/InputGroup'; // Wrapper til input med knapper/dropdowns
import Form from 'react-bootstrap/Form'; // Formular elementer
import Button from 'react-bootstrap/Button'; // Knapper
import Nav from 'react-bootstrap/Nav'; // Navigation wrapper
import Navbar from 'react-bootstrap/Navbar'; // Bootstrap navbar komponent
import NavDropdown from 'react-bootstrap/NavDropdown'; // Dropdown i navbar
import Dropdown from 'react-bootstrap/Dropdown'; // Generel dropdown
import DropdownButton from 'react-bootstrap/DropdownButton'; // Dropdown med knap-trigger
import Stack from 'react-bootstrap/Stack'; // Vertikal/horisontal stacking
import SignInOffcanvas from './SignInOffcanvas'; // Sidepanel til login
import useAuthStatus from '../hooks/useAuthStatus'; // Custom hook der giver auth-info og helpers
import mdb from '../business-logic-layer/ApiClient/ApiClient.jsx'; // API klient til backend kald
import { normalizeDataUrl } from './utils/profileImageUtils'; // Helper der sikrer gyldig data-url for billeder
import defaultProfilePic from '../pics/DefaultProfilePicture.jpg'; // Fallback profilbillede

export default function NavbarLayout() {
        // State til login-panelets visning
        const [showSignIn, setShowSignIn] = useState(false);
        // Custom hook leverer auth status og helpers til sync/logud
        const { isSignedIn, username, profileInitial, syncAuthState, handleLogout, userId } = useAuthStatus();
        const [query, setQuery] = useState(''); // Tekst i soegefeltet
        const [searchTitlesResult, setSearchTitlesResult] = useState(null); // Hurtigsoege resultater for titler
        const [searchIndividualsResult, setSearchIndividualsResult] = useState(null); // Hurtigsoege resultater for personer
        const [showDropdown, setShowDropdown] = useState(false); // Styrer om dropdown med resultater er synlig
        const [searchEntity, setSearchEntity] = useState('All'); // Valgt kategori at soege i
        const navigate = useNavigate(); // Giver navigation uden link klik

        const handleSearchChange = async (e) => {
                const query = e.target.value; // Ny tekst fra input
                setQuery(query); // Opdater state saa feltet er kontrolleret
                if (query.length === 0) { // Tomt felt nulstiller hurtigsoege
                        setSearchTitlesResult(null);
                        setSearchIndividualsResult(null);
                        setShowDropdown(false);
                        return; // Undgaa unodige kald paa tom streng
                }
                console.log('Search query:', query); // Debug log
                // Parallelsoeger titler og personer og venter paa begge
                const [titlesResults, individualsResults] = await Promise.all([searchTitles(query), searchIndividuals(query)]);
                // Viser dropdown kun hvis mindst eet sæt resultater findes
                setShowDropdown((titlesResults && titlesResults.length > 0) || (individualsResults && individualsResults.length > 0));
        };

        const searchTitles = async (query) => {
                const searchParams = {
                        name: query,	// Soeger i titelnavne
                        page: 1,		// Foerste side
                        pageSize: 3		// Faa resultater til hurtig visning
                };

                try {
                        const results = await mdb.apiv2.titles.search(searchParams); // API kald mod titler
                        console.log('Search results:', results);
                        setSearchTitlesResult(results); // Gem i state til dropdown
                        if (results.length !== 0) setShowDropdown(true); // Aabn dropdown hvis noget blev fundet
                        return results;
                } catch (error) {
                        console.error('Search failed:', error);
                        return []; // Fejl giver tom liste frem for at crashe
                }
        };

        const searchIndividuals = async (query) => {
                const searchParams = {
                        name: query,	// Soeger i personnavne
                        page: 1,		// Foerste side
                        pageSize: 3		// Faa resultater til hurtig visning
                };

                try {
                        const results = await mdb.apiv2.individuals.search(searchParams); // API kald mod personer
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
                console.log('Search submitted for query:', query); // Debug paa submit
                let searchPath = '/search'; // Base route for soeger
                if (query.trim().length === 0) { // Tomt input navigerer bare til base soegeside
                        setShowDropdown(false);
                        navigate(searchPath);
                        return;
                }
                // Tilfoej query params baseret paa valgte kategori
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
                setShowDropdown(false); // Skjul dropdown naar vi gaar til fuld soegeside
                navigate(searchPath); // Skift route med parametre
        };

        // Avatar state til profilbillede i dropdown
        const [avatar, setAvatar] = useState(defaultProfilePic);

        useEffect(() => {
                const fetchAvatar = async () => {
                        if (!isSignedIn || !userId) { // Hvis ikke logget ind, brug default billede
                                setAvatar(defaultProfilePic);
                                return;
                        }

                        try {
                                const user = await mdb.apiv2.user.get(userId); // Hent brugerdata
                                const img = user && user.image ? normalizeDataUrl(user.image) : defaultProfilePic; // Normaliser data-url eller brug fallback
                                setAvatar(img);
                        } catch (err) {
                                console.error('Failed to fetch avatar in Navbar:', err);
                                setAvatar(defaultProfilePic); // Fejl giver fallback for at undgaa tomt billede
                        }
                };

                fetchAvatar(); // Kald ved mount og naar afh ser aendres
        }, [isSignedIn, userId]);

        return (
                <div className="min-vh-100 d-flex flex-column"> {/* Fylder minimum hele hoejden og laegger indhold vertikalt */}
                        <Navbar expand="lg" className="bg-body-tertiary CNavbar-shadow"> {/* Responsiv navbar med custom skygge */}
                                <Container fluid className='NavbarCstyle'> {/* Fuldbredde container med egne styles */}
                                        <Navbar.Brand as={Link} to="/" className='Clogo'>CIT-MDB</Navbar.Brand> {/* Logo der linker hjem */}
                                        <Navbar.Toggle aria-controls="navbarScroll" /> {/* Burger-menu paa sma skraerme */}
                                        <Navbar.Collapse id="navbarScroll"> {/* Indhold der kan foldes sammen */}
                                                <Nav
                                                        className="me-auto my-2 my-lg-0"
                                                        style={{ maxHeight: '100px' }}
                                                        navbarScroll
                                                >
                                                </Nav> {/* Tom venstre side giver plads til soeg og profil til hoejre */}
                                                <div className="d-flex justify-content-between flex-grow-1"> {/* Fordeler soeg og profil sektion */}
                                                        <InputGroup > {/* Soegefelt med dropdown og knap */}
                                                                <DropdownButton
                                                                        variant="outline-secondary Cbutton"
                                                                        title={searchEntity}
                                                                        id="input-group-dropdown-1"
                                                                        onToggle={() => setShowDropdown(false)} // Luk hurtigsoege dropdown naar kategori aendres
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
                                                                        onChange={(e) => handleSearchChange(e)} // Live soegning naar tekst aendres
                                                                        onFocus={() => {
                                                                                if ((searchTitlesResult && searchTitlesResult.length > 0) || (searchIndividualsResult && searchIndividualsResult.length > 0)) setShowDropdown(true); // Viser dropdown igen hvis der allerede er resultater
                                                                        }}
                                                                        onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                        handleSearch(); // Enter udfoerer fuld soegning
                                                                                }
                                                                        }}
                                                                        autoComplete="off"
                                                                />
                                                                {/* Dropdown for hurtigsoege resultater */}
                                                                <Dropdown
                                                                        show={showDropdown && ((searchTitlesResult && searchTitlesResult.length > 0) || (searchIndividualsResult && searchIndividualsResult.length > 0))} // Synlig kun hvis vi har resultater
                                                                        onToggle={(next) => setShowDropdown(next)} // Holder synlighed kontrolleret af state
                                                                        className="Csearch-dropdown"
                                                                >
                                                                        <Dropdown.Menu
                                                                                rootCloseEvent="mousedown" // Lukker naar man klikker udenfor
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
                                                                                                                onClick={() => setShowDropdown(false)} // Luk dropdown naar der klikkes paa et resultat
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
                                                                <Button variant="outline-success Cbutton" onClick={() => handleSearch()}>Search</Button> {/* Knap til at starte fuld soegning */}
                                                        </InputGroup >
                                                        <div className="d-flex align-items-center justify-content-end" style={{ minWidth: 120 }}>
                                                                {/* Profil sektion */}
                                                                {isSignedIn ? (
                                                                        <NavDropdown
                                                                                title={
                                                                                        <div className="d-flex align-items-center">
                                                                                                <img
                                                                                                        src={avatar}
                                                                                                        alt={username || 'User'}
                                                                                                        className="profile-avatar"
                                                                                                />
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
                                                                                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item> {/* Brug helper fra hook til logud */}
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
                                        syncAuthState(); // Opdater auth state efter succesfuld login
                                }}
                        />
                        <Container
                                fluid
                                className="flex-grow-1 py-3 ContainerCstyle overflow-auto"
                        >
                                <div style={{ backgroundColor: '#f8f9fa', paddingBottom: '2rem', borderRadius: '8px' }}> {/* Wrapper om outlet-indholdet */}
                                        <Outlet /> {/* Her rendres undermatches fra routeren */}
                                </div>
                        </Container>
                </div >
        );
}


