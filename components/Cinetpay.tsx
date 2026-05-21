"use dom"
import React, { useEffect, useState } from 'react';

const CinetPay = ({ bookingData }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("=================", bookingData);
  }, [bookingData]);

  // Create iframe content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="Content-Security-Policy" content="default-src * gap:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.cinetpay.com; object-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'none'; font-src 'self' data:; connect-src *">
        <script src="https://cdn.cinetpay.com/seamless/main.js"></script>
        <style>
            .sdk {
                display: block;
                position: absolute;
                background-position: center;
                text-align: center;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
        </style>
        <script>
            function loadScript(url, callback) {
                var script = document.createElement("script")
                script.type = "text/javascript";
                script.onload = function() {
                    callback(null);
                };
                script.onerror = function() {
                    callback(new Error('Failed to load the script.'));
                };
                script.src = url;
                document.getElementsByTagName("head")[0].appendChild(script);
            }
            
            loadScript("https://cdn.cinetpay.com/seamless/main.js", function(error) {
                if (error) {
                    console.error('Error loading CinetPay script:', error);
                } else {
                    console.log('CinetPay script loaded successfully');
                }
            });

            function checkout() {
                console.log("Checkout function called");
                if (typeof CinetPay === 'undefined') {
                    console.error("CinetPay is not defined");
                    alert("Payment system is not available. Please try again later.");
                    return;
                }
                CinetPay.setConfig({
                    apikey: '2062271806665f3a8d2f4bc8.75775900',
                    site_id: "5873225",
                    notify_url: "https://affairez.com/notify.php",
                    mode: 'DEVELOPMENT'
                });
                CinetPay.getCheckout({
                    transaction_id: Math.floor(Math.random() * 100000000).toString(),
                    amount: 100,
                    currency: 'XOF',
                    channels: 'ALL',
                    description: 'Test de paiement',   
                    customer_name:"Joe",
                    customer_surname:"Down",
                    customer_email: "down@test.com",
                    customer_phone_number: "088767611",
                    customer_address : "BP 0024",
                    customer_city: "Antananarivo",
                    customer_country : "CM",
                    customer_state : "CM",
                    customer_zip_code : "06510",
                });
                CinetPay.waitResponse(function(data) {
                    console.log("CinetPay response:", data);
                    if (data.status == "REFUSED") {
                        alert("Votre paiement a échoué");
                    } else if (data.status == "ACCEPTED") {
                        alert("Votre paiement a été effectué avec succès");
                    }
                });
                CinetPay.onError(function(data) {
                    console.error("CinetPay error:", data);
                });
            }
        </script>
    </head>
    <body>
        <div onload="checkout()" class="sdk">
            <h1>SDK SEAMLESS</h1>
            <button onclick="checkout()">Checkout</button>
        </div>
    </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'console.log') {
        console.log('iframe log:', data.message);
      } else if (data.type === 'console.error') {
        console.error('iframe error:', data.message);
      }
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-red-500">An error occurred: {error}</div>
        <button 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setError(null)}
        >
          Retry
        </button>
      </Card>
    );
  }

  return (
    <div className="w-full h-screen relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-lg">Loading...</div>
        </div>
      )}
      <iframe
        srcDoc={htmlContent}
        className="w-full h-full border-0"
        allow="payment"
        onLoad={() => setIsLoading(false)}
        onError={(e) => setError('iframe error: ' + e.message)}
      />
    </div>
  );
};

export default CinetPay;