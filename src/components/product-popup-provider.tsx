"use client";

import dynamic from 'next/dynamic';

// Dynamically import the ProductPopup component with SSR turned off.
// This ensures it only renders on the client-side.
const ProductPopup = dynamic(
  () => import('@/components/product-popup').then((m) => m.ProductPopup),
  { ssr: false }
);

export function ProductPopupProvider() {
  return <ProductPopup />;
}
