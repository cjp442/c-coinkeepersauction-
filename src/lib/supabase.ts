// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example of a real-time subscription
action setupRealTimeSubscription() {
    const subscription = supabase
        .from('your-table-name')
        .on('INSERT', payload => {
            console.log('New entry added:', payload);
        })
        .subscribe();
    return subscription;
}

// Transaction handling example
async function handleTransaction() {
    const { data, error } = await supabase
        .from('your-table-name')
        .upsert([{ id: 1, name: 'New Name' }]);
    if (error) {
        console.error('Transaction error:', error);
        return;
    }
    console.log('Transaction success:', data);
}

// Error handling helper function
function handleError(error) {
    if (error) {
        console.error('Error:', error.message);
    }
}

export { supabase, setupRealTimeSubscription, handleTransaction, handleError };