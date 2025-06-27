
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Store } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

interface Partner {
  id: string;
  name: string;
  logo: string | null;
  url: string | null;
  base_rate: number;
  category: string | null;
  featured: boolean | null;
  country: string[];
}

const AdminPartnersManager = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    url: '',
    base_rate: 5,
    category: '',
    featured: false,
    country: ['BR']
  });

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('name');

      if (error) throw error;
      setPartners(data || []);
    } catch (error: any) {
      console.error('Error fetching partners:', error);
      toast({
        title: t('error'),
        description: t('partner_create_error') + ' ' + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPartner) {
        // Atualizar
        const { error } = await supabase
          .from('partners')
          .update(formData)
          .eq('id', editingPartner.id);

        if (error) throw error;
        toast({ title: t('success'), description: t('partner_updated_success') });
      } else {
        // Criar novo
        const { error } = await supabase
          .from('partners')
          .insert([formData]);

        if (error) throw error;
        toast({ title: t('success'), description: t('partner_created_success') });
      }

      setIsDialogOpen(false);
      setEditingPartner(null);
      resetForm();
      fetchPartners();
    } catch (error: any) {
      console.error('Error saving partner:', error);
      toast({
        title: t('error'),
        description: (editingPartner ? t('partner_update_error') : t('partner_create_error')) + ' ' + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('delete_partner_confirm'))) return;

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: t('success'), description: t('partner_deleted_success') });
      fetchPartners();
    } catch (error: any) {
      console.error('Error deleting partner:', error);
      toast({
        title: t('error'),
        description: t('partner_delete_error') + ' ' + error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '',
      url: '',
      base_rate: 5,
      category: '',
      featured: false,
      country: ['BR']
    });
  };

  const openEditDialog = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      logo: partner.logo || '',
      url: partner.url || '',
      base_rate: partner.base_rate,
      category: partner.category || '',
      featured: partner.featured || false,
      country: partner.country
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingPartner(null);
    resetForm();
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  if (loading) {
    return <div className="p-4">{t('loading_partners')}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            {t('manage_partners')}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                {t('new_partner')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPartner ? t('edit_partner') : t('new_partner')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('partner_name')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="logo">{t('logo_emoji')}</Label>
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="url">{t('url')}</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="base_rate">{t('base_rate')}</Label>
                  <Input
                    id="base_rate"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.base_rate}
                    onChange={(e) => setFormData({ ...formData, base_rate: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">{t('category')}</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <Label htmlFor="featured">{t('featured')}</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingPartner ? t('update') : t('create')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>{t('base_rate')}</TableHead>
              <TableHead>{t('category')}</TableHead>
              <TableHead>{t('countries')}</TableHead>
              <TableHead>{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((partner) => (
              <TableRow key={partner.id}>
                <TableCell className="font-medium">{partner.name}</TableCell>
                <TableCell>{partner.logo}</TableCell>
                <TableCell>{partner.base_rate}%</TableCell>
                <TableCell>{partner.category}</TableCell>
                <TableCell>{partner.country.join(', ')}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(partner)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(partner.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminPartnersManager;
