
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface FanToken {
  id: string;
  name: string;
  symbol: string;
  logo: string | null;
  category: string;
  description: string | null;
  coingecko_id: string | null;
  chiliz_contract: string | null;
}

const AdminTokensManager = () => {
  const [tokens, setTokens] = useState<FanToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingToken, setEditingToken] = useState<FanToken | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    logo: '',
    category: '',
    description: '',
    coingecko_id: '',
    chiliz_contract: ''
  });

  const fetchTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('fan_tokens')
        .select('*')
        .order('name');

      if (error) throw error;
      setTokens(data || []);
    } catch (error: any) {
      console.error('Error fetching tokens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tokens: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingToken) {
        // Atualizar
        const { error } = await supabase
          .from('fan_tokens')
          .update(formData)
          .eq('id', editingToken.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Token atualizado com sucesso!" });
      } else {
        // Criar novo
        const { error } = await supabase
          .from('fan_tokens')
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Token criado com sucesso!" });
      }

      setIsDialogOpen(false);
      setEditingToken(null);
      resetForm();
      fetchTokens();
    } catch (error: any) {
      console.error('Error saving token:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar token: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este token?')) return;

    try {
      const { error } = await supabase
        .from('fan_tokens')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Sucesso", description: "Token excluído com sucesso!" });
      fetchTokens();
    } catch (error: any) {
      console.error('Error deleting token:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir token: " + error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      symbol: '',
      logo: '',
      category: '',
      description: '',
      coingecko_id: '',
      chiliz_contract: ''
    });
  };

  const openEditDialog = (token: FanToken) => {
    setEditingToken(token);
    setFormData({
      name: token.name,
      symbol: token.symbol,
      logo: token.logo || '',
      category: token.category,
      description: token.description || '',
      coingecko_id: token.coingecko_id || '',
      chiliz_contract: token.chiliz_contract || ''
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingToken(null);
    resetForm();
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  if (loading) {
    return <div className="p-4">Carregando tokens...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Gerenciar Fan Tokens
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Token
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingToken ? 'Editar Token' : 'Novo Token'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="symbol">Símbolo</Label>
                    <Input
                      id="symbol"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logo">Logo (emoji)</Label>
                    <Input
                      id="logo"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="coingecko_id">CoinGecko ID</Label>
                    <Input
                      id="coingecko_id"
                      value={formData.coingecko_id}
                      onChange={(e) => setFormData({ ...formData, coingecko_id: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="chiliz_contract">Contrato Chiliz</Label>
                    <Input
                      id="chiliz_contract"
                      value={formData.chiliz_contract}
                      onChange={(e) => setFormData({ ...formData, chiliz_contract: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingToken ? 'Atualizar' : 'Criar'}
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
              <TableHead>Nome</TableHead>
              <TableHead>Símbolo</TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>CoinGecko ID</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.id}>
                <TableCell className="font-medium">{token.name}</TableCell>
                <TableCell>{token.symbol}</TableCell>
                <TableCell>{token.logo}</TableCell>
                <TableCell>{token.category}</TableCell>
                <TableCell className="font-mono text-sm">{token.coingecko_id}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(token)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(token.id)}
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

export default AdminTokensManager;
