import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { enforceCrmDomainRedirect } from "./lib/domainConfig";

// Redirect legacy crm.calsandumpsterspro.com → app.calsandumpsterspro.com
enforceCrmDomainRedirect();

createRoot(document.getElementById("root")!).render(<App />);
