import { BrowserRouter as Router, Link } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

function App() {
  return (
    <Router>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">CIT-MDB</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="me-auto my-2 my-lg-0"
              style={{ maxHeight: '100px' }}
              navbarScroll
            >
              <Nav.Link as={Link} to="/">Hjem</Nav.Link>
              <Nav.Link as={Link} to="/about">How to website</Nav.Link>
              <NavDropdown title=" ⋮ " id="navbarScrollingDropdown" className="no-caret">
                <NavDropdown.Item as={Link} to="/CompAndProps">Random pictures</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="#action4">
                  Noget sejt her?
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/">
                  Noget endnu sejere her?
                </NavDropdown.Item>
              </NavDropdown>
              {/*
              <Nav.Link href="#" disabled>
                Link
              </Nav.Link>
              */}
            </Nav>
            <div className="d-flex justify-content-between flex-grow-1">
              <div className="d-flex justify-content"></div>
              <Form className="d-flex" style={{ maxWidth: 400, width: "100%" }}>
                <Form.Control
                  type="search"
                  placeholder="Search"
                  className="me-2"
                  aria-label="Search"
                />
                <Button variant="outline-success">Search</Button>
              </Form>

              <div className="d-flex align-items-center justify-content-end" style={{ minWidth: 120 }}>
                {/* Profile*/}
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
                  <NavDropdown.Item href="#profile">Profile</NavDropdown.Item>
                  <NavDropdown.Item href="#settings">Settings</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#logout">Logout</NavDropdown.Item>
                </NavDropdown>
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
        <Container
          fluid
          className="flex-grow-1 overflow-auto py-3"
        >
          <AppRoutes />
        </Container>
    </Router>
  );
}

export default App;