import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { API_BASE_URL } from '@/config/api';

type ChilizNFT = {
  tokenId: string;
  name: string;
  image: string;
  description?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  contractAddress: string;
  owner: string;
  partner?: {
    id: string;
    name: string;
    logo: string;
    url: string;
    baseRate: number;
  };
  transactionDetails?: {
    id: string;
    saleAmount: number;
    cashbackAmount: number;
    cashbackPercent: number;
    currency: string;
    status: string;
    transactionDate: string;
    affiliateNetwork: string;
  };
  properties?: {
    cashbackEarned: number;
    purchaseValue: number;
    cashbackRate: number;
    partnerName: string;
    transactionStatus: string;
    mintDate: string;
  };
  blockchain?: {
    contractAddress: string;
    transactionHash?: string;
    tokenId: string;
    mintStatus: string;
    network: string;
    chainId: number;
  };
};

type NFTApiResponse = {
  success: boolean;
  walletAddress: string;
  summary: {
    totalNFTs: number;
    totalCashbackEarned: number;
    totalPurchaseValue: number;
    confirmedNFTs: number;
    pendingNFTs: number;
    networksUsed: string[];
    partnersUsed: string[];
    currencies: string[];
  };
  nfts: ChilizNFT[];
};

export function useChilizNFTs() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ['chiliz_nfts', address],
    queryFn: async (): Promise<ChilizNFT[]> => {
      if (!address || !isConnected) {
        return [];
      }

      try {
        console.log('Fetching NFTs for address:', address);
        
        const response = await fetch(`${API_BASE_URL}/api/wallet/${address}/nfts`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: NFTApiResponse = await response.json();
        console.log('API Response:', data);

        if (!data.success) {
          throw new Error('API returned error');
        }

        return data.nfts || [];

      } catch (error) {
        console.error('Error fetching Chiliz NFTs from API:', error);
        throw error;
      }
    },
    enabled: !!address && isConnected,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
