export interface Coin {
  productId: number;
  id: string;
  name: string;
  image: string;
  currentPrice: number;
  priceChangePercentage24h: number;
  sparkline: number[];
  marketCap: number;
  tradingVolume: number;
  symbol: string;
}
  
  export interface OHLCData {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
  }

  export type RootStackParamList = {
    MarketOverview: undefined; // No parameters for MarketOverview
    CoinDetails: { selectedCoin: Coin }; // CoinDetails expects coinId
  };