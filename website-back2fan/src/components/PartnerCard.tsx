
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Partner } from '@/types/partner';

type PartnerCardProps = {
  partner: Partner;
  cashbackBonus: number | null;
  onClickPartner: (partner: Partner) => void;
};

const PartnerCard: React.FC<PartnerCardProps> = ({ partner, cashbackBonus, onClickPartner }) => {
  const { t } = useTranslation();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex flex-col gap-2 pt-4 pb-6">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-xl">
            {partner.logo}
          </span>
          <div>
            <div className="text-lg font-bold">{partner.name}</div>
            {partner.category && (
              <Badge className="bg-blue-100 text-blue-900">{partner.category}</Badge>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-gray-500">{t('cashback')}:</span>
          <span className="font-bold text-green-600 text-lg">
            {(partner.base_rate + (cashbackBonus || 0))}%
          </span>
          {cashbackBonus ? (
            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
              {t('staking_bonus', { bonus: cashbackBonus })}
            </Badge>
          ) : null}
        </div>
        {partner.cashback_by_category && Object.keys(partner.cashback_by_category).length > 0 && (
          <div className="mt-1">
            <div className="text-xs text-gray-400 mb-1">{t('cashback')} por categoria:</div>
            <ul className="flex flex-wrap gap-2">
              {Object.entries(partner.cashback_by_category).map(([cat, rate]) => (
                <li key={cat}>
                  <Badge className="bg-indigo-100 text-indigo-900">
                    {cat}: {Number(rate) + (cashbackBonus || 0)}%
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button
          onClick={() => onClickPartner(partner)}
          className="mt-4 w-full bg-gradient-to-r from-rose-500 to-red-700 text-white font-semibold hover:brightness-90 transition"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          {t('go_to_store')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PartnerCard;
