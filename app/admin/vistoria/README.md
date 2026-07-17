# Sistema de Vistoria - imobWeb

## Visão Geral

Sistema completo de criação de laudos de vistoria de imóveis para fins locatícios. Gera PDFs profissionais com fotos reais, anotações e descrições detalhadas.

**URL:** `/admin/vistoria`  
**Exemplos:** `/admin/vistoria/exemplos`

---

## Arquitetura

```
app/admin/vistoria/page.tsx                    ← Página principal (wizard + home + edit + config)
app/admin/vistoria/exemplos/page.tsx           ← Página de exemplos de PDF
app/api/admin/vistoria/analyze/route.ts        ← API de análise com Gemini
app/api/admin/vistoria/generate-pdf/route.ts   ← Geração do HTML/PDF
app/api/admin/vistoria/cep/[cep]/route.ts      ← API de busca de CEP (ViaCEP)
app/api/admin/vistoria/examples/route.ts       ← Dados dos exemplos de PDF
components/ui/creatable-select.tsx             ← Componente de select criável
public/vistoria-exemplos/columbus/             ← Imagens do exemplo 1
public/vistoria-exemplos/saintpeter/           ← Imagens do exemplo 2
```

---

## Tela Principal (Home)

Botões de ação:
| Botão | Função |
|-------|--------|
| ✨ **Criar** | Novo laudo com wizard passo-a-passo |
| 👁 **Visualizar** | Lista de laudos salvos com busca |
| ⚙️ **Configurar** | Padrões, IA, marca d'água, problemas |

Cards de stats: Laudos Criados, Último Laudo, Status da Análise IA

---

## Wizard de Criação (6 Passos)

### Passo 1: Dados do Imóvel
- **Tipo do Imóvel** - Dropdown criável (APARTAMENTO, SALA, CASA, COBERTURA, etc.)
- **CEP** - Auto-fill via ViaCEP (preenche endereço, bairro, cidade, estado)
- **Endereço** - Autocomplete (Rua, Avenida, Alameda...)
- **Número**
- **Andar** - Aparece para APARTAMENTO, COBERTURA, LOFT, SALA
- **Conjunto / Apartamento** - Separados (apenas para apt/cobertura/loft)
- **Bairro** - Autocomplete com cidades brasileiras
- **Cidade** - Autocomplete
- **Estado** - 2 caracteres
- **Finalidade** - Dropdown criável (RESIDENCIAL, COMERCIAL)
- **Mobiliado** - Dropdown criável (NÃO, SIM, PARCIALMENTE)
- **Metragem** - Auto "m²" ao digitar número
- **Data da Vistoria**

### Passo 2: Partes Envolvidas
- **Locadora** - Nome + CPF/CNPJ com validação + Telefone
- **Locatário(a)** - Nome + CPF/CNPJ com validação + Telefone
- **Vistoriadora** - Pré-preenchida das configurações
- **Solicitante** - Pré-preenchido das configurações

### Passo 3: Cômodos (Questionário Guiado)
Perguntas diferentes por tipo de imóvel:

| Tipo | Perguntas |
|------|-----------|
| Apartamento/Cobertura | Andar, Entradas, Quartos, Suítes, Salas, Varanda, Lavabo, Cozinha, Área de Serviço, Home Office, Terraço, Despensa |
| Casa | Andares, Entradas, Quartos, Suítes, Salas, Lavabo, Cozinha, Área de Serviço, Varanda, Garagem, Quintal, Churrasqueira, Piscina, Home Office, Despensa |
| Sala/Comercial | Entradas, Salas, Sala de Reunião, Banheiro, Copa/Cozinhete, Depósito, Vitrine, Estacionamento |

### Passo 4: Inventário por Cômodo (3 Sub-passos)

#### 🪑 Móveis
- Porta, Fechadura, Janela, Vidro, Persiana, Torneira, Registro, Luminária
- Interruptor, Tomada, Armário, Gaveta, Espelho, Prateleira, Gabinete
- Ralo, Sifão, Box, Chuveiro, Aquecedor, Ar condicionado, Controle remoto
- Interfone, Campainha, Caixa de luz
- **Salvos no localStorage** para reutilização rápida

#### ⚠️ Avarias
- Lixeira oxidada, Fechadura com desgaste, Piso trincado
- Pintura descascando, Vazamento, Rachadura, Mancha de umidade, Metais oxidados
- Campo livre para descrição personalizada

#### 🔍 Problemas
- 53 problemas padrão organizados por categoria
- Problemas personalizados (configuração)
- Busca por texto
- Adição rápida com 1 clique

### Passo 5: Fotos e Anotações
- Upload múltiplo de fotos por cômodo
- Arrastar e ordenar fotos (drag & drop)
- **Prompts de fotos** baseados nos móveis e avarias registrados
- Análise automática com Gemini AI
- Anotações clicando na foto (marcadores + linhas de chamada)
- Preview grande das fotos
- Botão "Analisar Todos" para processar em lote

### Passo 6: Observações e PDF
- Resumo dos dados do imóvel
- Resumo das anotações por cômodo
- Templates rápidos de observações
- Textarea para observações livres
- Geração do laudo PDF
- Preview antes de salvar

---

## Visualizar Laudos

Lista de todos os laudos salvos com:
- **Busca** em tempo real (nome, endereço, cidade, bairro, locadora, locatário)
- **Cards detalhados** com: nome, tipo, endereço, cômodos, fotos, anotações, data
- **Botões de ação**: Editar, Visualizar PDF, Download HTML, Excluir

---

## Configurações

### Valores Padrão
- Vistoriadora (pré-preenchido no wizard)
- Solicitante (pré-preenchido no wizard)
- Cidade padrão
- Estado padrão

