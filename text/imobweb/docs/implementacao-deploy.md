# 🚀 Guia de Deployment: Colocando a imobWeb no Ar

A **imobWeb** foi arquitetada para rodar com performance máxima no ecossistema **Vercel**. Siga este guia para garantir um deploy seguro e escalável.

## ☁️ 1. Infraestrutura Recomendada
- **Hospedagem**: Vercel (Plano Pro recomendado para Multi-tenant).
- **Banco de Dados**: PostgreSQL (Supabase ou Neon).
- **Cache/Redis**: Upstash (Crucial para performance das Server Actions).
- **Mídia**: Cloudinary ou AWS S3.
- **Emails**: Resend.

## 🔑 2. Variáveis de Ambiente Obrigatórias
No seu painel da Vercel, configure as seguintes chaves:

### Autenticação & Base
- `DATABASE_URL`: String de conexão do Postgres.
- `NEXTAUTH_URL`: O URL oficial do seu site.
- `NEXTAUTH_SECRET`: Uma chave aleatória gerada via `openssl rand -base64 32`.

### Engine de IA
- `OPENAI_API_KEY`: Para os recursos de imobEngine.

### Integrações
- `WHATSAPP_TOKEN`: Access Token da Meta Cloud API.
- `STRIPE_SECRET_KEY`: Para processamento de pagamentos.
- `UPSTASH_REDIS_URL` & `TOKEN`: Para cache e rate limiting.

## 🛠️ 3. Passos para o Deploy

### Passo 1: Preparar o Banco
Certifique-se de que o seu banco de dados está acessível e rode as migrations:
```bash
npx prisma migrate deploy
```

### Passo 2: Conectar ao Vercel
1. Crie um novo projeto no dashboard da Vercel.
2. Aponte para o repositório da imobWeb.
3. Insira todas as variáveis de ambiente.
4. Clique em **Deploy**.

### Passo 3: Configurar Webhooks
Para que o WhatsApp funcione, você deve configurar o URL de Webhook no Painel do Desenvolvedor da Meta:
- **URL**: `https://seu-dominio.com/api/webhooks/whatsapp`
- **Verify Token**: O valor que você definiu em `WHATSAPP_VERIFY_TOKEN`.

---

## 📈 4. Monitoramento e Saúde
- **Sentry**: Já configurado. Certifique-se de adicionar `SENTRY_AUTH_TOKEN` nas variáveis de ambiente para o upload de Source Maps automática durante o build.
- **Vercel Analytics**: Ative no painel da Vercel para monitorar os Core Web Vitals.

---
*Dificuldades no deploy? Verifique os logs de build na Vercel ou consulte a seção 'Troubleshooting' no nosso fórum de desenvolvedores.*
