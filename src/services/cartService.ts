import { CartItem } from '../types';
import { db } from './db/database';

export class CartService {
  /**
   * Get cart items strictly isolated for this specific user
   */
  public getCartForUser(userId: string): CartItem[] {
    if (!userId) return [];
    return db.getCartForUser(userId) as CartItem[];
  }

  /**
   * Save cart items for this specific user
   */
  public saveCartForUser(userId: string, items: CartItem[]): void {
    if (!userId) return;
    db.saveCartForUser(userId, items);
  }

  /**
   * Clear user's cart
   */
  public clearCartForUser(userId: string): void {
    if (!userId) return;
    db.saveCartForUser(userId, []);
  }
}

export const cartService = new CartService();
