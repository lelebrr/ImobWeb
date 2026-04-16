import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export const dynamic = 'force-dynamic';

/**
 * Lazy-init OpenAI client to avoid build-time crash when env var is missing.
 */
function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });
}

/**
 * API Route for Dynamic Translation via AI.
 * Used for translating strings not found in static dictionaries 
 * or for dynamic user-generated content.
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Translation service is not configured. Set OPENAI_API_KEY.' },
        { status: 503 }
      );
    }

    const { text, targetLocale, sourceLocale = 'pt-BR' } = await req.json();

    if (!text || !targetLocale) {
      return NextResponse.json(
        { error: 'Missing required fields: text, targetLocale' },
        { status: 400 }
      );
    }

    const openai = getOpenAI();

    // Call AI to translate
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a professional real estate translator. 
          Translate the following text from ${sourceLocale} to ${targetLocale}. 
          Maintain real estate terminology and professional tone. 
          Return ONLY the translated text.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
    });

    const translatedText = response.choices[0]?.message?.content?.trim();

    return NextResponse.json({ 
      translated: translatedText,
      source: text,
      locale: targetLocale
    });

  } catch (error: any) {
    console.error('Translation Error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text', details: error.message },
      { status: 500 }
    );
  }
}
