import { Button } from "@/components/ui/button";
import { Wallet, Send, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
      <div className="flex justify-between max-w-md mx-auto">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400"
          onClick={() => navigate("/")}
        >
          <Wallet className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400"
          onClick={() => navigate("/send")}
        >
          <Send className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400"
          onClick={() => navigate("/recovery")}
        >
          <Key className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default BottomNav;