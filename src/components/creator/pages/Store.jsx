import React, { useState } from "react";
import { Package, Plus } from "lucide-react";
import { useIdentity } from "@/lib/web3/identity";
import { Page } from "@/components/creator/os";
import AddProduct from "@/components/creator/store/AddProduct";
import StoreInventory from "@/components/creator/store/StoreInventory";

export default function Store() {
  const { walletAddress } = useIdentity();
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState("inventory");

  return (
    <Page title="Store" subtitle="Unified product inventory — Amazon affiliate + custom products">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("inventory")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm ${tab === "inventory" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
        >
          <Package className="w-4 h-4" /> Inventory
        </button>
        <button
          onClick={() => setTab("add")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm ${tab === "add" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {tab === "inventory" ? (
        <StoreInventory wallet={walletAddress} reloadKey={reloadKey} />
      ) : (
        <AddProduct onAdded={() => { setReloadKey((k) => k + 1); setTab("inventory"); }} />
      )}
    </Page>
  );
}