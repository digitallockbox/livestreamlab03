import { useState, useCallback } from "react";

const generateAssetId = () => `AST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

const MOCK_UPLOAD_PRESETS = [
  {
    title: "Gaming Marathon Highlights",
    category: "gaming",
    thumbnail: "https://images.unsplash.com/photo-1538481143235-e42c3b22dc9f?w=400&q=80",
    duration: 3600,
    views: 12400,
  },
  {
    title: "Crypto Deep Dive Episode 5",
    category: "tech",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
    duration: 1800,
    views: 8900,
  },
  {
    title: "Creator Finance Masterclass",
    category: "education",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80",
    duration: 2400,
    views: 5200,
  },
  {
    title: "Behind the Scenes Studio Setup",
    category: "creative",
    thumbnail: "https://images.unsplash.com/photo-1471879832106-c7ab9019e8de?w=400&q=80",
    duration: 900,
    views: 3100,
  },
];

export function useMockDataHydration() {
  const [uploadedAssets, setUploadedAssets] = useState([]);
  const [processingTransactions, setProcessingTransactions] = useState([]);

  const simulateUploadAll = useCallback(() => {
    const newAssets = MOCK_UPLOAD_PRESETS.map(preset => ({
      ...preset,
      id: generateAssetId(),
      assetId: generateAssetId(),
      status: "verified",
      uploadedAt: new Date().toLocaleString(),
      fileSize: `${(Math.random() * 800 + 200).toFixed(0)}MB`,
      revenue: (Math.random() * 800 + 100).toFixed(2),
    }));
    
    setUploadedAssets(prev => [...prev, ...newAssets]);
    return newAssets;
  }, []);

  const simulateTransaction = useCallback((item, amount, paymentMethod) => {
    const creator = amount * 0.80;
    const platform = amount * 0.15;
    const heirs = amount * 0.05;

    const transaction = {
      id: generateAssetId(),
      timestamp: new Date(),
      item,
      amount,
      paymentMethod,
      status: "processing",
      splits: {
        creator,
        platform,
        heirs,
      },
    };

    setProcessingTransactions(prev => [...prev, transaction]);

    // Simulate completion
    setTimeout(() => {
      setProcessingTransactions(prev =>
        prev.map(t => t.id === transaction.id ? { ...t, status: "completed" } : t)
      );
    }, 1500);

    return transaction;
  }, []);

  return {
    uploadedAssets,
    processingTransactions,
    simulateUploadAll,
    simulateTransaction,
  };
}