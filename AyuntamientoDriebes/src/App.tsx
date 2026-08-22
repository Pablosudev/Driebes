import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Layout from "./Components/Layout/Layout";
import Historia from "./Pages/Historia";
import HistoriaCaraca from "./Pages/HistoriaCaraca";
import Turismo from "./Pages/Turismo";
import Eventos from "./Pages/Eventos";
import Noticias from "./Pages/Noticias";
import Empresas from "./Pages/Empresas";
import Servicios from "./Pages/Servicios";
import Contacto from "./Pages/Contacto";
import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout/>}>
            <Route path="/" element={<Home />} />
            <Route path="/historia" element={<Historia />} />
            <Route path="/historia/caraca" element={<HistoriaCaraca />} />
            <Route path="/turismo" element={<Turismo />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/noticias" element={<Noticias />} />
            <Route path="/empresas" element={<Empresas />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/contacto" element={<Contacto />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
