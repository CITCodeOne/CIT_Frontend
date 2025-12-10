import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import CompAndProps from '../pages/CompAndProps';
import CustomCarousel from '../pages/CustomCarousel';
import ItemList from '../components/ListComp';
import CustomCarouselFilterTest from "../pages/CustomCarouselFilterTest";
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
import TestMainDisplay from '../Tests/TestMainDisplay';
import TestRating from '../Tests/TestRating';
import UserBanner from '../components/UserBanner';
import TestBookmark from '../Tests/TestBookmark';
import TestBookmarkUserProfile from '../Tests/TestBookmarkUserProfile';
import ProfileImageBase64 from '../pages/ProfileImageBase64';

import Movie from "../business-logic-layer/data-models/Movie"

//dummy data
const sizeTest = 10;
const testItems = [];
  for (let i = 0; i < sizeTest; i++) {
    testItems.push(
      new Movie({
      name: "ep"+i,
      releaseYear: 1998,
      directors: ["Mike Hunt", "Hunter Mike"]
    })
    )
  }

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
        <Route path="/test" element={<TestMainDisplay />} />
        <Route path="/test-rating" element={<TestRating />} />
        <Route path="/test-bookmark" element={<TestBookmark />} />
        <Route path="/test-user-profile" element={<TestBookmarkUserProfile />} />
        <Route path="/profile-image-base64" element={<ProfileImageBase64 />} />


        // List comp page
        <Route path="/list" element={<ItemList
          itemsRecieved={testItems}
        />} />
      </Route>


      //pages without navbar goes here
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/compandprops" element={<CompAndProps />} />
      <Route path="/customcarousel" element={<CustomCarousel />} />
      <Route
        path="/customcarouselfiltertest" element={<CustomCarouselFilterTest />} />
      <Route path="/figlet/:text" element={<Figlet />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
