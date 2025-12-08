export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  size?: string;
  cartItemId?: string; // Optional for external usage, required internally
  storeId?: string | number; // Can be string or number
}
