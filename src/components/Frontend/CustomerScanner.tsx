import React, { useState } from 'react';
import { QrCode, Camera, Scan, Package, User, Mail, Phone, Calendar, CheckCircle, XCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { db } from '../../services/database';
import { calculateWarrantyEndDate, getWarrantyStatus } from '../../utils/codeGenerator';

export const CustomerScanner: React.FC = () => {
  const [step, setStep] = useState<'scan' | 'register' | 'success'>('scan');
  const [code, setCode] = useState('');
  const [codeType, setCodeType] = useState<'qr' | 'barcode'>('qr');
  const [isScanning, setIsScanning] = useState(false);
  const [productInstance, setProductInstance] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    purchaseDate: ''
  });

  const handleCodeScan = (inputCode: string, type: 'qr' | 'barcode' = 'qr') => {
    setLoading(true);
    
    // Find product instance by QR code or barcode
    const instance = type === 'qr' 
      ? db.getProductInstanceByQR(inputCode)
      : db.getProductInstanceByBarcode(inputCode);
      
    if (!instance) {
      setMessage({ type: 'error', text: `Invalid ${type === 'qr' ? 'QR code' : 'barcode'}. Product not found.` });
      setLoading(false);
      return;
    }

    // Check if already registered
    const existingWarranty = db.getWarrantyByInstanceId(instance.id);
    if (existingWarranty) {
      setMessage({ type: 'error', text: 'This product is already registered.' });
      setLoading(false);
      return;
    }

    // Get product details
    const productDetails = db.getProduct(instance.productId);
    if (!productDetails) {
      setMessage({ type: 'error', text: 'Product details not found.' });
      setLoading(false);
      return;
    }

    setProductInstance(instance);
    setProduct(productDetails);
    setStep('register');
    setMessage({ type: 'success', text: `Product found: ${productDetails.name}` });
    setLoading(false);
  };

  const simulateCodeScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Get a random unregistered instance for demo
      const unregisteredInstances = db.getProductInstances().filter(i => !i.isRegistered);
      if (unregisteredInstances.length > 0) {
        const randomInstance = unregisteredInstances[Math.floor(Math.random() * unregisteredInstances.length)];
        handleCodeScan(codeType === 'qr' ? randomInstance.qrCode : randomInstance.barcode || randomInstance.qrCode, codeType);
      } else {
        setMessage({ type: 'error', text: 'No unregistered products available for demo.' });
      }
      setIsScanning(false);
    }, 2000);
  };

  const handleManualScan = () => {
    if (code.trim()) {
      handleCodeScan(code.trim(), codeType);
      setCode('');
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate warranty end date
      const warrantyEndDate = calculateWarrantyEndDate(formData.purchaseDate, product.warrantyPeriodMonths);
      const status = getWarrantyStatus(warrantyEndDate);

      // Create warranty registration
      const warranty = db.addWarrantyRegistration({
        productInstanceId: productInstance.id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone || undefined,
        purchaseDate: formData.purchaseDate,
        warrantyStartDate: formData.purchaseDate,
        warrantyEndDate,
        status
      });

      // Mark instance as registered
      db.updateProductInstance(productInstance.id, { isRegistered: true });

      setStep('success');
      setMessage({ type: 'success', text: 'Warranty registered successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('scan');
    setCode('');
    setCodeType('qr');
    setProductInstance(null);
    setProduct(null);
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      purchaseDate: ''
    });
    setMessage(null);
  };

  const getMessageIcon = () => {
    switch (message?.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getMessageColor = () => {
    switch (message?.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <QrCode className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">Warranty Registration</h1>
              <p className="text-sm text-gray-600">Scan to register your product warranty</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        {/* Message Banner */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center space-x-3 ${getMessageColor()}`}>
            {getMessageIcon()}
            <span className="font-medium flex-1">{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-current hover:opacity-70 transition-opacity"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Scan Step */}
        {step === 'scan' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4">
                {codeType === 'qr' ? <QrCode className="w-8 h-8 text-blue-600" /> : <BarChart3 className="w-8 h-8 text-blue-600" />}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Scan Product {codeType === 'qr' ? 'QR Code' : 'Barcode'}
              </h3>
              <p className="text-gray-600">
                Scan the {codeType === 'qr' ? 'QR code' : 'barcode'} on your product to register warranty
              </p>
            </div>

            {/* Code Type Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => setCodeType('qr')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  codeType === 'qr' ? 'bg-white text-blue-600 shadow-sm transform scale-105' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code</span>
              </button>
              <button
                onClick={() => setCodeType('barcode')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  codeType === 'barcode' ? 'bg-white text-blue-600 shadow-sm transform scale-105' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Barcode</span>
              </button>
            </div>

            {/* Camera Scanner Simulation */}
            <div className="mb-6">
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 mb-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10"></div>
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
                        <p className="text-white text-sm font-medium">Scanning...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                        <p className="text-gray-400 text-sm">Point camera at {codeType === 'qr' ? 'QR code' : 'barcode'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={simulateCodeScan}
                disabled={isScanning || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Scan className="w-5 h-5" />
                <span>{isScanning ? 'Scanning...' : `Start Camera Scan`}</span>
              </button>
            </div>

            {/* Manual Input */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Or enter code manually:</h4>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`Enter ${codeType === 'qr' ? 'QR code' : 'barcode'}`}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
                <button
                  onClick={handleManualScan}
                  disabled={!code.trim() || loading}
                  className="bg-gray-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Registration Step */}
        {step === 'register' && product && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-4">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Register Product</h3>
              <p className="text-gray-600">Complete your warranty registration</p>
            </div>

            {/* Product Info */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-6 border border-gray-100">
              <div className="flex items-center space-x-4">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center shadow-md">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{product.name}</h4>
                  <p className="text-sm text-gray-600">{product.brand} • {product.model}</p>
                  <p className="text-sm text-green-600 font-medium">
                    {product.warrantyPeriodMonths} months warranty
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    {codeType === 'qr' ? productInstance.qrCode : productInstance.barcode}
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegistration} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your phone number"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                    disabled={loading}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {loading ? 'Registering...' : 'Register Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Registration Complete!</h3>
            <p className="text-gray-600 mb-6">
              Your warranty has been successfully registered. You will receive a confirmation email shortly.
            </p>
            
            <button
              onClick={resetForm}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Register Another Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};