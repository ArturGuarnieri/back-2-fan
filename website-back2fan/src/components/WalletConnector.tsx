
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const WalletConnector = () => {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? 'flex justify-center' : ''}`}>
      <appkit-button size={isMobile ? 'md' : 'sm'} />
    </div>
  );
};

export default WalletConnector;
