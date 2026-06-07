"use client";

import { useEffect, useState } from "react";
import { supabase, Product } from "@/lib/supabase";

// ===== KONFIGURASI BISNIS =====
const BUSINESS_CONFIG = {
  name: "Luriq Cake & Cookies",
  whatsapp: "6281345468369", // Format: 62 + nomor tanpa 0 di depan
  email: "hello@luriq.com",
  location: "Desa Lopo, Kec. Batudaa Pantai, Kota Gorontalo",
  payment: {
    dana: {
      number: "6281345468369",
      name: "Nirmala O Umar",
    },
  },
};
// ==============================

type PaymentMethod = "dana" | "cod";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("dana");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

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

  function openCheckout() {
    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }
    setShowCart(false);
    setShowCheckout(true);
  }

  function submitOrder() {
    if (!customerName.trim()) {
      alert("Mohon isi nama kamu");
      return;
    }
    if (!customerAddress.trim()) {
      alert("Mohon isi alamat pengiriman");
      return;
    }

    // Format daftar pesanan
    const orderLines = cart
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} - Rp ${Number(p.price).toLocaleString("id-ID")}`
      )
      .join("%0A");

    // Format info pembayaran
    let paymentInfo = "";
    if (paymentMethod === "dana") {
      paymentInfo = `*Metode Pembayaran:* DANA%0A*Nomor DANA:* ${BUSINESS_CONFIG.payment.dana.number}%0A*Atas Nama:* ${BUSINESS_CONFIG.payment.dana.name}`;
    } else {
      paymentInfo = `*Metode Pembayaran:* COD (Bayar di Tempat)`;
    }

    // Format pesan WhatsApp
    const message =
      `*PESANAN BARU - ${BUSINESS_CONFIG.name}*%0A%0A` +
      `*Nama:* ${customerName}%0A` +
      `*Alamat:* ${customerAddress}%0A%0A` +
      `*Detail Pesanan:*%0A${orderLines}%0A%0A` +
      `*Total:* Rp ${total.toLocaleString("id-ID")}%0A%0A` +
      `${paymentInfo}%0A%0A` +
      `Mohon konfirmasi pesanan ini. Terima kasih! 🍪`;

    window.open(
      `https://wa.me/${BUSINESS_CONFIG.whatsapp}?text=${message}`,
      "_blank"
    );
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
            <a href="#menu" className="hidden md:inline hover:text-caramel">
              Menu
            </a>
            <a href="#about" className="hidden md:inline hover:text-caramel">
              Tentang
            </a>
            <a href="#contact" className="hidden md:inline hover:text-caramel">
              Kontak
            </a>
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
          Cookies Lezat,
          <br />
          <span className="text-caramel italic">Dibuat dengan Cinta</span>
        </h1>
        <p className="text-lg text-caramel max-w-md mx-auto mb-8">
          Cookies premium dari Gorontalo. Bahan pilihan, rasa yang tak
          terlupakan.
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
            <p className="text-sm">
              Admin bisa menambahkan produk di halaman dashboard.
            </p>
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
                    <span className="text-caramel text-sm">
                      🍪 Gambar Cookies
                    </span>
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
            <strong>Luriq Cake & Cookies</strong> adalah usaha rumahan yang
            berdomisili di Desa Lopo, Kecamatan Batudaa Pantai, Kota Gorontalo.
            Kami menghadirkan cookies premium dengan bahan pilihan dan resep
            yang dibuat dengan penuh cinta.
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
            href={`https://wa.me/${BUSINESS_CONFIG.whatsapp}`}
            target="_blank"
            className="bg-coffee text-white px-6 py-3 rounded-full hover:bg-caramel"
          >
            💬 WhatsApp
          </a>
          <a
            href={`mailto:${BUSINESS_CONFIG.email}`}
            className="bg-white border border-coffee text-coffee px-6 py-3 rounded-full hover:bg-coffee hover:text-white"
          >
            ✉️ Email
          </a>
        </div>
        <p className="text-sm text-caramel mt-8">📍 {BUSINESS_CONFIG.location}</p>
      </section>

      {/* Footer */}
      <footer className="bg-coffee text-white py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm">
          © {new Date().getFullYear()} {BUSINESS_CONFIG.name} • Gorontalo
          <div className="mt-2">
            <a
              href="/admin/login"
              className="text-white/70 hover:text-white text-xs"
            >
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
              <button onClick={() => setShowCart(false)} className="text-2xl">
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-caramel text-center py-12">
                Keranjang masih kosong
              </p>
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
                    onClick={openCheckout}
                    className="w-full bg-coffee text-white py-3 rounded-full hover:bg-caramel"
                  >
                    Lanjut Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCheckout(false)}
        >
          <div
            className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light">Checkout</h3>
              <button
                onClick={() => setShowCheckout(false)}
                className="text-2xl"
              >
                ×
              </button>
            </div>

            {/* Ringkasan Pesanan */}
            <div className="bg-cream p-4 rounded-xl mb-5">
              <div className="text-sm font-medium mb-2">Ringkasan Pesanan</div>
              {cart.map((p, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-caramel">{p.name}</span>
                  <span>Rp {Number(p.price).toLocaleString("id-ID")}</span>
                </div>
              ))}
              <div className="flex justify-between border-t mt-2 pt-2 font-semibold">
                <span>Total</span>
                <span>Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            {/* Data Customer */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-sm mb-1 text-coffee">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-coffee"
                  placeholder="Nama kamu"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-coffee">
                  Alamat Pengiriman *
                </label>
                <textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-coffee"
                  placeholder="Alamat lengkap untuk pengiriman"
                  required
                />
              </div>
            </div>

            {/* Pilih Metode Pembayaran */}
            <div className="mb-5">
              <label className="block text-sm mb-2 text-coffee font-medium">
                Pilih Metode Pembayaran
              </label>
              <div className="space-y-2">
                {/* DANA */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("dana")}
                  className={`w-full text-left border-2 rounded-xl p-4 transition ${
                    paymentMethod === "dana"
                      ? "border-coffee bg-cream"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      DANA
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">DANA</div>
                      <div className="text-xs text-caramel">
                        Transfer ke nomor DANA
                      </div>
                    </div>
                    {paymentMethod === "dana" && (
                      <span className="text-coffee">✓</span>
                    )}
                  </div>
                </button>

                {/* COD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`w-full text-left border-2 rounded-xl p-4 transition ${
                    paymentMethod === "cod"
                      ? "border-coffee bg-cream"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      COD
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Bayar di Tempat (COD)</div>
                      <div className="text-xs text-caramel">
                        Bayar saat barang sampai
                      </div>
                    </div>
                    {paymentMethod === "cod" && (
                      <span className="text-coffee">✓</span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Info Detail Pembayaran (jika DANA) */}
            {paymentMethod === "dana" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 text-sm">
                <div className="font-medium text-blue-900 mb-2">
                  💳 Detail Pembayaran DANA
                </div>
                <div className="space-y-1 text-blue-800">
                  <div>
                    <span className="text-blue-600">Nomor DANA:</span>{" "}
                    <strong>{BUSINESS_CONFIG.payment.dana.number}</strong>
                  </div>
                  <div>
                    <span className="text-blue-600">Atas Nama:</span>{" "}
                    <strong>{BUSINESS_CONFIG.payment.dana.name}</strong>
                  </div>
                </div>
                <div className="mt-3 text-xs text-blue-700 italic">
                  Transfer sesuai total, lalu kirim bukti via WhatsApp setelah
                  klik tombol di bawah.
                </div>
              </div>
            )}

            {/* Tombol Submit */}
            <button
              onClick={submitOrder}
              className="w-full bg-green-600 text-white py-3 rounded-full hover:bg-green-700 flex items-center justify-center gap-2 font-medium"
            >
              💬 Kirim Pesanan via WhatsApp
            </button>

            <p className="text-xs text-center text-caramel mt-3">
              Pesanan akan dikirim ke WhatsApp admin untuk konfirmasi
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
