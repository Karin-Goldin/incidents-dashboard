import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import { store } from "./store/store";
import "@/styles/globals.css";

// Initialize theme before React renders
// Default to dark mode unless user explicitly chose light
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.documentElement.classList.remove("dark");
} else {
  document.documentElement.classList.add("dark");
  if (!savedTheme) {
    localStorage.setItem("theme", "dark");
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ReduxProvider store={store}>
        <Provider>
          <App />
        </Provider>
      </ReduxProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
