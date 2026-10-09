# Sistema de Vistoria - imobWeb

## Visão Geral

Sistema completo de criação de laudos de vistoria de imóveis para fins locatícios. Gera PDFs profissionais com fotos reais, anotações e descrições detalhadas.

**URL:** `/admin/vistoria`  
**Exemplos:** `/admin/vistoria/exemplos`

---

## Arquitetura

```
app/admin/vistoria/page.tsx                     ← Roteador de views (fino)
app/admin/vistoria/_lib/useVistoriaController.ts← Estado, autosave, fotos, IA, PDF
app/admin/vistoria/_lib/storage.ts              ← IndexedDB (Dexie): laudos, configurações, backup/importação
app/admin/vistoria/_lib/image.ts                ← Compressão de fotos (1600px / JPEG 82%)
app/admin/vistoria/_lib/{types,constants,utils,laudo-stats}.ts(x)
app/admin/vistoria/_views/                      ← Home, Library, Stats, Config, Wizard
app/admin/vistoria/_components/                 ← Passos do wizard, anotador de fotos, inputs
app/admin/vistoria/exemplos/page.tsx            ← Exemplos de PDF
app/api/admin/vistoria/{analyze,generate-pdf,examples,cep}/route.ts
lib/vistoria/api-guard.ts                       ← Autenticação, rate limit e validação de imagens das APIs
```

### Armazenamento
Laudos (com fotos) e configurações ficam em **IndexedDB** (`imobweb-vistoria`). Dados antigos do
`localStorage` são migrados automaticamente na primeira abertura. Use **Exportar/Importar** na tela
inicial para backup em JSON. O salvamento é automático (2,5 s após a última edição).

### Segurança das APIs
Todas as rotas exigem usuário autenticado (o middleware libera `/api`, então a checagem é feita na rota).
`analyze` tem limite de 20 chamadas/min por usuário; `generate-pdf` escapa todo texto e só aceita
imagens `data:image/*` ou `/vistoria-exemplos/*`.

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
- Versão: gemini-2.5-flash (padrão; fallback gemini-3.5-flash; override com GEMINI_MODEL)

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

## Novidades (v2)

- **Armazenamento em duas tabelas** (IndexedDB): `laudos` (registro leve + miniatura) e `photos` (bytes). A biblioteca abre rápido mesmo com centenas de fotos; as fotos só são lidas ao abrir/gerar um laudo. O autosave grava apenas fotos novas.
- **Tipo de vistoria**: Entrada, Saída ou Periódica (aparece na capa do laudo).
- **Conservação por cômodo**: checklist (Bom / Regular / Ruim / N.A.) para paredes, piso, elétrica, hidráulica etc. + observações do cômodo.
- **Assinatura digital** na tela (locadora, locatário, vistoriadora), incluída no PDF.
- **Vistoria de saída**: “Criar saída” na Biblioteca clona cômodos e inventário (sem fotos) e vincula à entrada.
- **Entrada x Saída**: compara fotos lado a lado, novas avarias, móveis não encontrados, piora no checklist; gera relatório para impressão/PDF.
- **PDF completo**: agora inclui móveis/equipamentos, avarias registradas, checklist, problemas e observações (antes só os itens da IA entravam).
- **Estatísticas**: avarias e móveis mais frequentes, completude média, vistorias de saída.
- **Testes**: `npm test` (vitest) cobre utilitários, comparação, resumo e a rota de PDF (escape/XSS, assinaturas, validação de imagens).

## IA como inteligência do módulo (v3)

A IA (Google Gemini) é usada em todo o fluxo; nada é simulado. Sem chave configurada, o módulo funciona normalmente e a IA aparece como "sem chave".

| Recurso | Onde | Rota |
|---|---|---|
| Análise de fotos: itens, móveis, avarias, checklist, marcações (%), dicas de fotos faltantes | Passo "Fotos" | `POST /api/admin/vistoria/analyze` (`GET` = status) |
| Considerações finais redigidas (com Desfazer) e ditado por voz | Passo "Revisão" | `POST /api/admin/vistoria/considerations` |
| Comparação entrada × saída por cômodo + resumo, incluída no relatório impresso | Biblioteca → Comparar | `POST /api/admin/vistoria/compare` |
| Auditoria de qualidade antes do PDF (regras determinísticas) | Passo "Revisão" | local (`_lib/audit.ts`) |

