import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Wallet, ArrowUpRight, Plus, Send } from "lucide-react";
import TokenList from "@/components/TokenList";
import WalletHeader from "@/components/WalletHeader";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  const [balance, setBalance] = useState("0.00");
  const [change, setChange] = useState({ amount: "+0.00", percentage: "+0.00%" });
  const { toast } = useToast();

  const tokens = [
    {
      symbol: "SOL",
      name: "Solana",
      balance: "0.00",
      price: "$0",
      change: "+$0",
      icon: "/tokens/solana.png"
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      balance: "0.00",
      price: "$0",
      change: "+$0",
      icon: "/tokens/ethereum.png"
    },
    {
      symbol: "MATIC",
      name: "Polygon",
      balance: "0.00",
      price: "$0",
      change: "+$0",
      icon: "/tokens/polygon.png"
    }
  ];

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

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Deposit
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Buy
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
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