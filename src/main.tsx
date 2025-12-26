import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import { store } from "./store/store";
import "@/styles/globals.css";

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
