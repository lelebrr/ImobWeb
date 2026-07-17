# Sistema de Vistoria com IA - imobWeb

## Visão Geral

O sistema de vistoria automatiza a criação de laudos de vistoria de imóveis para fins locatícios, utilizing Google Gemini AI para analisar fotos e gerar descrições automáticas dos cômodos.

**URL:** `/admin/vistoria`

---

## Arquitetura

```
app/admin/vistoria/page.tsx              ← Página principal (wizard completo)
app/api/admin/vistoria/analyze/route.ts  ← API de análise com Gemini
app/api/admin/vistoria/generate-pdf/route.ts ← Geração do HTML/PDF
components/ui/creatable-select.tsx       ← Componente de select criável
```

---

## Fluxo do Wizard (5 Passos)

### Passo 1: Dados do Imóvel
- Nome do condomínio, endereço, número, conjunto/apto
- CEP, bairro, cidade, estado
- Tipo do imóvel (dropdown criável)
- Finalidade (dropdown criável)
- Metragem, mobiliado (dropdown criável)
- Data da vistoria

### Passo 2: Partes Envolvidas
- Locadora: nome e CPF
- Locatário(a): nome e CPF
- Vistoriadora
- Solicitante (imobiliária)

### Passo 3: Cômodos
- Adicionar/remover cômodos
- Nome do cômodo (ex: SALA, COZINHA, BANHEIRO)
- Dicas de fotos por tipo de cômodo

### Passo 4: Fotos e Anotações
- Upload de fotos por cômodo
- Arrastar e ordenar fotos
- Análise com Gemini AI
- Anotações clicando na foto
- Preview grande das fotos

### Passo 5: Observações e PDF
- Resumo dos dados
- Templates rápidos de observações
- Textarea para observações livres
- Geração do laudo PDF
- Preview antes de salvar

---

## Componentes

### CreatableSelect (`components/ui/creatable-select.tsx`)

Select que permite criar novas opções que são salvas no localStorage.

```tsx
<CreatableSelect
  options={['APARTAMENTO', 'SALA', 'CASA']}
  value={selectedValue}
  onChange={(v) => setSelectedValue(v)}
  storageKey="vistoria_tipo_imovel"
/>
```

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| `options` | `string[]` | Opções fixas padrão |
| `value` | `string` | Valor selecionado |
| `onChange` | `(value: string) => void` | Callback ao mudar |
| `storageKey` | `string` | Key do localStorage para persistir |
| `placeholder` | `string?` | Texto placeholder |

### PhotoAnnotator (inline no page.tsx)

Modal para anotar problemas em fotos com:
- Marcadores numerados
- Linhas de chamada (callout lines)
- 16 problemas pré-definidos
- Edição de anotações existentes

### PhotoPreview (inline no page.tsx)

Modal de preview grande de fotos com:
- Imagem em tamanho real
- Lista de anotações no canto

---

## APIs

### POST `/api/admin/vistoria/analyze`

Analisa fotos de um cômodo com Google Gemini.

**Request:**
```json
{
  "rooms": [
    {
      "name": "SALA",
      "photos": ["data:image/jpeg;base64,..."]
    }
  ],
  "propertyType": "APARTAMENTO",
  "finality": "RESIDENCIAL"
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "SALA": [
      "✓ Porta de entrada de madeira em bom estado",
      "✓ Piso em laminado marrom em bom estado"
    ]
  }
}
```

### POST `/api/admin/vistoria/generate-pdf`

Gera o HTML do laudo para impressão.

**Request:**
```json
{
  "condominio": "EDIFÍCIO COLUMBUS TOWER",
  "endereco": "Avenida Dumont Villares",
  "numero": "1410",
  "rooms": [
    {
      "name": "SALA",
      "items": ["✓ Porta de madeira em bom estado"],
      "photos": [
        {
          "dataUrl": "data:image/jpeg;base64,...",
          "name": "foto1.jpg",
          "annotations": [
            { "x": 45.2, "y": 32.1, "label": "Rachadura na parede" }
          ]
        }
      ]
    }
  ],
  "consideracoes": "Imóvel entregue com pintura nova"
}
```

**Response:**
```json
{
  "success": true,
  "html": "<!DOCTYPE html>..."
}
```

---

## Estrutura do PDF Gerado

O laudo segue o padrão profissional de laudos de vistoria:

