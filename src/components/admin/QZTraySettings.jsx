import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, CheckCircle2, XCircle, AlertCircle, Upload, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { 
  isQZAvailable, 
  connectQZ, 
  getPrinter, 
  getAllPrinters,
  getSavedPrinter,
  savePrinter,
  getPrinterSettings,
  savePrinterSettings
} from '@/utils/qzPrint';

export default function QZTraySettings() {
  const [certPath, setCertPath] = useState('');
  const [keyPath, setKeyPath] = useState('');
  const [qzStatus, setQzStatus] = useState('checking');
  const [printer, setPrinter] = useState(null);
  const [availablePrinters, setAvailablePrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [loadingPrinters, setLoadingPrinters] = useState(false);
  const [showPrintSettings, setShowPrintSettings] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    width: 226.77, // 80mm in points
    height: null,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    orientation: 'portrait',
    colorType: 'grayscale',
    interpolation: 'nearest-neighbor'
  });

  useEffect(() => {
    checkQZStatus();
    loadSavedPaths();
    loadPrinters();
    loadSavedPrinter();
  }, []);

  useEffect(() => {
    if (selectedPrinter) {
      loadPrinterSettings();
    }
  }, [selectedPrinter]);

  const loadSavedPaths = () => {
    const savedCert = localStorage.getItem('qz_certificate_path');
    const savedKey = localStorage.getItem('qz_private_key_path');
    if (savedCert) setCertPath(savedCert);
    if (savedKey) setKeyPath(savedKey);
  };

  const savePaths = () => {
    if (certPath) localStorage.setItem('qz_certificate_path', certPath);
    if (keyPath) localStorage.setItem('qz_private_key_path', keyPath);
    toast.success('Certificate paths saved');
  };

  const loadPrinters = async () => {
    if (qzStatus !== 'connected') return;
    
    setLoadingPrinters(true);
    try {
      const printers = await getAllPrinters();
      setAvailablePrinters(printers);
    } catch (error) {
      console.error('Error loading printers:', error);
      toast.error('Failed to load printers');
    } finally {
      setLoadingPrinters(false);
    }
  };

  const loadSavedPrinter = () => {
    const saved = getSavedPrinter();
    if (saved) {
      setSelectedPrinter(saved);
      setPrinter(saved);
    }
  };

  const loadPrinterSettings = () => {
    if (!selectedPrinter) return;
    const settings = getPrinterSettings(selectedPrinter);
    if (settings) {
      setPrintSettings({
        width: settings.size?.width || 226.77,
        height: settings.size?.height || null,
        marginTop: settings.margins?.top || 0,
        marginBottom: settings.margins?.bottom || 0,
        marginLeft: settings.margins?.left || 0,
        marginRight: settings.margins?.right || 0,
        orientation: settings.orientation || 'portrait',
        colorType: settings.colorType || 'grayscale',
        interpolation: settings.interpolation || 'nearest-neighbor'
      });
    }
  };

  const handlePrinterSelect = (printerName) => {
    setSelectedPrinter(printerName);
    savePrinter(printerName);
    setPrinter(printerName);
    toast.success(`Printer "${printerName}" selected`);
    loadPrinterSettings();
  };

  const handleSavePrintSettings = () => {
    if (!selectedPrinter) {
      toast.error('Please select a printer first');
      return;
    }

    const settings = {
      size: {
        width: parseFloat(printSettings.width) || 226.77,
        height: printSettings.height ? parseFloat(printSettings.height) : null
      },
      margins: {
        top: parseFloat(printSettings.marginTop) || 0,
        bottom: parseFloat(printSettings.marginBottom) || 0,
        left: parseFloat(printSettings.marginLeft) || 0,
        right: parseFloat(printSettings.marginRight) || 0
      },
      orientation: printSettings.orientation,
      colorType: printSettings.colorType,
      interpolation: printSettings.interpolation
    };

    savePrinterSettings(selectedPrinter, settings);
    toast.success('Print settings saved');
  };

  const checkQZStatus = async () => {
    setQzStatus('checking');
    try {
      const available = isQZAvailable();
      if (available) {
        const connected = await connectQZ();
        if (connected) {
          setQzStatus('connected');
          await loadPrinters();
          const autoSelectedPrinter = await getPrinter();
          if (autoSelectedPrinter) {
            setPrinter(autoSelectedPrinter);
            // Only set selected printer if no saved preference exists
            if (!selectedPrinter) {
              setSelectedPrinter(autoSelectedPrinter);
            }
          }
        } else {
          setQzStatus('not_connected');
        }
      } else {
        setQzStatus('not_available');
      }
    } catch (error) {
      setQzStatus('error');
      console.error('QZ Tray check error:', error);
    }
  };

  const handleCertFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Note: Browser security prevents direct file path access
      // In production, you'd need to upload to server or use a different approach
      toast.info('For security, certificate files must be on the server. Use the setup script to configure paths.');
    }
  };

  const getStatusIcon = () => {
    switch (qzStatus) {
      case 'connected':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'not_connected':
      case 'not_available':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <AlertCircle className="w-5 h-5 text-amber-500 animate-pulse" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (qzStatus) {
      case 'connected':
        return 'QZ Tray is connected and ready';
      case 'not_connected':
        return 'QZ Tray is not connected. Please start QZ Tray application.';
      case 'not_available':
        return 'QZ Tray is not available. Please install QZ Tray.';
      case 'checking':
        return 'Checking QZ Tray status...';
      default:
        return 'Unable to check QZ Tray status';
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
          <Printer className="w-5 h-5" />
          QZ Tray Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QZ Tray Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {getStatusText()}
            </p>
            {printer && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Current Printer: {printer}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkQZStatus}
            className="text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
        </div>

        {/* Printer Selection */}
        {qzStatus === 'connected' && (
          <div className="space-y-3">
            <div>
              <Label className="text-slate-700 dark:text-slate-300">
                Select Printer
              </Label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Choose a printer to use for receipts. Settings can be configured per printer.
              </p>
              <div className="flex gap-2">
                <Select 
                  value={selectedPrinter} 
                  onValueChange={handlePrinterSelect}
                  disabled={loadingPrinters}
                >
                  <SelectTrigger className="flex-1 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                    <SelectValue placeholder={loadingPrinters ? "Loading printers..." : "Select a printer"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-60">
                    {availablePrinters.length > 0 ? (
                      availablePrinters.map((printerName) => (
                        <SelectItem key={printerName} value={printerName}>
                          {printerName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No printers found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadPrinters}
                  disabled={loadingPrinters}
                  className="px-3"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingPrinters ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Print Settings */}
            {selectedPrinter && (
              <div className="space-y-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Print Settings for {selectedPrinter}
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrintSettings(!showPrintSettings)}
                    className="text-xs"
                  >
                    {showPrintSettings ? 'Hide' : 'Show'} Settings
                  </Button>
                </div>

                {showPrintSettings && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-slate-600 dark:text-slate-400">Paper Width (points)</Label>
                        <Input
                          type="number"
                          value={printSettings.width}
                          onChange={(e) => setPrintSettings({ ...printSettings, width: e.target.value })}
                          placeholder="226.77"
                          className="text-xs"
                        />
                        <p className="text-xs text-slate-500 mt-1">80mm ≈ 226.77 points</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600 dark:text-slate-400">Paper Height (points)</Label>
                        <Input
                          type="number"
                          value={printSettings.height || ''}
                          onChange={(e) => setPrintSettings({ ...printSettings, height: e.target.value || null })}
                          placeholder="Auto (null)"
                          className="text-xs"
                        />
                        <p className="text-xs text-slate-500 mt-1">Leave empty for auto</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">Margins (points)</Label>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <Label className="text-xs">Top</Label>
                          <Input
                            type="number"
                            value={printSettings.marginTop}
                            onChange={(e) => setPrintSettings({ ...printSettings, marginTop: e.target.value })}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Right</Label>
                          <Input
                            type="number"
                            value={printSettings.marginRight}
                            onChange={(e) => setPrintSettings({ ...printSettings, marginRight: e.target.value })}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Bottom</Label>
                          <Input
                            type="number"
                            value={printSettings.marginBottom}
                            onChange={(e) => setPrintSettings({ ...printSettings, marginBottom: e.target.value })}
                            className="text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Left</Label>
                          <Input
                            type="number"
                            value={printSettings.marginLeft}
                            onChange={(e) => setPrintSettings({ ...printSettings, marginLeft: e.target.value })}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-slate-600 dark:text-slate-400">Orientation</Label>
                        <Select 
                          value={printSettings.orientation} 
                          onValueChange={(v) => setPrintSettings({ ...printSettings, orientation: v })}
                        >
                          <SelectTrigger className="text-xs bg-white dark:bg-slate-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="portrait">Portrait</SelectItem>
                            <SelectItem value="landscape">Landscape</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-600 dark:text-slate-400">Color Type</Label>
                        <Select 
                          value={printSettings.colorType} 
                          onValueChange={(v) => setPrintSettings({ ...printSettings, colorType: v })}
                        >
                          <SelectTrigger className="text-xs bg-white dark:bg-slate-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grayscale">Grayscale</SelectItem>
                            <SelectItem value="color">Color</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={handleSavePrintSettings}
                      className="w-full"
                      size="sm"
                    >
                      Save Print Settings
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Certificate Paths */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="cert-path" className="text-slate-700 dark:text-slate-300">
              Certificate File Path (Optional)
            </Label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Leave empty to use server certificates. Custom path example: C:\Users\User\Desktop\QZ Tray Demo Cert\digital-certificate.txt
            </p>
            <Input
              id="cert-path"
              value={certPath}
              onChange={(e) => setCertPath(e.target.value)}
              placeholder="C:\Users\User\Desktop\QZ Tray Demo Cert\digital-certificate.txt"
              className="font-mono text-xs"
            />
          </div>

          <div>
            <Label htmlFor="key-path" className="text-slate-700 dark:text-slate-300">
              Private Key File Path (Optional)
            </Label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Leave empty to use server keys. Custom path example: C:\Users\User\Desktop\QZ Tray Demo Cert\private-key.pem
            </p>
            <Input
              id="key-path"
              value={keyPath}
              onChange={(e) => setKeyPath(e.target.value)}
              placeholder="C:\Users\User\Desktop\QZ Tray Demo Cert\private-key.pem"
              className="font-mono text-xs"
            />
          </div>

          <Button
            onClick={savePaths}
            className="w-full"
            variant="outline"
          >
            Save Certificate Paths
          </Button>
        </div>

        {/* Info */}
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Note:</strong> Certificate paths are stored locally. For production, use the setup scripts to configure certificates on the server. 
            Custom paths are useful for development or when certificates are in non-standard locations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

