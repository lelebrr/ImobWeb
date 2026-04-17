/**
 * INTELLIGENT AD CLONER MOTOR - IMOBWEB 2026
 * Orchestrates the cloning and optimization of property listings.
 */

import { Property } from "@/types/property";
import { 
  ClonedPropertyData, 
  CloneStrategyRequest, 
  ClonedStrategyResult,
  CloningTone 
} from "@/types/cloner";
import { suggestPrice, PriceInput } from "@/lib/ai/price-suggester";
import { generateDescription, DescriptionInput } from "@/lib/ai/description-generator";
import { MOCK_PROPERTIES } from "@/lib/data/mock-properties";

export class IntelligentCloner {
  /**
   * Processes a cloning request and returns optimized suggestions.
   */
  public async processCloneRequest(request: CloneStrategyRequest): Promise<ClonedStrategyResult> {
    const sourceProperty = MOCK_PROPERTIES.find(p => p.id === request.sourcePropertyId);
    
    if (!sourceProperty) {
      throw new Error("Source property not found");
    }

    // 1. Price Optimization
    const priceInsight = await this.optimizePrice(sourceProperty, request.adjustPrice);

    // 2. Description Optimization
    const descInsight = await this.optimizeDescription(
      sourceProperty, 
      request.optimizeDescription,
      request.preferredTone || "PROFESSIONAL"
    );

    // 3. Photo Reordering
    const photoInsight = await this.optimizePhotos(sourceProperty, request.reorderPhotos);

    // 4. WhatsApp Starter Generation
    const whatsappText = request.generateWhatsApp 
      ? this.generateWhatsAppText(sourceProperty, descInsight.optimizedTitle)
      : "";

    // 5. Expected Performance
    const performance = this.calculateExpectedPerformance(sourceProperty, priceInsight.suggestedPrice);

    const result: ClonedStrategyResult = {
      sourceProperty,
      optimizedData: {
        title: descInsight.optimizedTitle,
        description: descInsight.optimizedDescription,
        price: {
          ...sourceProperty.price,
          amount: priceInsight.suggestedPrice,
        },
        publicationPackage: "HIGHLIGHT", // Recommended default for cloned successful ads
        highlightLevel: "SUPER_DESTAQUE",
        mediaOrder: photoInsight.orderedIds,
        mediaCaptions: photoInsight.captions,
        whatsappInitialText: whatsappText,
      },
      insights: {
        price: {
          reasoning: priceInsight.reasoning,
          suggestion: `Manter preço ${priceInsight.suggestedPrice > sourceProperty.price.amount ? 'ligeiramente acima' : 'competitivo'} do original.`,
          confidence: 0.92,
          impact: "HIGH",
        },
        description: {
          reasoning: "Ajustamos o tom para maximizar conversão baseada no histórico do bairro.",
          suggestion: "Use variações de título para diferentes portais.",
          confidence: 0.88,
          impact: "MEDIUM",
        },
        photos: {
          reasoning: "Priorizamos as fotos com maior tempo de retenção em anúncios similares.",
          suggestion: "Mantenha a fachada como foto principal.",
          confidence: 0.95,
          impact: "HIGH",
        },
        performance
      }
    };

    return result;
  }

  private async optimizePrice(property: Property, shouldAdjust: boolean) {
    if (!shouldAdjust) {
      return { 
        suggestedPrice: property.price.amount, 
        reasoning: "Mantendo preço original solicitado pelo corretor." 
      };
    }

    const input: PriceInput = {
      type: property.category.toLowerCase() as any, // Simple casting for mock
      area: property.metrics.totalArea,
      location: property.address.neighborhood,
      beds: property.metrics.bedrooms,
      baths: property.metrics.bathrooms,
      parking: property.metrics.parkingSpaces,
      features: property.features,
    };

    const suggestion = suggestPrice(input);
    
    // Logic: If it sold fast, we can try a slightly higher entry price
    const suggestedAmount = Math.round(suggestion.suggestedPrice * 1.05);

    return {
      suggestedPrice: suggestedAmount,
      reasoning: "Este tipo de imóvel vendeu em 28 dias na região. Recomendamos iniciar com 5% de margem sobre o preço de avaliação."
    };
  }

  private async optimizeDescription(property: Property, shouldOptimize: boolean, tone: CloningTone) {
    if (!shouldOptimize) {
      return { 
        optimizedTitle: `${property.title} (Cópia)`, 
        optimizedDescription: property.description 
      };
    }

    const input: DescriptionInput = {
      title: property.title,
      location: property.address.neighborhood,
      area: property.metrics.totalArea,
      beds: property.metrics.bedrooms,
      baths: property.metrics.bathrooms,
      parking: property.metrics.parkingSpaces,
      tone: tone.toLowerCase() as any,
    };

    const generated = generateDescription(input);

    return {
      optimizedTitle: `${property.title} - Oportunidade Única`,
      optimizedDescription: generated.full,
    };
  }

  private async optimizePhotos(property: Property, shouldReorder: boolean) {
    const ids = property.media.map(m => m.id);
    
    if (!shouldReorder) {
      return { 
        orderedIds: ids, 
        captions: property.media.reduce((acc, m) => ({ ...acc, [m.id]: m.alt }), {}) 
      };
    }

    // Logic: In real app, we'd fetch view metrics. Here we simulate.
    const ordered = [...property.media].sort((a, b) => {
        // High quality scores first
        const scoreA = a.aiMetadata?.qualityScore || 0;
        const scoreB = b.aiMetadata?.qualityScore || 0;
        return scoreB - scoreA;
    });

    const orderedIds = ordered.map(m => m.id);
    const captions: Record<string, string> = {};
    
    ordered.forEach((m, index) => {
      if (index === 0) captions[m.id] = "Fachada espetacular e imponente";
      else if (index === 1) captions[m.id] = "Living amplo com iluminação natural";
      else captions[m.id] = m.alt;
    });

    return { orderedIds, captions };
  }

  private generateWhatsAppText(property: Property, title: string): string {
    return `Olá! Vi o seu anúncio do ${property.title} e gostaria de saber mais detalhes. O imóvel ainda está disponível? Tenho interesse real e gostaria de agendar uma visita para este final de semana.`;
  }

  private calculateExpectedPerformance(property: Property, price: number) {
    // Simulated math based on the original's success
    return {
      estimatedTimeUntilSale: 32, // Original was 28
      expectedLeadsPerWeek: 12,
    };
  }
}

export const clonerMotor = new IntelligentCloner();
