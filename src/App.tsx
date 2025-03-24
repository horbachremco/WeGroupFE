import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserList } from './components/UserList'
import { UserDetail } from './components/UserDetail'

const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<UserList />} />
              <Route path="/users/:id" element={<UserDetail />} />
            </Routes>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
