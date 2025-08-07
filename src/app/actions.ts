'use server';

import { optimizeWebp, OptimizeWebpInput } from '@/ai/flows/optimize-webp-flow';

export async function optimizeWebpAction(
  input: OptimizeWebpInput
): Promise<string> {
  return await optimizeWebp(input);
}
