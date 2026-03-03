import { createContext, useContext, useState, useEffect } from "react";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [network, setNetwork] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [availableWallets, setAvailableWallets] = useState([]);

  // Detect available wallets
  useEffect(() => {
    const detect = () => {
      const wallets = [];

      if (window.ethereum) {
        // Check for multiple injected providers
        if (window.ethereum.providers?.length) {
          window.ethereum.providers.forEach((p) => {
            if (p.isMetaMask) wallets.push({ name: "MetaMask", icon: "🦊", provider: p });
            if (p.isPhantom) wallets.push({ name: "Phantom", icon: "👻", provider: p });
            if (p.isCoinbaseWallet) wallets.push({ name: "Coinbase Wallet", icon: "🔵", provider: p });
          });
        } else {
          // Single provider
          if (window.ethereum.isMetaMask) wallets.push({ name: "MetaMask", icon: "🦊", provider: window.ethereum });
          else if (window.ethereum.isPhantom) wallets.push({ name: "Phantom", icon: "👻", provider: window.ethereum });
          else if (window.ethereum.isCoinbaseWallet) wallets.push({ name: "Coinbase Wallet", icon: "🔵", provider: window.ethereum });
          else wallets.push({ name: "Browser Wallet", icon: "🌐", provider: window.ethereum });
        }
      }

      // Always add WalletConnect as option
      wallets.push({ name: "WalletConnect", icon: "🔗", provider: null, comingSoon: true });

      setAvailableWallets(wallets);
    };

    detect();
  }, []);

  // Auto reconnect
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          fetchNetwork(window.ethereum);
        }
      } catch (err) {
        console.error("Auto-connect failed:", err);
      }
    };
    checkConnection();
  }, []);

  // Listen for changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) { setWallet(null); setNetwork(null); }
      else setWallet(accounts[0]);
    };

    const handleChainChanged = () => fetchNetwork(window.ethereum);

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const fetchNetwork = async (provider) => {
    try {
      const chainId = await provider.request({ method: "eth_chainId" });
      const networks = {
        "0x1": "Ethereum",
        "0x89": "Polygon",
        "0x13881": "Mumbai",
        "0xaa36a7": "Sepolia",
        "0x7a69": "Localhost",
      };
      setNetwork(networks[chainId] || `Chain ${chainId}`);
    } catch (err) {
      console.error("Network fetch failed:", err);
    }
  };

  const connectWallet = () => {
    if (!window.ethereum) {
      alert("No wallet found. Please install MetaMask or Phantom.");
      return;
    }
    setShowWalletModal(true);
  };

  const connectSpecificWallet = async (walletOption) => {
    if (walletOption.comingSoon) return;
    try {
      setConnecting(true);
      setShowWalletModal(false);
      const accounts = await walletOption.provider.request({
        method: "eth_requestAccounts",
      });
      setWallet(accounts[0]);
      await fetchNetwork(walletOption.provider);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setNetwork(null);
  };

  const shortAddress = wallet
    ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
    : null;

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connecting,
        connectWallet,
        connectSpecificWallet,
        disconnectWallet,
        shortAddress,
        network,
        showWalletModal,
        setShowWalletModal,
        availableWallets,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);