import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { AuthProvider } from '@/lib/AuthContext';
import LiveStreamLabApp from '@/LiveStreamLabApp';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <LiveStreamLabApp />
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App