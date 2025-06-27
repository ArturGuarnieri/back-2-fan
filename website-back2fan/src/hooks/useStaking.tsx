
import { useState, useEffect, useContext, createContext, ReactNode } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/integrations/supabase/client";

type StakingContextType = {
  userEmail: string | null;
  firstName: string | null;
  lastName: string | null;
  totalStaked: number | null;
  stakingLevel: string | null;
  cashbackBonus: number | null;
  loading: boolean;
  error: string | null;
  reloadUser: () => void;
  defaultCurrency: string | null;
  setDefaultCurrency: (currency: string) => void;
  isConnected: boolean;
  address?: string | null;
  needsRegistration: boolean;
  completeRegistration: () => void;
};

const StakingContext = createContext<StakingContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const StakingProvider: React.FC<Props> = ({ children }) => {
  const { address, isConnected } = useAccount();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [totalStaked, setTotalStaked] = useState<number | null>(0);
  const [stakingLevel, setStakingLevel] = useState<string | null>(null);
  const [cashbackBonus, setCashbackBonus] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultCurrency, setDefaultCurrency] = useState<string | null>(null);
  const [needsRegistration, setNeedsRegistration] = useState(false);

  const resetState = () => {
    setUserEmail(null);
    setFirstName(null);
    setLastName(null);
    setTotalStaked(0);
    setStakingLevel(null);
    setCashbackBonus(0);
    setDefaultCurrency(null);
    setNeedsRegistration(false);
  };

  const fetchUser = async () => {
    if (!address || !isConnected) {
      resetState();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from("wallet_users")
        .select("*")
        .eq("wallet_address", address)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      let user;
      if (!existingUser) {
        const { data: newUser, error: insertError } = await supabase
          .from("wallet_users")
          .insert({ wallet_address: address, email: '' })
          .select()
          .single();
        if (insertError) throw insertError;
        user = newUser;
      } else {
        user = existingUser;
      }

      if (user) {
        const isRegistrationComplete = user.first_name && user.last_name && user.email && user.email.trim() !== '';
        
        if (!isRegistrationComplete) {
          setNeedsRegistration(true);
        } else {
          setNeedsRegistration(false);
        }

        setUserEmail(user.email);
        setFirstName(user.first_name);
        setLastName(user.last_name);
        setTotalStaked(user.staked_tokens || 0);
        setStakingLevel(user.staking_level);
        setCashbackBonus(user.cashback_bonus || 0);
        setDefaultCurrency(user.default_currency);
      }
    } catch (err: any) {
      console.error("Error fetching or creating user:", err);
      setError("Failed to load user profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const reloadUser = () => {
    fetchUser();
  };

  const completeRegistration = () => {
    setNeedsRegistration(false);
    fetchUser();
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, [address, isConnected]);

  const value: StakingContextType = {
    userEmail,
    firstName,
    lastName,
    totalStaked,
    stakingLevel,
    cashbackBonus,
    loading,
    error,
    reloadUser,
    defaultCurrency,
    setDefaultCurrency,
    isConnected: !!isConnected,
    address,
    needsRegistration,
    completeRegistration,
  };

  return (
    <StakingContext.Provider value={value}>
      {children}
    </StakingContext.Provider>
  );
};

export function useStaking(): StakingContextType {
  const context = useContext(StakingContext);
  if (context === undefined) {
    throw new Error("useStaking must be used within a StakingProvider");
  }
  return context;
}
