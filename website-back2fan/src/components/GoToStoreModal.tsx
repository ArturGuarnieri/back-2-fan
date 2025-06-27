
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { useFanTokens } from "@/hooks/useFanTokens";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onClose: () => void;
  storeName: string;
  onConfirm: (tokenId: string) => Promise<void>;
  loading: boolean;
};

const GoToStoreModal: React.FC<Props> = ({
  open,
  onClose,
  storeName,
  onConfirm,
  loading,
}) => {
  const { t } = useTranslation();
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const { data: fanTokens = [], isLoading: tokensLoading } = useFanTokens();

  const handleConfirm = async () => {
    if (selectedTokenId) {
      await onConfirm(selectedTokenId);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedTokenId("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !loading && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('going_to_store_title', { storeName: storeName })}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-gray-600 text-sm">
            {t('access_will_be_registered')}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t('select_fan_token_label')}
            </label>
            <Select 
              value={selectedTokenId} 
              onValueChange={setSelectedTokenId}
              disabled={loading || tokensLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={tokensLoading ? t('loading_tokens') : t('choose_fan_token')} />
              </SelectTrigger>
              <SelectContent>
                {fanTokens.map((token) => (
                  <SelectItem key={token.id} value={token.id}>
                    <div className="flex items-center gap-2">
                      <span>{token.logo}</span>
                      <span>{token.symbol} - {token.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <strong>{t('important_label')}:</strong> {t('important_conversion_notice')}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={loading || !selectedTokenId || tokensLoading}
            className="bg-gradient-to-r from-red-500 to-red-700 text-white"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-1" /> : null}
            {t('go_to_store_btn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoToStoreModal;
