import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, UtensilsCrossed, Receipt, DollarSign, Moon, Sun, Tag, LogOut } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MenuManager from '@/components/admin/MenuManager';
import OrderHistory from '@/components/admin/OrderHistory';
import DiscountManager from '@/components/admin/DiscountManager';
import PrinterSettings from '@/components/admin/PrinterSettings';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/currency';

export default function Admin() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'menu');
  
  // Update tab when query param changes
  useEffect(() => {
    if (tabParam && ['menu', 'orders', 'discounts', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const { data: menuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => apiClient.menu.list(),
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.orders.list(500, '-createdAt'), // Increased limit for better date range filtering
  });

  const { data: discounts = [], isLoading: discountsLoading } = useQuery({
    queryKey: ['discounts'],
    queryFn: () => apiClient.discounts.list(),
  });

  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt || o.created_date);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  });
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/50 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <h1 className="text-slate-900 dark:text-white font-medium text-lg sm:text-xl">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-slate-600 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-600 dark:text-slate-400"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Menu Items</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{menuItems.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Today's Orders</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{todayOrders.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Today's Revenue</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{formatCurrency(todayRevenue)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="menu" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900 text-xs sm:text-sm">
              Menu
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900 text-xs sm:text-sm">
              Orders
            </TabsTrigger>
            <TabsTrigger value="discounts" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900 text-xs sm:text-sm">
              <Tag className="w-4 h-4 mr-2 inline" />
              Discounts
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900 text-xs sm:text-sm">
              <Receipt className="w-4 h-4 mr-2 inline" />
              QZ Tray
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            {menuLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              </div>
            ) : (
              <MenuManager menuItems={menuItems} />
            )}
          </TabsContent>

          <TabsContent value="orders">
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              </div>
            ) : (
              <OrderHistory orders={orders} />
            )}
          </TabsContent>

          <TabsContent value="discounts">
            {discountsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              </div>
            ) : (
              <DiscountManager discounts={discounts} />
            )}
          </TabsContent>

          <TabsContent value="settings">
            <PrinterSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

