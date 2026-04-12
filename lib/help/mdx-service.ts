import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";

/**
 * SERVIÇO DE MDX - imobWeb
 * 2026 - Documentação Dinâmica e Artigos de Ajuda
 */

const postsDirectory = path.join(process.cwd(), "text/imobweb/docs/help");

export interface HelpArticle {
  slug: string;
  title: string;
  category: string;
  content: any;
}

/**
 * Recupera um artigo pelo slug e processa o MDX.
 */
export async function getArticleBySlug(slug: string): Promise<HelpArticle | null> {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");

  const { content, frontmatter } = await compileMDX<{ title: string; category: string }>({
    source: fileContents,
    options: { parseFrontmatter: true },
  });

  return {
    slug,
    title: frontmatter.title,
    category: frontmatter.category,
    content,
  };
}

/**
 * Lista todos os slugs de artigos disponíveis.
 */
export function getAllArticleSlugs() {
  if (!fs.existsSync(postsDirectory)) return [];
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => fileName.replace(/\.mdx$/, ""));
}
