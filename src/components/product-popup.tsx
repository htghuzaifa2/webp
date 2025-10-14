"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, ShoppingCart } from 'lucide-react'
import products from '@/lib/products.json'
import { cn } from '@/lib/utils'

interface Product {
  id: number;
  slug: string;
  title: string;
  price: string;
  imageUrl: string;
}

const DISMISS_COOLDOWN = 90 * 1000; // 90 seconds in milliseconds
const INITIAL_APPEAR_DELAY = 10 * 1000; // 10 seconds
const PRODUCT_ROTATION_INTERVAL = 60 * 1000; // 1 minute

export function ProductPopup() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const getRandomProduct = () => {
    return products[Math.floor(Math.random() * products.length)];
  };

  useEffect(() => {
    // This effect should only run on the client
    if (typeof window === 'undefined') {
      return;
    }

    const dismissedUntil = localStorage.getItem('product-popup-dismissed-until');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      const timeout = setTimeout(() => {
        setProduct(getRandomProduct());
        setIsVisible(true);
      }, parseInt(dismissedUntil, 10) - Date.now());
      return () => clearTimeout(timeout);
    }

    const initialTimer = setTimeout(() => {
      setProduct(getRandomProduct());
      setIsVisible(true);
    }, INITIAL_APPEAR_DELAY);

    const rotationInterval = setInterval(() => {
      // Check isVisible directly from state, no need for passing it
      setIsVisible(currentIsVisible => {
        if (!currentIsVisible) return false;

        setIsFading(true);
        setTimeout(() => {
          setProduct(prevProduct => {
            let newProduct = getRandomProduct();
            while (newProduct.slug === prevProduct?.slug) {
              newProduct = getRandomProduct();
            }
            return newProduct;
          });
          setIsFading(false);
        }, 500);
        
        return true;
      });
    }, PRODUCT_ROTATION_INTERVAL);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(rotationInterval);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  const handleDismiss = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsFading(false);
      const dismissedUntil = Date.now() + DISMISS_COOLDOWN;
      localStorage.setItem('product-popup-dismissed-until', dismissedUntil.toString());
    }, 500);
  };

  if (!product || !isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 w-80 transform transition-all duration-500 ease-in-out',
        isVisible && !isFading ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      )}
    >
      <Card className="overflow-hidden shadow-2xl border-primary/20">
        <CardContent className="p-4 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>

          <div className="flex gap-4">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="font-semibold text-sm line-clamp-2">
                {product.title}
              </h4>
              <p className="text-lg font-bold text-primary">PKR {product.price}</p>
              <Button asChild size="sm" className="mt-2">
                <Link href={`https://huzi.pk/product/${product.slug}`} target="_blank" rel="noopener noreferrer">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View Product
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}