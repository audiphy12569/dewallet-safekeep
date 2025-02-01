import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ethers } from "ethers";
import { DeWalletABI, CONTRACT_ADDRESS } from "@/contracts/DeWalletABI";

const ALCHEMY_API_KEY = "cUnkmV9JNeKd-cc5uviKiJIsy6BmtSY8";

interface CreateWalletProps {
  onWalletCreated?: () => void;
}

const CreateWallet = ({ onWalletCreated }: CreateWalletProps) => {
  const [seedPhrase, setSeedPhrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateWallet = async () => {
    try {
      setIsLoading(true);

      // Generate a new wallet
      const wallet = ethers.Wallet.createRandom();
      const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
      const signer = wallet.connect(provider);

      // Create wallet in smart contract
      const contract = new ethers.Contract(CONTRACT_ADDRESS, DeWalletABI, signer);
      const seedPhraseHash = ethers.keccak256(ethers.toUtf8Bytes(wallet.mnemonic?.phrase || ""));
      
      const tx = await contract.createWallet(seedPhraseHash);
      await tx.wait();

      // Encrypt private key with seed phrase
      const encryptedKey = await wallet.encrypt(wallet.mnemonic?.phrase || "");

      // Store wallet data
      localStorage.setItem("walletAddress", wallet.address);
      localStorage.setItem("encryptedPrivateKey", encryptedKey);
      localStorage.setItem("seedPhrase", wallet.mnemonic?.phrase || "");

      setSeedPhrase(wallet.mnemonic?.phrase || "");

      toast({
        title: "Success",
        description: "Wallet created successfully!",
      });

      if (onWalletCreated) {
        onWalletCreated();
      }

    } catch (error) {
      console.error("Error creating wallet:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Create Wallet</h1>
        
        {!seedPhrase ? (
          <div className="space-y-4">
            <p className="text-gray-400">
              Create a new wallet to start using the application. Your seed phrase will be generated automatically.
            </p>
            
            <Button
              onClick={handleCreateWallet}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? "Creating..." : "Create Wallet"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-2">Your Seed Phrase</h3>
              <p className="text-sm text-gray-400 break-all">{seedPhrase}</p>
            </div>
            
            <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-4">
              <p className="text-yellow-500 text-sm">
                Warning: Save this seed phrase somewhere safe. You'll need it to recover your wallet.
              </p>
            </div>
            
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Continue to Wallet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateWallet;