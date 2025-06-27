
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSignature } from "@/hooks/useSignature";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "wagmi";
import { useTranslation } from "react-i18next";

interface UserRegistrationModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const UserRegistrationModal: React.FC<UserRegistrationModalProps> = ({ isOpen, onComplete }) => {
  const { t } = useTranslation();
  const { address } = useAccount();
  const { signMessage, loading: sigLoading } = useSignature();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !address) return;

    setSaving(true);
    setError(null);

    try {
      const msg = `Complete registration for wallet ${address}`;
      const signature = await signMessage(msg);
      if (!signature) {
        setError("Signature required to complete registration");
        setSaving(false);
        return;
      }

      const { error: insertError } = await supabase
        .from("wallet_users")
        .update({
          first_name: firstName,
          last_name: lastName,
          email: email
        })
        .eq("wallet_address", address);

      if (insertError) throw insertError;

      onComplete();
    } catch (err: any) {
      console.error("Registration error:", err);
      setError("Error completing registration: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center">{t('user_registration_title')}</DialogTitle>
          <p className="text-sm text-gray-600 text-center">{t('user_registration_subtitle')}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t('first_name')}</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={saving || sigLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t('last_name')}</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={saving || sigLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={saving || sigLoading}
            />
          </div>
          <Button 
            type="submit" 
            disabled={saving || sigLoading || !firstName || !lastName || !email}
            className="w-full"
          >
            {saving || sigLoading ? t('loading') : t('complete_registration')}
          </Button>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserRegistrationModal;
