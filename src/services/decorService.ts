// src/services/decorService.ts

export function getAllDecor(): Promise<unknown[]> {
    // TODO: Replace with: const { data } = await supabase.from('decor_items').select('*')
    return Promise.resolve([]);
}

export function getUserInventory(_userId: string): Promise<unknown[]> {
    // TODO: Replace with: const { data } = await supabase.from('user_inventory').select('*').eq('user_id', _userId)
    return Promise.resolve([]);
}

export function purchaseDecor(_itemId: string, _userId: string): Promise<void> {
    // TODO: Replace with supabase insert into purchases
    return Promise.resolve();
}

export function placeDecorInRoom(_itemId: string, _roomId: string): Promise<void> {
    // TODO: Replace with supabase update room layout
    return Promise.resolve();
}

export function removeDecor(_itemId: string, _roomId: string): Promise<void> {
    // TODO: Replace with supabase remove from room layout
    return Promise.resolve();
}