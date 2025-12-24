import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import MenuGrid from '@/components/pos/MenuGrid';
import OrderPanel from '@/components/pos/OrderPanel';

export default function POSTerminal() {
  const [orderItems, setOrderItems] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => base44.entities.MenuItem.list(),
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => base44.entities.Order.create(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setOrderItems([]);
      setTableNumber('');
      toast.success('Order placed successfully!');
    },
  });

  const handleAddItem = (item) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) {
        return prev.map(i => 
          i.menuItemId === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }];
    });
  };

  const handleUpdateQuantity = (menuItemId, delta) => {
    setOrderItems(prev => prev.map(item => {
      if (item.menuItemId === menuItemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleRemoveItem = (menuItemId) => {
    setOrderItems(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  const handleCheckout = () => {
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    createOrderMutation.mutate({
      items: orderItems,
      total,
      table_number: tableNumber || 'Walk-in',
      status: 'completed'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-slate-800/50 border-b border-slate-700/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-white font-medium">POS Terminal</h1>
            <div className="w-20" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Menu Section */}
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
              <TabsList className="bg-slate-800/50 border border-slate-700/50">
                <TabsTrigger value="all" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900">
                  All
                </TabsTrigger>
                <TabsTrigger value="appetizers" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900">
                  Appetizers
                </TabsTrigger>
                <TabsTrigger value="mains" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900">
                  Mains
                </TabsTrigger>
                <TabsTrigger value="drinks" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900">
                  Drinks
                </TabsTrigger>
                <TabsTrigger value="desserts" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900">
                  Desserts
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex-1 overflow-auto">
              {menuItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">No menu items yet.</p>
                  <p className="text-slate-600 text-sm mt-1">Add items from the Admin panel.</p>
                </div>
              ) : (
                <MenuGrid 
                  items={menuItems} 
                  onItemClick={handleAddItem}
                  selectedCategory={selectedCategory}
                />
              )}
            </div>
          </div>

          {/* Order Panel */}
          <div className="w-80 lg:w-96 border-l border-slate-700/50 p-4">
            <OrderPanel
              orderItems={orderItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearOrder={() => setOrderItems([])}
              onCheckout={handleCheckout}
              tableNumber={tableNumber}
              onTableNumberChange={setTableNumber}
              isProcessing={createOrderMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}