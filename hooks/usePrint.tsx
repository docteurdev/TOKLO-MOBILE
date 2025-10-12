import { useState } from 'react';
import { View, StyleSheet, Button, Platform, Text } from 'react-native';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { formatXOF } from '@/util/comon';
import { IOrder, TInvoice } from '@/interfaces/type';
import { useUserStore } from '@/stores/user';
import { Colors } from '@/constants/Colors';

function html(reciept?: TInvoice) {
//  console.log("=============================",reciept.type);

return `
   <!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture de Retrait - Confection de Vêtement</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: #f8f9fa;
            padding: 10px;
            max-width: 100%;
        }
        
        .facture-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            max-width: 100%;
        }
        
        .facture-header {
            background-color: ${Colors.app.primary};
            color: white;
            padding: 15px;
            text-align: center;
        }
        
        .logo-container {
            text-align: center;
            margin-bottom: 15px;
        }
        
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: white;
        }
        
        .info-section {
            padding: 15px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .section-title {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        
        .info-item {
            margin-bottom: 5px;
        }
        
        .info-label {
            font-size: 12px;
            color: #6c757d;
        }
        
        .info-value {
            font-size: 14px;
            font-weight: 500;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        .items-table th {
            background-color: #f1f3f5;
            padding: 8px;
            text-align: left;
            font-size: 13px;
            color: #495057;
        }
        
        .items-table td {
            padding: 8px;
            border-bottom: 1px solid #dee2e6;
            font-size: 13px;
        }
        
        .total-section {
            padding: 15px;
            border-top: 1px solid #dee2e6;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        
        .total-label {
            font-size: 14px;
        }
        
        .total-value {
            font-size: 14px;
            font-weight: 600;
        }
        
        .grand-total {
            margin-top: 10px;
            font-size: 16px;
            font-weight: bold;
            color: ${Colors.app.primary};
        }
        
        .signature-section {
            padding: 15px;
            text-align: center;
            border-top: 1px solid #dee2e6;
        }
        
        .signature-line {
            margin: 15px auto;
            width: 70%;
            border-bottom: 1px solid #000;
        }
        
        .footer {
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
            background-color: #f8f9fa;
        }
        
        .barcode {
            text-align: center;
            margin: 15px 0;
            font-family: monospace;
            letter-spacing: 2px;
        }
        
        .status-paid {
            position: relative;
        }
        
        .status-paid::after {
            content: "PAYÉ";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 48px;
            color: rgba(40, 167, 69, 0.2);
            font-weight: bold;
            border: 5px solid rgba(40, 167, 69, 0.2);
            padding: 10px 20px;
            border-radius: 8px;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div class="facture-container status-paid">
        <div class="facture-header">
            <div class="logo-container">
                <div class="logo"> ${reciept?.storeName} </div>
            </div>
            <h2>FACTURE</h2>
            <p> ${reciept?.sotreSlogan} </p>
        </div>
        
        <div class="info-section">
            <div class="info-grid">
                <div>
                    <div class="section-title">Information Client</div>
                    <div class="info-item">
                        <div class="info-label">Nom</div>
                        <div class="info-value">${reciept?.clientFullName}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Téléphone</div>
                        <div class="info-value">${reciept?.clientPhone}</div>
                    </div>
                   
                </div>
                
                <div>
                    <div class="section-title">Détails Facture</div>
                    <div class="info-item">
                        <div class="info-label">N° Facture</div>
                        <div class="info-value">${reciept?.invoiceNumber}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Date</div>
                        <div class="info-value">${new Date().toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Statut</div>
                        <div class="info-value"> ${reciept?.staus} </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="padding: 0 15px;">
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Qté</th>
                        <th>Prix Unit.</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${reciept?.dressName}</td>
                        <td>${reciept?.quantite}</td>
                        <td>${formatXOF(Number(reciept?.price))}</td>
                        <td>${formatXOF(Number(reciept?.totalPrice))}</td>
                        
                    </tr>
                   
                </tbody>
            </table>
        </div>
        
        <div class="total-section">
            <div class="total-row">
                <div class="total-label">Sous-total:</div>
                <div class="total-value">${formatXOF(Number(reciept?.totalPrice))}</div>
            </div>
            <div class="total-row">
                <div class="total-label">Avance:</div>
                <div class="total-value">${formatXOF(Number(reciept?.paiement))}</div>
            </div>
            <div style="display: none" class="total-row">
                <div class="total-label">TVA (20%):</div>
                <div class="total-value">113,00 €</div>
            </div>
            <div class="total-row grand-total">
                <div class="total-label">TOTAL:</div>
                <div class="total-value"> ${formatXOF(Number(reciept?.biTotal))}</div>
            </div>
        </div>
        
        <div class="signature-section">
            <p>Signature client pour confirmation de retrait:</p>
            <div class="signature-line"></div>
            <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div class="barcode">
            *FACT20251234*
        </div>
        
        <div class="footer">
            <p>${reciept?.storeName} - ${reciept?.storeAddress}</p>
            <p>Tél: ${reciept?.storePhone} - Boutique: toklo-store.con</p>
            <p style="display: none">SIRET: 123 456 789 00012 - TVA: FR12 123456789</p>
        </div>
    </div>
</body>
</html>
 
 `
};

export default function usePrint() {
  const [selectedPrinter, setSelectedPrinter] = useState();
  const [reciept, setreciept] = useState<TInvoice> (); 

  const print = async (ticket?: TInvoice) => {
   setreciept(ticket);
    try {
      // Generate the PDF file
      const { uri } = await Print.printToFileAsync({html: html(ticket) });
      console.log('PDF file created at:', uri);

      // Initiate download by sharing the PDF file
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Error generating or sharing PDF:', error);
    }
  };

  const selectPrinter = async (ticket?: TInvoice) => {
   setreciept(ticket); 
   const printer = await Print.selectPrinterAsync(); // iOS only
    setSelectedPrinter(printer);
  };

  return {selectPrinter, print}
  ;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    flexDirection: 'column',
    padding: 8,
  },
  spacer: {
    height: 8,
  },
  printer: {
    textAlign: 'center',
  },
});
