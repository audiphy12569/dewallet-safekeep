import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ethers } from "ethers";
import { DeWalletABI, CONTRACT_ADDRESS } from "@/contracts/DeWalletABI";
import BottomNav from "@/components/BottomNav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

const ALCHEMY_API_KEY = "cUnkmV9JNeKd-cc5uviKiJIsy6BmtSY8";

const Send = () => {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("ETH");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch ETH balance
  const { data: ethBalance } = useQuery({
    queryKey: ['ethBalance'],
    queryFn: async () => {
      const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
      const walletAddress = localStorage.getItem("walletAddress");
      if (!walletAddress) return "0";
      const balance = await provider.getBalance(walletAddress);
      return ethers.formatEther(balance);
    }
  });

  const handleSend = async () => {
    if (!to || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const privateKey = localStorage.getItem("privateKey");
    if (!privateKey) {
      toast({
        title: "Error",
        description: "No wallet found. Please create a wallet first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
      const signer = new ethers.Wallet(privateKey, provider);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DeWalletABI, signer);

      let tx;
      if (selectedToken === "ETH") {
        tx = await contract.transferETH(to, { value: ethers.parseEther(amount) });
      } else {
        // For ERC20 tokens (to be implemented when tokens are available)
        // tx = await contract.transferToken(tokenAddress, to, ethers.parseEther(amount));
      }

      await tx.wait();

      toast({
        title: "Success",
        description: "Transaction sent successfully",
      });

      // Clear form
      setTo("");
      setAmount("");
    } catch (error) {
      console.error("Error sending transaction:", error);
      toast({
        title: "Error",
        description: "Failed to send transaction. Please check your balance and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Send</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Token</label>
            <Select
              value={selectedToken}
              onValueChange={setSelectedToken}
            >
              <SelectTrigger className="bg-gray-900 border-gray-800">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETH">Sepolia ETH ({ethBalance || "0"} ETH)</SelectItem>
                {/* Add more tokens here when available */}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Recipient Address</label>
            <Input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="0x..."
              className="bg-gray-900 border-gray-800"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Amount</label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              step="0.0001"
              placeholder="0.0"
              className="bg-gray-900 border-gray-800"
            />
            {selectedToken === "ETH" && ethBalance && (
              <p className="text-sm text-gray-400 mt-1">
                Available: {ethBalance} ETH
              </p>
            )}
          </div>

          <Button
            onClick={handleSend}
            disabled={isLoading || !to || !amount}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default Send;