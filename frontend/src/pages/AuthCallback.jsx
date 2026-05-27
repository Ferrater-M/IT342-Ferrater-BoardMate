import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import axios from 'axios'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase exchanges the URL token and creates a session
      const { data: { session }, error } = await supabase.auth.getSession()

      if (session) {
        // Send the access token to your Spring Boot backend
        const res = await axios.post('http://localhost:8080/api/auth/verify', {
          token: session.access_token
        })

        // Store the token and redirect
        localStorage.setItem('token', res.data.token)
        navigate('/dashboard')
      }
    }

    handleCallback()
  }, [navigate])

  return <p>Verifying...</p>
}