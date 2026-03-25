import React, { useState } from 'react';

const TokenShop = () => {
  const [coinAmount, setCoinAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const usdPrice = coinAmount * 0.01;
  const taxRate = 0.1;
  const taxAmount = usdPrice * taxRate;
  const totalPrice = usdPrice + taxAmount;

  const handlePurchase = () => {
    setShowConfirmation(true);
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <div>
      <h1>Token Shop</h1>
      <label>Coin Amount:</label>
      <input
        type="number"
        value={coinAmount}
        onChange={(e) => setCoinAmount(Number(e.target.value))}
      />
      <p>Price in USD: ${usdPrice.toFixed(2)}</p>
      <p>Tax: ${taxAmount.toFixed(2)}</p>
      <p>Total Price: ${totalPrice.toFixed(2)}</p>
      <h3>Payment Methods</h3>
      <select onChange={(e) => setPaymentMethod(e.target.value)}>
        <option value="">Select Payment Method</option>
        <option value="credit_card">Credit Card</option>
        <option value="paypal">PayPal</option>
      </select>
      <button onClick={handlePurchase}>Purchase</button>

      {showConfirmation && (
        <div>
          <h2>Confirmation</h2>
          <p>You have purchased {coinAmount} coins for ${totalPrice.toFixed(2)}.</p>
          <button onClick={closeConfirmation}>Close</button>
        </div>
      )}
    </div>
  );
};

export default TokenShop;
