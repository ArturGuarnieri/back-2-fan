
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Coins, Star, Construction, Lock } from 'lucide-react';
import { useStaking } from '@/hooks/useStaking';
import Dashboard from '@/components/Dashboard';
import { useTranslation } from 'react-i18next';

const getLevelColor = (level: string) => {
    switch (level) {
      case 'Bronze': return 'bg-amber-600';
      case 'Silver': return 'bg-gray-400';
      case 'Gold': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
};

const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Bronze': return <Trophy className="w-4 h-4 text-amber-700" />;
      case 'Silver': return <Trophy className="w-4 h-4 text-gray-600" />;
      case 'Gold': return <Trophy className="w-4 h-4 text-yellow-600" />;
      default: return <Star className="w-4 h-4 text-gray-500" />;
    }
};

const DashboardPage = () => {
  const { stakingLevel, totalStaked } = useStaking();
  const { t } = useTranslation();

  const safeTotalStaked = typeof totalStaked === 'number' ? totalStaked : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('current_level')}</CardTitle>
            {getLevelIcon(stakingLevel)}
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={`${getLevelColor(stakingLevel as keyof typeof getLevelColor)} text-white`}>
                {stakingLevel ? t(`tier_${stakingLevel.toLowerCase()}`) : t('none')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('total_staked_title')}</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeTotalStaked.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t('fan_tokens')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bonus Levels - Em Desenvolvimento */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Construction className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-yellow-800">{t('bonus_levels')}</CardTitle>
              <p className="text-sm text-yellow-600">{t('feature_under_development')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <Lock className="w-12 h-12 text-yellow-500 mx-auto" />
              <p className="text-yellow-700 font-medium">{t('bonus_levels_coming_soon')}</p>
              <p className="text-sm text-yellow-600 max-w-sm">
                {t('bonus_levels_development_message')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
