import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import "./index.css";
import App from "./App.jsx";

axios.defaults.withCredentials = true;
axios.interceptors.request.use((config) => {
  const authorization = config.headers?.Authorization || config.headers?.authorization;

  if (authorization === "Bearer null" || authorization === "Bearer undefined") {
    delete config.headers.Authorization;
    delete config.headers.authorization;
  }

  return config;
});

const nativeFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const headers = new Headers(init.headers || {});
  const authorization = headers.get("Authorization");

  if (authorization === "Bearer null" || authorization === "Bearer undefined") {
    headers.delete("Authorization");
  }

  return nativeFetch(input, {
    ...init,
    credentials: init.credentials ?? "include",
    headers,
  });
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" />
      <App />
    </BrowserRouter>
  </StrictMode>
);
