
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, TrendingUp, Gift, ExternalLink, Download, Filter, Construction, Lock, ShoppingBag } from 'lucide-react';
import { useStaking } from '@/hooks/useStaking';
import { useTranslation } from 'react-i18next';
import { usePurchases } from '@/hooks/usePurchases';
import ChilizNFTList from './ChilizNFTList';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { totalStaked, stakingLevel, cashbackBonus, defaultCurrency } = useStaking();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const { data: purchases = [], isLoading } = usePurchases();

  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      console.warn(`Could not format currency ${currency}:`, error);
      return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
    }
  };

  const cashbackHistory = purchases.map((p: any) => ({
    id: p.id,
    partner: p.partner?.name || p.partner_id,
    purchaseValue: Number(p.purchase_value),
    cashbackPercent: p.cashback_percent,
    cashbackAmount: Number(p.cashback_amount),
    date: p.date,
    status: p.status,
    currency: p.currency || 'usd',
  }));

  const totalCashbackEarned = cashbackHistory
    .filter(item => item.status === 'paid' && item.currency.toLowerCase() === (defaultCurrency || 'usd').toLowerCase())
    .reduce((sum, item) => sum + item.cashbackAmount, 0);

  const totalPurchases = purchases.length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <span className="text-gray-400">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_cashback_earned')}</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCashbackEarned, defaultCurrency || 'usd')}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('vs_last_month')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_purchases')}</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases}</div>
            <p className="text-xs text-muted-foreground">
              {t('total_purchases_made')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity History */}
      <Card>
        <CardHeader>
          <CardTitle>{t('activity_history')}</CardTitle>
          <CardDescription>{t('track_transactions')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="purchases" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="purchases">{t('purchases')}</TabsTrigger>
              <TabsTrigger value="staking">{t('staking')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="purchases" className="space-y-6">
              {/* NFTs Section - Each purchase generates an NFT */}
              <div className="space-y-4">
                <ChilizNFTList />
              </div>
            </TabsContent>
            
            <TabsContent value="staking">
              {/* Staking - Em Desenvolvimento */}
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <Construction className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-yellow-800">{t('staking')}</h3>
                    <p className="text-yellow-600">{t('feature_under_development')}</p>
                  </div>
                  <p className="text-sm text-yellow-600 max-w-sm">
                    {t('staking_development_message')}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
