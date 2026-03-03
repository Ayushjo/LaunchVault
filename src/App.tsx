import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./context/WalletContext";
import Navbar from "./components/layout/Navbar.jsx"
import Home from "./pages/Home";
import CampaignDetails from "./pages/CampaignDetails";
import CreateCampaign from "./pages/CreateCampaign";
import Dashboard from "./pages/Dashboard"
import NotFound from "./pages/NotFound"
import WalletModal from "./components/WalletModal";

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#020617] text-white">
          <Navbar />
          <WalletModal />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/campaign/:id" element={<CampaignDetails />} />
              <Route path="/create" element={<CreateCampaign />} />
              {<Route path="/dashboard" element={<Dashboard />} /> }
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </WalletProvider>
  );
}