import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext.js";
import Navbar from "./components/layout/Navbar.js"
import Home from "./pages/Home";
import CampaignDetails from "./pages/CampaignDetails.js";
import CreateCampaign from "./pages/CreateCampaign.js";
import Dashboard from "./pages/Dashboard.js"
import NotFound from "./pages/NotFound.js"
import WalletModal from "./components/WalletModal.js";

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-950 text-white">
          <Navbar />
          <WalletModal />
          <main>
            {" "}
            {/* no pt-16 — Navbar now injects its own h-20 spacer */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/campaign/:id" element={<CampaignDetails />} />
              <Route path="/create" element={<CreateCampaign />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </WalletProvider>
  );
}