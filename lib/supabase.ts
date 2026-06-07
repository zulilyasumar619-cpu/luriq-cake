import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  discount_percent: number;
};

export type Settings = {
  id: number;
  delivery_enabled: boolean;
  updated_at: string;
};

// Helper: hitung harga setelah diskon
export function getDiscountedPrice(product: Product): number {
  if (!product.discount_percent || product.discount_percent <= 0) {
    return product.price;
  }
  const discount = (product.price * product.discount_percent) / 100;
  return Math.round(product.price - discount);
}

// Helper: cek apakah produk ada diskon
export function hasDiscount(product: Product): boolean {
  return !!product.discount_percent && product.discount_percent > 0;
}
