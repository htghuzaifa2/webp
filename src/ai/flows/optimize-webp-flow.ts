'use server';
/**
 * @fileOverview A flow for optimizing images to WebP format.
 *
 * - optimizeWebp - A function that handles the image optimization.
 * - OptimizeWebpInput - The input type for the optimizeWebp function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const OptimizeWebpInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  quality: z.number().min(1).max(100).describe('The quality of the output image (1-100).'),
});
export type OptimizeWebpInput = z.infer<typeof OptimizeWebpInputSchema>;

const prompt = ai.definePrompt({
  name: 'optimizeWebpPrompt',
  input: { schema: OptimizeWebpInputSchema },
  output: { format: 'media' },
  prompt: `Convert the following image to WebP with quality set to {{{quality}}}.
  
Image: {{media url=photoDataUri}}`,
});

const optimizeWebpFlow = ai.defineFlow(
  {
    name: 'optimizeWebpFlow',
    inputSchema: OptimizeWebpInputSchema,
    outputSchema: z.string().describe("The data URI of the converted WebP image."),
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The model did not return an image.');
    }
    return output.url;
  }
);


export async function optimizeWebp(input: OptimizeWebpInput): Promise<string> {
  return await optimizeWebpFlow(input);
}
