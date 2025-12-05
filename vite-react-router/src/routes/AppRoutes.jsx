import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import CompAndProps from '../pages/CompAndProps';
import CustomCarousel from '../pages/CustomCarousel';
import Figlet from '../pages/Figlet';
import Navbar from '../components/Navbar';
import Signin from '../pages/Signin';
import Signup from '../pages/Signup';
import NotFound from '../pages/NotFound';
import User from '../pages/User';
import Bookmarks from '../pages/Bookmarks';
import Page from '../pages/Page';
import Title from '../pages/Title';
import Individual from '../pages/Individual';
import Search from '../pages/Search';
import UserBanner from '../components/UserBanner';

function AppRoutes() {
  return (
    <Routes>
      //any page needing a navbar goes here
      <Route element={<Navbar />} >
        // Home page
        <Route path="/" element={<Home />} />

        // User related pages
        <Route path="/user/:userId" element={<User />} />
        <Route path="/user/:userId/bookmarks" element={<Bookmarks />} />
        // missing history for pages and searches
        // also missing ratings

        // Titles and individual pages
        <Route path="/page/:pageId" element={<Page />} />
        <Route path="/page/title/:titleId" element={<Title />} />
        <Route path="/page/individual/:individualId" element={<Individual />} />

        // Search page
        <Route path="/search" element={<Search />} />
        <Route path="/search/:query" element={<Search />} />

        //Userbanner for testing
        <Route path="/userbanner" element={<UserBanner />} />
        <Route path="/userbanner/:userId" element={<User />} />

        // Other minor pages
        <Route path="/about" element={<About />} />
      </Route>

      //pages without navbar goes here
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/compandprops" element={<CompAndProps />} />
      <Route path="/customcarousel" element={<CustomCarousel />} />
      <Route path="/figlet/:text" element={<Figlet />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
