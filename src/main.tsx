import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "./index.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./shared/Layout/Layout";
import Home from "./modules/Home";
import Events from "./modules/events/Pages/Events";
import EventDetail from "./modules/events/Pages/EventDetail";
import News from "./modules/news/Pages/News";
import Jobs from "./modules/jobs/Pages/Jobs";
import Bookings from "./modules/bookings/Pages/Bookings";
import JobDetail from "./modules/jobs/Pages/JobDetail";
import NewDetail from "./modules/news/Pages/NewDetail";
import BookingDetail from "./modules/bookings/Pages/BookingDetail";



createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/eventos" element={<Events />} />
            <Route path="/eventos/:id" element={<EventDetail />} />
            <Route path="/noticias" element={<News />} />
            <Route path="/noticias/:id" element={<NewDetail />} /> 
            <Route path="/ofertas" element={<Jobs />} />
            <Route path="/ofertas/:id" element={<JobDetail/>}/>
            <Route path="/reservas" element={<Bookings />} />
            <Route path="/reservas/:id" element={<BookingDetail/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
