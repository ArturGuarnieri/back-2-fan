
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Store, Coins, ShoppingCart, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

interface Stats {
  totalUsers: number;
  totalPartners: number;
  totalTokens: number;
  totalPurchases: number;
  totalCashback: number;
}

const AdminOverview = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPartners: 0,
    totalTokens: 0,
    totalPurchases: 0,
    totalCashback: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Buscar estatísticas de todas as tabelas
      const [usersResult, partnersResult, tokensResult, purchasesResult] = await Promise.all([
        supabase.from('wallet_users').select('*', { count: 'exact', head: true }),
        supabase.from('partners').select('*', { count: 'exact', head: true }),
        supabase.from('fan_tokens').select('*', { count: 'exact', head: true }),
        supabase.from('purchases').select('cashback_amount')
      ]);

      const totalCashback = purchasesResult.data?.reduce((sum, purchase) => sum + Number(purchase.cashback_amount), 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalPartners: partnersResult.count || 0,
        totalTokens: tokensResult.count || 0,
        totalPurchases: purchasesResult.data?.length || 0,
        totalCashback
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-4">{t('loading_statistics')}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('total_users')}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('total_partners')}</CardTitle>
          <Store className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPartners}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('total_fan_tokens')}</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTokens}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('total_purchases')}</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPurchases}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('total_cashback')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {stats.totalCashback.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
