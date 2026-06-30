import { create } from 'zustand';

// Expanded to include the nested Prisma relations your drawer needs
interface CartItem {
  id: string; // Postgres ID or temporary UI ID
  variantId: string;
  quantity: number;
  currency?: string;
  variant?: {
    id: string;
    title: string;
    price: number;
    product?: {
      title: string;
      images: { url: string }[];
    };
  };
}

interface CartStore {
  items: CartItem[];
  cartCount: number;
  isCartOpen: boolean;
  toggleCart: () => void;
  loadCart: () => Promise<void>;
  addItem: (variantId: string, optimisticData?:any) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  cartCount: 0,
  isCartOpen: false,

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  // 1. CALCULATE TOTAL PRICE
  totalPrice: () => {
    const { items } = get();
    return items.reduce((total, item) => {
      const price = item.variant?.price || 0;
      return total + price * item.quantity;
    }, 0);
  },

  // 2. LOAD CART
  loadCart: async () => {
    try {
      const response = await fetch('/api/cart'); 
      if (!response.ok) return;
      
      const items = await response.json();
      const totalCount = items.reduce((total: number, item: CartItem) => total + (item.quantity || 1), 0);
      
      set({ items, cartCount: totalCount });
    } catch (error) {
      console.error("Failed to load cart on initialization:", error);
    }
  },

  // 3. OPTIMISTIC ADD
  addItem: async (variantId: string, optimisticData?: any) => {
    const previousItems = get().items;
    const previousCount = get().cartCount;

    const existingItemIndex = previousItems.findIndex(item => item.variantId === variantId);
    let optimisticItems;

    if (existingItemIndex !== -1) {
      optimisticItems = [...previousItems];
      optimisticItems[existingItemIndex].quantity += 1;
    } else {
      const tempId = `temp-${Date.now()}`;
    const newItem: CartItem = {
        id: tempId,
        variantId,
        quantity: 1,
        variant: optimisticData ? {
          id: variantId,
          title: optimisticData.variantTitle,
          price: optimisticData.price,
          product: {
            title: optimisticData.productTitle,
            images: [{ url: optimisticData.image }]
          }
        } : undefined
      };
      
      optimisticItems = [...previousItems, newItem];
    }
    
    set({ items: optimisticItems, cartCount: previousCount + 1 });

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId }),
      });

      if (!response.ok) throw new Error("Database transaction failed");
      
      // Re-sync to get the full variant details and images
      await get().loadCart();

    } catch (error) {
      set({ items: previousItems, cartCount: previousCount });
      console.error("Optimistic update failed. Rolled back.", error);
    }
  },

  // 4. OPTIMISTIC REMOVE
  removeItem: async (itemId: string) => {
    const previousItems = get().items;
    const previousCount = get().cartCount;
    
    const itemToRemove = previousItems.find(item => item.id === itemId);
    if (!itemToRemove) return;

    // Instantly remove from UI
    const optimisticItems = previousItems.filter(item => item.id !== itemId);
    set({
      items: optimisticItems,
      cartCount: previousCount - itemToRemove.quantity,
    });

    try {
      const response = await fetch('/api/cart/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        // CRITICAL FIX: Send the real variantId, not the temp itemId
        body: JSON.stringify({ variantId: itemToRemove.variantId }), 
      });

      if (!response.ok) throw new Error("Database remove failed");
    } catch (error) {
      set({ items: previousItems, cartCount: previousCount });
      console.error("Optimistic remove failed. Rolled back.", error);
    }
  },

  // 5. OPTIMISTIC UPDATE QUANTITY
  updateQuantity: async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      return get().removeItem(itemId);
    }

    const previousItems = get().items;
    const previousCount = get().cartCount;

    const itemToUpdate = previousItems.find(item => item.id === itemId);
    if (!itemToUpdate) return;

    const quantityDifference = quantity - itemToUpdate.quantity;

    // Instantly update UI
    const optimisticItems = previousItems.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );

    set({
      items: optimisticItems,
      cartCount: previousCount + quantityDifference,
    });

    try {
      const response = await fetch('/api/cart/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // CRITICAL FIX: Send the real variantId, not the temp itemId
        body: JSON.stringify({ variantId: itemToUpdate.variantId, quantity }),
      });

      if (!response.ok) throw new Error("Database update failed");
    } catch (error) {
      set({ items: previousItems, cartCount: previousCount });
      console.error("Optimistic quantity update failed. Rolled back.", error);
    }
  }
}));