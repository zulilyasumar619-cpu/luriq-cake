"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  supabase,
  Product,
  Settings,
  getDiscountedPrice,
  hasDiscount,
} from "@/lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  // form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [discountPercent, setDiscountPercent] = useState("0");

  // settings state
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAdmin = localStorage.getItem("isAdmin");
      if (!isAdmin) {
        router.push("/admin/login");
        return;
      }
    }
    fetchProducts();
    fetchSettings();
  }, [router]);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });
    if (!error && data) setProducts(data as Product[]);
    setLoading(false);
  }

  async function fetchSettings() {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (!error && data) {
      const s = data as Settings;
      setDeliveryEnabled(s.delivery_enabled);
    }
  }

  async function toggleDelivery() {
    const newValue = !deliveryEnabled;
    setSavingSettings(true);
    const { error } = await supabase
      .from("settings")
      .update({
        delivery_enabled: newValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) {
      alert("Gagal update setting: " + error.message);
      setSavingSettings(false);
      return;
    }
    setDeliveryEnabled(newValue);
    setSavingSettings(false);
  }

  function openNew() {
    setEditing(null);
    setName("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setDiscountPercent("0");
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setName(p.name);
    setDescription(p.description || "");
    setPrice(String(p.price));
    setImageUrl(p.image_url || "");
    setDiscountPercent(String(p.discount_percent || 0));
    setShowForm(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar (JPG, PNG, dll)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (uploadError) {
        alert("Gagal upload: " + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      setImageUrl(urlData.publicUrl);
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }

    setUploading(false);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();

    // Validasi diskon
    const discountNum = parseInt(discountPercent, 10) || 0;
    if (discountNum < 0 || discountNum > 100) {
      alert("Diskon harus antara 0 - 100%");
      return;
    }

    const payload = {
      name,
      description: description || null,
      price: parseInt(price, 10),
      image_url: imageUrl || null,
      discount_percent: discountNum,
    };

    if (editing) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        alert("Gagal update: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) {
        alert("Gagal tambah: " + error.message);
        return;
      }
    }

    setShowForm(false);
    fetchProducts();
  }

  async function deleteProduct(id: number) {
    if (!confirm("Yakin hapus produk ini?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("Gagal hapus: " + error.message);
      return;
    }
    fetchProducts();
  }

  function logout() {
    localStorage.removeItem("isAdmin");
    router.push("/admin/login");
  }

  // Preview harga di form
  const previewPrice = parseInt(price, 10) || 0;
  const previewDiscount = parseInt(discountPercent, 10) || 0;
  const previewFinalPrice =
    previewDiscount > 0
      ? Math.round(previewPrice - (previewPrice * previewDiscount) / 100)
      : previewPrice;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-light text-coffee">
              Admin Dashboard
            </h1>
            <p className="text-caramel text-sm mt-1">
              Kelola produk Luriq Cake & Cookies
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/"
              className="text-sm px-4 py-2 border border-coffee rounded-full hover:bg-coffee hover:text-white"
            >
              Lihat Website
            </a>
            <button
              onClick={logout}
              className="text-sm px-4 py-2 border border-coffee rounded-full hover:bg-coffee hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>

        {/* === SETTINGS: TOGGLE DELIVERY === */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-medium mb-4 text-coffee">
            ⚙️ Pengaturan Toko
          </h2>
          <div className="flex items-center justify-between bg-cream p-4 rounded-xl">
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                🛵 Layanan Delivery
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    deliveryEnabled
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {deliveryEnabled ? "AKTIF" : "NONAKTIF"}
                </span>
              </div>
              <div className="text-sm text-caramel mt-1">
                {deliveryEnabled
                  ? "Customer bisa pilih opsi delivery saat checkout (ongkir via chat WA)."
                  : "Customer hanya bisa jemput di tempat. Nyalakan kalau kamu siap mengantar."}
              </div>
            </div>
            <button
              onClick={toggleDelivery}
              disabled={savingSettings}
              className={`relative w-16 h-8 rounded-full transition flex-shrink-0 ${
                deliveryEnabled ? "bg-green-500" : "bg-gray-300"
              } ${savingSettings ? "opacity-50 cursor-wait" : ""}`}
              aria-label="Toggle delivery"
            >
              <span
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${
                  deliveryEnabled ? "left-9" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* === DAFTAR PRODUK === */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light">Daftar Produk</h2>
            <button
              onClick={openNew}
              className="bg-coffee text-white px-5 py-2 rounded-full text-sm hover:bg-caramel"
            >
              + Tambah Produk
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-caramel">Memuat...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-caramel">
              Belum ada produk. Klik &quot;Tambah Produk&quot; untuk mulai.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((p) => {
                const discounted = hasDiscount(p);
                const finalPrice = getDiscountedPrice(p);
                return (
                  <div
                    key={p.id}
                    className="flex gap-4 bg-cream p-4 rounded-xl relative"
                  >
                    {discounted && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{p.discount_percent}%
                      </div>
                    )}
                    <div className="w-20 h-20 bg-sand rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-caramel">🍪</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-sm text-caramel truncate">
                        {p.description || "-"}
                      </div>
                      <div className="text-sm mt-1">
                        {discounted ? (
                          <>
                            <span className="text-gray-400 line-through text-xs mr-2">
                              Rp {Number(p.price).toLocaleString("id-ID")}
                            </span>
                            <span className="font-semibold text-red-600">
                              Rp {finalPrice.toLocaleString("id-ID")}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold">
                            Rp {Number(p.price).toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-xs px-3 py-1 bg-coffee text-white rounded-full hover:bg-caramel"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="text-xs px-3 py-1 border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-light mb-6">
              {editing ? "Edit Produk" : "Tambah Produk"}
            </h3>

            <form onSubmit={saveProduct} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-coffee">
                  Nama Produk
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-coffee"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-coffee">
                  Deskripsi
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-coffee"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-coffee">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-coffee"
                  required
                  min="0"
                />
              </div>

              {/* === DISKON === */}
              <div>
                <label className="block text-sm mb-1 text-coffee">
                  Diskon (%) — isi 0 jika tidak ada diskon
                </label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:border-coffee"
                  min="0"
                  max="100"
                  placeholder="0"
                />
                {previewDiscount > 0 && previewPrice > 0 && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                    <div className="text-red-700 font-medium mb-1">
                      🏷️ Preview Harga Diskon
                    </div>
                    <div>
                      <span className="text-gray-400 line-through mr-2">
                        Rp {previewPrice.toLocaleString("id-ID")}
                      </span>
                      <span className="text-red-600 font-bold">
                        Rp {previewFinalPrice.toLocaleString("id-ID")}
                      </span>
                      <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                        -{previewDiscount}% OFF
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Gambar */}
              <div>
                <label className="block text-sm mb-1 text-coffee">
                  Gambar Produk
                </label>

                {imageUrl && (
                  <div className="mb-3 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}

                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl px-4 py-6 text-center cursor-pointer hover:border-coffee hover:bg-cream transition">
                    {uploading ? (
                      <span className="text-caramel">⏳ Mengupload...</span>
                    ) : (
                      <>
                        <div className="text-2xl mb-2">📤</div>
                        <div className="text-sm text-coffee font-medium">
                          {imageUrl ? "Ganti Gambar" : "Pilih Gambar"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          JPG, PNG, max 5MB
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-coffee text-coffee py-2 rounded-full hover:bg-coffee hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-coffee text-white py-2 rounded-full hover:bg-caramel disabled:opacity-50"
                >
                  {editing ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
