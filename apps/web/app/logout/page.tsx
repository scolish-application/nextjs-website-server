'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { destroyCookie } from 'nookies'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    async function logout() {
      try {
        // 1. Chamar API do servidor para logout
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })

        // 2. Limpar cookies/tokens do lado do cliente
        destroyCookie(null, 'authToken')
        localStorage.removeItem('userData')

        // 3. Redirecionar após logout
        router.push('/auth')
      } catch (error) {
        console.error('Erro durante logout:', error)
        router.push('/auth')
      }
    }

    logout()
  }, [router])

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-center">
        <p className="text-lg">Fazendo logout...</p>
      </div>
    </div>
  )
}