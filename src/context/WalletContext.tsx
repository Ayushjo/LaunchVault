import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface WalletOption {
  name: string;
  icon: string;
  provider: ExternalProvider | null;
  comingSoon?: boolean;
}

interface ExternalProvider {
  request: (args: { method: string }) => Promise<string[]>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  isPhantom?: boolean;
  isCoinbaseWallet?: boolean;
  providers?: ExternalProvider[];
}

interface WalletContextValue {
  wallet: string | null;
  connecting: boolean;
  connectWallet: () => void;
  connectSpecificWallet: (walletOption: WalletOption) => Promise<void>;
  disconnectWallet: () => void;
  shortAddress: string | null;
  network: string | null;
  showWalletModal: boolean;
  setShowWalletModal: (value: boolean) => void;
  availableWallets: WalletOption[];
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [network, setNetwork] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([]);

  useEffect(() => {
    const detect = () => {
      const wallets: WalletOption[] = [];
      if (window.ethereum) {
        if (window.ethereum.providers?.length) {
          window.ethereum.providers.forEach((p: ExternalProvider) => {
            if (p.isMetaMask) wallets.push({ name: "MetaMask", icon: "🦊", provider: p });
            if (p.isPhantom) wallets.push({ name: "Phantom", icon: "👻", provider: p });
            if (p.isCoinbaseWallet) wallets.push({ name: "Coinbase Wallet", icon: "🔵", provider: p });
          });
        } else {
          if (window.ethereum.isMetaMask) wallets.push({ name: "MetaMask", icon: "🦊", provider: window.ethereum });
          else if (window.ethereum.isPhantom) wallets.push({ name: "Phantom", icon: "👻", provider: window.ethereum });
          else if (window.ethereum.isCoinbaseWallet) wallets.push({ name: "Coinbase Wallet", icon: "🔵", provider: window.ethereum });
          else wallets.push({ name: "Browser Wallet", icon: "🌐", provider: window.ethereum });
        }
      }
      wallets.push({ name: "WalletConnect", icon: "🔗", provider: null, comingSoon: true });
      setAvailableWallets(wallets);
    };
    detect();
  }, []);

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

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length === 0) { setWallet(null); setNetwork(null); }
      else setWallet(accs[0]);
    };

    const handleChainChanged = () => {
      if (window.ethereum) fetchNetwork(window.ethereum);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const fetchNetwork = async (provider: ExternalProvider) => {
    try {
      const [chainId] = await provider.request({ method: "eth_chainId" });
      const networks: Record<string, string> = {
        "0x1": "Ethereum",
        "0x89": "Polygon",
        "0x13881": "Mumbai",
        "0xaa36a7": "Sepolia",
        "0x7a69": "Localhost",
      };
      setNetwork(networks[chainId] ?? `Chain ${chainId}`);
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

  const connectSpecificWallet = async (walletOption: WalletOption) => {
    if (walletOption.comingSoon || !walletOption.provider) return;
    try {
      setConnecting(true);
      setShowWalletModal(false);
      const accounts = await walletOption.provider.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0]);
      await fetchNetwork(walletOption.provider);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => { setWallet(null); setNetwork(null); };

  const shortAddress: string | null = wallet
    ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
    : null;

  return (
    <WalletContext.Provider value={{
      wallet, connecting, connectWallet, connectSpecificWallet,
      disconnectWallet, shortAddress, network,
      showWalletModal, setShowWalletModal, availableWallets,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within a WalletProvider");
  return context;
};