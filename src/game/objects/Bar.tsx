import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Adjust the import according to your Supabase client setup

const Bar = () => {
    const [price, setPrice] = useState(0);
    const [tokenCount, setTokenCount] = useState(0);
    const [taxRate, setTaxRate] = useState(0.1); // Assuming a 10% tax rate
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        // Fetch real-time price from your API or state management here
        const fetchPrice = async () => {
            // Fetch logic to get the current price
            const currentPrice = await fetchCurrentPrice();
            setPrice(currentPrice);
        };

        fetchPrice();
    }, []);

    useEffect(() => {
        // Calculate total price including tax
        const calculatedTotalPrice = tokenCount * price * (1 + taxRate);
        setTotalPrice(calculatedTotalPrice);
    }, [tokenCount, price]);

    const handlePurchase = async () => {
        // Transaction logging to Supabase
        const { data, error } = await supabase
            .from('transactions')
            .insert([
                { amount: tokenCount, total: totalPrice, timestamp: new Date().toISOString() },
            ]);

        if (error) {
            console.error('Error logging transaction:', error);
        } else {
            console.log('Transaction logged:', data);
        }

        // Reset token count after purchase
        setTokenCount(0);
    };

    return (
        <div>
            <h1>Token Purchase</h1>
            <div>
                <label>Token Count:</label>
                <input
                    type="number"
                    value={tokenCount}
                    onChange={(e) => setTokenCount(Number(e.target.value))}
                />
            </div>
            <div>
                <p>Current Price: {price} coins</p>
                <p>Total Price (incl. tax): {totalPrice} coins</p>
                <button onClick={handlePurchase}>Purchase</button>
            </div>
        </div>
    );
};

export default Bar;
