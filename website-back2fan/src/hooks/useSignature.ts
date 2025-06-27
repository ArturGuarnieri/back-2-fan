
import { useState } from "react";
import { useWalletClient } from "wagmi";

export function useSignature() {
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signMessage(message: string): Promise<string | null> {
    setLoading(true);
    setError(null);
    try {
      if (!walletClient) throw new Error("Wallet não conectada");
      const address = walletClient.account.address;
      const sig = await walletClient.signMessage({ account: address, message });
      setLoading(false);
      return sig;
    } catch (e: any) {
      setError(e.message || String(e));
      setLoading(false);
      return null;
    }
  }

  return { signMessage, loading, error };
}
