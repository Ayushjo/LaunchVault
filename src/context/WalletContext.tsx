import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface WalletOption {
  name: string;
  icon: string;
  provider: ExternalProvider | null;
  comingSoon?: boolean;
}

interface ExternalProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (
    event: string,
    handler: (...args: unknown[]) => void,
  ) => void;
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
  chainId: string | null;
  showWalletModal: boolean;
  setShowWalletModal: (value: boolean) => void;
  availableWallets: WalletOption[];
  switchToTenderly: () => Promise<void>;
  isCorrectNetwork: boolean;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

const TENDERLY_CHAIN_ID = "0x26f7"; // 9991 in hex
const TENDERLY_RPC =
  "https://virtual.mainnet.eu.rpc.tenderly.co/45a59347-a54d-40a5-916a-d594f88b45fb";

const NETWORK_NAMES: Record<string, string> = {
  "0x1": "Ethereum",
  "0x89": "Polygon",
  "0x13881": "Mumbai",
  "0xaa36a7": "Sepolia",
  "0x7a69": "Localhost",
  "0x26f7": "LaunchVault Testnet",
  "0x13882": "Polygon Amoy",
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [network, setNetwork] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([]);

  const isCorrectNetwork = chainId === TENDERLY_CHAIN_ID;

  // Detect available wallets
  useEffect(() => {
    const detect = () => {
      const wallets: WalletOption[] = [];
      if (window.ethereum) {
        if (window.ethereum.providers?.length) {
          window.ethereum.providers.forEach((p: ExternalProvider) => {
            if (p.isMetaMask)
              wallets.push({ name: "MetaMask", icon: "🦊", provider: p });
            if (p.isPhantom)
              wallets.push({ name: "Phantom", icon: "👻", provider: p });
            if (p.isCoinbaseWallet)
              wallets.push({
                name: "Coinbase Wallet",
                icon: "🔵",
                provider: p,
              });
          });
        } else {
          if (window.ethereum.isMetaMask)
            wallets.push({
              name: "MetaMask",
              icon: "🦊",
              provider: window.ethereum,
            });
          else if (window.ethereum.isPhantom)
            wallets.push({
              name: "Phantom",
              icon: "👻",
              provider: window.ethereum,
            });
          else if (window.ethereum.isCoinbaseWallet)
            wallets.push({
              name: "Coinbase Wallet",
              icon: "🔵",
              provider: window.ethereum,
            });
          else
            wallets.push({
              name: "Browser Wallet",
              icon: "🌐",
              provider: window.ethereum,
            });
        }
      }
      wallets.push({
        name: "WalletConnect",
        icon: "🔗",
        provider: null,
        comingSoon: true,
      });
      setAvailableWallets(wallets);
    };
    detect();
  }, []);

  // Fetch network using direct eth_chainId call
  const fetchNetwork = async () => {
    if (!window.ethereum) return;
    try {
      const id: string = await window.ethereum.request({
        method: "eth_chainId",
      });
      console.log("chainId fetched:", id);
      setChainId(id);
      setNetwork(NETWORK_NAMES[id] ?? `Chain ${parseInt(id, 16)}`);
    } catch (err) {
      console.error("Network fetch failed:", err);
    }
  };

  // Auto-connect if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return;
      try {
        const accounts: string[] = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          await fetchNetwork();
        }
      } catch (err) {
        console.error("Auto-connect failed:", err);
      }
    };
    checkConnection();
  }, []);

  // Listen for account/network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length === 0) {
        setWallet(null);
        setNetwork(null);
        setChainId(null);
      } else {
        setWallet(accs[0]);
      }
    };

    const handleChainChanged = (id: unknown) => {
      const newId = id as string;
      console.log("chainChanged event:", newId);
      setChainId(newId);
      setNetwork(NETWORK_NAMES[newId] ?? `Chain ${parseInt(newId, 16)}`);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  const connectWallet = () => {
    if (!window.ethereum) {
      alert("No wallet found. Please install MetaMask.");
      return;
    }
    setShowWalletModal(true);
  };

  const connectSpecificWallet = async (walletOption: WalletOption) => {
    if (walletOption.comingSoon || !walletOption.provider) return;
    try {
      setConnecting(true);
      setShowWalletModal(false);
      const accounts: string[] = await walletOption.provider.request({
        method: "eth_requestAccounts",
      });
      setWallet(accounts[0]);
      await fetchNetwork();
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setConnecting(false);
    }
  };

  const switchToTenderly = async () => {
    if (!window.ethereum) return;
    try {
      // Try switching first
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: TENDERLY_CHAIN_ID }],
      });
      await fetchNetwork();
    } catch (err: any) {
      // Chain not added — add it
      if (err.code === 4902 || err.code === -32603) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: TENDERLY_CHAIN_ID,
                chainName: "LaunchVault Testnet",
                rpcUrls: [TENDERLY_RPC],
                nativeCurrency: {
                  name: "Ethereum",
                  symbol: "ETH",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://dashboard.tenderly.co"],
              },
            ],
          });
          await fetchNetwork();
        } catch (addErr) {
          console.error("Failed to add network:", addErr);
        }
      } else {
        console.error("Failed to switch network:", err);
      }
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setNetwork(null);
    setChainId(null);
  };

  const shortAddress: string | null = wallet
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
        chainId,
        showWalletModal,
        setShowWalletModal,
        availableWallets,
        switchToTenderly,
        isCorrectNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (!context)
    throw new Error("useWallet must be used within a WalletProvider");
  return context;
};
