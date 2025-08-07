
'use server';

import { optimizeWebpImageFlow } from "@/ai/flows/optimize-webp-flow";

export async function optimizeWebpImage(imageAsDataUrl: string): Promise<string> {
    return await optimizeWebpImageFlow(imageAsDataUrl);
}

    