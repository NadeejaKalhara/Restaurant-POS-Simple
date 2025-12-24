import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Minus, X, ShoppingCart, Tag, Printer, CreditCard, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';

export default function OrderPanel({
  orderItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
  onCheckout,
  tableNumber,
  onTableNumberChange,
  isProcessing,
  onPrintKOT
}) {
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = appliedDiscount?.amount || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code');
      return;
    }

    if (subtotal === 0) {
      toast.error('Add items to cart first');
      return;
    }

    setValidatingDiscount(true);
    try {
      const result = await apiClient.discounts.validate(discountCode, subtotal);
      if (result.valid) {
        setAppliedDiscount(result.discount);
        toast.success(`Discount "${result.discount.name}" applied!`);
      } else {
        toast.error(result.message || 'Invalid discount code');
        setAppliedDiscount(null);
      }
    } catch (error) {
      toast.error('Failed to validate discount code');
      setAppliedDiscount(null);
    } finally {
      setValidatingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    toast.info('Discount removed');
  };

  const handleCheckoutClick = async () => {
    if (orderItems.length === 0) {
      toast.error('Add items to cart first');
      return;
    }

    // Use discount if applied
    const orderData = {
      items: orderItems,
      discountCode: appliedDiscount?.code || null,
      discountAmount: discountAmount,
      discountType: appliedDiscount?.type || null,
      table_number: tableNumber || 'Walk-in',
      payment_method: paymentMethod,
    };

    // Increment discount usage if applied
    if (appliedDiscount?.id) {
      try {
        await apiClient.discounts.use(appliedDiscount.id);
      } catch (error) {
        console.error('Failed to increment discount usage:', error);
      }
    }

    onCheckout(orderData);
    setAppliedDiscount(null);
    setDiscountCode('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <Card className="flex-1 flex flex-col bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 min-h-0">
        <CardHeader className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 py-2 px-3">
          <CardTitle className="text-base text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Order Summary
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col overflow-hidden p-3 min-h-0">
          {/* Fixed Top Section */}
          <div className="flex-shrink-0 space-y-3 mb-3">
            {/* Payment Method */}
            <div>
              <Label className="text-slate-700 dark:text-slate-300 text-sm mb-2 block">Payment Method</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex-1 ${
                    paymentMethod === 'cash'
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Cash
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 ${
                    paymentMethod === 'card'
                      ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Card
                </Button>
              </div>
            </div>

            {/* Discount Code */}
            <div>
              <Label className="text-slate-700 dark:text-slate-300 text-sm flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Discount Code
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  disabled={!!appliedDiscount || validatingDiscount}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                />
                {appliedDiscount ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveDiscount}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleApplyDiscount}
                    disabled={validatingDiscount || !discountCode.trim()}
                    className="shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-900"
                  >
                    {validatingDiscount ? '...' : 'Apply'}
                  </Button>
                )}
              </div>
              {appliedDiscount && (
                <div className="mt-2 p-2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {appliedDiscount.name}: -{formatCurrency(appliedDiscount.amount)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Order Items Section */}
          <div 
            className="flex-1 overflow-y-auto min-h-0 mb-4 touch-pan-y" 
            style={{ 
              scrollbarWidth: 'thin', 
              scrollbarColor: 'rgb(203 213 225) transparent',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="space-y-2 pr-1">
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Cart is empty</p>
                </div>
              ) : (
                orderItems.map((item) => (
                  <div
                    key={item.menuItemId || item._id}
                    className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.menuItemId || item._id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium text-slate-900 dark:text-white w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onUpdateQuantity(item.menuItemId || item._id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        onClick={() => onRemoveItem(item.menuItemId || item._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Fixed Bottom Section */}
          <div className="flex-shrink-0 space-y-4">
            {/* Totals */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400">Discount</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-900 dark:text-white">Total</span>
                <span className="text-amber-500 dark:text-amber-400">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={onPrintKOT}
                disabled={orderItems.length === 0 || isProcessing}
                className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print KOT
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClearOrder}
                  disabled={orderItems.length === 0 || isProcessing}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleCheckoutClick}
                  disabled={orderItems.length === 0 || isProcessing}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold"
                >
                  {isProcessing ? 'Processing...' : 'Checkout'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

