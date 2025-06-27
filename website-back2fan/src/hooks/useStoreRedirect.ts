
import { useState } from 'react';
import { useStaking } from '@/hooks/useStaking';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { API_BASE_URL } from '@/config/api';
import { Partner } from '@/types/partner';

export function useStoreRedirect() {
  const { address } = useStaking();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [selectedStore, setSelectedStore] = useState<Partner | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const handleClickPartner = (partner: Partner) => {
    setSelectedStore(partner);
    setModalOpen(true);
  };

  async function handleConfirmGoToStore(selectedTokenId: string) {    
    if (!selectedStore || !address || !selectedTokenId) {
      toast({
        title: 'Erro',
        description: 'Dados necessários não encontrados',
        variant: 'destructive'
      });
      return;
    }
    
    setModalLoading(true);
    
    try {
      // 1. Registrar o clique na store_clicks
      const { error: clickError } = await supabase.from('store_clicks').insert({
        wallet_address: address,
        partner_id: selectedStore.id,
      });

      if (clickError) {
        throw clickError;
      }

      // 2. Buscar dados do usuário para obter o userId
      const { data: userData, error: userError } = await supabase
        .from('wallet_users')
        .select('id')
        .eq('wallet_address', address)
        .single();

      if (userError || !userData?.id) {
        throw new Error('Usuário não encontrado');
      }

      // 3. Determinar a rede de afiliados baseada nos IDs disponíveis
      let network = null;
      if (selectedStore.awin_advertiser_id) {
        network = 'awin';
      } else if (selectedStore.rakuten_advertiser_id) {
        network = 'rakuten';
      }

      // 4. Se tem network configurada, gerar link rastreado
      if (network && selectedStore.url) {
        const trackLinkPayload = {
          url: selectedStore.url,
          userId: userData.id,
          network: network,
          tokenId: selectedTokenId
        };

        const trackResponse = await fetch(`${API_BASE_URL}/api/track-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(trackLinkPayload)
        });

        if (!trackResponse.ok) {
          const errorText = await trackResponse.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }
          throw new Error(errorData.error || 'Erro ao gerar link rastreado');
        }

        const trackData = await trackResponse.json();
        
        // Redirecionar para o link rastreado
        window.open(trackData.trackedUrl, "_blank", "noopener");
      } else {
        // Se não tem network configurada, redirecionar diretamente para a URL original
        if (selectedStore.url) {
          window.open(selectedStore.url, "_blank", "noopener");
        }
      }
      
      toast({
        title: 'Sucesso',
        description: t('redirect_success'),
      });

    } catch (error: any) {
      console.error('Erro ao processar redirecionamento:', error);
      
      // Fallback: redirecionar para URL original se houver erro
      if (selectedStore.url) {
        window.open(selectedStore.url, "_blank", "noopener");
        toast({
          title: 'Aviso',
          description: t('redirect_fallback'),
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Erro',
          description: t('redirect_error'),
          variant: 'destructive'
        });
      }
    } finally {
      setModalLoading(false);
      setModalOpen(false);
    }
  }

  return {
    selectedStore,
    modalOpen,
    modalLoading,
    handleClickPartner,
    handleConfirmGoToStore,
    setModalOpen
  };
}
