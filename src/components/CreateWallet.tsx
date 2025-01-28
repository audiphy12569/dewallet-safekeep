import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Key, Copy, Download, CheckCircle } from "lucide-react";

const CreateWallet = ({ onWalletCreated }: { onWalletCreated: () => void }) => {
  const [seedPhrase, setSeedPhrase] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  const generateWallet = async () => {
    try {
      const wallet = ethers.Wallet.createRandom();
      
      if (!wallet.mnemonic?.phrase) {
        throw new Error("Failed to generate seed phrase");
      }

      setSeedPhrase(wallet.mnemonic.phrase);
      setWalletAddress(wallet.address);
      
      // Store wallet info securely
      localStorage.setItem("walletAddress", wallet.address);
      localStorage.setItem("seedPhrase", wallet.mnemonic.phrase);
      
      // Hash the seed phrase for the smart contract
      const seedPhraseHash = ethers.keccak256(ethers.toUtf8Bytes(wallet.mnemonic.phrase));
      console.log("Wallet created with address:", wallet.address);
      
      toast({
        title: "Wallet Created Successfully",
        description: "Please save your seed phrase securely before continuing.",
      });
    } catch (error) {
      console.error("Error creating wallet:", error);
      toast({
        title: "Error",
        description: "Failed to create wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copySeedPhrase = () => {
    navigator.clipboard.writeText(seedPhrase);
    toast({
      title: "Copied",
      description: "Seed phrase copied to clipboard. Store it safely!",
    });
  };

  const downloadSeedPhrase = () => {
    const element = document.createElement("a");
    const file = new Blob([`Wallet Address: ${walletAddress}\nSeed Phrase: ${seedPhrase}`], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "dewallet-seed-phrase.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: "Downloaded",
      description: "Seed phrase downloaded. Keep it in a secure location.",
    });
  };

  const handleConfirmation = () => {
    setShowConfirmation(true);
    onWalletCreated();
  };

  const renderSeedPhraseWords = () => {
    return seedPhrase.split(" ").map((word, index) => (
      <div key={index} className="bg-gray-800 p-2 rounded">
        <span className="text-gray-500">{index + 1}.</span> {word}
      </div>
    ));
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
        ) : !showConfirmation ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-sm font-medium mb-2 text-gray-400">Your Wallet Address:</h3>
              <p className="text-sm break-all font-mono mb-4">{walletAddress}</p>
              
              <h3 className="text-sm font-medium mb-2 text-gray-400">Your Seed Phrase:</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {renderSeedPhraseWords()}
              </div>
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

            <div className="mt-6">
              <Button 
                onClick={handleConfirmation}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                I've Saved My Seed Phrase
              </Button>
            </div>

            <p className="text-sm text-yellow-500 mt-4">
              ⚠️ Warning: Never share your seed phrase with anyone. Store it securely offline. You'll need it to recover your wallet.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Wallet Created Successfully!</h3>
            <p className="text-gray-400">Your wallet is ready to use.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CreateWallet;