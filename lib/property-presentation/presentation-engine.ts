import type { PresentationMode, PropertyPresentationData } from '@/types/presentation';

/**
 * Engine de Apresentação Imobiliária (imobEngine)
 * 
 * Esta classe é responsável por orquestrar como um imóvel é apresentado ao usuário
 * final (lead). O objetivo principal aqui é o "Wow Factor" — garantir que o cliente
 * seja impactado nos primeiros segundos.
 */
export class PresentationEngine {
  private data: PropertyPresentationData;

  constructor(data: PropertyPresentationData) {
    this.data = data;
  }

  /**
   * Determina a experiência inicial (Wow Factor) mais alta disponível.
   * 
   * @param deviceType O tipo de dispositivo do usuário para ajustar a carga e recursos.
   * @returns O modo de apresentação ideal (`3d-model`, `ar-preview`, etc).
   * 
   * Rationale: Em 2026, a atenção do lead dura 3 segundos. Se o imóvel tem tour 3D
   * ou Drone, precisamos carregar isso IMEDIATAMENTE.
   */
  public getOptimalInitialMode(deviceType: 'mobile' | 'desktop' | 'vr-headset' = 'desktop'): PresentationMode {
    const { features } = this.data;

    // Prioridade Máxima: Simulação de Vôo/Drone (Impacto visual absurdo no Desktop)
    if (deviceType === 'desktop' && features.hasDroneFlightSimulator) return '3d-model';
    
    // Prioridade Mobile: Realidade Aumentada (Engajamento via câmera)
    if (deviceType === 'mobile' && features.hasARMobilePreview) return 'ar-preview';
    
    // Eventos ao vivo (Escalabilidade de vendas)
    if (features.hasVirtualOpenHouse) return 'virtual-open-house';
    
    // Tours Imersivos 360
    if (features.hasInteractive360Tour) return '360-tour';
    
    // Modelagem 3D automática via Fotos (imobEngine AI)
    if (features.has3DModelFromPhotos) return '3d-model';
    
    // Fallback Seguro: Galeria de Fotos tradicional
    return this.data.defaultMode || 'gallery';
  }

  /**
   * Lista os modos de navegação que este imóvel específico suporta.
   * Filtra dinamicamente baseado no processamento de mídia concluído.
   * 
   * @returns Array de objetos configurados para renderizar o menu de navegação.
   */
  public getAllowedNavigationModes(): { id: PresentationMode; icon: string; label: string; isPremium: boolean }[] {
    const modes: { id: PresentationMode; icon: string; label: string; isPremium: boolean }[] = [];
    const feat = this.data.features;

    // Modos Essenciais (Sempre tentamos ter esses)
    if (feat.hasGallery) modes.push({ id: 'gallery', icon: 'image', label: 'Galeria', isPremium: false });
    if (feat.hasMap) modes.push({ id: 'map', icon: 'map', label: 'Mapa Interativo', isPremium: false });
    
    // Modos Imersivos (O diferencial da imobWeb)
    if (feat.hasInteractive360Tour) modes.push({ id: '360-tour', icon: 'move-3d', label: 'Tour 360°', isPremium: true });
    if (feat.has3DModelFromPhotos) modes.push({ id: '3d-model', icon: 'box', label: 'Maquete 3D', isPremium: true });
    
    // Utilidades de Conversão
    if (this.data.floorPlanUrl) modes.push({ id: 'floor-plan', icon: 'layout', label: 'Planta Baixa', isPremium: false });
    if (feat.hasVirtualOpenHouse) modes.push({ id: 'virtual-open-house', icon: 'users', label: 'Open House Ao Vivo', isPremium: true });

    return modes;
  }

  /**
   * Configuração para o Assistente de IA que acompanha a visita virtual.
   * 
   * Por que isso existe? Para que a IA saiba se deve começar a falar sozinha 
   * ou sugerir interações baseadas nos recursos ativos do imóvel.
   */
  public getAIAssistantConfig() {
    return {
      autoStartVoiceOver: this.data.features.hasAIVoiceOver,
      suggestComparison: this.data.features.hasComparisonMode,
      enableInteriorDesigner: this.data.features.hasAIInteriorDesigner,
      showDynamicLighting: this.data.features.hasDynamicDayNight
    };
  }

  /**
   * Validação de capacidade do navegador para WebXR (VR/AR).
   * 
   * Nota: Só deve ser chamado no lado do cliente (Client-side).
   */
  public canRenderWebXR(): boolean {
    return typeof window !== 'undefined' && 'xr' in navigator;
  }
}

