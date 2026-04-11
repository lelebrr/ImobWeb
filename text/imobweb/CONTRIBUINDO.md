# 👩‍💻 Guia de Contribuição: Vamos Construir Juntos?

Ficamos muito felizes que você quer ajudar a tornar a **imobWeb** o melhor CRM imobiliário do mundo! Para mantermos a qualidade "Enterprise 2026", temos algumas regrinhas básicas.

## 🤝 Código de Conduta
Seja legal. Respeite todos os colegas. Estamos aqui para aprender e construir algo gigante.

## 🚀 Como Contribuir

### 1. Ache algo para fazer
Dê uma olhada nas nossas [**Issues**](https://github.com/lelebrr/ImobWeb/issues). Se você tem uma ideia nova, abra uma **Feature Request** primeiro para discutirmos.

### 2. O Fluxo de Trabalho (Git)
1. Faça um **Fork** deste repositório.
2. Crie uma **Branch** com um nome descritivo:
   - `feat/nome-da-feature`
   - `fix/nome-do-bug`
   - `docs/melhoria-na-doc`
3. Faça seus commits seguindo o padrão **Conventional Commits**:
   - `feat: adiciona componente de staging virtual`
   - `fix: corrige bug no calculo de comissao`
4. Envie o seu **Pull Request (PR)**.

## 🛠️ Padrões de Código (The Master Way)

- **TypeScript**: É obrigatório. Use tipos fortes, evite `any`.
- **Server-First**: Priorize Server Components e Server Actions. Só use `use client` se houver interação direta (hooks, eventos).
- **Estilização**: Use Tailwind CSS. Evite CSS inline ou módulos CSS externos a menos que seja estritamente necessário.
- **Testes**: Se você criou uma funcionalidade nova, ela deve vir acompanhada de um teste (Vitest ou Playwright).

## 📝 Documentação
Mandou código novo? **Comente!** Use JSDoc para explicar o que suas funções fazem e por que elas existem. Atualize o `README.md` se a sua feature for digna de nota.

---

### 🎨 Design System
Use nossos componentes do `components/ui` (Shadcn). Queremos que o sistema tenha uma cara única e consistente.

---
*Dúvidas sobre o ambiente? Chame os core maintainers no Discord oficial.*
