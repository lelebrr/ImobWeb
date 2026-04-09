import { describe, it, expect } from 'vitest';
import { 
  calculateSaleCommission, 
  calculateRentalCommission, 
  calculateBrokerPayout 
} from '../../lib/finance/commission-calculator';

describe('Commission Calculator', () => {
  const config = {
    listingPercentage: 10,  // 10% for listing
    sellingPercentage: 40,  // 40% for selling
    agencyPercentage: 50,   // 50% for agency
    issRate: 5              // 5% ISS
  };

  describe('calculateSaleCommission', () => {
    it('should calculate correct splits for a R$ 1.000.000 sale at 6% commission', () => {
      const salesPrice = 1000000;
      const rate = 0.06; // 6%
      
      const result = calculateSaleCommission(salesPrice, rate, config);
      
      // Total commission = 60,000
      expect(result.listingBrokerValue).toBe(6000);  // 10% of 60k
      expect(result.sellingBrokerValue).toBe(24000); // 40% of 60k
      expect(result.agencyValue).toBe(30000);        // 50% of 60k
      expect(result.taxes).toBe(3000);               // 5% ISS of 60k
      expect(result.netValue).toBe(57000);           // 60k - 3k
    });
  });

  describe('calculateRentalCommission', () => {
    it('should return full first month rent as commission', () => {
      const rentValue = 3000;
      const result = calculateRentalCommission(rentValue, 0.1, true);
      expect(result).toBe(3000);
    });

    it('should return 10% of rent as administration fee for recurring months', () => {
      const rentValue = 3000;
      const result = calculateRentalCommission(rentValue, 0.1, false);
      expect(result).toBe(300);
    });
  });

  describe('calculateBrokerPayout', () => {
    it('should calculate payout with IRRF deduction (above ceiling)', () => {
      // Assuming calculateIRRF follows standard Brazilian table logic
      // This is a unit test, so we verify if it calls calculateIRRF and subtracts correctly
      const gross = 10000;
      const result = calculateBrokerPayout(gross);
      
      expect(result.gross).toBe(gross);
      expect(result.net).toBeLessThan(gross);
      expect(result.net + result.irrf).toBe(gross);
    });
  });
});
