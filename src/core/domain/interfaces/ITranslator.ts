/**
 * @file ITranslator.ts
 * @description Decoupled Translation Service Contract.
 * Part of Clean Architecture: /core/domain/interfaces
 */

export interface TranslationRequest {
  text: string;
  sourceLang?: 'ar' | 'en' | 'auto';
  targetLang?: 'ar' | 'en';
}

export interface TranslationResponse {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  engine: 'gemini-ai' | 'dictionary-fallback' | 'mock';
  executionTimeMs: number;
}

export interface ITranslatorService {
  translate(request: TranslationRequest): Promise<TranslationResponse>;
}
