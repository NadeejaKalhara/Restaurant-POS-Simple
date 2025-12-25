import React, { useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { printReceipt, isQZAvailable } from '@/utils/qzPrint';
import { toast } from 'sonner';

export default function KOTReceipt({ 
  orderItems,
  tableNumber,
  orderNumber,
  onPrintComplete
}) {
  const printRef = useRef(null);

  useEffect(() => {
    if (printRef.current && orderItems && orderItems.length > 0) {
      // Small delay to ensure content is rendered before printing
      const timer = setTimeout(async () => {
        try {
          await printReceipt(printRef.current, {
            onSuccess: () => {
              toast.success('KOT printed via QZ Tray');
              // Callback after print
              if (onPrintComplete) {
                setTimeout(() => {
                  onPrintComplete();
                }, 500);
              }
            },
            onError: (error) => {
              toast.error('KOT print failed. Please ensure QZ Tray is running.');
              console.error('Print error:', error);
              // Callback even on error
              if (onPrintComplete) {
                setTimeout(() => {
                  onPrintComplete();
                }, 500);
              }
            }
          });
        } catch (error) {
          toast.error('KOT print failed. Please check QZ Tray connection.');
          if (onPrintComplete) {
            setTimeout(() => {
              onPrintComplete();
            }, 500);
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [orderItems, onPrintComplete]);

  if (!orderItems || orderItems.length === 0) return null;

  const orderDate = new Date();

  return (
    <>
      {/* KOT content for QZ Tray printing */}
      <div ref={printRef} className="hidden print:block print:fixed print:inset-0 print:z-[9999] print:bg-white">
        <div className="p-6 bg-white text-black max-w-sm mx-auto">
          {/* KOT Header */}
          <div className="text-center mb-6 border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold mb-2">KITCHEN ORDER TICKET</h1>
            <h2 className="text-xl font-semibold mb-1">Shan Star Weligama</h2>
            <p className="text-sm text-slate-600">Sri Lanka</p>
          </div>

          {/* Order Info */}
          <div className="mb-4 space-y-2 text-sm">
            <div className="flex justify-between border-b border-slate-300 pb-1">
              <span className="font-semibold">Order #:</span>
              <span className="font-bold text-lg">{orderNumber ? String(orderNumber).padStart(4, '0') : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Date:</span>
              <span className="font-medium">{format(orderDate, 'MMM dd, yyyy hh:mm a')}</span>
            </div>
            <div className="flex justify-between border-t border-slate-300 pt-2 mt-2">
              <span className="font-semibold text-lg">Table:</span>
              <span className="font-bold text-xl">{tableNumber || 'Walk-in'}</span>
            </div>
          </div>

          {/* Items List */}
          <div className="border-t-2 border-b-2 border-black py-4 mb-4">
            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div key={index} className="border-b border-slate-300 pb-2 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">{item.quantity}x</span>
                        <span className="font-bold text-lg">{item.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-500 border-t border-slate-300 pt-4">
            <p className="font-semibold text-black">--- KITCHEN COPY ---</p>
            <p className="mt-2">Please prepare items as listed</p>
          </div>
        </div>
      </div>

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
