import { useContext } from 'react';
import { CartContext, type Region } from '../contexts/CartContext';

export { type Region };

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
