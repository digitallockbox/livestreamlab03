import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is $STREAMING and how does it work?",
    a: "$STREAMING is the native utility token of LiveStreamLab. Viewers use it to tip creators, unlock premium content, and purchase store items. Creators earn $STREAMING on top of USD revenue — it's a second income stream layered on everything you do.",
  },
  {
    q: "How do I get paid?",
    a: "All your earnings flow into CreatorVault — your sovereign earnings dashboard. You can cash out to your bank account, a crypto wallet, or hold $STREAMING tokens. Team Splits let you auto-distribute revenue to collaborators before payout.",
  },
  {
    q: "Does LiveStreamLab take a cut of my earnings?",
    a: "We charge a small platform fee on USD transactions (5%) to keep the lights on. On $STREAMING token transactions, the fee is zero — you keep 100% of every token-based tip, unlock, and sale.",
  },
  {
    q: "Can I migrate my existing content from YouTube or Twitch?",
    a: "Yes. Our bulk import tool lets you pull in video metadata and descriptions from YouTube. For Twitch, you can connect your VOD library. Migration guides are available in the Creator Onboarding flow.",
  },
  {
    q: "What streaming software does LiveStreamLab support?",
    a: "We support any RTMP-compatible software including OBS Studio, Streamlabs, XSplit, and vMix. Simply copy your stream key from Go Live, paste it into your encoder, and you're broadcasting.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes — the Creator plan is completely free, forever. You get live streaming (up to 2hr), 5GB video uploads, podcast publishing, a 10-product store, affiliate links, and basic CreatorVault access. No credit card required.",
  },
  {
    q: "What's the War Room?",
    a: "War Room is LiveStreamLab's intelligence layer. It tracks your content performance across the platform, surfaces revenue opportunities, and gives you visibility into cycle analytics — all in one command center.",
  },
  {
    q: "Can I white-label the platform for my brand or agency?",
    a: "White-label options are available on the Studio plan ($99/month). You can customize channel branding, use your own domain, and manage multiple creators under one tenant account.",
  },
];

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border border-border rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-secondary/30 transition-colors"
      >
        <span className="text-sm font-semibold text-foreground">{faq.q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section id="faq" className="py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-secondary border border-border rounded-full px-4 py-1.5 mb-5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">FAQ</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Got Questions?
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Everything you need to know before you start creating.
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => <FAQItem key={i} faq={faq} index={i} />)}
        </div>
      </div>
    </section>
  );
}