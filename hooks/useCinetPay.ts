import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';

const CINETPAY_API_KEY = '2062271806665f3a8d2f4bc8.75775900';
const CINETPAY_SITE_ID = '5873225';
const CINETPAY_API_URL = 'https://api-checkout.cinetpay.com/v2/payment';
const NOTIFY_URL = 'YOUR_NOTIFICATION_URL';

export const useCinetPay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiatePayment = async ({
    amount,
    currency = 'XOF',
    designation,
    customerName,
    customerEmail
  }:{amount:number, currency?:string, designation?:string, customerName?:string, customerEmail?:string}) => {
    setLoading(true);
    setError(null);
    
    try {
      const transId = `TRANS_${Date.now()}`;
      const paymentData = {
        apikey: CINETPAY_API_KEY,
        site_id: CINETPAY_SITE_ID,
        transaction_id: transId,
        amount,
        currency,
        description: designation,
        customer_name: customerName,
        customer_email: customerEmail,
        notify_url: NOTIFY_URL,
        return_url: 'styfy',
        channels: 'ALL'
      };

      const response = await axios.post(CINETPAY_API_URL, paymentData);
      console.log(response);

      if (response.data.code === '201') {
        await WebBrowser.openBrowserAsync(response.data.data.payment_url);
        return { success: true, transactionId: transId, data: response.data };
      } else {
        throw new Error(response.data.description);
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  function myPaiement(){

    
    var data = JSON.stringify({
      "apikey": CINETPAY_API_KEY,
      "site_id": CINETPAY_SITE_ID,
      "transaction_id":  Math.floor(Math.random() * 100000000).toString(), //
      "amount": 100,
      "currency": "XOF",
      "alternative_currency": "",
      "description": " TEST INTEGRATION ",
      "customer_id": "172",
      "customer_name": "KOUADIO",
      "customer_surname": "Francisse",
      "customer_email": "harrissylver@gmail.com",
      "customer_phone_number": "+2250142269019",
      "customer_address": "Antananarivo",
      "customer_city": "Antananarivo",
      "customer_country": "CM",
      "customer_state": "CM",
      "customer_zip_code": "065100",
      "notify_url": "https://webhook.site/d1dbbb89-52c7-49af-a689-b3c412df820d",
      "return_url": "https://webhook.site/d1dbbb89-52c7-49af-a689-b3c412df820d",
      "channels": "ALL",
      "metadata": "user1",
      "lang": "FR",
      "invoice_data": {
        "Donnee1": "",
        "Donnee2": "",
        "Donnee3": ""
      }
    });

    var config = {
      method: 'post',
      url: 'https://api-checkout.cinetpay.com/v2/payment',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };

    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

  }

  return { initiatePayment, myPaiement, loading, error };
};

