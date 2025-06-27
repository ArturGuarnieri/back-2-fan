
import { useState, useEffect } from 'react';
import { useStaking } from './useStaking';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const { address, isConnected } = useStaking();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!address || !isConnected) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin', {
          check_wallet_address: address
        });

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data || false);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [address, isConnected]);

  return { isAdmin, loading };
};
