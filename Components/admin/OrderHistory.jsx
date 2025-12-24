import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  completed: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

export default function OrderHistory({ orders }) {
  const sortedOrders = [...orders].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-400">Date</TableHead>
              <TableHead className="text-slate-400">Table</TableHead>
              <TableHead className="text-slate-400">Items</TableHead>
              <TableHead className="text-slate-400">Total</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOrders.map((order) => (
              <TableRow key={order.id} className="border-slate-700/50">
                <TableCell className="text-slate-300 text-sm">
                  {format(new Date(order.created_date), 'MMM d, h:mm a')}
                </TableCell>
                <TableCell className="text-white">{order.table_number || '-'}</TableCell>
                <TableCell className="text-slate-300 text-sm">
                  {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </TableCell>
                <TableCell className="text-amber-400 font-medium">${order.total?.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={statusColors[order.status]}>{order.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                  No orders yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}