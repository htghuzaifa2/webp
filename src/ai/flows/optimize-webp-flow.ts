
'use server';
/**
 * @fileOverview A flow for converting images to WebP format.
 * 
 * - optimizeWebpImageFlow - A function that handles the image conversion.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OptimizeWebpInputSchema = z.string().describe("A source image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.");
const OptimizeWebpOutputSchema = z.string().describe("The converted WebP image as a data URI.");


export const optimizeWebpImageFlow = ai.defineFlow(
  {
    name: 'optimizeWebpImageFlow',
    inputSchema: OptimizeWebpInputSchema,
    outputSchema: OptimizeWebpOutputSchema,
  },
  async (imageAsDataUrl) => {
    const llmResponse = await ai.generate({
      prompt: `Convert the following image to WebP. Optimize it for the best balance of quality and file size.`,
      model: 'googleai/gemini-pro-vision',
      input: [
        { media: { url: imageAsDataUrl } },
      ],
      output: {
        format: 'image/webp'
      }
    });

    const output = llmResponse.output();
    if (!output?.media) {
        throw new Error("AI model did not return an image.");
    }

    return output.media.url;
  }
);

    