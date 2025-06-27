
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, X } from 'lucide-react';

const DevelopmentModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Verificar se o modal já foi mostrado nesta sessão
    const hasSeenModal = sessionStorage.getItem('dev-modal-seen');
    if (!hasSeenModal) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('dev-modal-seen', 'true');
  };

  const handleFollowX = () => {
    window.open('https://x.com/back2fan', '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-white border-2 border-orange-200 shadow-2xl animate-scale-in">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <img src="/lovable-uploads/8038e957-dab5-457d-a12b-6f5b1b8ca374.png" alt="Back2Fan" className="w-32 h-32" />
          </div>
          <DialogTitle className="text-2xl font-bold text-orange-600 uppercase tracking-wide text-center">
            {t('dev_modal_title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <p className="text-center text-gray-700 leading-relaxed">
            {t('dev_modal_message')}
          </p>
          
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleFollowX}
              className="w-full bg-black hover:bg-gray-800 text-white flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <ExternalLink size={18} />
              {t('dev_modal_follow')}
            </Button>
            
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full border-2 border-orange-200 text-orange-600 hover:bg-orange-50 py-3 rounded-lg transition-all duration-200"
            >
              {t('dev_modal_close')}
            </Button>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default DevelopmentModal;
