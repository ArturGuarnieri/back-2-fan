
import { useQuery } from '@tanstack/react-query';
import { useFanTokens } from "@/hooks/useFanTokens";
import { useStaking } from "@/hooks/useStaking";

/**
 * Tipo para preços e dados dos tokens retornados pela CoinGecko.
 */
type TokenPriceData = {
  [symbol: string]: {
    usd?: number;
    usd_24h_change?: number;
    usd_24h_vol?: number;
    usd_market_cap?: number;
  } | undefined;
};

/**
 * Hook para carregar preços e métricas dos tokens do banco, consultando CoinGecko com base no campo `coingecko_id`.
 */
export function useTokenPrices() {
  const { data: tokens = [] } = useFanTokens();
  const { defaultCurrency } = useStaking(); // pega a moeda escolhida, default para "usd"

  return useQuery({
    queryKey: ['fan_token_prices', tokens.map(t => t.symbol).join(','), defaultCurrency || "usd"],
    queryFn: async (): Promise<TokenPriceData> => {
      if (!tokens.length) return {};

      const currency = defaultCurrency || "usd";

      // Filtra tokens com coingecko_id válido
      const tokensWithGecko = tokens
        .filter(token => token.coingecko_id && token.coingecko_id.trim() !== "")
        .map(token => ({
          symbol: token.symbol,
          coingeckoId: token.coingecko_id as string,
        }));

      const ids = tokensWithGecko.map(t => t.coingeckoId);

      if (!ids.length) return {};

      // Consulta CoinGecko para a moeda do user
      // https://api.coingecko.com/api/v3/simple/price?ids=ID1,ID2&vs_currencies=usd,eur,brl etc
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=${currency}&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
      const resp = await fetch(url);
      
      if (!resp.ok) {
        throw new Error('API_ERROR');
      }

      const data = await resp.json();

      // Conta quantos tokens conseguimos obter dados
      let successCount = 0;
      const result: TokenPriceData = {};
      
      for (const { symbol, coingeckoId } of tokensWithGecko) {
        if (coingeckoId && data[coingeckoId]) {
          result[symbol] = {
            [currency]: data[coingeckoId][currency],
            [`${currency}_24h_change`]: data[coingeckoId][`${currency}_24h_change`],
            [`${currency}_24h_vol`]: data[coingeckoId][`${currency}_24h_vol`],
            [`${currency}_market_cap`]: data[coingeckoId][`${currency}_market_cap`],
          };
          successCount++;
        } else {
          result[symbol] = undefined;
        }
      }
      
      for (const token of tokens) {
        if (!token.coingecko_id || token.coingecko_id.trim() === "") {
          result[token.symbol] = undefined;
        }
      }

      // Se menos de 50% dos tokens com coingecko_id obtiveram dados, considera erro da API
      if (tokensWithGecko.length > 0 && successCount < tokensWithGecko.length * 0.5) {
        throw new Error('API_ERROR');
      }

      return result;
    },
    enabled: !!tokens.length,
    staleTime: 60 * 1000, // 1 minuto
  });
}
