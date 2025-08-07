'use server';

/**
 * @fileOverview This file defines a Genkit flow for optimizing WebP conversion settings.
 *
 * - optimizeWebp - A function that handles the WebP optimization process.
 * - OptimizeWebpInput - The input type for the optimizeWebp function, including original image size.
 * - OptimizeWebpOutput - The return type for the optimizeWebp function, including optimized settings.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeWebpInputSchema = z.object({
  originalSizeKb: z
    .number()
    .describe('The original size of the image in kilobytes.'),
  imageType: z
    .string()
    .describe('The image type of the original image. e.g. JPG, PNG.'),
  description: z
    .string()
    .optional()
    .describe('The description of the original image.'),
});

export type OptimizeWebpInput = z.infer<typeof OptimizeWebpInputSchema>;

const OptimizeWebpOutputSchema = z.object({
  quality: z
    .number()
    .describe(
      'The quality setting for WebP conversion, ranging from 0 (lowest) to 100 (highest).'
    ),
  method: z
    .number()
    .describe(
      'The encoding method: 0 specifies the fastest, but lowest quality, 6 specifies the slowest, but best quality.'
    ),
  targetSizeKb: z
    .number()
    .describe(
      'The estimated target size of the converted image in kilobytes.'
    ),
  compressionRatio: z
    .number()
    .describe(
      'The estimated compression ratio of the converted image (originalSize / targetSize).'
    ),
});

export type OptimizeWebpOutput = z.infer<typeof OptimizeWebpOutputSchema>;

export async function optimizeWebp(input: OptimizeWebpInput): Promise<OptimizeWebpOutput> {
  return optimizeWebpFlow(input);
}

const optimizeWebpPrompt = ai.definePrompt({
  name: 'optimizeWebpPrompt',
  input: {schema: OptimizeWebpInputSchema},
  output: {schema: OptimizeWebpOutputSchema},
  prompt: `You are an expert image compression engineer specializing in WebP optimization. Given the original image size ({{{originalSizeKb}}} KB), image type ({{{imageType}}}), and an optional description ({{{description}}}), you will determine the optimal WebP conversion settings to minimize file size without significant quality loss. 

Specifically, set the 'quality' and 'method' values such that the 'targetSizeKb' is significantly lower than the 'originalSizeKb'}, while maintaining acceptable visual quality. Provide a high 'compressionRatio' that reflects the efficiency of the optimization.

Ensure that the quality is set within a reasonable range (e.g., 70-90) to avoid excessive quality degradation, and the method is also set appropriately (e.g., 4-6) to balance speed and quality.

Return the suggested settings in JSON format.
`,
});

const optimizeWebpFlow = ai.defineFlow(
  {
    name: 'optimizeWebpFlow',
    inputSchema: OptimizeWebpInputSchema,
    outputSchema: OptimizeWebpOutputSchema,
  },
  async input => {
    const {output} = await optimizeWebpPrompt(input);
    return output!;
  }
);
