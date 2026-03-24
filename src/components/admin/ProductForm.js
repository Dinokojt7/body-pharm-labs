"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getProducts, adminCreateProduct, adminUpdateProduct } from "@/lib/firebase/firestore";
import { uploadProductImage } from "@/lib/firebase/storage";
import { ArrowLeft, Upload, X } from "lucide-react";

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

const CATEGORIES = ["Recovery", "Weight Management", "Performance", "Tanning", "Wellness", "Other"];

const emptyForm = {
  name: "", slug: "", subtitle: "", type: "Research Peptide",
  description: "", details: "", benefits: "", category: "",
  size: "", sizes: "", sizePrices: "", price: "", compareAtPrice: "",
  purity: ">99%", stock: "", featured: false, points: "",
  customColor: "#6ab04c", imageFit: "",
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseLines(str) {
  return str.split("\n").map((s) => s.trim()).filter(Boolean);
}

function parseSizes(str) {
  return str.split(",").map((s) => s.trim()).filter(Boolean);
}

function parseSizePrices(str) {
  const obj = {};
  str.split(",").forEach((pair) => {
    const [key, val] = pair.split(":").map((s) => s.trim());
    if (key && val) obj[key] = parseFloat(val) || 0;
  });
  return obj;
}

function serializeSizePrices(obj) {
  if (!obj || typeof obj !== "object") return "";
  return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(", ");
}

// productId = "new" for create, or a Firestore doc ID for edit
export default function ProductForm({ productId }) {
  const isNew = productId === "new";
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [fetching, setFetching] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Auth guard
  useEffect(() => {
    if (!loading && user?.uid !== ADMIN_UID) router.replace("/admin");
  }, [user, loading, router]);

  // Load existing product
  useEffect(() => {
    if (isNew || loading || user?.uid !== ADMIN_UID) return;
    (async () => {
      setFetching(true);
      const { products } = await getProducts();
      const product = products.find((p) => p.id === productId);
      if (!product) { router.replace("/admin/dashboard"); return; }
      setForm({
        name: product.name || "",
        slug: product.slug || "",
        subtitle: product.subtitle || "",
        type: product.type || "Research Peptide",
        description: product.description || "",
        details: product.details || "",
        benefits: Array.isArray(product.benefits) ? product.benefits.join("\n") : "",
        category: product.category || "",
        size: product.size || "",
        sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : "",
        sizePrices: serializeSizePrices(product.sizePrices),
        price: product.price ?? "",
        compareAtPrice: product.compareAtPrice ?? "",
        purity: product.purity || ">99%",
        stock: product.stock ?? "",
        featured: product.featured || false,
        points: product.points ?? "",
        customColor: product.customColor || "#6ab04c",
        imageFit: product.imageFit || "",
      });
      setExistingImageUrl(product.imageUrl || product.imageString || null);
      setImagePreview(product.imageUrl || product.imageString || null);
      setFetching(false);
    })();
  }, [productId, isNew, loading, user]);

  const set = (field) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if (field === "name" && isNew) {
      setForm((prev) => ({ ...prev, name: val, slug: slugify(val) }));
    } else {
      setForm((prev) => ({ ...prev, [field]: val }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");

    try {
      let imageUrl = existingImageUrl;

      if (imageFile) {
        const docId = isNew ? `new-${Date.now()}` : productId;
        const { url, error: uploadErr } = await uploadProductImage(imageFile, docId);
        if (uploadErr) { setError("Image upload failed: " + uploadErr); setSaving(false); return; }
        imageUrl = url;
      }

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        subtitle: form.subtitle.trim(),
        type: form.type.trim(),
        description: form.description.trim(),
        details: form.details.trim(),
        benefits: parseLines(form.benefits),
        category: form.category,
        size: form.size.trim(),
        sizes: parseSizes(form.sizes),
        sizePrices: parseSizePrices(form.sizePrices),
        price: parseFloat(form.price) || 0,
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        purity: form.purity.trim(),
        stock: parseInt(form.stock) || 0,
        featured: form.featured,
        points: parseInt(form.points) || 0,
        customColor: form.customColor,
        imageFit: form.imageFit || null,
        imageUrl: imageUrl || null,
        imageString: imageUrl || null,
      };

      if (isNew) {
        const { error: createErr } = await adminCreateProduct(payload);
        if (createErr) { setError(createErr); setSaving(false); return; }
      } else {
        const { error: updateErr } = await adminUpdateProduct(productId, payload);
        if (updateErr) { setError(updateErr); setSaving(false); return; }
      }

      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading || (!loading && user?.uid !== ADMIN_UID)) return null;
  if (fetching) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm text-gray-400">Loading…</div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/admin/dashboard" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-sm font-semibold text-gray-900">
          {isNew ? "Add Product" : "Edit Product"}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Image */}
        <Section title="Product Image">
          <div className="flex items-start gap-4">
            {imagePreview ? (
              <div className="relative w-24 h-24 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shrink-0">
                <Image src={imagePreview} alt="" fill className="object-contain p-2" unoptimized />
                <button type="button" onClick={removeImage}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-red-50">
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-gray-400 transition-colors shrink-0">
                <Upload className="w-5 h-5 text-gray-300" />
                <span className="text-xs text-gray-400">Upload</span>
              </div>
            )}
            <div className="flex-1">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="h-9 px-4 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                {imagePreview ? "Change image" : "Choose image"}
              </button>
              <p className="text-xs text-gray-400 mt-2">PNG recommended for transparent backgrounds.</p>
            </div>
          </div>
        </Section>

        {/* Basic info */}
        <Section title="Basic Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name *"><input type="text" value={form.name} onChange={set("name")} required className={inputCls} /></Field>
            <Field label="Slug"><input type="text" value={form.slug} onChange={set("slug")} className={inputCls} placeholder="auto-generated" /></Field>
            <Field label="Subtitle"><input type="text" value={form.subtitle} onChange={set("subtitle")} className={inputCls} placeholder="e.g. BPC 157" /></Field>
            <Field label="Type"><input type="text" value={form.type} onChange={set("type")} className={inputCls} /></Field>
            <Field label="Category">
              <select value={form.category} onChange={set("category")} className={inputCls}>
                <option value="">Select…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Purity"><input type="text" value={form.purity} onChange={set("purity")} className={inputCls} /></Field>
          </div>
          <Field label="Description"><textarea value={form.description} onChange={set("description")} rows={2} className={`${inputCls} h-auto py-2`} /></Field>
          <Field label="Details"><textarea value={form.details} onChange={set("details")} rows={3} className={`${inputCls} h-auto py-2`} /></Field>
          <Field label="Benefits (one per line)">
            <textarea value={form.benefits} onChange={set("benefits")} rows={4} className={`${inputCls} h-auto py-2`} placeholder={"Joint Recovery\nGut Lining Protection"} />
          </Field>
        </Section>

        {/* Pricing */}
        <Section title="Pricing & Sizes">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Default Size Label"><input type="text" value={form.size} onChange={set("size")} className={inputCls} placeholder="5mg" /></Field>
            <Field label="Sizes (comma-separated)"><input type="text" value={form.sizes} onChange={set("sizes")} className={inputCls} placeholder="5mg, 10mg" /></Field>
            <Field label="Size Prices (size: price, ...)"><input type="text" value={form.sizePrices} onChange={set("sizePrices")} className={inputCls} placeholder="5mg: 89.99, 10mg: 159.99" /></Field>
            <Field label="Default Price (R)"><input type="number" step="0.01" value={form.price} onChange={set("price")} className={inputCls} /></Field>
            <Field label="Compare-at Price (R)"><input type="number" step="0.01" value={form.compareAtPrice} onChange={set("compareAtPrice")} className={inputCls} /></Field>
          </div>
        </Section>

        {/* Inventory */}
        <Section title="Inventory & Display">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Stock"><input type="number" value={form.stock} onChange={set("stock")} className={inputCls} /></Field>
            <Field label="Points"><input type="number" value={form.points} onChange={set("points")} className={inputCls} /></Field>
            <Field label="Custom Color (sale pill)">
              <div className="flex items-center gap-2">
                <input type="color" value={form.customColor} onChange={set("customColor")} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                <input type="text" value={form.customColor} onChange={set("customColor")} className={`${inputCls} flex-1`} />
              </div>
            </Field>
            <Field label="Image Fit">
              <select value={form.imageFit} onChange={set("imageFit")} className={inputCls}>
                <option value="">Default (padded)</option>
                <option value="large">Large (minimal padding)</option>
              </select>
            </Field>
            <Field label="Featured">
              <label className="flex items-center gap-2 h-10 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={set("featured")} className="w-4 h-4 rounded accent-gray-900" />
                <span className="text-sm text-gray-600">Show on home page</span>
              </label>
            </Field>
          </div>
        </Section>

        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/admin/dashboard" className="h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="h-10 px-6 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50">
            {saving ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-gray-400 bg-white";

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  );
}