1. **Capa** - Título, vistoriadora, datas
2. **Dados do Imóvel** - Informações gerais, critérios de avaliação
3. **Sumário** - Lista de cômodos
4. **Cômodos** - Para cada cômodo:
   - Lista de itens com estado de conservação
   - Fotos com anotações (marcadores + linhas de chamada)
   - Legenda das anotações
5. **Considerações Finais** - Texto livre + templates
6. **Contestação** - Regras de prazo
7. **Assinaturas** - Locadora e Locatário

### Formato das Anotações no PDF

```
┌─────────────────────────────────┐
│  ┌─┐                           │
│  │1│── ── ── ── ── ┌──────────┐│
│  └─┘               │Rachadura ││
│                    │na parede ││
│    [FOTO]          └──────────┘│
│  ┌─┐                           │
│  │2│── ── ── ── ┌────────────┐│
│  └─┘            │Mancha de   ││
│                 │umidade     ││
│                 └────────────┘│
└─────────────────────────────────┘
```

---

## Dicas de Fotos por Cômodo

O sistema sugere automaticamente quais fotos tirar baseado no nome do cômodo:

| Cômodo | Dicas |
|--------|-------|
| ENTRADA | Porta, fechadura, interfone, piso, parede, quadro de luz |
| SALA | Parede (4 faces), piso, janelas, teto, tomadas, ar condicionado |
| COZINHA | Bancada, pia, armários, torneira, piso, fogão/forno |
| BANHEIRO | Vaso sanitário, pia, espelho, torneira, chuveiro, piso |
| QUARTO | Parede, piso, janelas, teto, armários |
| VARANDA | Piso, grade/vidraça, teto, luminária |

---

## Problemas Comuns (Quick-Select)

Ao anotar fotos, o sistema oferece 16 problemas pré-definidos:

1. Rachadura na parede
2. Mancha de umidade
3. Desgaste no piso
4. Vazamento
5. Infiltração
6. Pintura descascando
7. Furo na parede
8. Serragem/trincas
9. Metais oxidados
10. Louça quebrada
11. Tomada com defeito
12. Interruptor com defeito
13. Porta com desajuste
14. Janela emperrando
15. Mofo
16. Barulho

---

## Configuração

### Variável de Ambiente

Adicione no `.env`:

```
GEMINI_API_KEY=sua-chave-aqui
```

Obtenha em: https://aistudio.google.com/app/apikey

### localStorage

Opções criadas são salvas automaticamente:

```
vistoria_tipo_imovel: ["APARTAMENTO", "SALA", "CASA", "LOFT"]
vistoria_finalidade: ["RESIDENCIAL", "COMERCIAL"]
vistoria_mobiliado: ["NÃO", "SIM", "PARCIALMENTE"]
```

---

## Componentes de UI

| Componente | Uso |
|------------|-----|
| `CreatableSelect` | Dropdown com opção "+ Criar" |
| `Button` | Botões de ação |
| `Input` | Campos de texto |
| `Label` | Labels dos campos |
| `Badge` | Indicadores de status |
| `ResponsiveTable` | Tabelas responsivas |
| `AdaptiveModal` | Modais adaptativos |

---

## Animações

- **Framer Motion** em todos os componentes
- Transições suaves entre passos do wizard
- Animação de entrada/saída de modais
- Hover effects em cards e botões
- Loading spinner durante geração

---

## Responsividade

- **Mobile:** Layout vertical, upload simplificado
- **Tablet:** Grid 2 colunas, sidebar colapsada
- **Desktop:** Grid 3-4 colunas, sidebar expandida
- **Preview:** Tela cheia no mobile, modal no desktop

---

## Exemplos de Laudos

O sistema gera laudos no padrão dos exemplos:
- LAUDO DE VISTORIA DE ENTRADA - COLUMBUS TOWER
- LAUDO DE VISTORIA ENTRADA - SAINT PETER
- LAUDO DE VISTORIA ENTRADA - TIFFANY'S

---

## Manutenção

### Adicionar novos problemas comuns

Edite a constante `COMMON_PROBLEMS` em `app/admin/vistoria/page.tsx`:

```ts
const COMMON_PROBLEMS = [
  'Rachadura na parede',
  'Seu novo problema aqui',
  // ...
];
```

### Adicionar dicas para novo cômodo

Edite `ROOM_PHOTO_TIPS`:

```ts
const ROOM_PHOTO_TIPS: Record<string, string[]> = {
  'NOVO CÔMODO': ['Dica 1', 'Dica 2'],
  // ...
};
```

### Modificar o layout do PDF

Edite a função `generateHtml()` em `app/api/admin/vistoria/generate-pdf/route.ts`.
