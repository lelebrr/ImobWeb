import { NextRequest, NextResponse } from 'next/server';
import { ImageProcessor } from '../../../../lib/image-optimization/image-processor';

/**
 * imobWeb Media API - Real-time Image Optimization
 */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob;
    const optionsRaw = formData.get('options') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const options = optionsRaw ? JSON.parse(optionsRaw) : {};
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Perform Optimization
    const { buffer: optimizedBuffer, info } = await ImageProcessor.optimize(buffer, {
      width: options.width || 1920,
      quality: options.quality || 85,
      format: options.format || 'webp',
      watermarkPath: options.watermark ? './public/watermark.png' : undefined,
    });

    // Generate Blur Placeholder
    const blurDataURL = await ImageProcessor.generateBlurPlaceholder(buffer);

    // AI Assessment (Optional)
    let aiScore = undefined;
    if (options.aiAnalysis) {
      aiScore = await ImageProcessor.assessQuality(buffer);
    }

    // Return the optimized image
    // In a real scenario, you would upload this to Supabase/S3 first
    // and return the URL. For now, we return metadata + simulated URL.
    
    return NextResponse.json({
      success: true,
      metadata: {
        width: info.width,
        height: info.height,
        format: info.format,
        size: info.size,
        blurDataURL,
        aiScore
      },
      url: 'https://cdn.imobweb.com/temp-optimized-image.webp' // Mock
    });

  } catch (error: any) {
    console.error('[Media API Error]', error);
    return NextResponse.json({ 
      error: 'Failed to process image', 
      details: error.message 
    }, { status: 500 });
  }
}
