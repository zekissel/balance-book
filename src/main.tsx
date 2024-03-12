import React from "react";
import ReactDOM from "react-dom/client";
import App from "./component/base/App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
