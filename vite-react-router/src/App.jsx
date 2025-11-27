import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="header">
          <form id="form" role="search">
            <input
              type="search"
              placeholder="Search actor..."
              aria-label="Search actor"
              className="TextInput"
            />
            <button id="SearchButton" type="submit">Search</button>
          </form>
        </header>
        <div className="Container">
          <aside className="Sidebar" aria-label="Primary navigation">
            <Navbar />
          </aside>
          <main className="content" role="main">
            <AppRoutes />
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;