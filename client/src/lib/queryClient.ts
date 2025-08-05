import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { clientAPI } from "./clientApi";
import type { InsertTransaction, InsertMarketSession } from "@shared/schema";

// Client-side query function that uses LocalStorage instead of server
export const getQueryFn: (options: {
  on401: "returnNull" | "throw";
}) => QueryFunction<any> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const [endpoint, ...params] = queryKey as [string, ...any[]];
    
    try {
      switch (endpoint) {
        case '/api/me':
          const user = await clientAPI.getCurrentUser();
          if (!user && unauthorizedBehavior === "returnNull") {
            return null;
          }
          if (!user && unauthorizedBehavior === "throw") {
            throw new Error("Chưa đăng nhập");
          }
          return user;
          
        case '/api/student/dashboard':
          return clientAPI.getStudentDashboard();
          
        case '/api/admin/students':
          return clientAPI.getStudents();
          
        case '/api/admin/transactions':
          // Admin transactions endpoint not implemented yet
          return [];
          
        case '/api/market-sessions':
          return clientAPI.getMarketSessions();
          
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized' && unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw error;
    }
  };

// Client-side API request function that uses LocalStorage
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  try {
    switch (url) {
      case '/api/login':
        if (method === 'POST') {
          return clientAPI.login(data as any);
        }
        break;
        
      case '/api/logout':
        if (method === 'POST') {
          return clientAPI.logout();
        }
        break;
        
      case '/api/register':
        if (method === 'POST') {
          return clientAPI.register(data as any);
        }
        break;
        
      case '/api/admin/transactions':
        if (method === 'POST') {
          return clientAPI.createTransaction(data as InsertTransaction);
        }
        break;
        
      case '/api/admin/market-sessions':
        if (method === 'POST') {
          return clientAPI.createMarketSession(data as InsertMarketSession);
        }
        break;
        
      default:
        // Handle dynamic URLs like /api/admin/market-sessions/:id
        if (url.startsWith('/api/admin/market-sessions/') && method === 'PATCH') {
          const id = parseInt(url.split('/').pop() || '0');
          return clientAPI.updateMarketSession(id, data as Partial<InsertMarketSession>);
        }
        if (url.startsWith('/api/admin/market-sessions/') && method === 'DELETE') {
          const id = parseInt(url.split('/').pop() || '0');
          return clientAPI.deleteMarketSession(id);
        }
        throw new Error(`Unknown API endpoint: ${method} ${url}`);
    }
  } catch (error) {
    throw error;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
