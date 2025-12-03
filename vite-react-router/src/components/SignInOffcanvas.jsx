import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';

function SignInOffcanvas({ show, onClose, onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'signup') {
      if (!form.username.trim()) {
        setError('Please enter a username');
        return;
      }
      if (form.password !== form.confirm) {
        setError('Passwords do not match');
        return;
      }
      onSignUp ? onSignUp(form) : onClose && onClose();
    } else {
      onSignIn ? onSignIn({ email: form.email, password: form.password }) : onClose && onClose();
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    setError('');
  };

  return (
    <Offcanvas show={show} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{mode === 'signin' ? 'Sign in' : 'Sign up'}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <Form.Group className="mb-3" controlId="signupUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                name="username"
                type="text"
                placeholder="Your username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3" controlId="emailField">
            <Form.Label>Email</Form.Label>
            <Form.Control
              name="email"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="passwordField">
            <Form.Label>Password</Form.Label>
            <Form.Control
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {mode === 'signup' && (
            <Form.Group className="mb-3" controlId="confirmField">
              <Form.Label>Confirm password</Form.Label>
              <Form.Control
                name="confirm"
                type="password"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </Form.Group>
          )}

          {error && <div className="text-danger mb-2">{error}</div>}

          <Button type="submit" variant="primary" className="w-100 mb-2">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>

          <Button type="button" variant="outline-secondary" className="w-100" onClick={switchMode}>
            {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
          </Button>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default SignInOffcanvas;