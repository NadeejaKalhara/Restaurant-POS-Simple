import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, CheckCircle2, XCircle, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { testPrint, getAllPrinters, getPrintStatus, isPrintAvailable } from '@/utils/print';
import { getSavedPrinter, savePrinter } from '@/utils/printerStorage';

export default function PrinterSettings() {
  const [printStatus, setPrintStatus] = useState(null);
  const [testingPrint, setTestingPrint] = useState(false);
  const [printerInfo, setPrinterInfo] = useState(null);
  const [availablePrinters, setAvailablePrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [manualPrinterName, setManualPrinterName] = useState('');
  const [loadingPrinters, setLoadingPrinters] = useState(false);

  useEffect(() => {
    checkPrintStatus();
    loadSavedPrinter();
  }, []);

  const loadSavedPrinter = () => {
    const saved = getSavedPrinter();
    if (saved) {
      setSelectedPrinter(saved);
      setManualPrinterName(saved);
    }
  };

  const checkPrintStatus = async () => {
    try {
      const status = await getPrintStatus();
      setPrintStatus(status);
      
      if (status.available) {
        await loadPrinters();
      }
    } catch (error) {
      console.error('Error checking print status:', error);
    }
  };

  const loadPrinters = async () => {
    setLoadingPrinters(true);
    try {
      const result = await getAllPrinters();
      setPrinterInfo(result);
      
      if (result.printers && result.printers.length > 0) {
        setAvailablePrinters(result.printers);
        // Auto-select saved printer if it exists in the list
        const saved = getSavedPrinter();
        if (saved && result.printers.includes(saved)) {
          setSelectedPrinter(saved);
        }
      }
    } catch (error) {
      console.error('Error loading printers:', error);
    } finally {
      setLoadingPrinters(false);
    }
  };

  const handleSavePrinter = () => {
    const printerToSave = selectedPrinter || manualPrinterName.trim();
    if (!printerToSave) {
      toast.error('Please select or enter a printer name');
      return;
    }
    
    const saved = savePrinter(printerToSave);
    if (saved) {
      toast.success(`Printer "${printerToSave}" saved successfully`);
      setManualPrinterName(printerToSave);
    } else {
      toast.error('Failed to save printer');
    }
  };

  const handleTestPrint = async () => {
    const printerToUse = selectedPrinter || manualPrinterName.trim() || getSavedPrinter();
    setTestingPrint(true);
    try {
      const result = await testPrint(printerToUse || null);
      if (result.success) {
        toast.success(`Test print sent to ${printerToUse || 'default printer'} successfully!`);
      } else {
        toast.error(`Print failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error(`Print error: ${error.message}`);
    } finally {
      setTestingPrint(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Printer Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Print Status */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Print Status</h3>
            {printStatus ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {printStatus.available ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">
                        Printing available via {printStatus.method === 'electron' ? 'Electron IPC' : 'Local Server'}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-red-600 dark:text-red-400">
                        No print method available
                      </span>
                    </>
                  )}
                </div>
                
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <div>Electron: {printStatus.electron ? '✓ Available' : '✗ Not available'}</div>
                  <div>Local Server: {printStatus.local ? '✓ Available' : '✗ Not available'}</div>
                  <div>Method: {printStatus.method || 'None'}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">Checking status...</div>
            )}
          </div>

          {/* Printer Selector */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="printer-select">Select Printer</Label>
              {availablePrinters.length > 0 ? (
                <Select
                  value={selectedPrinter}
                  onValueChange={(value) => {
                    setSelectedPrinter(value);
                    setManualPrinterName(value);
                  }}
                >
                  <SelectTrigger id="printer-select">
                    <SelectValue placeholder="Select a printer" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePrinters.map((printer) => (
                      <SelectItem key={printer} value={printer}>
                        {printer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Enter printer name (e.g., XP-76C)"
                    value={manualPrinterName}
                    onChange={(e) => setManualPrinterName(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {printerInfo?.message || 'Use Windows Settings > Printers & scanners to find printer name'}
                  </p>
                </div>
              )}
            </div>

            {/* Saved Printer Info */}
            {getSavedPrinter() && (
              <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-2 rounded">
                Saved: <strong>{getSavedPrinter()}</strong>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button
              onClick={checkPrintStatus}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Button
              onClick={loadPrinters}
              variant="outline"
              size="sm"
              disabled={loadingPrinters || !printStatus?.available}
            >
              {loadingPrinters ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Load Printers
                </>
              )}
            </Button>
            
            <Button
              onClick={handleSavePrinter}
              variant="outline"
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Printer
            </Button>
            
            <Button
              onClick={handleTestPrint}
              disabled={!printStatus?.available || testingPrint}
              size="sm"
            >
              {testingPrint ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Printing...
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 mr-2" />
                  Test Print
                </>
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold mb-2">How to Use</h3>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p><strong>Electron App:</strong> Printing works automatically via IPC bridge</p>
              <p><strong>Web Browser:</strong> Start local printer server: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">npm start</code> in thermal-printer-script folder</p>
              <p><strong>Printer Name:</strong> Use exact name from Windows Settings > Printers & scanners</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

