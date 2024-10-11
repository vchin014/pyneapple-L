import { Routes, Route } from "react-router-dom";
import AGWR from "views/AGWR";
import Hotspot from "views/Hotspot";
import Home from "views/Home";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/l/agwr" element={<AGWR />} />
      <Route path="/l/hotspot" element={<Hotspot />} />
    </Routes>
  );
};

export default App;
