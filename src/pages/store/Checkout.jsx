import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Zap, ShoppingCart } from "lucide-react";

export default function Checkout() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Checkout</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Cart Summary */}
        <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Cart</h3>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm"><span className="text-foreground">Preset Pack v2</span><span className="text-foreground">$24.99</span></div>
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-semibold text-foreground"><span>Total</span><span>$24.99</span></div>
        </div>
        {/* Payment */}
        <div className="md:col-span-3 bg-card border border-border rounded-2xl p-6 space-y-6">
          <h3 className="font-display font-semibold text-foreground">Payment Method</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 rounded-xl bg-secondary border border-border cursor-pointer hover:border-primary/30 transition-colors">
              <input type="radio" name="payment" defaultChecked className="accent-primary" />
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Credit Card</span>
            </label>
            <label className="flex items-center gap-3 p-4 rounded-xl bg-secondary border border-border cursor-pointer hover:border-accent/30 transition-colors">
              <input type="radio" name="payment" className="accent-accent" />
              <Zap className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-foreground">Pay with $STREAMING</span>
            </label>
          </div>
          <div className="space-y-4">
            <div><Label>Email</Label><Input className="mt-1.5 bg-secondary border-border" placeholder="email@example.com" /></div>
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90 h-12 text-base gap-2">
            <ShoppingCart className="w-5 h-5" /> Complete Purchase
          </Button>
        </div>
      </div>
    </div>
  );
}