import { describe, it, expect } from 'vitest';
import { processChat, ChatInputSchema, containsPriceIntent, containsDescriptionIntent } from '../../lib/ai/chat-agent';

describe('chat-agent', () => {
  describe('processChat', () => {
    it('should respond to price query', async () => {
      const result = await processChat({
        message: 'Quanto custa um apartamento no centro?',
        action: 'chat',
      });

      expect(result.message).toBeTruthy();
      expect(result.action).toBe('collect_property_info');
    });

    it('should respond to description query', async () => {
      const result = await processChat({
        message: 'Preciso criar uma descrição para meu imóvel',
        action: 'chat',
      });

      expect(result.message).toBeTruthy();
      expect(result.action).toBe('collect_description_info');
    });

    it('should respond to greetings', async () => {
      const result = await processChat({
        message: 'Olá!',
      });

      const greetings = ['Bom dia', 'Boa tarde', 'Boa noite'];
      expect(greetings.some(g => result.message.includes(g))).toBe(true);
      expect(result.suggestions).toBeTruthy();
    });

    it('should respond to thanks', async () => {
      const result = await processChat({
        message: 'Obrigado pela ajuda!',
      });

      expect(result.message).toContain('De nada');
    });

    it('should respond to help query', async () => {
      const result = await processChat({
        message: 'O que você pode fazer?',
      });

      expect(result.suggestions).toBeTruthy();
      expect(result.suggestions?.length).toBeGreaterThan(0);
    });

    it('should handle context from previous messages', async () => {
      const result = await processChat({
        message: 'Sim, confirmados os dados',
        context: {
          propertyId: 'prop-123',
          propertyTitle: 'Apartamento центра',
          previousMessages: [
            { role: 'user', content: 'Qual o preço?' },
            { role: 'assistant', content: 'Me passe os dados' },
          ],
        },
      });

      expect(result.message).toBeTruthy();
    });
  });

  describe('containsPriceIntent', () => {
    it('should detect price keywords', () => {
      expect(containsPriceIntent('quanto custa')).toBe(true);
      expect(containsPriceIntent('qual o valor')).toBe(true);
      expect(containsPriceIntent('preço justo')).toBe(true);
    });

    it('should not detect price intent in unrelated messages', () => {
      expect(containsPriceIntent('olá tudo bem')).toBe(false);
      expect(containsPriceIntent('quais são os imóveis')).toBe(false);
    });
  });

  describe('containsDescriptionIntent', () => {
    it('should detect description keywords', () => {
      expect(containsDescriptionIntent('criar descrição')).toBe(true);
      expect(containsDescriptionIntent('gerar descrição')).toBe(true);
      expect(containsDescriptionIntent('escrever anúncio')).toBe(true);
    });

    it('should not detect description intent in unrelated messages', () => {
      expect(containsDescriptionIntent('listar imóveis')).toBe(false);
    });
  });

  describe('ChatInputSchema', () => {
    it('should validate minimal input', () => {
      const valid = {
        message: 'Olá',
      };

      expect(ChatInputSchema.safeParse(valid).success).toBe(true);
    });

    it('should validate full input with context', () => {
      const valid = {
        message: 'Qual o preço?',
        context: {
          propertyId: 'prop-123',
          propertyTitle: 'Apartamento Legal',
          userName: 'João',
        },
        action: 'suggest_price',
      };

      expect(ChatInputSchema.safeParse(valid).success).toBe(true);
    });

    it('should reject empty message', () => {
      const invalid = {
        message: '',
      };

      expect(ChatInputSchema.safeParse(invalid).success).toBe(false);
    });

    it('should reject invalid action', () => {
      const invalid = {
        message: 'Teste',
        action: 'invalid_action',
      };

      expect(ChatInputSchema.safeParse(invalid).success).toBe(false);
    });
  });
});
