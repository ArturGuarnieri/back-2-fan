
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useFanTokens } from "@/hooks/useFanTokens";

export function useWalletBalances() {
  const { address, isConnected } = useAccount();
  const { data: tokens = [] } = useFanTokens();

  // Fetch CHZ balance from Chiliz Explorer API
  const fetchChzBalance = async () => {
    if (!address || !isConnected) return 0;
    
    try {
      const response = await fetch(`https://scan.chiliz.com/api?module=account&action=balance&address=${address}`);
      const data = await response.json();
      
      if (data.status === '1' && data.result) {
        // Convert from wei to CHZ (18 decimals)
        const balanceInWei = data.result;
        const balanceInChz = parseFloat(balanceInWei) / Math.pow(10, 18);
        return balanceInChz;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching CHZ balance:', error);
      return 0;
    }
  };

  const { data: chzBalance = 0 } = useQuery({
    queryKey: ['chz_balance', address],
    queryFn: fetchChzBalance,
    enabled: !!address && isConnected,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch token balances from Chiliz Explorer API
  const fetchTokenBalances = async () => {
    if (!address || !isConnected || !tokens.length) return {};

    const tokenBalances: Record<string, number> = {};

    for (const token of tokens) {
      if (token.chiliz_contract) {
        try {
          const response = await fetch(
            `https://scan.chiliz.com/api?module=account&action=tokenbalance&contractaddress=${token.chiliz_contract}&address=${address}`
          );
          const data = await response.json();
          
          if (data.status === '1' && data.result) {
            // Get token decimals
            const decimalsResponse = await fetch(
              `https://scan.chiliz.com/api?module=token&action=getToken&contractaddress=${token.chiliz_contract}`
            );
            const decimalsData = await decimalsResponse.json();
            
            const decimals = decimalsData.result?.decimals || 18;
            const balanceInWei = data.result;
            const balance = parseFloat(balanceInWei) / Math.pow(10, decimals);
            
            tokenBalances[token.symbol] = balance;
          } else {
            tokenBalances[token.symbol] = 0;
          }
        } catch (error) {
          console.error(`Error fetching balance for ${token.symbol}:`, error);
          tokenBalances[token.symbol] = 0;
        }
      }
    }

    return tokenBalances;
  };

  const { data: tokenBalances = {} } = useQuery({
    queryKey: ['token_balances', address, tokens.map(t => t.chiliz_contract).join(",")],
    queryFn: fetchTokenBalances,
    enabled: !!address && isConnected && tokens.length > 0,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    data: {
      native: chzBalance,
      tokens: tokenBalances,
    },
    isLoading: false, // We'll handle loading states individually
  };
}
