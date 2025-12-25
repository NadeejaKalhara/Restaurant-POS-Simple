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
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';

export default function DiscountManager({ discounts }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'percentage',
    value: '',
    minPurchase: '',
    maxDiscount: '',
    active: true,
    usageLimit: '',
    validUntil: '',
  });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.discounts.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      resetForm();
      toast.success('Discount created');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create discount');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.discounts.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      resetForm();
      toast.success('Discount updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update discount');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.discounts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Discount deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete discount');
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'percentage',
      value: '',
      minPurchase: '',
      maxDiscount: '',
      active: true,
      usageLimit: '',
      validUntil: '',
    });
    setEditingDiscount(null);
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      type: formData.type,
      value: parseFloat(formData.value),
      minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : 0,
      maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
      active: formData.active,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      validUntil: formData.validUntil ? new Date(formData.validUntil) : null,
    };
    
    if (editingDiscount) {
      updateMutation.mutate({ id: editingDiscount._id || editingDiscount.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      name: discount.name,
      type: discount.type,
      value: discount.value.toString(),
      minPurchase: discount.minPurchase?.toString() || '',
      maxDiscount: discount.maxDiscount?.toString() || '',
      active: discount.active !== false,
      usageLimit: discount.usageLimit?.toString() || '',
      validUntil: discount.validUntil ? new Date(discount.validUntil).toISOString().split('T')[0] : '',
    });
    setIsOpen(true);
  };

  return (
    <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Discount Codes
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">
                {editingDiscount ? 'Edit Discount' : 'Create New Discount'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-slate-700 dark:text-slate-300">Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  required
                  disabled={!!editingDiscount}
                />
              </div>
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
                <Label className="text-slate-700 dark:text-slate-300">Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-300">
                  {formData.type === 'percentage' ? 'Discount %' : 'Discount Amount (LKR)'}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-300">Minimum Purchase (LKR)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                />
              </div>
              {formData.type === 'percentage' && (
                <div>
                  <Label className="text-slate-700 dark:text-slate-300">Max Discount (LKR)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                </div>
              )}
              <div>
                <Label className="text-slate-700 dark:text-slate-300">Usage Limit</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-300">Valid Until</Label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(v) => setFormData({ ...formData, active: v })}
                />
                <Label className="text-slate-700 dark:text-slate-300">Active</Label>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1 border-slate-300 dark:border-slate-600">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900">
                  {editingDiscount ? 'Update' : 'Create'}
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
                <TableHead className="text-slate-600 dark:text-slate-400">Code</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Name</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Type</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Value</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Used</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400">Status</TableHead>
                <TableHead className="text-slate-600 dark:text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((discount) => (
                <TableRow key={discount._id || discount.id} className="border-slate-200 dark:border-slate-700/50">
                  <TableCell className="text-slate-900 dark:text-white font-mono font-medium">
                    {discount.code}
                  </TableCell>
                  <TableCell className="text-slate-900 dark:text-white">{discount.name}</TableCell>
                  <TableCell>
                    <Badge className={discount.type === 'percentage' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'}>
                      {discount.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-900 dark:text-white">
                    {discount.type === 'percentage' 
                      ? `${discount.value}%` 
                      : formatCurrency(discount.value)}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {discount.usedCount || 0}
                    {discount.usageLimit && ` / ${discount.usageLimit}`}
                  </TableCell>
                  <TableCell>
                    <Badge className={discount.active !== false ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}>
                      {discount.active !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(discount)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(discount._id || discount.id)} className="text-slate-600 dark:text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {discounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 dark:text-slate-400 py-8">
                    No discounts yet. Create your first discount code!
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




