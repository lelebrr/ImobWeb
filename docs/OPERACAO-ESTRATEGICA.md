# Guia de Operação Estratégica: O Ciclo da Inteligência

Este documento detalha como os três grandes pilares da **ImobWeb** (Insights, Fechamento e Repasse) trabalham em conjunto para criar uma imobiliária autônoma de alta performance.

---

## 1. O Motor de Inteligência (Insights)

Tudo começa com a detecção de oportunidades e riscos. O módulo `ActionableInsights` monitora o banco de dados em tempo real.

### Casos de Uso:
*   **Gestão de Estoque**: Se um imóvel (`Property`) não recebe visitas há 30 dias, a IA dispara um alerta no dashboard sugerindo uma revisão de preço baseada no `SuggestedPrice`.
*   **Gestão de Equipe**: Se o volume de novos contratos (`Contract`) de um corretor cai 20% em comparação à média do trimestre, o gestor recebe um insight de intervenção.

---

## 2. O Fechamento (Assinatura Digital)

Uma vez que o insight gerou uma visita e o lead decidiu fechar, entra o `SignatureWizard`.

### Fluxo de Validade Jurídica:
1.  **Geração**: O contrato é gerado em PDF (em desenvolvimento) e os signatários são cadastrados.
2.  **Verificação**: O signatário recebe o link, acessa pelo celular e realiza a **Biometria Facial**.
3.  **Auditoria**: Armazenamos o hash da biometria, IP, Timestamp e geolocalização no modelo `Signature`.
4.  **Confirmado**: O contrato muda o status para `ACTIVE` automaticamente.

---

## 3. O Repasse Autônomo (Split Inteligente)

Com o contrato ativo, as finanças são orquestradas pelo `ImobPay Split Engine`.

### Como funciona o Split:
1.  **Configuração**: Ao criar o contrato, define-se a `BillingRule` (ex: 10% Imobiliária / 90% Proprietário).
2.  **Cobrança**: O sistema gera a `Invoice` mensal.
3.  **Pagamento**: Quando o inquilino paga, o `SplitEngine` detecta a liquidação.
4.  **Distribuição**:
    *   **Imobiliária**: Recebe a comissão instantaneamente.
    *   **Proprietário**: O repasse é agendado (padrão D+1) para garantir segurança e liquidez.
5.  **Reconciliação**: O painel `AutomaticSplitDashboard` mostra 100% de transparência sobre para onde cada centavo foi distribuído.

---

## 🛠️ Manutenção e Extensibilidade

### Adicionando novas Regras de Split
Para adicionar novos tipos de repasse (ex: Taxa de Condomínio repassada a terceiros), basta estender o enum `RecipientType` no `schema.prisma` e atualizar a lógica de cálculo no `app/actions/finance.ts`.

### Segurança de Dados Biométricos
As fotos faciais e metadados de assinatura são armazenados em buckets seguros no **Supabase Storage**, com acesso restrito via tokens temporários.

---

> [!TIP]
> **Dica de Performance**: Para garantir que os insights sejam sempre precisos, certifique-se de que os corretores registrem todas as visitas no sistema, pois isso alimenta o algoritmo de "Estoque Estagnado".

> [!WARNING]
> **Privacidade**: Em conformidade com a LGPD, os dados biométricos são usados exclusivamente para a finalidade de assinatura de contrato e não são compartilhados com terceiros.
