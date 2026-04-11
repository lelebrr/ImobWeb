import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { publicApiRouter } from "@/lib/api-public/router";
import { authenticatePublicRequest } from "@/lib/api-public/auth";
import { NextRequest } from "next/server";

/**
 * Endpoint Handler para a API Pública v1
 * Suporta tRPC e chamadas REST (via trpc-openapi futuramente)
 */

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/v1",
    req,
    router: publicApiRouter,
    createContext: async ({ req }) => {
      // Extrai API Key do header
      const apiKey = req.headers.get("x-api-key");
      
      try {
        return await authenticatePublicRequest(apiKey);
      } catch (error) {
        // Se falhar a autenticação, retorna contexto não autenticado pro tRPC lidar via middleware
        return {
          organizationId: "",
          scopes: [],
          authenticated: false,
        };
      }
    },
    onError: ({ path, error }) => {
      console.error(`❌ tRPC Error on '${path}': ${error.message}`);
    },
  });

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
