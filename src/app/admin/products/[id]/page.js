"use client";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export default function AdminEditProductPage() {
  const { id } = useParams();
  return <ProductForm productId={id} />;
}
