import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "./index.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./modules/login/Pages/Login";
import Layout from "./shared/Layout/Layout";




createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout/>}>
        
        </Route>
      </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
