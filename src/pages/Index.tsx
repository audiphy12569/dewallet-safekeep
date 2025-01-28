import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import TokenList from "@/components/TokenList";
import WalletHeader from "@/components/WalletHeader";
import BottomNav from "@/components/BottomNav";
import CreateWallet from "@/components/CreateWallet";
import { DeWalletABI } from "@/contracts/DeWalletABI";

const CONTRACT_ADDRESS = "0x608b7f1ef01600C33e34C585a85fAE8ECAfEC6D2";
const ALCHEMY_API_KEY = "cUnkmV9JNeKd-cc5uviKiJIsy6BmtSY8";

const Index = () => {
  const [hasWallet, setHasWallet] = useState(false);
  const [balance, setBalance] = useState("0.00");
  const [change, setChange] = useState({ amount: "+0.00", percentage: "+0.00%" });
  const { toast } = useToast();

  const tokens = [
    {
      symbol: "ETH",
      name: "Sepolia ETH",
      balance: balance,
      price: "$0",
      change: "+$0",
      icon: "/lovable-uploads/fcae4b49-2dcf-481d-b0d4-4df268c4d28f.png"
    },
  ];

  useEffect(() => {
    const checkWallet = () => {
      const walletAddress = localStorage.getItem("walletAddress");
      setHasWallet(!!walletAddress);
      if (walletAddress) {
        fetchBalance(walletAddress);
      }
    };
    checkWallet();
  }, []);

  const fetchBalance = async (address: string) => {
    try {
      const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleWalletCreated = () => {
    const walletAddress = localStorage.getItem("walletAddress");
    if (walletAddress) {
      fetchBalance(walletAddress);
      setHasWallet(true);
    }
  };

  if (!hasWallet) {
    return <CreateWallet onWalletCreated={handleWalletCreated} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container max-w-md mx-auto px-4 py-6">
        <WalletHeader />
        
        {/* Balance Section */}
        <div className="mt-8 text-center">
          <h1 className="text-4xl font-bold">${balance}</h1>
          <p className="text-green-500 mt-1">
            {change.amount} {change.percentage}
          </p>
        </div>

        {/* Token List */}
        <TokenList tokens={tokens} />

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};

export default Index;