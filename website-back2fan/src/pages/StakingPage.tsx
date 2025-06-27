
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StakingPage = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Construction className="w-10 h-10 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-800 mb-2">
            {t('feature_under_development')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-yellow-700">
            <Lock className="w-5 h-5" />
            <span className="text-lg font-medium">{t('staking_feature_coming_soon')}</span>
          </div>
          <p className="text-yellow-600 max-w-md mx-auto leading-relaxed">
            {t('staking_development_message')}
          </p>
          <div className="pt-4">
            <div className="inline-flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-lg">
              <span className="text-sm text-yellow-700 font-medium">
                {t('check_back_soon')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StakingPage;