Configuração:
- `GEMINI_API_KEY` no servidor (preferencial) **ou** chave própria em Configurações (enviada no header `x-gemini-key`, guardada só no navegador).
- Modelo padrão `gemini-2.5-flash` com fallback `gemini-3.5-flash`; sobrescreva com `GEMINI_MODEL`. (`gemini-2.0-flash` foi descontinuado.)
- Todas as rotas exigem usuário autenticado e têm limite de requisições por usuário.
- Em Configurações: nome da empresa e e-mail de contestação (rodapé do laudo), marca d'água, e interruptores de análise automática, checklist automático e marcações automáticas.

Responsividade: viewport `dvh`, navegação do wizard fixa no rodapé em telas pequenas, alvos de toque ≥ 40 px, anotador de foto em tela cheia no celular, campos com 16 px no mobile (sem zoom no iOS).

## Assistente de fotos (câmera guiada)

`_components/CameraAssistant.tsx` + `_lib/photo-quality.ts` (análise local, sem enviar nada para fora):
- Câmera traseira em tela cheia, com lanterna (quando o aparelho permite), grade de enquadramento e troca de câmera.
- Avisos ao vivo: pouca luz, luz estourada, movimento ("segure firme") e inclinação (sensor do aparelho).
- Roteiro por cômodo (`getRoomPhotoTips`), com o item "Agora: …" avançando a cada foto.
- Revisão automática após cada disparo: foto com problema mostra o motivo e a dica, com "Refazer" ou "Usar assim mesmo".
- Fotos enviadas pela galeria também passam pela checagem e geram um aviso agrupado.
- Zoom (0,5x/1x/2x/3x quando o aparelho permite), foco por toque, lanterna com atalho no aviso de pouca luz, tela sempre acesa e pausa automática ao sair do app.
- Disparo automático opcional (ícone de cronômetro): fotografa sozinho após ~1,6 s firme e bem iluminado, com anel de progresso.
- Roteiro inteligente: junta as "fotos que faltam" apontadas pela IA, os problemas marcados no cômodo e as dicas do tipo de cômodo; cada foto fica vinculada ao item do roteiro.
- Contraluz detectado; parede lisa fotografada com o aparelho firme não é acusada de "tremida".
- Miniaturas abrem em tela cheia com opção de excluir; sair com fotos pede confirmação (usar, continuar ou descartar). Layout próprio para celular deitado.
- Preferências (grade, disparo automático) ficam salvas no aparelho.
- Requer HTTPS (ou localhost) e permissão de câmera; sem isso, a galeria continua funcionando.

## Inspeção inteligente (objetos e defeitos)

`POST /api/admin/vistoria/inspect` + `_lib/inspection.ts` + `_components/DetectionsReview.tsx`:
- A IA localiza, em cada foto, móveis e aparelhos (mesa, fogão, micro-ondas, cama…) e defeitos tipificados (risco, trinca, quebrado, descascado, mancha, umidade, mofo, ferrugem, amassado, desgaste, sujeira, peça faltando, folgado, queimado, vazamento), com gravidade, confiança e caixa na foto.
- Roda na câmera guiada (logo após cada disparo), nas fotos da galeria (automático, configurável) e no botão "Detectar defeitos".
- **Nada é gravado sem aceite.** O resultado vira *sugestões* (`RoomData.proposals`) mostradas numa tela de revisão: o usuário marca, edita o texto e escolhe se a avaria será marcada na foto. Confiança alta vem pré-marcada; média vem desmarcada como "Possível …". A análise geral do cômodo (`/analyze`) segue o mesmo fluxo.
- Sugestões pendentes aparecem como alerta na revisão de qualidade e não entram no PDF.

## App Android

O módulo roda como app Android (Capacitor) em `mobile/` — veja `mobile/README.md`. A ponte com o app fica em `_lib/native.ts` (salvar/compartilhar, imprimir PDF, WhatsApp); no navegador comum nada muda.
