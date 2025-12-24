import React, { useState } from 'react';
import { apiClient } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Moon, Sun, LogOut, DollarSign, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatCurrency } from '@/utils/currency';
import { toast } from 'sonner';
import MenuGrid from '@/components/pos/MenuGrid';
import OrderPanel from '@/components/pos/OrderPanel';
import Receipt from '@/components/pos/Receipt';
import KOTReceipt from '@/components/pos/KOTReceipt';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function POSTerminal() {
  const [orderItems, setOrderItems] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [kotData, setKOTData] = useState(null);
  const [pendingKOTItems, setPendingKOTItems] = useState(null);
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => apiClient.menu.list(),
  });

  const { data: dailyStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dailyStats'],
    queryFn: () => apiClient.orders.getDailyStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => {
      const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return apiClient.orders.create({
        ...orderData,
        subtotal,
        total: Math.max(0, subtotal - (orderData.discountAmount || 0)),
      });
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dailyStats'] });
      
      // Prepare receipt data
      const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setReceiptData({
        items: order.items,
        subtotal: order.subtotal || subtotal,
        discountAmount: order.discountAmount || 0,
        discountCode: order.discountCode || null,
        total: order.total,
        table_number: order.table_number,
        payment_method: order.payment_method || 'cash',
      });
      
      // Prepare KOT data
      const orderItemsForKOT = order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));
      setPendingKOTItems({
        items: orderItemsForKOT,
        tableNumber: order.table_number,
        orderNumber: order.orderNumber || order._id || order.id
      });
      
      setOrderNumber(order.orderNumber || order._id || order.id);
      setShowReceipt(true);
      
      // Clear order
      setOrderItems([]);
      setTableNumber('');
      toast.success('Order placed successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to place order');
    },
  });

  const handleAddItem = (item) => {
    setOrderItems(prev => {
      const existing = prev.find(i => (i.menuItemId || i._id) === (item._id || item.id));
      if (existing) {
        return prev.map(i => 
          (i.menuItemId || i._id) === (item._id || item.id)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, {
        menuItemId: item._id || item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const handleUpdateQuantity = (menuItemId, delta) => {
    setOrderItems(prev => prev.map(item => {
      if ((item.menuItemId || item._id) === menuItemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleRemoveItem = (menuItemId) => {
    setOrderItems(prev => prev.filter(item => (item.menuItemId || item._id) !== menuItemId));
  };

  const handleCheckout = (orderData) => {
    createOrderMutation.mutate(orderData);
  };

  const handlePrintKOT = () => {
    if (orderItems.length === 0) {
      toast.error('Add items to cart first');
      return;
    }
    // Generate a temporary order number for KOT
    const tempKOTNumber = Date.now().toString().slice(-6);
    // Set KOT data to trigger print
    setKOTData({
      orderItems,
      tableNumber,
      orderNumber: tempKOTNumber,
    });
    toast.success('Printing KOT...');
  };

  const handleKOTPrintComplete = () => {
    // Clear KOT data after print
    setKOTData(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/50 px-3 py-1.5 flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white h-8 px-2">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline text-sm">Back</span>
              </Button>
            </Link>
            <h1 className="text-slate-900 dark:text-white font-medium text-base">POS Terminal</h1>
            
            {/* Daily Collection Stats */}
            {dailyStats && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-md">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-xs">
                    <div className="text-slate-500 dark:text-slate-400 leading-tight">Cash</div>
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400 leading-tight">
                      {formatCurrency(dailyStats.cashRevenue || 0)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 dark:bg-blue-500/20 rounded-md">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <div className="text-xs">
                    <div className="text-slate-500 dark:text-slate-400 leading-tight">Card</div>
                    <div className="font-semibold text-blue-600 dark:text-blue-400 leading-tight">
                      {formatCurrency(dailyStats.cardRevenue || 0)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 dark:bg-amber-500/20 rounded-md">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <div className="text-xs">
                    <div className="text-slate-500 dark:text-slate-400 leading-tight">Total</div>
                    <div className="font-bold text-amber-600 dark:text-amber-400 leading-tight">
                      {formatCurrency(dailyStats.totalRevenue || 0)}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-slate-600 dark:text-slate-400 h-8 w-8"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-slate-600 dark:text-slate-400 h-8 w-8"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Menu Section */}
          <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
              <TabsList className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 w-full sm:w-auto overflow-x-auto">
                <TabsTrigger value="all" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900 text-xs sm:text-sm">
                  All
                </TabsTrigger>
                <TabsTrigger value="appetizers" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900 text-xs sm:text-sm">
                  Appetizers
                </TabsTrigger>
                <TabsTrigger value="mains" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900 text-xs sm:text-sm">
                  Mains
                </TabsTrigger>
                <TabsTrigger value="drinks" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900 text-xs sm:text-sm">
                  Drinks
                </TabsTrigger>
                <TabsTrigger value="desserts" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900 text-xs sm:text-sm">
                  Desserts
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex-1 overflow-auto">
              {menuItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400">No menu items yet.</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Add items from the Admin panel.</p>
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
          <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700/50 p-2 sm:p-3 bg-white dark:bg-slate-800/30 flex flex-col min-h-0">
            <OrderPanel
              orderItems={orderItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearOrder={() => setOrderItems([])}
              onCheckout={handleCheckout}
              tableNumber={tableNumber}
              onTableNumberChange={setTableNumber}
              isProcessing={createOrderMutation.isPending}
              onPrintKOT={handlePrintKOT}
            />
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <Receipt
        open={showReceipt}
        onClose={() => {
          setShowReceipt(false);
          setReceiptData(null);
          setOrderNumber(null);
          setPendingKOTItems(null);
        }}
        orderData={receiptData}
        orderNumber={orderNumber}
        kotData={pendingKOTItems}
      />

      {/* KOT Receipt - Direct Print */}
      {kotData && (
        <KOTReceipt
          orderItems={kotData.orderItems}
          tableNumber={kotData.tableNumber}
          orderNumber={kotData.orderNumber}
          onPrintComplete={handleKOTPrintComplete}
        />
      )}
    </div>
  );
}

