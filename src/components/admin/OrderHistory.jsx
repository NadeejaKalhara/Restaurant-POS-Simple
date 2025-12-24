import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { formatCurrency } from '@/utils/currency';
import { Trash2, Calendar } from 'lucide-react';
import { apiClient } from '@/api/client';
import { useQueryClient } from '@tanstack/react-query';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  completed: 'bg-green-500/10 text-green-600 dark:text-green-400',
  cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export default function OrderHistory({ orders, onOrderDeleted }) {
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState(() => {
    const date = subDays(new Date(), 7);
    return format(date, 'yyyy-MM-dd');
  });
  const [endDate, setEndDate] = useState(() => {
    return format(new Date(), 'yyyy-MM-dd');
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.created_date);
      return orderDate >= start && orderDate <= end;
    });
  }, [orders, startDate, endDate]);

  // Sort orders
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      if (a.orderNumber && b.orderNumber) {
        return b.orderNumber - a.orderNumber;
      }
      return new Date(b.createdAt || b.created_date) - new Date(a.createdAt || a.created_date);
    });
  }, [filteredOrders]);

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    
    setIsDeleting(true);
    try {
      await apiClient.orders.delete(orderToDelete._id || orderToDelete.id);
      queryClient.invalidateQueries(['orders']);
      if (onOrderDeleted) {
        onOrderDeleted();
      }
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetToWeek = () => {
    const date = subDays(new Date(), 7);
    setStartDate(format(date, 'yyyy-MM-dd'));
    setEndDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <>
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-900 dark:text-white">Recent Orders</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToWeek}
                className="text-xs"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Last Week
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600 dark:text-slate-400">From:</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600 dark:text-slate-400">To:</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing {sortedOrders.length} of {orders.length} orders
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-700">
                  <TableHead className="text-slate-600 dark:text-slate-400">Order #</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Date</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Table</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Items</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Total</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => (
                  <TableRow key={order._id || order.id} className="border-slate-200 dark:border-slate-700/50">
                    <TableCell className="text-slate-900 dark:text-white font-mono font-medium">
                      {order.orderNumber ? String(order.orderNumber).padStart(4, '0') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300 text-sm">
                      {format(new Date(order.createdAt || order.created_date), 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell className="text-slate-900 dark:text-white">{order.table_number || '-'}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300 text-sm">
                      {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ') || 'N/A'}
                    </TableCell>
                    <TableCell className="text-amber-500 dark:text-amber-400 font-medium">
                      {formatCurrency(order.total || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status] || statusColors.pending}>
                        {order.status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(order)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        title="Delete order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-500 dark:text-slate-400 py-8">
                      No orders found in the selected date range
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete order #{orderToDelete?.orderNumber ? String(orderToDelete.orderNumber).padStart(4, '0') : 'N/A'}?
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setOrderToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

