import React, { useState } from 'react';
import { apiClient } from '@/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';

const categoryColors = {
  appetizers: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  mains: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  drinks: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  desserts: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
};

export default function MenuManager({ menuItems }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', category: 'mains', available: true });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.menu.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      resetForm();
      toast.success('Item added');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add item');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.menu.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      resetForm();
      toast.success('Item updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update item');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.menu.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      toast.success('Item deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete item');
    },
  });

  const resetForm = () => {
    setFormData({ name: '', price: '', category: 'mains', available: true });
    setEditingItem(null);
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, price: parseFloat(formData.price) };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id || editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ 
      name: item.name, 
      price: item.price.toString(), 
      category: item.category, 
      available: item.available !== false 
    });
    setIsOpen(true);
  };

  return (
    <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-slate-900 dark:text-white">Menu Items</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-slate-700 dark:text-slate-300">Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-300">Price (LKR)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-300">Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectItem value="appetizers">Appetizers</SelectItem>
                    <SelectItem value="mains">Mains</SelectItem>
                    <SelectItem value="drinks">Drinks</SelectItem>
                    <SelectItem value="desserts">Desserts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.available}
                  onCheckedChange={(v) => setFormData({ ...formData, available: v })}
                />
                <Label className="text-slate-700 dark:text-slate-300">Available</Label>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1 border-slate-300 dark:border-slate-600">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900">
                  {editingItem ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-700">
                <TableHead className="text-slate-600 dark:text-slate-400">Name</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Category</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Price</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Status</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item._id || item.id} className="border-slate-200 dark:border-slate-700/50">
                  <TableCell className="text-slate-900 dark:text-white font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge className={categoryColors[item.category]}>
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-amber-500 dark:text-amber-400">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={item.available !== false ? 'default' : 'secondary'} 
                      className={item.available !== false ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}>
                      {item.available !== false ? 'Available' : 'Unavailable'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(item._id || item.id)} className="text-slate-600 dark:text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {menuItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 dark:text-slate-400 py-8">
                    No menu items yet. Add your first item!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

