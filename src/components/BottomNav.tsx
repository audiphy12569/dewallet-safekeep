import { Button } from "@/components/ui/button";
import { Wallet, Grid, Send, Zap, Globe } from "lucide-react";

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
      <div className="flex justify-between max-w-md mx-auto">
        <Button variant="ghost" size="icon" className="text-gray-400">
          <Wallet className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400">
          <Grid className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400">
          <Send className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400">
          <Zap className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400">
          <Globe className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default BottomNav;