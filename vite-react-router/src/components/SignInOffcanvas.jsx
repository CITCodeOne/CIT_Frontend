import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

function SignInOffcanvas({ show, onClose, onSignIn }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSignIn) {
      onSignIn();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <Offcanvas show={show} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Sign in</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="signinEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="name@example.com" required />
          </Form.Group>
          <Form.Group className="mb-3" controlId="signinPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="••••••••" required />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100">Sign in</Button>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default SignInOffcanvas;