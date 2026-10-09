# App Android — Vistoria imobWeb

App nativo (Capacitor) que abre o sistema publicado direto em **/admin/vistoria**. O resto do CRM continua acessível dentro do app. Tudo que existe no site (câmera assistida, IA, laudos offline, comparativo) funciona igual, e o app acrescenta:

- **Câmera nativa** com permissão do Android (assistente de foto, lanterna, zoom, foco).
- **Salvar / compartilhar arquivos** (backup `.json`, laudo `.html`) pela folha de compartilhamento do Android.
- **Imprimir / salvar o laudo em PDF** pela tela de impressão do Android ("Salvar como PDF").
- **WhatsApp** abre o app de verdade.
- **Botão voltar** fecha a tela atual da vistoria em vez de sair do app.
- **Tela de abertura**, ícone adaptativo e **tela "sem conexão"** com botão de tentar de novo.
- Aviso "sem internet" dentro da vistoria (as vistorias ficam salvas no aparelho; IA e geração de PDF pelo servidor precisam de conexão).

> A pasta `android/` na raiz do repositório é um projeto nativo antigo e **não** é usada por este app.

## 1. Defina o endereço do site

O app só abre o site publicado. Use o domínio de produção (sem `/` no final):

```bat
set CAP_SERVER_URL=https://seu-dominio.com.br
```

Se não definir, usa `https://imobweb2.vercel.app` (nome do projeto na Vercel — confirme se é o seu).
No GitHub Actions, crie a variável `SERVER_URL` (Settings → Secrets and variables → Actions → Variables) ou informe ao rodar o workflow.

## 2. Gerar o APK

### Opção A — sem instalar nada (GitHub Actions)
1. Envie o repositório ao GitHub.
2. Aba **Actions → Android (Vistoria) → Run workflow** (informe o endereço do site se quiser).
3. Baixe o artefato **vistoria-debug-apk**, copie o `.apk` para o celular e instale (permita "instalar apps desconhecidos").

### Opção B — no seu PC (Windows)
Requisitos: Node 20+, **Android Studio** (traz o JDK 21 e o SDK) .

```bat
cd mobile
npm install
set CAP_SERVER_URL=https://seu-dominio.com.br
npm run apk:debug
```
O APK sai em `mobile\android\app\build\outputs\apk\debug\`. Para abrir no Android Studio: `npm run sync` e depois `npm run open`.

## 3. Versão para a Play Store (assinada)

1. Crie a chave **uma vez** e guarde-a em local seguro (se perder, não consegue mais atualizar o app):
   ```bat
   keytool -genkeypair -v -keystore vistoria-release.jks -alias vistoria -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Crie `mobile\android\keystore.properties` (já está no `.gitignore`):
   ```properties
   storeFile=C:/caminho/vistoria-release.jks
   storePassword=...
   keyAlias=vistoria
   keyPassword=...
   ```
3. `npm run apk:release` (APK) ou `npm run aab:release` (pacote `.aab` para a Play Store).
   Para novas versões aumente `appVersionCode` / `appVersionName` em `android/gradle.properties`.

No GitHub Actions, cadastre os segredos `ANDROID_KEYSTORE_BASE64` (o `.jks` em base64), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` e `ANDROID_KEY_PASSWORD`: o workflow passa a gerar APK e AAB assinados.

## Como funciona
- `capacitor.config.ts` aponta `server.url` para `CAP_SERVER_URL + /admin/vistoria`; `www/` guarda só a tela de "sem conexão".
- O site detecta o app (`window.Capacitor`) em `app/admin/vistoria/_lib/native.ts` e troca download/impressão/compartilhamento pelos recursos nativos. No navegador comum nada muda.
- Plugin próprio: `android/app/src/main/java/com/imobweb/vistoria/HtmlPrintPlugin.java`.
- O site precisa permitir câmera (`Permissions-Policy: camera=(self)` em `next.config.mjs`) — já ajustado.

## Limitações conhecidas
- É preciso internet para **abrir** o app e para IA/PDF pelo servidor; vistorias em andamento ficam no aparelho (IndexedDB).
- Login por provedores externos (ex.: "Entrar com Google") abre fora do app e pode não voltar; use e-mail e senha.
- O app mostra o site publicado: atualizar o site atualiza o app, sem novo APK. Só é preciso gerar outro APK se mudar algo nesta pasta.
