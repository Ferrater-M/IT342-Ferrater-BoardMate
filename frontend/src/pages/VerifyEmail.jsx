import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('Verifying...')
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) return setStatus('Invalid link.')

    axios.get(`/api/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus('Email verified! Redirecting to login...')
        setTimeout(() => navigate('/login'), 2000)
      })
      .catch((err) => {
        console.error('Verification error:', err.response?.data || err.message)
        setStatus('Verification failed. Link may have expired.')
      })
  }, [])

  return <div style={{ textAlign: 'center', marginTop: '5rem' }}><h2>{status}</h2></div>
}