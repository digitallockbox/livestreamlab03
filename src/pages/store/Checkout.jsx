import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard, Zap, ShoppingCart, CheckCircle2, Lock,
  ShoppingBag, X, ChevronRight, ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";

const CART_ITEMS = [
  { id: 1, name: "Preset Pack v2",     price: 24.99, streamingPrice: 120, qty: 1 },
  { id: 2, name: "Audio Samples Pack", price: 14.99, streamingPrice: 80,  qty: 1 },
];

const PAYMENT_METHODS = [
  { id: "card",      label: "Credit / Debit Card",  icon: CreditCard, desc: "Visa, Mastercard, Amex",      color: "text-primary",  border: "border-primary/40",  bg: "bg-primary/5" },
  { id: "streaming", label: "Pay with $STREAMING",  icon: Zap,        desc: "200 $S tokens available",     color: "text-accent",   border: "border-accent/40",   bg: "bg-accent/5" },
];

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cart, setCart]                   = useState(CART_ITEMS);
  const [success, setSuccess]             = useState(false);
  const [email, setEmail]                 = useState("");
  const [cardNumber, setCardNumber]       = useState("");
  const [expiry, setExpiry]               = useState("");
  const [cvc, setCvc]                     = useState("");
  const [name, setName]                   = useState("");

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const subtotal     = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const streamingTotal = cart.reduce((s, i) => s + i.streamingPrice * i.qty, 0);
  const tax          = subtotal * 0.08;
  const total        = subtotal + tax;

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-2xl p-12 max-w-md w-full text-center space-y-5">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-accent" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Purchase Complete!</h2>
            <p className="text-muted-foreground mt-2">Your order has been confirmed. Check your email for download links.</p>
          </div>
          <div className="bg-secondary rounded-xl p-4 text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between"><span>Order ID</span><span className="font-mono text-foreground">#ORD-4822</span></div>
            <div className="flex justify-between"><span>Amount</span><span className="text-foreground font-semibold">${total.toFixed(2)}</span></div>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/store">
              <Button className="w-full bg-primary hover:bg-primary/90">Continue Shopping</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full border-border">Go to Dashboard</Button>
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
        <div className="flex items-center gap-3 mb-8">
          <Link to="/store" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Checkout</h1>
            <p className="text-sm text-muted-foreground">Secure checkout via CreatorVault</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" /> SSL Secured
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left — Payment Form */}
          <div className="lg:col-span-3 space-y-5">

            {/* Payment Method */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h3 className="font-display font-semibold text-foreground">Payment Method</h3>
              {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc, color, border, bg }) => (
                <label key={id}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                    ${paymentMethod === id ? `${border} ${bg}` : "border-border bg-secondary hover:border-muted-foreground/30"}`}
                  onClick={() => setPaymentMethod(id)}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === id ? border.replace("border-", "border-") : "border-muted-foreground/40"}`}>
                    {paymentMethod === id && <div className={`w-2 h-2 rounded-full ${id === "streaming" ? "bg-accent" : "bg-primary"}`} />}
                  </div>
                  <Icon className={`w-5 h-5 ${color}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  {id === "streaming" && paymentMethod === "streaming" && (
                    <Badge className="ml-auto bg-accent/10 text-accent border-accent/20 text-xs gap-1">
                      <Zap className="w-2.5 h-2.5" /> {streamingTotal} $S total
                    </Badge>
                  )}
                </label>
              ))}
            </div>

            {/* Card Details */}
            {paymentMethod === "card" && (
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <h3 className="font-display font-semibold text-foreground">Card Details</h3>
                <div>
                  <Label className="mb-1.5 block text-xs">Cardholder Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="bg-secondary border-border" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Card Number</Label>
                  <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" className="bg-secondary border-border font-mono" maxLength={19} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1.5 block text-xs">Expiry</Label>
                    <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM / YY" className="bg-secondary border-border" maxLength={7} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-xs">CVC</Label>
                    <Input value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" className="bg-secondary border-border" maxLength={4} />
                  </div>
                </div>
              </div>
            )}

            {/* Billing Info */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-semibold text-foreground">Billing Info</h3>
              <div>
                <Label className="mb-1.5 block text-xs">Email Address</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="bg-secondary border-border" />
              </div>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4 sticky top-6">
              <h3 className="font-display font-semibold text-foreground">Order Summary</h3>

              {/* Cart Items */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {paymentMethod === "streaming" ? `${item.streamingPrice} $S` : `$${item.price.toFixed(2)}`}
                      </p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                {paymentMethod === "card" ? (
                  <>
                    <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                    <div className="flex justify-between font-semibold text-foreground text-base border-t border-border pt-2 mt-2">
                      <span>Total</span><span>${total.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between font-semibold text-foreground text-base">
                    <span>Total</span><span className="text-accent flex items-center gap-1"><Zap className="w-4 h-4" />{streamingTotal} $S</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setSuccess(true)}
                className={`w-full h-12 text-base gap-2 ${paymentMethod === "streaming" ? "bg-accent hover:bg-accent/90 text-accent-foreground" : "bg-primary hover:bg-primary/90"}`}
              >
                {paymentMethod === "streaming" ? <><Zap className="w-5 h-5" /> Pay with $STREAMING</> : <><ShoppingCart className="w-5 h-5" /> Complete Purchase</>}
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" /> Payments secured via CreatorVault
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}