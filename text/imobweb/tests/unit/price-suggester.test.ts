import { describe, it, expect, beforeEach } from 'vitest';
import { suggestPrice, formatPrice, PriceInputSchema } from '../../lib/ai/price-suggester';

describe('price-suggester', () => {
  describe('suggestPrice', () => {
    it('should suggest price for apartment in center', () => {
      const result = suggestPrice({
        type: 'apartamento',
        area: 80,
        location: 'Centro',
        zone: 'centro',
      });

      expect(result.suggestedPrice).toBeGreaterThan(0);
      expect(result.minPrice).toBeLessThan(result.suggestedPrice);
      expect(result.maxPrice).toBeGreaterThan(result.suggestedPrice);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should suggest price for house in periphery', () => {
      const result = suggestPrice({
        type: 'casa',
        area: 150,
        location: 'Bairro Novo',
        zone: 'periferia',
        beds: 3,
        baths: 2,
        parking: 1,
      });

      expect(result.suggestedPrice).toBeGreaterThan(0);
      expect(result.factors.length).toBeGreaterThan(3);
    });

    it('should apply age multiplier correctly', () => {
      const newProperty = suggestPrice({
        type: 'apartamento',
        area: 60,
        location: 'Zona Sul',
        age: 1,
      });

      const oldProperty = suggestPrice({
        type: 'apartamento',
        area: 60,
        location: 'Zona Sul',
        age: 30,
      });

      expect(newProperty.suggestedPrice).toBeGreaterThan(oldProperty.suggestedPrice);
    });

    it('should calculate price per sqm correctly', () => {
      const result = suggestPrice({
        type: 'apartamento',
        area: 100,
        location: 'Centro',
      });

      expect(result.pricePerSqm).toBe(result.suggestedPrice / 100);
    });
  });

  describe('formatPrice', () => {
    it('should format price in BRL', () => {
      expect(formatPrice(350000)).toContain('350');
      expect(formatPrice(1000000)).toContain('1.000');
    });

    it('should handle zero', () => {
      expect(formatPrice(0)).toBe('R$ 0');
    });
  });

  describe('PriceInputSchema', () => {
    it('should validate correct input', () => {
      const valid = {
        type: 'apartamento',
        area: 80,
        location: 'Centro',
        beds: 2,
      };

      expect(PriceInputSchema.safeParse(valid).success).toBe(true);
    });

    it('should reject invalid type', () => {
      const invalid = {
        type: 'invalid-type',
        area: 80,
        location: 'Centro',
      };

      expect(PriceInputSchema.safeParse(invalid).success).toBe(false);
    });

    it('should reject negative area', () => {
      const invalid = {
        type: 'apartamento',
        area: -50,
        location: 'Centro',
      };

      expect(PriceInputSchema.safeParse(invalid).success).toBe(false);
    });

    it('should accept optional fields', () => {
      const minimal = {
        type: 'casa',
        area: 100,
        location: 'Bairro',
      };

      expect(PriceInputSchema.safeParse(minimal).success).toBe(true);
    });
  });
});
