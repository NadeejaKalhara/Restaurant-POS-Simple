import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, Utensils } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import KOTReceipt from './KOTReceipt';
import { printReceipt, getPrintStatus } from '@/utils/print';
import { toast } from 'sonner';

export default function Receipt({ 
  open, 
  onClose, 
  orderData,
  orderNumber,
  kotData
}) {
  const printRef = useRef(null);
  const [showKOT, setShowKOT] = useState(false);
  const [printAvailable, setPrintAvailable] = useState(false);

  // Check print availability (local server or QZ Tray)
  useEffect(() => {
    getPrintStatus().then(status => {
      setPrintAvailable(status.available);
      if (!status.available) {
        console.warn('[Receipt] No print method available. Start local printer server or QZ Tray.');
      }
    });
  }, []);

  // Auto-print receipt when dialog opens
  useEffect(() => {
    if (open && printRef.current && orderData) {
      // Small delay to ensure content is rendered before printing
      const timer = setTimeout(async () => {
        try {
          await printReceipt(printRef.current, {
            onSuccess: (result) => {
              toast.success(`Receipt sent to ${result.printer || 'printer'} successfully`);
            },
            onError: (error) => {
              toast.error(`Print failed: ${error.message || 'Please ensure local printer server is running or QZ Tray is available.'}`);
              console.error('Print error:', error);
            }
          });
        } catch (error) {
          toast.error('Print failed. Please check printer server connection.');
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [open, orderData]);

  if (!orderData) return null;

  const { items, subtotal, discountAmount, discountCode, total, table_number, payment_method } = orderData;
  const orderDate = new Date();

  const handlePrintReceipt = async () => {
    if (!printRef.current) return;
    
    try {
      await printReceipt(printRef.current, {
        onSuccess: (result) => {
          toast.success(`Receipt sent to ${result.printer || 'printer'} successfully`);
        },
        onError: (error) => {
          toast.error(`Print failed: ${error.message || 'Please ensure QZ Tray is running and certificate is installed.'}`);
          console.error('Print error:', error);
        }
      });
    } catch (error) {
      toast.error('Print failed. Please check QZ Tray connection.');
    }
  };

  const handlePrintKOT = () => {
    setShowKOT(true);
  };

  const handleKOTPrintComplete = () => {
    setShowKOT(false);
  };

  const ReceiptContent = () => (
    <div className="p-6 bg-white text-black max-w-sm mx-auto">
      {/* Receipt Header */}
      <div className="text-center mb-6 border-b border-slate-300 pb-4">
        <h1 className="text-2xl font-bold mb-2">Shan Star Weligama</h1>
        <p className="text-sm text-slate-600">Sri Lanka</p>
        <p className="text-xs text-slate-500 mt-1">Thank you for your visit!</p>
      </div>

      {/* Order Info */}
      <div className="mb-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Order #:</span>
          <span className="font-medium">{orderNumber ? String(orderNumber).padStart(4, '0') : 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Date:</span>
          <span>{format(orderDate, 'MMM dd, yyyy hh:mm a')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Table:</span>
          <span className="font-medium">{table_number || 'Walk-in'}</span>
        </div>
        {payment_method && (
          <div className="flex justify-between">
            <span className="text-slate-600">Payment:</span>
            <span className="capitalize">{payment_method}</span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="border-t border-b border-slate-300 py-4 mb-4">
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-slate-600">
                  {formatCurrency(item.price)} × {item.quantity}
                </div>
              </div>
              <div className="font-medium ml-4">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span>Discount {discountCode ? `(${discountCode})` : ''}:</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold border-t border-slate-300 pt-2 mt-2">
          <span>TOTAL:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-500 border-t border-slate-300 pt-4">
        <p>Thank you for dining with us!</p>
        <p className="mt-1">Visit us again soon</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Receipt content for QZ Tray printing */}
      <div ref={printRef} className="hidden print:block print:fixed print:inset-0 print:z-[9999] print:bg-white">
        <ReceiptContent />
      </div>

      {/* Screen view - Dialog */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-w-md p-0">
          <div className="p-6 print:hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Receipt</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="no-print">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Receipt Preview */}
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg mb-4 border border-slate-200 dark:border-slate-700">
              <ReceiptContent />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 no-print">
              <div className="flex gap-2">
                <Button
                  onClick={handlePrintReceipt}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
                {kotData && (
                  <Button
                    onClick={handlePrintKOT}
                    variant="outline"
                    className="flex-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  >
                    <Utensils className="w-4 h-4 mr-2" />
                    Print KOT
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* KOT Receipt - Hidden until triggered */}
      {showKOT && kotData && (
        <KOTReceipt
          orderItems={kotData.items}
          tableNumber={kotData.tableNumber}
          orderNumber={kotData.orderNumber}
          onPrintComplete={handleKOTPrintComplete}
        />
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 0.5cm;
            size: 80mm auto;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print\\:block,
          .print\\:block * {
            visibility: visible !important;
          }
          
          .print\\:block {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: 100vh !important;
            background: white !important;
            color: black !important;
            z-index: 99999 !important;
            padding: 1.5rem !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          button,
          .print\\:hidden,
          .no-print,
          [role="dialog"],
          [data-state] {
            display: none !important;
            visibility: hidden !important;
          }
          
          .print\\:block h1,
          .print\\:block h2,
          .print\\:block h3,
          .print\\:block p,
          .print\\:block div,
          .print\\:block span,
          .print\\:block * {
            color: black !important;
            background: white !important;
            border-color: #000 !important;
          }
        }
      `}</style>
    </>
  );
}
