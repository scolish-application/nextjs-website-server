'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './hooks/userAuth'

export default function HomeRedirect() {
  const router = useRouter()
  const { isAuthenticated, userRole, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Se não autenticado, redireciona para auth
        router.push('/auth')
      } else {
        // Redireciona conforme a role
        switch (userRole) {
          case 'ROLE_ADMIN':
            router.push('/admin/dashboard')
            break
          case 'ROLE_STUDENT':
            router.push('/student/dashboard')
            break
          case 'ROLE_TEACHER':
            router.push('/teacher/dashboard')
            break
          default:
            // Caso a role não seja reconhecida, redireciona para auth
            router.push('/auth')
        }
      }
    }
  }, [isAuthenticated, userRole, isLoading, router])
}