export interface Token {
  symbol: string;
  name: string;
  balance: string;
  price: string;
  change: string;
  icon: string;
}

export interface WalletDetails {
  owner: string;
  isActive: boolean;
  createdAt: number;
  lastActivity: number;
}