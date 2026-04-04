import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard, Zap, ShoppingCart, CheckCircle2, Lock,
  Package, ArrowLeft, ChevronDown, Shield
} from "lucide-react";
import { Link } from "react-router-dom";

const CART_ITEMS = [
  { id: 1, name: "Preset Pack v2", price: 24.99, streamingPrice: 120 },
  { id: 2, name: "Audio Samples Pack", price: 14.99, streamingPrice: 80 },
];

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [success, setSuccess] = useState(false);

  const subtotal = CART_ITEMS.reduce((s, i) => s + i.price, 0);
  const streamingTotal = CART_ITEMS.reduce((s, i) => s + i.streamingPrice, 0);

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Purchase Complete!</h1>
          <p className="text-muted-foreground mb-2">Your order has been processed successfully.</p>
          <p className="text-sm text-muted-foreground mb-6">Download links have been sent to your email. Check your CreatorVault for digital files.</p>
          <div className="bg-card border border-border rounded-2xl p-4 mb-6 text-left space-y-2">
            {CART_ITEMS.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-foreground">{item.name}</span>
                <span className="text-muted-foreground">{paymentMethod === "streaming" ? `${item.streamingPrice} $S` : `$${item.price}`}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
              <span>Total</span>
              <span>{paymentMethod === "streaming" ? `${streamingTotal} $STREAMING` : `$${subtotal.toFixed(2)}`}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/store/products" className="flex-1">
              <Button variant="outline" className="w-full border-border">Back to Store</Button>
            </Link>
            <Link to="/dashboard" className="flex-1">
              <Button className="w-full bg-primary hover:bg-primary/90">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/store/products">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Checkout</h1>
            <p className="text-sm text-muted-foreground">Complete your purchase securely</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-3 space-y-5">

            {/* Payment Method */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="font-display font-semibold text-foreground mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${paymentMethod === "card" ? "border-primary/50 bg-primary/10" : "border-border bg-secondary hover:border-primary/30"}`}>
                  <CreditCard className={`w-5 h-5 ${paymentMethod === "card" ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="text-left">
                    <p className={`text-sm font-medium ${paymentMethod === "card" ? "text-primary" : "text-foreground"}`}>Credit Card</p>
                    <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
                  </div>
                </button>
                <button onClick={() => setPaymentMethod("streaming")}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${paymentMethod === "streaming" ? "border-accent/50 bg-accent/10" : "border-border bg-secondary hover:border-accent/30"}`}>
                  <Zap className={`w-5 h-5 ${paymentMethod === "streaming" ? "text-accent" : "text-muted-foreground"}`} />
                  <div className="text-left">
                    <p className={`text-sm font-medium ${paymentMethod === "streaming" ? "text-accent" : "text-foreground"}`}>$STREAMING</p>
                    <p className="text-xs text-muted-foreground">Token payment</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Card Details */}
            {paymentMethod === "card" && (
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <h3 className="font-display font-semibold text-foreground">Card Details</h3>
                <div>
                  <Label className="mb-1.5 block">Card Number</Label>
                  <Input placeholder="1234 5678 9012 3456" className="bg-secondary border-border font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1.5 block">Expiry</Label>
                    <Input placeholder="MM / YY" className="bg-secondary border-border font-mono" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">CVV</Label>
                    <Input placeholder="•••" type="password" className="bg-secondary border-border font-mono" />
                  </div>
                </div>
              </div>
            )}

            {/* $STREAMING wallet */}
            {paymentMethod === "streaming" && (
              <div className="bg-card border border-accent/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <h3 className="font-display font-semibold text-foreground">$STREAMING Wallet</h3>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent/5 rounded-xl border border-accent/20">
                  <span className="text-sm text-muted-foreground">Available balance</span>
                  <span className="text-sm font-bold text-accent">4,250 $STREAMING</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                  <span className="text-sm text-muted-foreground">Order total</span>
                  <span className="text-sm font-bold text-foreground">{streamingTotal} $STREAMING</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent/5 rounded-xl border border-accent/20">
                  <span className="text-sm text-muted-foreground">Balance after</span>
                  <span className="text-sm font-bold text-accent">{4250 - streamingTotal} $STREAMING</span>
                </div>
              </div>
            )}

            {/* Billing Info */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-semibold text-foreground">Billing Information</h3>
              <div>
                <Label className="mb-1.5 block">Email</Label>
                <Input placeholder="email@example.com" className="bg-secondary border-border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block">First Name</Label>
                  <Input placeholder="Sam" className="bg-secondary border-border" />
                </div>
                <div>
                  <Label className="mb-1.5 block">Last Name</Label>
                  <Input placeholder="Creator" className="bg-secondary border-border" />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Country</Label>
                <div className="relative">
                  <select className="w-full h-9 px-3 rounded-md border border-input bg-secondary text-sm text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-ring">
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>Other</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* CTA */}
            <Button onClick={() => setSuccess(true)} className="w-full h-13 text-base gap-2 bg-primary hover:bg-primary/90 py-4">
              <ShoppingCart className="w-5 h-5" />
              Complete Purchase — {paymentMethod === "streaming" ? `${streamingTotal} $STREAMING` : `$${subtotal.toFixed(2)}`}
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              <span>Protected by CreatorVault · Secure &amp; Encrypted</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 sticky top-6">
              <h3 className="font-display font-semibold text-foreground mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4">
                {CART_ITEMS.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Digital download</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">{paymentMethod === "streaming" ? `${item.streamingPrice} $S` : `$${item.price}`}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{paymentMethod === "streaming" ? `${streamingTotal} $S` : `$${subtotal.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Processing fee</span>
                  <span className="text-accent">Free</span>
                </div>
                <div className="flex justify-between font-bold text-foreground text-base pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{paymentMethod === "streaming" ? `${streamingTotal} $STREAMING` : `$${subtotal.toFixed(2)}`}</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2 text-xs text-accent">
                  <Zap className="w-3.5 h-3.5" />
                  <span className="font-medium">CreatorVault routing active</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Revenue automatically split via TridentAutoSplit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}