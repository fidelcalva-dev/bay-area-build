import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { enforceCrmDomainRedirect } from "./lib/domainConfig";

// Enforce HTTPS, www→non-www, and legacy subdomain redirects
enforceCrmDomainRedirect();

createRoot(document.getElementById("root")!).render(<App />);
