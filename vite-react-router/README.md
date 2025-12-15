# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Quick Start

```bash
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173/`

## Common Issues & Fixes

### Path Constantly Switching / Navigation Issues
**Cause:** React Router v7 compatibility issues  
**Fix:** App.jsx includes future flags:
```jsx
<Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

### Backend Connection Failed
**Cause:** Backend not running  
**Fix:** Start backend server on ports 5000 (HTTP) or 5001 (HTTPS)

### Port 5173 Already in Use
**Cause:** Previous dev server still running  
**Fix:** 
```bash
lsof -i :5173 | grep LISTEN
kill -9 <PID>
```

### API Calls Failing
**Cause:** CORS or backend not configured  
**Fix:** Ensure backend allows requests from `http://localhost:5173`

See `STARTUP_GUIDE.md` for detailed documentation.
