
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useStaking } from '@/hooks/useStaking';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminUsersManager from '@/components/admin/AdminUsersManager';
import AdminPartnersManager from '@/components/admin/AdminPartnersManager';
import AdminTokensManager from '@/components/admin/AdminTokensManager';
import { useTranslation } from 'react-i18next';

const AdminPage = () => {
  const { isConnected } = useStaking();
  const { isAdmin, loading } = useAdmin();
  const { t } = useTranslation();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-6">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('connect_wallet')}</h2>
            <p className="text-gray-600 text-center">
              {t('connect_wallet_admin')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('checking_permissions')}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-6">
            <Shield className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('access_denied')}</h2>
            <p className="text-gray-600 text-center">
              {t('no_admin_permission')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-red-600" />
            {t('admin_panel')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('manage_users_partners_tokens')}
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('admin_overview')}</TabsTrigger>
            <TabsTrigger value="users">{t('admin_users')}</TabsTrigger>
            <TabsTrigger value="partners">{t('admin_partners')}</TabsTrigger>
            <TabsTrigger value="tokens">{t('admin_tokens')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminUsersManager />
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <AdminPartnersManager />
          </TabsContent>

          <TabsContent value="tokens" className="space-y-6">
            <AdminTokensManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
