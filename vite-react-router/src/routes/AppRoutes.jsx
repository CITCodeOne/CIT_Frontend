import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import Navbar from '../components/Navbar';
import Signin from '../pages/Signin';
import Signup from '../pages/Signup';
import NotFound from '../pages/NotFound';
import User from '../pages/User';
import UserRatingsList from '../pages/UserRatingsList';
import UserBookmarksList from '../pages/UserBookmarksList';
import Title from '../pages/Title';
import Individual from '../pages/Individual';
import Search from '../pages/Search';

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

        // Titles and individual pages
        <Route path="/title/:titleId" element={<Title />} />
        <Route path="/individual/:individualId" element={<Individual />} />

        // Search page
        <Route path="/search" element={<Search />} />
        <Route path="/search/:query" element={<Search />} />

        // Other minor pages
        <Route path="/about" element={<About />} />
      </Route>


      //pages without navbar goes here
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
