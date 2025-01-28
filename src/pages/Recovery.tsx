import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ethers } from "ethers";
import { DeWalletABI, CONTRACT_ADDRESS } from "@/contracts/DeWalletABI";
import BottomNav from "@/components/BottomNav";

const Recovery = () => {
  const [seedPhrase, setSeedPhrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRecovery = async () => {
    try {
      setIsLoading(true);
      const provider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY");
      const signer = new ethers.Wallet(localStorage.getItem("privateKey") || "", provider);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DeWalletABI, signer);

      // Hash the seed phrase
      const seedPhraseHash = ethers.keccak256(ethers.toUtf8Bytes(seedPhrase));
      
      // Initiate recovery
      const tx = await contract.initiateRecovery(seedPhraseHash);
      await tx.wait();

      toast({
        title: "Success",
        description: "Recovery process initiated successfully",
      });
    } catch (error) {
      console.error("Error initiating recovery:", error);
      toast({
        title: "Error",
        description: "Failed to initiate recovery",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Recover Wallet</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Enter Seed Phrase</label>
            <Input
              value={seedPhrase}
              onChange={(e) => setSeedPhrase(e.target.value)}
              placeholder="Enter your 12-word seed phrase"
              className="bg-gray-900 border-gray-800"
            />
          </div>

          <Button
            onClick={handleRecovery}
            disabled={isLoading || !seedPhrase}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? "Recovering..." : "Recover Wallet"}
          </Button>
        </div>

        <BottomNav />
      </div>
    </div>
  );
};

export default Recovery;