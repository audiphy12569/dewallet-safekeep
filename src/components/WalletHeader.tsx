import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronDown, Scan } from "lucide-react";

const WalletHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <Avatar className="h-8 w-8">
        <AvatarImage src="/lovable-uploads/fcae4b49-2dcf-481d-b0d4-4df268c4d28f.png" />
        <AvatarFallback>DW</AvatarFallback>
      </Avatar>
      
      <Button variant="ghost" className="text-white">
        Wallet 1
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
      
      <Button variant="ghost" size="icon">
        <Scan className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default WalletHeader;