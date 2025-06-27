
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSignature } from "@/hooks/useSignature";
import { useStaking } from "@/hooks/useStaking";
import { Label } from "@/components/ui/label";
import { FIAT_CURRENCIES } from "@/utils/fiatCurrencies";
import { useTranslation } from "react-i18next";

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { address } = useAccount();
  const { userEmail, firstName, lastName, defaultCurrency, loading: stakingLoading, reloadUser } = useStaking();

  const [email, setEmail] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [currency, setCurrency] = useState("usd");

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const { signMessage, loading: sigLoading, error: sigError } = useSignature();

  useEffect(() => {
    setEmail(userEmail || "");
    setNewFirstName(firstName || "");
    setNewLastName(lastName || "");
    setCurrency(defaultCurrency || "usd");
  }, [userEmail, firstName, lastName, defaultCurrency]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const msg = `Confirm profile update for wallet ${address}`;
    const signature = await signMessage(msg);
    if (!signature) {
      setFeedback({type: 'error', message: t('signature_rejected')});
      setSaving(false);
      return;
    }

    const updates = {
      email: email,
      first_name: newFirstName,
      last_name: newLastName,
      default_currency: currency
    };

    const { error } = await supabase
      .from("wallet_users")
      .update(updates)
      .eq("wallet_address", address);
      
    setSaving(false);
    if (error) {
      setFeedback({type: 'error', message: t('update_profile_error')});
      return;
    }
    setFeedback({type: 'success', message: t('profile_updated_success')});
    reloadUser && reloadUser();
    setTimeout(() => window.location.reload(), 1500);
  };
  
  const loading = stakingLoading;

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">{t('settings')}</h1>
      {loading ? (
        <div>{t('loading')}</div>
      ) : (
        <div>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('first_name')}</Label>
              <Input
                id="firstName"
                type="text"
                placeholder={t('first_name')}
                value={newFirstName}
                required
                disabled={saving || sigLoading}
                onChange={e => setNewFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('last_name')}</Label>
              <Input
                id="lastName"
                type="text"
                placeholder={t('last_name')}
                value={newLastName}
                required
                disabled={saving || sigLoading}
                onChange={e => setNewLastName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('email')}
                value={email}
                required
                disabled={saving || sigLoading}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_currency">{t('default_currency')}</Label>
              <select
                id="default_currency"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                disabled={saving || sigLoading}
              >
                {FIAT_CURRENCIES.map(fc => (
                  <option key={fc.code} value={fc.code}>{fc.label}</option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={saving || sigLoading || !email || !newFirstName || !newLastName}>
              {saving || sigLoading ? t('loading') : t('update_profile')}
            </Button>
            {sigError && <div className="text-red-500 text-xs">{sigError}</div>}
            {feedback && <div className={`text-xs ${feedback.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{feedback.message}</div>}
          </form>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
