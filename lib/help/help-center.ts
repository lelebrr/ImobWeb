import { OpenAI } from "openai";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  slug: string;
  content: string;
  tags: string[];
}

/**
 * Motor do Help Center Avançado.
 * Gerencia artigos, busca semântica e categorização.
 */
export class HelpCenterEngine {
  private static articles: Article[] = [
    {
      id: "1",
      title: "Primeiros Passos: Configurando sua Imobiliária",
      excerpt:
        "Aprenda como configurar o perfil da sua imobiliária e convidar sua equipe.",
      category: "Início",
      slug: "primeiros-passos",
      content:
        "Bem-vindo ao imobWeb! O primeiro passo é configurar sua organização...",
      tags: ["configuração", "equipe", "onboarding"],
    },
    {
      id: "2",
      title: "Dominando o WhatsApp Automático",
      excerpt:
        "Entenda como funcionam as conversas inteligentes com proprietários.",
      category: "WhatsApp",
      slug: "whatsapp-automatico",
      content:
        "O imobWeb utiliza IA para responder proprietários automaticamente...",
      tags: ["whatsapp", "ia", "automação"],
    },
    {
      id: "3",
      title: "Gestão de Imóveis e Publicação em Portais",
      excerpt:
        "Como cadastrar um imóvel uma única vez e publicar em todos os portais.",
      category: "Imóveis",
      slug: "gestao-imoveis",
      content:
        "Para cadastrar um imóvel, acesse o dashboard e clique em Novo Imóvel...",
      tags: ["imóveis", "portais", "venda"],
    },
  ];

  /**
   * Realiza busca inteligente (Semântica/Fuzzy).
   */
  static async search(query: string): Promise<Article[]> {
    if (!query) return [];

    // Por enquanto, usamos busca por palavras-chave (Mock de Busca Semântica)
    // Em produção, isso chamaria embeddings da OpenAI e faria busca vetorial no Supabase
    const lowerQuery = query.toLowerCase();
    return this.articles.filter(
      (article) =>
        article.title.toLowerCase().includes(lowerQuery) ||
        article.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        article.excerpt.toLowerCase().includes(lowerQuery),
    );
  }

  /**
   * Retorna artigos por categoria.
   */
  static getByCategory(category: string): Article[] {
    return this.articles.filter((a) => a.category === category);
  }

  /**
   * Obtém todas as categorias únicas.
   */
  static getCategories(): string[] {
    return Array.from(new Set(this.articles.map((a) => a.category)));
  }

  /**
   * Recupera um artigo pelo slug.
   */
  static getBySlug(slug: string): Article | undefined {
    return this.articles.find((a) => a.slug === slug);
  }
}
