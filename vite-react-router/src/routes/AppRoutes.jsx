import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import Navbar from '../components/Navbar';
import NotFound from '../pages/NotFound';
import User from '../pages/User';
import UserRatingsList from '../pages/UserRatingsList';
import UserBookmarksList from '../pages/UserBookmarksList';
import Visited from '../pages/Visited';
import Title from '../pages/Title';
import Individual from '../pages/Individual';
import Search from '../pages/Search';
import Page from '../pages/Page';
import Test from '../Tests/TestApiClient';

function AppRoutes() {
  return (
    <Routes>
      //any page needing a navbar goes here
      <Route element={<Navbar />} >
        // Home page
        <Route path="/" element={<Home />} />

        // User profile and related pages
        <Route path="/user/:userId" element={<User />} />
        <Route path="/user/:userId/ratings" element={<UserRatingsList />} />
        <Route path="/user/:userId/bookmarks" element={<UserBookmarksList />} />
        <Route path="/user/:userId/visited" element={<Visited />} />

        // Titles and individual pages
        <Route path="/page/:pageId" element={<Page />}>
          <Route path="/page/:pageId/title/:titleId" element={<Title />} />
          <Route path="/page/:pageId/individual/:individualId" element={<Individual />} />
          <Route index element={<NotFound />} />
        </Route>

        // Search page
        <Route path="/search" element={<Search />} />
        <Route path="/search/:query" element={<Search />} />

        // Other minor pages
        <Route path="/about" element={<About />} />
        <Route path="/visited" element={<Visited />} />
        <Route path="*" element={<NotFound />} />
        <Route path="test" element={<Test />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
