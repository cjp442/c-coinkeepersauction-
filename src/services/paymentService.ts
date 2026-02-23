import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe('your-stripe-secret-key', {
    apiVersion: '2020-08-27',
});

// Function to process payment
export const processPayment = async (amount, currency, paymentMethodId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method: paymentMethodId,
            confirmations: 'required',
        });
        return paymentIntent;
    } catch (error) {
        throw new Error(`Payment processing failed: ${error.message}`);
    }
};

// Function to handle subscriptions
export const createSubscription = async (customerId, priceId) => {
    try {
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
        });
        return subscription;
    } catch (error) {
        throw new Error(`Subscription creation failed: ${error.message}`);
    }
};

// Function to manage transactions
export const manageTransaction = async (transactionId) => {
    try {
        const transaction = await stripe.balanceTransactions.retrieve(transactionId);
        return transaction;
    } catch (error) {
        throw new Error(`Transaction retrieval failed: ${error.message}`);
    }
};

// Export all functions
export default {
    processPayment,
    createSubscription,
    manageTransaction,
};
