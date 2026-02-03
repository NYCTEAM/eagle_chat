import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Chat from './pages/Chat'
import './App.css'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-gray-50">
        <Toaster position="top-center" />
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/chat" />} 
          />
          <Route 
            path="/chat" 
            element={isAuthenticated ? <Chat /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/chat" : "/login"} />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
