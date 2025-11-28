import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import CompAndProps from '../pages/CompAndProps';
import CustomCarousel from '../pages/CustomCarousel';

function AppRoutes() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/compandprops" element={<CompAndProps />} />
        <Route path="/customcarousel" element={<CustomCarousel />}/>
      </Routes>
  );
}

export default AppRoutes;