import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ethers } from "ethers";
import { DeWalletABI, CONTRACT_ADDRESS } from "@/contracts/DeWalletABI";
import BottomNav from "@/components/BottomNav";

const Send = () => {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    try {
      setIsLoading(true);
      const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY");
      const signer = new ethers.Wallet(localStorage.getItem("privateKey") || "", provider);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DeWalletABI, signer);

      const tx = await contract.transferETH(to, { value: ethers.parseEther(amount) });
      await tx.wait();

      toast({
        title: "Success",
        description: "Transaction sent successfully",
      });
    } catch (error) {
      console.error("Error sending transaction:", error);
      toast({
        title: "Error",
        description: "Failed to send transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Send ETH</h1>
        
        <div className="space-y-4">
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
            <label className="block text-sm font-medium mb-2">Amount (ETH)</label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              step="0.0001"
              placeholder="0.0"
              className="bg-gray-900 border-gray-800"
            />
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