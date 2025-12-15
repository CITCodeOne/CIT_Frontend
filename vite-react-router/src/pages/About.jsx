export default function About() {
  return (
    <div className="container py-4">
      <h1>About CIT Movie Database</h1>

      <section className="mb-4">
        <h2>What is CIT-MDB?</h2>
        <p>
          CIT Movie Database (CIT-MDB) is a comprehensive movie and TV series information platform.
          Browse titles, discover actors and crew members, read reviews, and manage your personal
          watchlist and ratings.
        </p>
      </section>

      <section className="mb-4">
        <h2>Features</h2>
        <ul>
          <li><strong>Search:</strong> Find movies, TV series, and people in our extensive database</li>
          <li><strong>Detailed Information:</strong> Access comprehensive details about titles including cast, crew, reviews, and similar recommendations</li>
          <li><strong>User Profiles:</strong> Create your personal profile to track your favorite content</li>
          <li><strong>Ratings:</strong> Rate titles and see what others think</li>
          <li><strong>Bookmarks:</strong> Save titles to your watchlist for later</li>
        </ul>
      </section>

      <section className="mb-4">
        <h2>Technology Stack</h2>
        <p>
          This application is built with modern web technologies to provide a fast and responsive user experience:
        </p>
        <ul>
          <li><strong>React:</strong> Component-based UI framework</li>
          <li><strong>React Router:</strong> Client-side routing</li>
          <li><strong>Bootstrap & React-Bootstrap:</strong> Responsive design and UI components</li>
          <li><strong>Vite:</strong> Fast build tool and development server</li>
        </ul>
        <p>
          For more information about React-Bootstrap components, visit{' '}
          <a href="https://react-bootstrap.netlify.app/" target="_blank" rel="noreferrer">
            react-bootstrap.netlify.app
          </a>.
        </p>
      </section>

      <section className="mb-4">
        <h2>API Integration</h2>
        <p>
          CIT-MDB connects to a backend API that provides access to movie and TV series data,
          user authentication, ratings, and bookmarks. The application uses a sophisticated
          data mapping layer to ensure consistent data structures throughout the interface.
        </p>
      </section>

      <section className="mb-4">
        <h2>Project Information</h2>
        <p>
          This project is developed as part of the CIT course, demonstrating modern web development
          practices including component architecture, state management, API integration, and
          responsive design principles.
        </p>
      </section>
    </div>
  );
}
