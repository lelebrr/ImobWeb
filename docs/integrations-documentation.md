# Documentação Completa das Integrações com Portais de Imóveis Brasileiros

## Introdução

Este documento fornece uma documentação completa sobre o sistema de integração com os principais portais de imóveis do Brasil. A solução permite a sincronização automática de anúncios entre o sistema CRM e os portais, com suporte a 10 portais principais e um sistema de seleção automática de portais.

### Portais Suportados

1. **Zap Imóveis** - Mais popular portal do Brasil
2. **Viva Real** - Portal de imóveis com foco em qualidade
3. **OLX Imóveis** - Compre e venda direta
4. **ImovelWeb** - Portal com formato XML VRSync padrão
5. **Chaves na Mão** - Portal com formato personalizado
6. **Mercado Livre** - Integração com marketplace
7. **Proprietário Direto** - Portal focado em vendas diretas
8. **ImobiBrasil** - Portal completo de imóveis
9. **Loft** - Portal moderno com metadados avançados
10. **QuintoAndar** - Portal de alto padrão

## Arquitetura do Sistema

### 1. Estrutura de Tipos e Interfaces

O sistema utiliza um padrão de interfaces consistentes para todos os portais:

```typescript
// Tipos de Portal
export type PortalType = 'ZAP' | 'VIVAREAL' | 'OLX' | 'IMOVELWEB' | 'CHAVES_NA_MAO' | 'MERCADO_LIVRE' | 'PROPRIETARIO_DIRETO' | 'IMOBIBRASIL' | 'LOFT' | 'QUINTO_ANDAR' | 'VRSYNC' | 'CUSTOM';

// Interface de Adapter
export interface PortalAdapter {
  createProperty(data: Record<string, unknown>): Promise<string>;
  updateProperty(externalId: string, data: Record<string, unknown>): Promise<void>;
  deleteProperty(externalId: string): Promise<void>;
  getProperty(externalId: string): Promise<Record<string, unknown>>;
  getLeads(): Promise<any[]>;
  getAnalytics(propertyId?: string): Promise<Record<string, unknown>>;
  validateProperty(property: any): { valid: boolean; errors?: string[] };
}
```

### 2. Adaptadores de Portais

Cada portal possui um adaptador específico que implementa a interface `PortalAdapter`. Os adaptadores são responsáveis por:

- **Validação de dados**: Verificar se os campos do imóvel estão de acordo com as regras do portal
- **Gerar XML**: Transformar os dados do sistema em formato XML específico do portal
- **Autenticação**: Gerenciar as chaves de API e autenticação
- **Sincronização**: Realizar as operações de criação, atualização e exclusão

#### Exemplo: Adaptador de Zap Imóveis

```typescript
export class ZapAdapter extends BasePortalAdapter implements PortalAdapter {
  async createProperty(data: Record<string, unknown>): Promise<string> {
    // Implementação de criação de anúncio no Zap
    // Validação de dados, geração de XML VRSync
    // Autenticação e envio para API do Zap
  }
}
```

### 3. Gerador de XML

O sistema utiliza um gerador de XML que suporta todos os formatos específicos de cada portal:

```typescript
export class XmlGenerator {
  generate(property: PropertyData, portalId: PortalId): string {
    switch (portalId) {
      case 'zap':
        return this.generateZapXml(property);
      case 'vivareal':
        return this.generateVivaXml(property);
      case 'olx':
        return this.generateOlxXml(property);
      case 'imovelweb':
        return this.generateImovelWebXml(property);
      case 'chaves':
        return this.generateChavesXml(property);
      case 'mercado_livre':
        return this.generateMercadoLivreXml(property);
      case 'proprietario_direto':
        return this.generateProprietarioDiretoXml(property);
      case 'imobibrasil':
        return this.generateImobiBrasilXml(property);
      case 'loft':
        return this.generateLoftXml(property);
      case 'quinto_andar':
        return this.generateQuintoAndarXml(property);
      default:
        throw new Error('Portal não suportado');
    }
  }
}
```

### 4. Sistema de Seleção Automática

O sistema utiliza um algoritmo de pontuação para selecionar os portais mais adequados:

```typescript
export class PortalAutoSelector {
  selectPortals(criteria: PortalSelectionCriteria): AutoSelectionResult {
    const scores = this.calculatePortalScores(criteria);
    const selectedPortals = this.selectBestPortals(scores, criteria);
    const recommendations = this.generateRecommendations(scores, criteria);
    return { selectedPortals, scores, recommendations };
  }
}
```

