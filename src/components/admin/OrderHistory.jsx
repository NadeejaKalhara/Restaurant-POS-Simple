import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/currency';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  completed: 'bg-green-500/10 text-green-600 dark:text-green-400',
  cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export default function OrderHistory({ orders }) {
  const sortedOrders = [...orders].sort((a, b) => {
    // Sort by orderNumber if available, otherwise by date
    if (a.orderNumber && b.orderNumber) {
      return b.orderNumber - a.orderNumber;
    }
    return new Date(b.createdAt || b.created_date) - new Date(a.createdAt || a.created_date);
  });

  return (
    <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-white">Recent Orders</CardTitle>
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
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 dark:text-slate-400 py-8">
                    No orders yet
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

