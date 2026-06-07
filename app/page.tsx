"use client";

import { useEffect, useState } from "react";
import { supabase, Product } from "@/lib/supabase";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (!error && data) setProducts(data as Product[]);
    setLoading(false);
  }

  function addToCart(p: Product) {
    setCart((c) => [...c, p]);
    setShowCart(true);
  }

  function removeFromCart(index: number) {
    setCart((c) => c.filter((_, i) => i !== index));
  }

  const total = cart.reduce((sum, p) => sum + Number(p.price), 0);

  function checkoutWA() {
    if (cart.length === 0) return;
    const lines = cart
      .map((p, i) => `${i + 1}. ${p.name} - Rp ${Number(p.price).toLocaleString("id-ID")}`)
      .join("%0A");
    const msg = `Halo Luriq Cake, saya mau pesan:%0A%0A${lines}%0A%0ATotal: Rp ${total.toLocaleString("id-ID")}`;
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-cream text-coffee">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl md:text-2xl font-semibold">
            Luriq <span className="text-caramel">Cake & Cookies</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#menu" className="hidden md:inline hover:text-caramel">Menu</a>
            <a href="#about" className="hidden md:inline hover:text-caramel">Tentang</a>
            <a href="#contact" className="hidden md:inline hover:text-caramel">Kontak</a>
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-coffee text-white px-4 py-2 rounded-full text-xs hover:bg-caramel"
            >
              🛒 Keranjang
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-6 leading-tight">
          Cookies Lezat,<br />
          <span className="text-caramel italic">Dibuat dengan Cinta</span>
        </h1>
        <p className="text-lg text-caramel max-w-md mx-auto mb-8">
          Cookies premium dari Gorontalo. Bahan pilihan, rasa yang tak terlupakan.
        </p>
        <a
          href="#menu"
          className="inline-block bg-coffee text-white px-8 py-3 rounded-full hover:bg-caramel transition"
        >
          Lihat Menu
        </a>
      </section>

      {/* Menu */}
      <section id="menu" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-light text-center mb-12">Menu Cookies</h2>

        {loading ? (
          <div className="text-center text-caramel py-12">Memuat produk...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-caramel py-12 bg-white/50 rounded-2xl">
            <p className="mb-2">Belum ada produk.</p>
            <p className="text-sm">Admin bisa menambahkan produk di halaman dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="h-64 bg-sand flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-caramel text-sm">🍪 Gambar Cookies</span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-medium text-xl mb-1">{product.name}</h3>
                  <p className="text-caramel text-sm mb-4 line-clamp-2">
                    {product.description || "Cookies premium pilihan."}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-coffee text-white px-4 py-2 rounded-full text-xs hover:bg-caramel"
                    >
                      + Keranjang
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About */}
      <section id="about" className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-light mb-6">Tentang Kami</h2>
          <p className="text-caramel leading-relaxed">
            <strong>Luriq Cake & Cookies</strong> adalah usaha rumahan yang berdomisili di
            Desa Lopo, Kecamatan Batudaa Pantai, Kota Gorontalo. Kami menghadirkan cookies
            premium dengan bahan pilihan dan resep yang dibuat dengan penuh cinta.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-light mb-6">Hubungi Kami</h2>
        <p className="text-caramel mb-8">
          Mau pesan atau tanya-tanya dulu? Kontak kami via:
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <a
            href="https://wa.me/"
            target="_blank"
            className="bg-coffee text-white px-6 py-3 rounded-full hover:bg-caramel"
          >
            💬 WhatsApp
          </a>
          <a
            href="mailto:hello@luriq.com"
            className="bg-white border border-coffee text-coffee px-6 py-3 rounded-full hover:bg-coffee hover:text-white"
          >
            ✉️ Email
          </a>
        </div>
        <p className="text-sm text-caramel mt-8">
          📍 Desa Lopo, Kec. Batudaa Pantai, Kota Gorontalo
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-coffee text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm">
          © {new Date().getFullYear()} Luriq Cake & Cookies • Gorontalo
          <div className="mt-2">
            <a href="/admin/login" className="text-white/70 hover:text-white text-xs">
              Admin Login
            </a>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      {showCart && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex justify-end"
          onClick={() => setShowCart(false)}
        >
          <div
            className="bg-white w-full max-w-md h-full p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light">Keranjang</h3>
              <button onClick={() => setShowCart(false)} className="text-2xl">×</button>
            </div>

            {cart.length === 0 ? (
              <p className="text-caramel text-center py-12">Keranjang masih kosong</p>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cart.map((p, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-cream p-3 rounded-xl"
                    >
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-caramel">
                          Rp {Number(p.price).toLocaleString("id-ID")}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(i)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-4 text-lg">
                    <span>Total:</span>
                    <strong>Rp {total.toLocaleString("id-ID")}</strong>
                  </div>
                  <button
                    onClick={checkoutWA}
                    className="w-full bg-coffee text-white py-3 rounded-full hover:bg-caramel"
                  >
                    Checkout via WhatsApp
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
