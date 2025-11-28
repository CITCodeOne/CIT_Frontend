import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import CompAndProps from '../pages/CompAndProps';
import Carousel from '../pages/carousel';

function AppRoutes() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/compandprops" element={<CompAndProps />} />
        <Route path="/carousel" element={<Carousel />}/>
      </Routes>
  );
}

export default AppRoutes;