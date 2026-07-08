"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getProducts, adminDeleteProduct } from "@/lib/firebase/firestore";
import { deleteProductImage } from "@/lib/firebase/storage";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";

const ADMIN_UIDS = [process.env.NEXT_PUBLIC_ADMIN_UID, process.env.NEXT_PUBLIC_CO_ADMIN_UID].filter(Boolean);

export default function AdminStore() {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmProduct, setConfirmProduct] = useState(null);

  useEffect(() => {
    if (!loading && !ADMIN_UIDS.includes(user?.uid)) router.replace("/admin");
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && ADMIN_UIDS.includes(user?.uid)) loadProducts();
  }, [user, loading]);

  const loadProducts = async () => {
    setFetching(true);
    const { products } = await getProducts();
    setProducts(products);
    setFetching(false);
  };

  const handleDeleteConfirmed = async () => {
    const product = confirmProduct;
    setConfirmProduct(null);
    setDeletingId(product.id);
    await adminDeleteProduct(product.id);
    if (product.imageUrl) await deleteProductImage(product.imageUrl);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setDeletingId(null);
  };

  if (loading || (!loading && !ADMIN_UIDS.includes(user?.uid))) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader backHref="/admin/dashboard" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Products</h1>
            <p className="text-xs text-gray-400 mt-0.5">{products.length} total</p>
          </div>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </Link>
        </div>

        {fetching ? (
          <div className="text-center py-20 text-gray-400 text-sm">Loading…</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Image</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Featured</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {(product.imageUrl || product.imageString) && (
                          <Image
                            src={product.imageUrl || product.imageString}
                            alt={product.name}
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                      {product.subtitle && <p className="text-xs text-gray-400">{product.subtitle}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500">{product.category || "—"}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-gray-700">R{product.price?.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-xs font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                        {product.stock ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="relative group inline-flex">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium cursor-default ${product.featured ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                          {product.featured ? "Yes" : "No"}
                        </span>
                        {product.featured && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-[10px] rounded px-2.5 py-1.5 leading-snug opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 text-center">
                            This product appears on the homepage featured grid
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setConfirmProduct(product)}
                          disabled={deletingId === product.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 && !fetching && (
              <div className="text-center py-16 text-gray-400 text-sm">
                No products yet.{" "}
                <Link href="/admin/products/new" className="text-gray-900 underline">Add one</Link>
              </div>
            )}
          </div>
        )}
      </div>

      {confirmProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmProduct(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Delete product?</p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium text-gray-700">{confirmProduct.name}</span> will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setConfirmProduct(null)}
                className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
