'use server';

import {optimizeWebp as optimizeWebpFlow} from '@/ai/flows/optimize-webp-conversion';
import type {
  OptimizeWebpInput,
  OptimizeWebpOutput,
} from '@/ai/flows/optimize-webp-conversion';

export async function optimizeWebp(
  input: OptimizeWebpInput
): Promise<OptimizeWebpOutput> {
  return optimizeWebpFlow(input);
}