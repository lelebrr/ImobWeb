"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import { HelpCenterEngine, Article } from "@/lib/help/help-center";

interface HelpCenterProps {
  agencyId?: string; // For context-aware help
}

export default function HelpCenter({ agencyId }: HelpCenterProps = {}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchFocus, setSearchFocus] = useState(false);
  const router = useRouter();

  // Simple toast state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Toast functions
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Categories for filtering
  const categories = [
    "Primeiros Passos",
    "Cadastro de Imóveis",
    "WhatsApp e Leads",
    "Publicação em Portais",
    "Financeiro e Comissões",
    "Franquias e Parceiros",
    "White Label",
  ];

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Helper function to get all articles
  const getAllArticles = useCallback(async (): Promise<Article[]> => {
    try {
      const allCategories = HelpCenterEngine.getCategories();
      let allArticles: Article[] = [];

      for (const category of allCategories) {
        const categoryArticles = HelpCenterEngine.getByCategory(category);
        allArticles = [...allArticles, ...categoryArticles];
      }

      return allArticles;
    } catch (error) {
      console.error("Error getting all articles:", error);
      return [];
    }
  }, []);

  // Helper function to get articles by category
  const getArticlesByCategory = useCallback(
    async (category: string): Promise<Article[]> => {
      try {
        return HelpCenterEngine.getByCategory(category);
      } catch (error) {
        console.error(
          `Error getting articles for category ${category}:`,
          error,
        );
        return [];
      }
    },
    [],
  );

  // Search articles when query or category changes
  const performSearch = useCallback(
    async (searchQuery: string, categoryFilter?: string | null) => {
      if (!searchQuery.trim() && !categoryFilter) {
        // Show featured articles when no search
        const featured = await getAllArticles();
        setResults(featured.slice(0, 6)); // Show first 6 as featured
        return;
      }

      setLoading(true);
      try {
        let searchResults: Article[] = [];

        if (searchQuery.trim()) {
          // Use semantic search if we have a query
          searchResults = await HelpCenterEngine.search(searchQuery);
        } else if (categoryFilter) {
          // Get articles by category if no query but category selected
          searchResults = await getArticlesByCategory(categoryFilter);
        } else {
          // Get all articles if neither query nor category
          searchResults = await getAllArticles();
        }

        // Filter by category if specified
        if (categoryFilter) {
          searchResults = searchResults.filter(
            (article) =>
              article.category.toLowerCase() === categoryFilter.toLowerCase(),
          );
        }

        setResults(searchResults);
      } catch (error) {
        console.error("Error searching articles:", error);
        showToast("Não foi possível realizar a busca no momento.", "error");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [getAllArticles, getArticlesByCategory, showToast],
  );

  // Load initial articles (popular/getting started) on mount
  useEffect(() => {
    performSearch("", "Primeiros Passos");
  }, [performSearch]);

  // Watch for changes in query or category
  useEffect(() => {
    if (searchFocus) {
      // Only search when actively typing or category changed
      performSearch(query, selectedCategory);
    }
  }, [query, selectedCategory, performSearch, searchFocus]);

  // Handle search input changes
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSearchFocus(true);

    // Reset to showing all results when clearing search
    if (!value.trim() && !selectedCategory) {
      performSearch("", null);
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setSearchFocus(true);
    if (category) {
      setQuery(""); // Clear query when selecting category
    }
  };

  // Handle article selection
  const handleArticleSelect = (article: Article) => {
    setSelectedArticle(article);
    // Update URL for sharing/bookmarking
    router.push(`/help/${article.slug}`);
  };

  // Handle closing article view
  const handleCloseArticle = () => {
    setSelectedArticle(null);
    router.push("/help");
  };

  // Handle submitting search (Enter key)
  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFocus(true);
  };

  // If viewing a specific article, show article content
  if (selectedArticle) {
    return (
      <div className="flex h-full w-full flex-col bg-background">
        {/* Header */}
        <div className="flex h-16 w-full items-center justify-between px-6 bg-card border-b">
          <button
            onClick={handleCloseArticle}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ChevronDown className="h-3 w-3" />
            Voltar para o Help Center
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h8m-4 4v8m4-8v8"
              />
            </svg>
            {selectedArticle.category}
          </div>
        </div>

        {/* Toast Message */}
        {toastMessage && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center p-4 w-64 rounded-lg border 
            ${
              toastMessage.type === "error"
                ? "border-red-500 bg-red-50 text-red-700"
                : "border-primary bg-primary/50 text-primary-foreground"
            }`}
          >
            <div className="flex-shrink-0 flex h-5 w-5 items-center justify-center">
              {toastMessage.type === "error" ? (
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M7 7l10 10"
                  />
                </svg>
              ) : (
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 5.04"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className="font-semibold">
                {toastMessage.type === "error" ? "Erro" : "Sucesso"}
              </h3>
              <p className="text-sm">{toastMessage.text}</p>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose lg:prose-xl dark:prose-invert">
            <h1 className="mb-4 text-2xl font-bold">{selectedArticle.title}</h1>
            <p className="mb-6 text-muted-foreground">
              {selectedArticle.excerpt}
            </p>

            {/* Here we would render the MDX content */}
            {/* In a real implementation, we'd use next-mdx-remote or similar */}
            <div className="space-y-6">
              <p>{selectedArticle.content}</p>

              {/* Example of interactive step */}
              <div className="bg-muted p-4 rounded-lg border border-muted/50">
                <h3 className="font-semibold mb-2">
                  Exemplo de Passo Interativo
                </h3>
                <p className="mb-3">
                  Este seria um passo que o usuário precisa completar para
                  avançar no tutorial.
                </p>
                <button className="btn-primary">
                  Simular conclusão do passo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with related articles */}
        <div className="flex h-16 w-full items-center justify-between px-6 bg-card border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17l-2-2m0 0l2-2m-2 2h12a2 2 0 002-2V5a2 2 0 002-2H5a2 2 0 002-2v10a2 2 0 002 2z"
              />
            </svg>
            Artigos relacionados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Implement print functionality
                window.print();
              }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
            >
              Imprimir
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 9l6-6 6 6M6 18l6-6 6 6"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* Search Header */}
      <div className="flex h-16 w-full items-center justify-between px-6 bg-card border-b">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Help Center</h1>
          <p className="text-muted-foreground mt-1">
            Encontre respostas para suas perguntas sobre o imobWeb
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Implement create ticket functionality
              showToast(
                "Funcionalidade de abertura de chamados em breve.",
                "success",
              );
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
          >
            Falar com suporte
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 15H5a2 2 0 012-2V6a2 2 0 012-2h14a2 2 0 012 2v5a2 2 0 012-2h-5"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex h-12 w-full items-center px-6 bg-muted">
        {/* Search Input */}
        <div className="flex-1 min-w-0 relative">
          <form onSubmit={handleSubmitSearch} className="flex w-full">
            <div className="relative flex-1">
              <svg
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${searchFocus ? "text-primary" : "text-muted-foreground"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M15 10a5 5 0 11-10 0"
                />
              </svg>
              <input
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="O que você procura hoje?"
                className={`block w-full pl-10 pr-4 py-2 bg-background border border-muted-foreground/50 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
                  text-sm ${searchFocus ? "" : "text-muted-foreground"} placeholder:text-muted-foreground/50`}
              />
              {query.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSearchFocus(true);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-primary"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            {!query.trim() && !selectedCategory && (
              <button
                type="submit"
                className="ml-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                disabled={!searchFocus}
              >
                <Search className="h-3 w-3" />
              </button>
            )}
          </form>
        </div>

        {/* Category Filter */}
        <div className="ml-4 flex items-center hidden md:flex">
          <div className="relative">
            <button
              onClick={() => {
                // Toggle category dropdown
                // In a real implementation, this would open a dropdown
              }}
              className="flex items-center gap-2 px-3 py-2 bg-muted/50 text-sm text-muted-foreground hover:bg-muted hover:text-primary rounded-lg"
            >
              {selectedCategory ? (
                <>
                  {selectedCategory}
                  <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Todas as categorias
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>

            {/* Dropdown menu (simplified) */}
            {/* In a real implementation, this would be a proper dropdown component */}
            <div className="absolute left-0 mt-2 w-56 bg-card border border-muted/50 rounded-lg shadow-lg z-20">
              {categories.map((category) => (
                <div
                  key={category}
                  className={`flex w-full items-center px-4 py-2 text-sm 
                    ${
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted hover:text-primary"
                    }`}
                  onClick={() =>
                    handleCategorySelect(
                      selectedCategory === category ? null : category,
                    )
                  }
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-hidden">
        {loading && !selectedArticle && (
          <div className="flex h-full w-full items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {!loading && !selectedArticle && (
          <div className="p-6">
            {results.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {results.length} resultado{results.length !== 1 ? "s" : ""}{" "}
                  para "{query || selectedCategory || "artigos em destaque"}"
                </p>

                <div className="space-y-4">
                  {results.map((article) => (
                    <div
                      key={article.slug}
                      className="flex items-start gap-4 p-4 bg-card border border-muted/50 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleArticleSelect(article)}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <Search className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{article.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {article.excerpt}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{article.category}</span>
                          {/* In a real implementation, we might show relevance score or last updated */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show more results button if there are many results */}
                {results.length > 8 && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        // Implement load more functionality
                        showToast(
                          "Funcionalidade de carregar mais resultados em breve.",
                          "success",
                        );
                      }}
                      className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
                    >
                      Carregar mais resultados
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v0m0 0v0m0 13v0M5 12h14"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/20 text-muted-foreground mb-4">
                  <Search className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold mb-3">
                  Nenhum resultado encontrado
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Tente uma busca diferente ou explore as categorias abaixo para
                  encontrar o que você precisa.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 justify-center">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`px-4 py-2 bg-muted hover:bg-muted/80 text-sm 
                        ${selectedCategory === category ? "bg-primary text-primary-foreground" : ""}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
