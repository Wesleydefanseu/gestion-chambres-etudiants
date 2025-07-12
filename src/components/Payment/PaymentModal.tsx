import React, { useState } from 'react';
import { CreditCard, Smartphone, Check, X, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    room_title: string;
    total_price: number;
    start_date: string;
    end_date: string;
  };
  onPaymentSuccess: (paymentData: any) => void;
}

export default function PaymentModal({ isOpen, onClose, booking, onPaymentSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'mtn' | 'orange' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'method' | 'details' | 'processing' | 'success'>('method');
  const [transactionId, setTransactionId] = useState('');

  const commission = booking.total_price * 0.05; // 5% de commission
  const totalWithCommission = booking.total_price + commission;

  const resetModal = () => {
    setSelectedMethod(null);
    setPhoneNumber('');
    setProcessing(false);
    setStep('method');
    setTransactionId('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleMethodSelect = (method: 'mtn' | 'orange') => {
    setSelectedMethod(method);
    setStep('details');
  };

  const validatePhoneNumber = (number: string, operator: 'mtn' | 'orange') => {
    const cleanNumber = number.replace(/\s/g, '');
    if (operator === 'mtn') {
      return /^(\+237)?6[5-9]\d{7}$/.test(cleanNumber);
    } else if (operator === 'orange') {
      return /^(\+237)?6[9]\d{7}$/.test(cleanNumber);
    }
    return false;
  };

  const simulatePayment = async () => {
    setProcessing(true);
    setStep('processing');

    // Simuler le processus de paiement
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Générer un ID de transaction simulé
    const mockTransactionId = `${selectedMethod?.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setTransactionId(mockTransactionId);

    // Simuler le succès (90% de chance de succès)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      setStep('success');
      
      // Préparer les données de paiement
      const paymentData = {
        booking_id: booking.id,
        amount: totalWithCommission,
        payment_method: selectedMethod,
        transaction_id: mockTransactionId,
        phone_number: phoneNumber,
        commission: commission,
        status: 'completed'
      };

      // Appeler le callback de succès
      onPaymentSuccess(paymentData);
    } else {
      alert('Échec du paiement. Veuillez réessayer.');
      setStep('details');
    }

    setProcessing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMethod || !phoneNumber) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (!validatePhoneNumber(phoneNumber, selectedMethod)) {
      alert(`Numéro ${selectedMethod.toUpperCase()} invalide`);
      return;
    }

    await simulatePayment();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Paiement</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Résumé de la réservation */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">{booking.room_title}</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Du {new Date(booking.start_date).toLocaleDateString('fr-FR')}</p>
            <p>Au {new Date(booking.end_date).toLocaleDateString('fr-FR')}</p>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span>Montant:</span>
                <span>{booking.total_price.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Commission plateforme (5%):</span>
                <span>{commission.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between font-semibold text-primary-600 border-t pt-1">
                <span>Total à payer:</span>
                <span>{totalWithCommission.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Étape 1: Sélection de la méthode */}
        {step === 'method' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 mb-4">Choisissez votre méthode de paiement</h4>
            
            <button
              onClick={() => handleMethodSelect('mtn')}
              className="w-full flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
            >
              <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">MTN Mobile Money</div>
                <div className="text-sm text-gray-600">Paiement via MTN MoMo</div>
              </div>
            </button>

            <button
              onClick={() => handleMethodSelect('orange')}
              className="w-full flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors"
            >
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Orange Money</div>
                <div className="text-sm text-gray-600">Paiement via Orange Money</div>
              </div>
            </button>
          </div>
        )}

        {/* Étape 2: Détails du paiement */}
        {step === 'details' && selectedMethod && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                selectedMethod === 'mtn' ? 'bg-yellow-400' : 'bg-orange-500'
              }`}>
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">
                {selectedMethod === 'mtn' ? 'MTN Mobile Money' : 'Orange Money'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={selectedMethod === 'mtn' ? '+237 6XX XXX XXX' : '+237 69X XXX XXX'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {selectedMethod === 'mtn' 
                  ? 'Numéros MTN: 65X, 66X, 67X, 68X, 69X' 
                  : 'Numéros Orange: 69X'
                }
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Composez *126# sur votre téléphone</li>
                    <li>Suivez les instructions pour autoriser le paiement</li>
                    <li>Confirmez le montant de {totalWithCommission.toLocaleString()} FCFA</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('method')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Retour
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Payer {totalWithCommission.toLocaleString()} FCFA
              </button>
            </div>
          </form>
        )}

        {/* Étape 3: Traitement */}
        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Traitement du paiement...</h4>
            <p className="text-gray-600">
              Veuillez confirmer le paiement sur votre téléphone
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Montant: {totalWithCommission.toLocaleString()} FCFA<br />
                Méthode: {selectedMethod?.toUpperCase()}<br />
                Numéro: {phoneNumber}
              </p>
            </div>
          </div>
        )}

        {/* Étape 4: Succès */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Paiement réussi !</h4>
            <p className="text-gray-600 mb-4">
              Votre réservation a été confirmée et payée avec succès.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-green-800">
                <p><strong>ID Transaction:</strong> {transactionId}</p>
                <p><strong>Montant payé:</strong> {totalWithCommission.toLocaleString()} FCFA</p>
                <p><strong>Méthode:</strong> {selectedMethod?.toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}