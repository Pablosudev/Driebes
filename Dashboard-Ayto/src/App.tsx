import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./shared/Layout/Layout";
import Home from "./modules/Home";
import Events from "./modules/events/Pages/Events";
import EventDetail from "./modules/events/Pages/EventDetail";
import News from "./modules/news/Pages/News";
import NewDetail from "./modules/news/Pages/NewDetail";
import Jobs from "./modules/jobs/Pages/Jobs";
import JobDetail from "./modules/jobs/Pages/JobDetail";
import Bookings from "./modules/bookings/Pages/Bookings";
import BookingDetail from "./modules/bookings/Pages/BookingDetail";
import { Login } from "./modules/login/Pages/Login";
import { RequireAuth } from "./shared/components/RequireAuth";

/**
 * Arbol de rutas de la aplicacion.
 *
 * Vive aqui y no en main.tsx para poder montarlo en los tests: main.tsx solo
 * arranca React y enchufa el store.
 */
const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Unica ruta publica: el resto exige sesion. */}
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/eventos" element={<Events />} />
          <Route path="/eventos/:id" element={<EventDetail />} />
          <Route path="/noticias" element={<News />} />
          <Route path="/noticias/:id" element={<NewDetail />} />
          <Route path="/ofertas" element={<Jobs />} />
          <Route path="/ofertas/:id" element={<JobDetail />} />
          <Route path="/reservas" element={<Bookings />} />
          <Route path="/reservas/:id" element={<BookingDetail />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;