### Google Gemini AI
- Campo para API Key
- Toggle: Análise de Fotos com IA
- Toggle: Considerações com IA
- Versão: gemini-2.0-flash (15 RPM, 1M tokens/dia)

### Marca d'Água
- Toggle para ativar/desativar
- Texto da marca d'água
- Upload de imagem (logo)

### Opções
- Análise automática ao adicionar fotos

### Problemas
- **Personalizados**: Adicionar vários de uma vez (um por linha)
- **Padrão (53)**: Lista completa com opção de deletar cada um
- **Restaurar todos**: Botão para restaurar problemas deletados

---

## APIs

### POST `/api/admin/vistoria/analyze`

Analisa fotos com Google Gemini.

```json
{
  "rooms": [{ "name": "SALA", "photos": ["data:image/jpeg;base64,..."] }],
  "propertyType": "APARTAMENTO",
  "finality": "RESIDENCIAL"
}
```

### GET `/api/admin/vistoria/cep/[cep]`

Busca endereço por CEP via ViaCEP.

### POST `/api/admin/vistoria/generate-pdf`

Gera HTML do laudo profissional.

```json
{
  "condominio": "EDIFÍCIO COLUMBUS TOWER",
  "endereco": "Avenida Dumont Villares",
  "numero": "1410",
  "conjApto": "Conj. 103",
  "apto": "",
  "andar": "",
  "cep": "05640-003",
  "bairro": "Vila Suzana",
  "cidade": "São Paulo",
  "estado": "SP",
  "tipoImovel": "SALA",
  "finalidade": "COMERCIAL",
  "metragem": "35m²",
  "mobiliado": "NÃO",
  "locadora": "ALEXANDRA ESCOBAR",
  "locadoraCpf": "153.224.928-44",
  "locadoraTelefone": "(11) 99876-5432",
  "locatario": "IGOR MIRA",
  "locatarioCpf": "277.246.018-52",
  "locatarioTelefone": "(11) 98765-4321",
  "vistoriadora": "Mônica Barbosa",
  "dataFotografia": "23/12/2025",
  "dataLaudo": "27/12/2025",
  "solicitante": "ARTIMOB",
  "emailContestacao": "monica@artimob.com",
  "rooms": [{
    "name": "SALA",
    "items": ["✓ Porta de madeira em bom estado", "..."],
    "furniture": ["Porta", "Janela", "Ar condicionado"],
    "damages": ["Manchas na persiana"],
    "problems": ["Rachadura na parede"],
    "observations": "Sala em bom estado geral",
    "photos": [{
      "dataUrl": "https://...",
      "name": "sala_1.jpg",
      "annotations": [{ "x": 35, "y": 45, "label": "Manchas na persiana" }]
    }]
  }],
  "consideracoes": "Conforme laudo, o imóvel encontra-se em bom estado..."
}
```

---

## Estrutura do PDF Gerado

1. **Capa** - Título com gradiente, vistoriadora, datas
2. **Critérios + Info** - 5 níveis de conservação, dados do imóvel, resumo
3. **Sumário** - Tabela com cômodos, fotos e páginas reais
4. **Cômodos** (1 por página):
   - Header com número + nome
   - Itens com ✓ verde
   - Box de problemas (vermelho ⚠)
   - Box de observações (azul 📋)
   - Grid de fotos com marcadores e linhas de chamada
5. **Considerações Finais** - Texto + contestação + email
6. **Assinaturas** - Locadora e Locatário

---

## Problemas Comuns (53)

**Paredes e Teto (11):** Rachadura, Mancha de umidade, Pintura descascando, Furo, Teto descascando, Infiltração, Mofo, Vazamento, Parede com bolhas, Reboco soltando, Teto com manchas

**Piso (8):** Desgaste, Quebrado, Rachadura, Azulejo solto, Rejunte, Manchas, Desnível, Ladrilho trincado

**Hidráulica (9):** Vazamento torneira/registro/vaso, Pressão baixa, Louça quebrada, Torneira com vazamento, Vazamento caixa d'água, Tubo exposto, Registro travado

**Elétrica (8):** Tomada com defeito, Interruptor com defeito, Fiação aparente, Quadro de luz, Disjuntor, Luz piscando, Falta de tomadas, Fio desencapado

**Portas/Janelas (8):** Porta com desajuste, Fechadura com defeito, Janela emperrando, Vidro rachado, Persiana quebrada, Mosqueiro rasgado, Porta rangendo, Batente danificado

**Outros (5):** Barulho, Vazamento na varanda, Grade com ferrugem, Luminária com defeito, Ar condicionado vazamento

---

## Configuração

### Variável de Ambiente
```
GEMINI_API_KEY=sua-chave-aqui
```
Obtenha em: https://aistudio.google.com/app/apikey

### localStorage
```
vistoria_tipo_imovel: ["APARTAMENTO", "SALA", "LOFT"]
vistoria_finalidade: ["RESIDENCIAL", "COMERCIAL"]
vistoria_mobiliado: ["NÃO", "SIM", "PARCIALMENTE"]
vistoria_furniture: ["Porta", "Janela", "Ar condicionado"]
vistoria_settings: { ... }
vistoria_saved: [ ... laudos salvos ... ]
```

---

## Manutenção

### Adicionar problemas
Edite `COMMON_PROBLEMS` em `app/admin/vistoria/page.tsx`

### Adicionar dicas de fotos
Edite `ROOM_PHOTO_TIPS`

### Modificar PDF
Edite `generateHtml()` em `app/api/admin/vistoria/generate-pdf/route.ts`

### Adicionar tipo de cômodo
Edite `ROOM_PHOTO_TIPS` e `getQuestionsForType()` no componente `RoomQuestionnaire`
