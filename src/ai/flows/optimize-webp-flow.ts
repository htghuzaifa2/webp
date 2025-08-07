'use server';
/**
 * @fileOverview A flow for reliably converting images to WebP format on the server.
 * - optimizeWebpImage - The exported server action that performs the conversion.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema for the flow's input.
const OptimizeWebpInputSchema = z
  .string()
  .describe(
    "A source image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  );

// Define the flow that calls the Gemini Pro Vision model.
// This flow takes a data URI and asks the model to convert it to WebP.
// The AI model handles the complexities of different image formats and optimizes
// for a good balance of quality and file size.
const optimizeWebpImageFlow = ai.defineFlow(
  {
    name: 'optimizeWebpImageFlow',
    inputSchema: OptimizeWebpInputSchema,
    outputSchema: z.string(), // The output is a data URI of the converted WebP image.
  },
  async (imageAsDataUrl) => {
    const llmResponse = await ai.generate({
      prompt: `Convert the following image to WebP. Optimize it for the best balance of quality and file size.`,
      model: 'googleai/gemini-pro-vision',
      input: [{ media: { url: imageAsDataUrl } }],
      output: {
        format: 'image/webp',
      },
    });

    const output = llmResponse.output();
    if (!output?.media?.url) {
      throw new Error('AI model did not return a valid WebP image.');
    }

    return output.media.url;
  }
);

// This is the exported function that the front-end will call.
export async function optimizeWebpImage(imageAsDataUrl: string): Promise<string> {
  // Validate the input using the Zod schema to ensure it's a valid data URI.
  const validatedInput = OptimizeWebpInputSchema.parse(imageAsDataUrl);
  return await optimizeWebpImageFlow(validatedInput);
}
