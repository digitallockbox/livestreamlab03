import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { Page } from "@/components/creator/os";
import AddProduct from "@/components/creator/store/AddProduct";

// AddProductPage — dedicated page for listing a new digital product.
// Wraps the AddProduct component (Amazon search/import + custom product form)
// with a page header and navigation back to the storefront dashboard.
export default function AddProductPage() {
  const navigate = useNavigate();
  return (
    <Page title="Add Product" subtitle="List a new digital asset for sale in your storefront">
      <div className="mb-4">
        <Link to="/store" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Storefront
        </Link>
      </div>
      <AddProduct onAdded={() => navigate("/store/catalog")} />
    </Page>
  );
}