### 5. Motor de Sincronização

O motor de sincronização suporta:

- **Sincronização unidirecional** (sistema → portal)
- **Sincronização bidirecional** (portal → sistema)
- **Detecção de conflitos**
- **Resolução de conflitos**

```typescript
export class SyncEngine {
  async syncProperty(propertyId: string, portalId: PortalId): Promise<BidirectionalSyncResult> {
    const conflicts = await this.detectConflicts(property, portalId);
    const syncDetails: SyncDetails = { action: 'SYNC', direction: 'BIDIRECTIONAL' };
    // Implementação completa do processo de sincronização
  }
}
```

## Configuração e Gerenciamento

### 1. Configuração de Integração

A configuração de cada portal é armazenada no banco de dados como:

```prisma
model PortalIntegration {
  id: String @id @default(cuid())
  name: String
  type: PortalType
  apiKey: String?
  apiSecret: String?
  baseUrl: String?
  authType: String @default("api_key")
  authData: Json?
  status: PortalIntegrationStatus @default(ATIVO)
  lastSync: DateTime?
  syncCount: Int @default(0)
  errorCount: Int @default(0)
  metadata: Json?
  settings: Json?
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

### 2. Dashboard de Gestão

O dashboard fornece:

- **Visão geral** dos portais ativos
- **Status de saúde** de cada portal
- **Métricas de desempenho**
- **Logs de sincronização**
- **Configurações detalhadas**

## Implementação Técnica

### 1. Autenticação e Segurança

- **Chaves de API**: Armazenadas com hash SHA-256
- **Autenticação**: Tipo de autenticação específico para cada portal
- **Rate Limiting**: Implementado para evitar limites de API

### 2. Tratamento de Erros

O sistema implementa:

- **Retries com Exponential Backoff**
- **Circuit Breaker Pattern**
- **Rate Limiting**
- **Log de Erros**

### 3. Performance

- **Cache**: Implementado para dados de integração
- **Batch Processing**: Processamento em lote para grandes volumes
- **Concorrencia**: Suporte a múltiplas integrações simultâneas

## Uso do Sistema

### 1. Cadastrar Propriedade

1. **Adicionar imóvel no sistema**
2. **O sistema detecta os portais configurados**
3. **Auto-seleciona os portais mais adequados**
4. **Sincroniza automaticamente o anúncio**

### 2. Monitorar Integrações

- **Dashboard**: Visualização em tempo real
- **Logs**: Detalhes de cada operação
- **Alertas**: Notificações de erros ou problemas

### 3. Testar Conexão

- **API Test**: Verifica a conexão com o portal
- **Health Check**: Verifica o status do portal
- **Sync Test**: Realiza uma sincronização de teste

## Recursos Adicionais

### 1. Análise de Desempenho

- **Métricas de visualizações**
- **Taxa de cliques**
- **Leads gerados**
- **Performance de cada portal**

### 2. Relatórios

- **Relatório de integrações**
- **Relatório de sincronização**
- **Relatório de erros**

### 3. Configurações Avançadas

- **Prioridade de portais**
- **Limites de sincronização**
- **Filtros de dados**
- **Planos de integração**

## Limitações e Considerações

### 1. Limitações

- **Portais com restrições de API**: Algumas portais limitam o número de solicitações
- **Formatos complexos**: Portais com formatos XML complexos podem exigir mais validação
- **Diferenças de dados**: Diferenças nos campos necessários entre portais

### 2. Considerações de Segurança

- **Armazenamento de chaves**: As chaves de API são armazenadas criptografadas
- **Acesso restrito**: Apenas usuários com permissão podem configurar integrações
- **Monitoramento de uso**: Contagem de sincronizações e erros

## Próximas Melhorias

1. **Integração com mais portais**
2. **Suporte a portais internacionais**
3. **Análise de dados avançada**
4. **Integração com sistemas de CRM**
5. **Relatórios customizáveis**

## Conclusão

O sistema de integração com portais de imóveis brasileiros é completo e robusto, suportando 10 portais principais com diferentes formatos e regras. A arquitetura é escalável e pode ser estendida para novos portais com facilidade. A implementação inclui todos os recursos necessários para uma integração eficiente e segura.