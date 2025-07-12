import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, FileText, Calendar, User, Home, CreditCard } from 'lucide-react';

interface InvoiceData {
  id: string;
  booking: {
    id: string;
    room: {
      title: string;
      location: string;
      district: string;
    };
    student: {
      name: string;
      email: string;
      phone?: string;
    };
    start_date: string;
    end_date: string;
    total_price: number;
  };
  payment: {
    id: string;
    amount: number;
    payment_method: string;
    transaction_id: string;
    payment_date: string;
  };
}

interface InvoiceGeneratorProps {
  invoiceData: InvoiceData;
  onClose: () => void;
}

export default function InvoiceGenerator({ invoiceData, onClose }: InvoiceGeneratorProps) {
  const generatePDF = async () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Facture_${invoiceData.booking.id.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération de la facture');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const commission = invoiceData.payment.amount * 0.05;
  const netAmount = invoiceData.payment.amount - commission;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <FileText className="w-6 h-6 text-primary-600" />
              <span>Facture de Réservation</span>
            </h3>
            <div className="flex space-x-3">
              <button
                onClick={generatePDF}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger PDF</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div id="invoice-content" className="p-8 bg-white">
          {/* En-tête de la facture */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-cameroon-green to-cameroon-red rounded-lg flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">KmerLogis</h1>
                  <p className="text-sm text-gray-600">Plateforme de logement étudiant</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Logbessou, Douala - Cameroun</p>
                <p>Tél: +237 654 545 696</p>
                <p>Email: contact@kmerlogis.cm</p>
              </div>
            </div>
            
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">FACTURE</h2>
              <div className="text-sm text-gray-600">
                <p><strong>N° Facture:</strong> FAC-{invoiceData.payment.id.slice(0, 8)}</p>
                <p><strong>Date:</strong> {new Date(invoiceData.payment.payment_date).toLocaleDateString('fr-FR')}</p>
                <p><strong>Réservation:</strong> {invoiceData.booking.id.slice(0, 8)}</p>
              </div>
            </div>
          </div>

          {/* Informations client */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Informations Client
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Nom:</strong> {invoiceData.booking.student.name}</p>
                <p><strong>Email:</strong> {invoiceData.booking.student.email}</p>
                {invoiceData.booking.student.phone && (
                  <p><strong>Téléphone:</strong> {invoiceData.booking.student.phone}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Home className="w-5 h-5 mr-2 text-primary-600" />
                Détails du Logement
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Chambre:</strong> {invoiceData.booking.room.title}</p>
                <p><strong>Localisation:</strong> {invoiceData.booking.room.location}</p>
                <p><strong>Quartier:</strong> {invoiceData.booking.room.district}</p>
              </div>
            </div>
          </div>

          {/* Détails de la réservation */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Période de Réservation
            </h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Date de début</p>
                  <p className="text-gray-900">{new Date(invoiceData.booking.start_date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Date de fin</p>
                  <p className="text-gray-900">{new Date(invoiceData.booking.end_date).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Durée</p>
                  <p className="text-gray-900">
                    {Math.ceil((new Date(invoiceData.booking.end_date).getTime() - new Date(invoiceData.booking.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} mois
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Détails du paiement */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
              Détails du Paiement
            </h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="font-medium text-gray-700">Méthode de paiement</p>
                  <p className="text-gray-900">{invoiceData.payment.payment_method.toUpperCase()}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">ID Transaction</p>
                  <p className="text-gray-900 font-mono">{invoiceData.payment.transaction_id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Récapitulatif financier */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Récapitulatif Financier</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Montant de la réservation</span>
                  <span className="font-medium">{formatPrice(invoiceData.booking.total_price)} FCFA</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Commission plateforme (5%)</span>
                  <span>{formatPrice(commission)} FCFA</span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                    <span>Total payé</span>
                    <span className="text-primary-600">{formatPrice(invoiceData.payment.amount)} FCFA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de page */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>Merci de votre confiance !</strong>
            </p>
            <p>
              Cette facture est générée automatiquement par le système KmerLogis.
            </p>
            <p className="mt-4">
              Pour toute question, contactez-nous : support@kmerlogis.cm | +237 654 545 696
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}