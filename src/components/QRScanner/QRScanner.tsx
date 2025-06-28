import React, { useState } from 'react';
import { QrCode, Camera, Scan } from 'lucide-react';

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  isLoading?: boolean;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, isLoading = false }) => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  const simulateQRScan = () => {
    setIsScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      const sampleCodes = [
        'QR001SMARTPHONE2024',
        'QR002LAPTOP2024',
        'QR003HEADPHONES2024',
        'QR004SMARTWATCH2024',
        'QR005GAMING2024'
      ];
      const randomCode = sampleCodes[Math.floor(Math.random() * sampleCodes.length)];
      onScan(randomCode);
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <QrCode className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Scan Product QR Code</h3>
        <p className="text-gray-600">
          Scan the QR code on your product to register warranty
        </p>
      </div>

      {/* Camera Scanner Simulation */}
      <div className="mb-6">
        <div className="relative bg-gray-900 rounded-xl p-8 mb-4">
          <div className="aspect-square max-w-xs mx-auto relative">
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              {isScanning ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-white text-sm">Scanning...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                  <p className="text-gray-400 text-sm">Point camera at QR code</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={simulateQRScan}
          disabled={isScanning || isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Scan className="w-5 h-5" />
          <span>{isScanning ? 'Scanning...' : 'Start Camera Scan'}</span>
        </button>
      </div>

      {/* Manual Input */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Or enter code manually:</h4>
        <div className="flex space-x-3">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Enter QR code"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleScan}
            disabled={!manualCode.trim() || isLoading}
            className="bg-gray-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Try: QR001SMARTPHONE2024, QR002LAPTOP2024, QR003HEADPHONES2024
        </p>
      </div>
    </div>
  );
};