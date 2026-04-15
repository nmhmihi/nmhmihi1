
export interface Transaction {
  id: string;
  senderName: string;
  twdAmount: number;
  feeTwd: number;
  vndAmount: number;
  timestamp: string;
  exchangeRate: number;
  tag?: 'self' | 'other'; // To distinguish user's vs others' transactions
}

export interface ExchangeRate {
    rate: number;
    updatedAt: string;
}
