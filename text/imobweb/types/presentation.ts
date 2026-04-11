export type PresentationMode = 
  | 'gallery' 
  | 'map' 
  | 'street-view' 
  | '3d-model' 
  | '360-tour' 
  | 'floor-plan'
  | 'video'
  | 'ar-preview'
  | 'virtual-open-house'
  | 'comparison';

export type AIStagingStyle = 'modern' | 'minimalist' | 'industrial' | 'scandinavian' | 'classic' | 'bohemian' | 'japandi';

export type LightingCondition = 'sunrise' | 'midday' | 'sunset' | 'night' | 'dynamic';
export type SeasonCondition = 'spring' | 'summer' | 'autumn' | 'winter';

export interface AccessibilitySimulation {
  enabled: boolean;
  viewpointHeight: 'standing' | 'wheelchair' | 'child';
  visualImpairment: 'none' | 'colorblind-deuteranopia' | 'glaucoma-tunnel' | 'cataracts-blur';
}

export interface NeighborhoodLayer {
  id: string;
  type: 'schools' | 'transit' | 'security' | 'commerce' | 'healthcare' | 'parks';
  active: boolean;
  dataPoints: Array<{
    lat: number;
    lng: number;
    title: string;
    rating?: number;
    distance?: number;
  }>;
}

export interface PresentationFeatureAvailability {
  // Base Features
  hasMap: boolean;
  hasStreetView: boolean;
  hasGallery: boolean;
  
  // The 20 Next-Gen Innovative Features
  hasAIVirtualStaging: boolean;             // 1. AI Virtual Staging
  has3DModelFromPhotos: boolean;            // 2. 3D Model from Photos
  hasInteractive360Tour: boolean;           // 3. Interactive 360° Tour
  hasARMobilePreview: boolean;              // 4. AR Mobile Preview
  hasDynamicDayNight: boolean;              // 5. Dynamic Day/Night Simulation
  hasAIVoiceOver: boolean;                  // 6. AI Voice-Over Tour
  hasFurniturePlacementAI: boolean;         // 7. Furniture Placement AI
  hasHeatmapOfInterest: boolean;            // 8. Heatmap of Interest
  hasPriceOverlayOnMap: boolean;            // 9. Price Overlay on Map
  hasNeighborhoodIntelligence: boolean;     // 10. Neighborhood Intelligence Layer
  hasSeasonalView: boolean;                 // 11. Seasonal View
  hasAccessibilitySimulation: boolean;      // 12. Accessibility Simulation
  hasEnergyEfficiencyViz: boolean;          // 13. Energy Efficiency Visualization
  hasSmartHomePreview: boolean;             // 14. Smart Home Preview
  hasComparisonMode: boolean;               // 15. Comparison Mode
  hasPersonalizedVideoTour: boolean;        // 16. Personalized Video Tour
  hasDroneFlightSimulator: boolean;         // 17. Drone Flight Simulator
  hasRoomByRoomMeasurement: boolean;        // 18. Room-by-Room Measurement AR
  hasVirtualOpenHouse: boolean;             // 19. Virtual Open House
  hasAIInteriorDesigner: boolean;           // 20. AI Interior Designer Assistant
}

export interface PropertyPresentationData {
  propertyId: string;
  defaultMode: PresentationMode;
  availableModes: PresentationMode[];
  features: PresentationFeatureAvailability;
  
  // Basic Info for overlays
  price: number;
  pricePerSqm: number;
  area: number;
  address: {
    lat: number;
    lng: number;
    formattedAddress: string;
    neighborhood: string;
    city: string;
  };
  
  // Feature Specific Configurations
  stagingConfig?: {
    availableStyles: AIStagingStyle[];
    previewImages: Record<string, string>; // original -> staged URL
  };
  model3DUrl?: string; // .glb / .gltf
  floorPlanUrl?: string;
  tour360Url?: string;
}
