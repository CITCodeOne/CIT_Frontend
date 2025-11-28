import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import CompAndProps from '../pages/CompAndProps';
import CustomCarousel from '../pages/CustomCarousel';
import Figlet from '../pages/Figlet';
import Navbar from '../components/Navbar';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Navbar />} >
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/compandprops" element={<CompAndProps />} />
        <Route path="/customcarousel" element={<CustomCarousel />} />
        <Route path="/figlet/:text" element={<Figlet />} />
      </Route>
      <Route path="/signin" element={<Home />} />
      <Route path="/signup" element={<Home />} />
    </Routes>
  );
}

export default AppRoutes;
