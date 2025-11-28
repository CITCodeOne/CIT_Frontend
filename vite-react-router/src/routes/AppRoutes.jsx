import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import CompAndProps from '../pages/CompAndProps';
import CustomCarousel from '../pages/CustomCarousel';
import Figlet from '../pages/Figlet';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/compandprops" element={<CompAndProps />} />
      <Route path="/customcarousel" element={<CustomCarousel />} />
      <Route path="/figlet/:text" element={<Figlet />} />
    </Routes>
  );
}

export default AppRoutes;
