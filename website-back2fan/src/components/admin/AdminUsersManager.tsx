
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, User, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface UserWithRole {
  wallet_address: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  roles: string[];
}

const AdminUsersManager = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      // Buscar todos os usuários (sem mostrar emails completos por padrão)
      const { data: usersData, error: usersError } = await supabase
        .from('wallet_users')
        .select('wallet_address, email, first_name, last_name, created_at');

      if (usersError) throw usersError;

      // Buscar todas as roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('wallet_address, role');

      if (rolesError) throw rolesError;

      // Combinar dados
      const usersWithRoles = usersData.map(user => ({
        ...user,
        roles: rolesData
          .filter(role => role.wallet_address === user.wallet_address)
          .map(role => role.role)
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: t('error'),
        description: t('error_loading_users') + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminRole = async (walletAddress: string, isCurrentlyAdmin: boolean) => {
    try {
      if (isCurrentlyAdmin) {
        // Remover role de admin
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('wallet_address', walletAddress)
          .eq('role', 'admin');

        if (error) throw error;
        toast({
          title: t('success'),
          description: t('admin_role_removed')
        });
      } else {
        // Adicionar role de admin
        const { error } = await supabase
          .from('user_roles')
          .insert({
            wallet_address: walletAddress,
            role: 'admin'
          });

        if (error) throw error;
        toast({
          title: t('success'),
          description: t('admin_role_added')
        });
      }

      fetchUsers(); // Recarregar dados
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: t('error'),
        description: t('error_updating_role') + error.message,
        variant: "destructive"
      });
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatEmail = (email: string) => {
    if (showSensitiveData) return email;
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    return `${username.slice(0, 2)}***@${domain}`;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <span className="ml-2">{t('loading_users')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t('manage_users_admins')}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="flex items-center gap-2"
          >
            {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showSensitiveData ? t('hide_data') : t('show_data')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">{t('wallet')}</TableHead>
                <TableHead className="min-w-[200px]">{t('email')}</TableHead>
                <TableHead className="min-w-[120px]">{t('name')}</TableHead>
                <TableHead className="min-w-[100px]">{t('roles')}</TableHead>
                <TableHead className="min-w-[140px]">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isAdmin = user.roles.includes('admin');
                const displayName = user.first_name || user.last_name 
                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                  : 'N/A';

                return (
                  <TableRow key={user.wallet_address}>
                    <TableCell className="font-mono text-sm">
                      {formatWalletAddress(user.wallet_address)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatEmail(user.email)}
                    </TableCell>
                    <TableCell className="text-sm">{displayName}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map(role => (
                          <Badge 
                            key={role} 
                            variant={role === 'admin' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {role}
                          </Badge>
                        ))}
                        {user.roles.length === 0 && (
                          <Badge variant="outline" className="text-xs">user</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={isAdmin ? "destructive" : "default"}
                        onClick={() => toggleAdminRole(user.wallet_address, isAdmin)}
                        className="text-xs px-2 py-1 h-8"
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">
                          {isAdmin ? t('remove_admin') : t('make_admin')}
                        </span>
                        <span className="sm:hidden">
                          {isAdmin ? 'Remove' : 'Admin'}
                        </span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {t('no_users_found')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsersManager;
