# Property Presentation Module

Bem-vindo à documentação do módulo de Apresentação de Imóveis do **ImobWeb**, projetado para os padrões visuais e imersivos de 2026.

## Arquitetura Base
O módulo é centralizado na biblioteca `PresentationEngine` (`lib/property-presentation/presentation-engine.ts`), que faz a triagem das mais de 20 funcionalidades High-End disponíveis no sistema. O motor garante renderização condicional baseada na capacidade de hardware do cliente (Mobile vs Desktop vs VR), nas permissões de usuário e na disponibilidade de mídia (Ex: se o cliente processou imagem 360).

### Diretórios
- `components/maps/` - Camadas de Inteligência e Mapas 3D.
- `components/3d/` - Modelos interativos baseados em React Three Fiber.
- `components/floorplan/` - Ferramentas de edição e medida SVG (planta baixa).
- `components/immersive/` - Visualizações baseadas em IA (Staging, Tours, etc).

## As 20 Funcionalidades de Luxo (Implementation Scope)

1. **AI Virtual Staging** (`AIVirtualStaging.tsx`): Toggle inteligente em fotos que aplica decoração por difusão (AI).
2. **3D Model from Photos**: Motor de conversão estática -> 3D. (Dependência externa).
3. **Interactive 360° Tour**: Suporte a vídeo hiper-esférico com hot-spots.
4. **AR Mobile Preview**: WebXR para projetar o lote em mesa.
5. **Dynamic Day/Night**: Controle de shaders para transição de luz natural.
6. **AI Voice-Over Tour**: Player de áudio espacial ditando os cômodos.
7. **Furniture Placement AI**: Interface Drag & Drop 2D/3D (FloorPlanEditor).
8. **Heatmap of Interest**: UI de Tracking Map (AdvancedPropertyMap).
9. **Price Overlay on Map**: Polygon layer no mapa (AdvancedPropertyMap).
10. **Neighborhood Intelligence Layer**: Data-layer interativo (Escolas, Parques).
11. **Seasonal View**: Engine shaders (Vento/Neve/Folhas).
12. **Accessibility Simulation**: View modes de altura de câmera e filtros daltônicos.
13. **Energy Efficiency Visualization**: Grade de calor/insolação no mapa ou 3D.
14. **Smart Home Preview**: Event triggers na UI conectando com IoT mock.
15. **Comparison Mode**: Split Screen para duas casas passivas em `Property3DViewer`.
16. **Personalized Video Tour**: Hook de geração FFMPEG ou AI Video API.
17. **Drone Flight Simulator**: Câmera Desacoplada usando WASD + Scroll no WebGL.
18. **Room-by-Room Measurement AR**: Overlay dimensional indicando medições dinâmicas nas fotos ou 3D.
19. **Virtual Open House**: Sistema integrado c/ WebSocket Rooms e WebRTC.
20. **AI Interior Designer Assistant**: Input prompt mudando texturas at runtime.

---
_A estrutura de tipagem master está presente em `types/presentation.ts` limitando cada fallback._
