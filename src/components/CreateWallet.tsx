import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Key, Copy, Download } from "lucide-react";

const CreateWallet = ({ onWalletCreated }: { onWalletCreated: () => void }) => {
  const [seedPhrase, setSeedPhrase] = useState("");
  const { toast } = useToast();

  const generateWallet = async () => {
    try {
      const wallet = ethers.Wallet.createRandom();
      setSeedPhrase(wallet.mnemonic?.phrase || "");
      
      // Hash the seed phrase for the smart contract
      const seedPhraseHash = ethers.keccak256(ethers.toUtf8Bytes(wallet.mnemonic?.phrase || ""));
      
      // Store wallet info securely
      localStorage.setItem("walletAddress", wallet.address);
      // Note: In a production environment, we'd want to encrypt this
      localStorage.setItem("seedPhrase", wallet.mnemonic?.phrase || "");
      
      toast({
        title: "Wallet Created Successfully",
        description: "Please save your seed phrase securely.",
      });
      
      onWalletCreated();
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast({
        title: "Error",
        description: "Failed to create wallet",
        variant: "destructive",
      });
    }
  };

  const copySeedPhrase = () => {
    navigator.clipboard.writeText(seedPhrase);
    toast({
      title: "Copied",
      description: "Seed phrase copied to clipboard",
    });
  };

  const downloadSeedPhrase = () => {
    const element = document.createElement("a");
    const file = new Blob([seedPhrase], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "dewallet-seed-phrase.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="p-4">
      <Card className="p-6 bg-gray-900 border-gray-800">
        <div className="flex items-center justify-center mb-6">
          <Key className="w-12 h-12 text-indigo-500" />
        </div>
        
        <h2 className="text-xl font-bold text-center mb-4">Create New Wallet</h2>
        
        {!seedPhrase ? (
          <Button 
            onClick={generateWallet}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            Generate Seed Phrase
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-sm break-all">{seedPhrase}</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={copySeedPhrase}
                className="flex-1 bg-gray-800 hover:bg-gray-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              
              <Button
                onClick={downloadSeedPhrase}
                className="flex-1 bg-gray-800 hover:bg-gray-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CreateWallet;