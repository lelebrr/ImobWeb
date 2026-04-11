import { describe, it, expect } from 'vitest';
import { generateDescription, DescriptionInputSchema } from '../../lib/ai/description-generator';

describe('description-generator', () => {
  describe('generateDescription', () => {
    it('should generate descriptions for apartment', () => {
      const result = generateDescription({
        location: 'Centro de São Paulo',
        area: 75,
        propertyType: 'apartamento',
        beds: 2,
        baths: 1,
        parking: 1,
      });

      expect(result.short).toBeTruthy();
      expect(result.medium).toBeTruthy();
      expect(result.full).toBeTruthy();
      expect(result.tags).toContain('apartamento');
      expect(result.tags).toContain('Centro de São Paulo');
    });

    it('should generate descriptions for house with features', () => {
      const result = generateDescription({
        location: 'Jardim América',
        area: 200,
        propertyType: 'casa',
        beds: 4,
        baths: 3,
        parking: 2,
        features: ['piscina', 'churrasqueira', 'jardim'],
        highlight: 'Ótima localização',
        tone: 'persuasivo',
      });

      expect(result.short).toBeTruthy();
      expect(result.full).toContain('piscina');
      expect(result.highlights).toContain('Piscina');
    });

    it('should respect tone parameter', () => {
      const formal = generateDescription({
        location: 'Pinheiros',
        area: 60,
        tone: 'formal',
      });

      const informal = generateDescription({
        location: 'Pinheiros',
        area: 60,
        tone: 'informal',
      });

      expect(formal.full).not.toBe(informal.full);
    });

    it('should generate SEO keywords', () => {
      const result = generateDescription({
        location: 'Moema',
        area: 90,
        propertyType: 'apartamento',
        beds: 2,
      });

      expect(result.seoKeywords).toContain('apartamento Moema');
      expect(result.seoKeywords).toContain('apartamento à venda');
    });

    it('should generate correct tags', () => {
      const result = generateDescription({
        location: 'Brooklyn',
        area: 50,
        propertyType: 'apartamento',
        beds: 1,
      });

      expect(result.tags).toContain('apartamento');
      expect(result.tags).toContain('Brooklyn');
      expect(result.tags).toContain('1-quartos');
    });
  });

  describe('DescriptionInputSchema', () => {
    it('should validate minimal input', () => {
      const valid = {
        location: 'Centro',
        area: 50,
      };

      expect(DescriptionInputSchema.safeParse(valid).success).toBe(true);
    });

    it('should validate full input', () => {
      const valid = {
        location: 'Pinheiros',
        area: 100,
        propertyType: 'casa',
        beds: 3,
        baths: 2,
        parking: 2,
        features: ['piscina', 'churrasqueira'],
        highlight: 'Excelente',
        targetAudience: 'família',
        tone: 'formal',
      };

      expect(DescriptionInputSchema.safeParse(valid).success).toBe(true);
    });

    it('should reject invalid property type', () => {
      const invalid = {
        location: 'Centro',
        area: 50,
        propertyType: 'castelo',
      };

      expect(DescriptionInputSchema.safeParse(invalid).success).toBe(false);
    });

    it('should reject negative area', () => {
      const invalid = {
        location: 'Centro',
        area: -10,
      };

      expect(DescriptionInputSchema.safeParse(invalid).success).toBe(false);
    });

    it('should reject invalid tone', () => {
      const invalid = {
        location: 'Centro',
        area: 50,
        tone: 'extravagant',
      };

      expect(DescriptionInputSchema.safeParse(invalid).success).toBe(false);
    });
  });
});
