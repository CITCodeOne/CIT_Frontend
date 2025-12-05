import Offcanvas from 'react-bootstrap/Offcanvas';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:5001';
const INITIAL_FORM = { username: '', email: '', password: '', confirm: '' };

function SignInOffcanvas({ show, onClose, onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (submitting) return;
    if (mode === 'signup') {
      if (!form.username.trim()) {
        setError('Please enter a username');
        return;
      }
      if (!form.email.trim()) {
        setError('Please enter an email');
        return;
      }
      if (form.password !== form.confirm) {
        setError('Passwords do not match');
        return;
      }
      try {
        setSubmitting(true);
        const response = await fetch(`${API_BASE_URL}/api/v2/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: form.username.trim(),
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password
          })
        });

        const contentType = response.headers.get('content-type') ?? '';
        const payload = contentType.includes('application/json')
          ? await response.json()
          : await response.text();

        if (!response.ok) {
          const message = typeof payload === 'string' ? payload : payload?.message ?? 'Unable to sign up';
          throw new Error(message);
        }

        onSignUp?.(payload);
        setForm(INITIAL_FORM);
        setMode('signin');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to sign up');
      } finally {
        setSubmitting(false);
      }
      return;
    } else {
      if (!form.username.trim()) {
        setError('Please enter your username');
        return;
      }
      try {
        setSubmitting(true);
        const response = await fetch(`${API_BASE_URL}/api/v2/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: form.username.trim(),
            password: form.password
          })
        });

        const contentType = response.headers.get('content-type') ?? '';
        const payload = contentType.includes('application/json')
          ? await response.json()
          : await response.text();

        if (!response.ok) {
          const message = typeof payload === 'string' ? payload : payload?.message ?? 'Unable to sign in';
          throw new Error(message);
        }

        if (typeof payload !== 'object' || payload === null) {
          throw new Error('Login response was not valid JSON');
        }

        if (payload.token && typeof window !== 'undefined') {
          localStorage.setItem('cit.jwt', payload.token);
        }

        onSignIn?.(payload);
        setForm(INITIAL_FORM);
        onClose?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to sign in');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    setForm(INITIAL_FORM);
    setError('');
  };

  return (
    <Offcanvas show={show} onHide={onClose} placement="end">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{mode === 'signin' ? 'Sign in' : 'Sign up'}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="usernameField">
            <Form.Label>Username</Form.Label>
            <Form.Control
              name="username"
              type="text"
              placeholder="Your username"
              value={form.username}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </Form.Group>

          {mode === 'signup' && (
            <Form.Group className="mb-3" controlId="emailField">
              <Form.Label>Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3" controlId="passwordField">
            <Form.Label>Password</Form.Label>
            <Form.Control
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              disabled={submitting}
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
                disabled={submitting}
                required
              />
            </Form.Group>
          )}

          {error && <div className="text-danger mb-2">{error}</div>}

          <Button type="submit" variant="primary" className="w-100 mb-2" disabled={submitting}>
            {submitting && mode === 'signin'
              ? 'Signing in...'
              : mode === 'signin'
                ? 'Sign in'
                : 'Create account'}
          </Button>

          <Button
            type="button"
            variant="outline-secondary"
            className="w-100"
            onClick={switchMode}
            disabled={submitting}
          >
            {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
          </Button>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default SignInOffcanvas;