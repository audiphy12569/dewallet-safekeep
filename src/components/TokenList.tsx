import { Token } from "@/types/wallet";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TokenListProps {
  tokens: Token[];
}

const TokenList = ({ tokens }: TokenListProps) => {
  return (
    <div className="mt-8 space-y-4">
      {tokens.map((token) => (
        <Card key={token.symbol} className="p-4 bg-gray-900 border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={token.icon} alt={token.name} />
                <AvatarFallback>{token.symbol}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{token.name}</h3>
                <p className="text-sm text-gray-400">{token.balance} {token.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">{token.price}</p>
              <p className="text-sm text-green-500">{token.change}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TokenList;