'use server';

import { optimizeWebpImage as optimizeFlow } from '@/ai/flows/optimize-webp-flow';

/**
 * Server Action to optimize an image to WebP format.
 * This function is called from the client-side.
 * @param imageAsDataUrl The image to convert, as a base64 data URI.
 * @returns A promise that resolves to the data URI of the converted WebP image.
 */
export async function optimizeWebpImage(
  imageAsDataUrl: string
): Promise<string> {
  return await optimizeFlow(imageAsDataUrl);
}
