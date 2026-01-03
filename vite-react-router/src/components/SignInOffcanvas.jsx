import Offcanvas from 'react-bootstrap/Offcanvas'; // Sidepanel der kan glide ind fra hoejre/venstre
import Form from 'react-bootstrap/Form'; // Formular felter og grupper
import Button from 'react-bootstrap/Button'; // Bootstrap knapper
import { useState } from 'react'; // React hook til lokal state
import mdb from '../business-logic-layer/ApiClient/ApiClient'; // Centralt API lag der haandterer auth kald
const INITIAL_FORM = { username: '', email: '', password: '', confirm: '' }; // Startvaerdier for alle formularfelter

// Use the centralized ApiClient for auth operations (`signup` and `login`).
// This keeps API versioning, error handling, and fetch logic in one place.

function SignInOffcanvas({ show, onClose, onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin'); // Gemmer om vi er i login- eller opret-bruger-mode
  const [form, setForm] = useState(INITIAL_FORM); // Formularens aktuelle felter
  const [error, setError] = useState(''); // Fejlbeskeder der vises til brugeren
  const [submitting, setSubmitting] = useState(false); // Laaser knapper mens der sendes request

  const handleChange = (e) => {
    const { name, value } = e.target; // Navn matcher feltnavn i state
    setForm((prev) => ({ ...prev, [name]: value })); // Opdaterer kun det felt der blev aendret
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Stopper browserens default submit
    setError(''); // Nulstiller tidligere fejl
    if (submitting) return; // Undgaa dobbelt-kald hvis der allerede sendes

    try {
      setSubmitting(true); // Laas knapper mens vi haandterer request

      if (mode === 'signup') {
        // Valider felter foer oprettelse
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

        // Send opret-bruger request
        const payload = await mdb.apiv2.auth.signup({
          name: form.username.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password
        });

        onSignUp?.(payload); // Informer foraelder om succes
        setForm(INITIAL_FORM); // Ryd felter
        setMode('signin'); // Skift tilbage til login-mode
      } else {
        // Valider login felter
        if (!form.username.trim()) {
          setError('Please enter your username');
          return;
        }

        // Send login request
        const payload = await mdb.apiv2.auth.login({
          username: form.username.trim(),
          password: form.password
        });

        if (typeof payload !== 'object' || payload === null) {
          throw new Error('Login response was not valid JSON');
        }

        // Gem JWT token i localStorage for senere kald
        if (payload.token && typeof window !== 'undefined') {
          localStorage.setItem('cit.jwt', payload.token);
          window.dispatchEvent(new StorageEvent('storage', { key: 'cit.jwt', newValue: payload.token })); // Informer andre tabs
        }

        onSignIn?.(payload); // Callback til foraelder
        setForm(INITIAL_FORM); // Ryd formularen
        onClose?.(); // Luk panelet
      }
    } catch (err) {
      if (mode === 'signin') {
        setError('The username or password is wrong'); // Brugervenlig fejl til login
      } else {
        setError('Something went wrong'); // Generel fejl for signup
      }
    } finally {
      setSubmitting(false); // Laas op igen uanset udfald
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin')); // Flip mellem login og signup
    setForm(INITIAL_FORM); // Nulstil felter saa der ikke haenger gamle inputs
    setError(''); // Fjern evt. fejlmeddelelser ved skift
  };

  return (
    <Offcanvas show={show} onHide={onClose} placement="end"> {/* Panel der skubbes ind fra hoejre */}
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{mode === 'signin' ? 'Sign in' : 'Sign up'}</Offcanvas.Title> {/* Overskrift skifter efter mode */}
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form onSubmit={handleSubmit}> {/* Haandterer både login og signup afh mode */}
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

          {error && <div className="text-danger mb-2">{error}</div>} {/* Viser fejl hvis noget gik galt */}

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