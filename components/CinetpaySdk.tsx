"use dom"
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

const CinetPaySDK = forwardRef(({
  structure,
  userName,
  phone,
  email,
  amount,
  service,
  firstName,
  lastName
}, ref) => {
  const [isCinetPayLoaded, setIsCinetPayLoaded] = useState(false);

  // Config values would typically come from environment variables
  // const config = {
  //   apikey: process.env.REACT_APP_CINETPAY_APIKEY || '',
  //   site_id: process.env.REACT_APP_CINETPAY_SITE_ID || '',
  //   notify_url: process.env.REACT_APP_CINETPAY_NOTIFY_URL || 'https://affairez.com/notify.php',
  //   mode: process.env.REACT_APP_CINETPAY_MODE || 'DEVELOPMENT'
  // };

  const loadCinetPayScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.cinetpay.com/seamless/main.js';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load script'));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    if (typeof window.CinetPay === 'undefined') {
      loadCinetPayScript()
        .then(() => {
          setIsCinetPayLoaded(true);
        })
        .catch((error) => {
          console.error('Error loading CinetPay script:', error);
        });
    } else {
      setIsCinetPayLoaded(true);
    }
  }, []);

  const checkout = async (handlePost) => {
    if (!isCinetPayLoaded) {
      console.error('CinetPay is not loaded yet.');
      return;
    }

    window.CinetPay.setConfig({
     apikey: '2062271806665f3a8d2f4bc8.75775900',
     site_id: "5873225",
      notify_url: "https://affairez.com/notify.php",
      mode: 'DEVELOPMENT'
    });

    window.CinetPay.getCheckout({
      transaction_id: Math.floor(Math.random() * 100000000).toString(),
      amount: amount,
      currency: 'XOF',
      channels: 'ALL',
      description: service,
      customer_name: firstName,
      customer_surname: lastName,
      customer_email: email,
      customer_phone_number: phone,
      customer_address: "BP 000",
      customer_city: "Abidjan",
      customer_country: "CI",
      customer_state: "CM",
      customer_zip_code: "000",
    });

    window.CinetPay.waitResponse(function(data) {
      if (data.status === "REFUSED") {
        alert("Votre paiement a échoué");
        window.location.reload();
      } else if (data.status === "ACCEPTED") {
        handlePost();
        alert("Votre paiement a été effectué avec succès");
        window.location.reload();
      }
    });

    window.CinetPay.onError(function(data) {
      console.log(data);
    });
  };

  // Expose the checkout method to parent components
  useImperativeHandle(ref, () => ({
    checkout
  }));

  return (
    <div 
      className=""
    >
      {/* Child components can be added here */}
    </div>
  );
});

CinetPaySDK.displayName = 'CinetPaySDK';

export default CinetPaySDK;