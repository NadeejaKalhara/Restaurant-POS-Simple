import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, CheckCircle2, XCircle, AlertCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { isQZAvailable, connectQZ, getPrinter } from '@/utils/qzPrint';

export default function QZTraySettings() {
  const [certPath, setCertPath] = useState('');
  const [keyPath, setKeyPath] = useState('');
  const [qzStatus, setQzStatus] = useState('checking');
  const [printer, setPrinter] = useState(null);

  useEffect(() => {
    checkQZStatus();
    loadSavedPaths();
  }, []);

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

  const checkQZStatus = async () => {
    setQzStatus('checking');
    try {
      const available = isQZAvailable();
      if (available) {
        const connected = await connectQZ();
        if (connected) {
          const selectedPrinter = await getPrinter();
          setPrinter(selectedPrinter);
          setQzStatus('connected');
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
                Selected Printer: {printer}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkQZStatus}
            className="text-xs"
          >
            Refresh
          </Button>
        </div>

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

