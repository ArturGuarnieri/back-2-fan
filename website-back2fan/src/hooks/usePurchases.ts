
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePurchases() {
  const { address } = useAccount();
  return useQuery({
    queryKey: ['purchases', address],
    queryFn: async () => {
      if (!address) return [];
      const { data, error } = await supabase
        .from('purchases')
        .select(`*, partner:partner_id(*)`)
        .eq('wallet_address', address)
        .order('date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!address,
  });
}
