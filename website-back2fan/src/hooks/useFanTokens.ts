import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type FanToken = {
  id: string;
  name: string;
  symbol: string;
  category: string;
  logo: string | null;
  description: string | null;
  chiliz_contract: string | null;
  coingecko_id: string | null;
  created_at: string | null;
};

// Busca os Fan Tokens do banco Supabase
export function useFanTokens() {
  return useQuery({
    queryKey: ['fan_tokens'],
    queryFn: async (): Promise<FanToken[]> => {
      const { data, error } = await supabase
        .from('fan_tokens')
        .select('id, name, symbol, category, logo, description, chiliz_contract, coingecko_id, created_at')
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
}
