'use client'

import { useAuth } from '../../hooks/userAuth';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { FiBook, FiMail, FiCalendar, FiUser, FiLogOut, FiHome, FiDollarSign, FiCoffee, FiBell, FiChevronRight } from 'react-icons/fi';

export default function StudentDashboard() {
  const { userRole, isLoading, username } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-indigo-600 font-medium">Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'ROLE_STUDENT') {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-50 to-white">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md border border-red-100">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso restrito</h1>
          <p className="text-gray-600 mb-6">Esta área é exclusiva para estudantes.</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-all shadow-md"
          >
            Voltar à página inicial
          </button>
        </div>
      </div>
    );
  }

  const features = [
    { 
      title: 'Turma', 
      icon: <FiBook className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      onClick: () => router.push('/student/class') 
    },
    { 
      title: 'Refeições', 
      icon: <FiCoffee className="w-6 h-6" />,
      color: 'from-emerald-500 to-emerald-600',
      onClick: () => router.push('/student/meals') 
    },
    { 
      title: 'Correio', 
      icon: <FiMail className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      onClick: () => router.push('/student/messages') 
    },
    { 
      title: 'Carteira', 
      icon: <FiDollarSign className="w-6 h-6" />,
      color: 'from-amber-500 to-amber-600',
      onClick: () => router.push('/student/wallet') 
    },
    { 
      title: 'Calendário', 
      icon: <FiCalendar className="w-6 h-6" />,
      color: 'from-rose-500 to-rose-600',
      onClick: () => router.push('/student/calendar') 
    },
    { 
      title: 'Perfil', 
      icon: <FiUser className="w-6 h-6" />,
      color: 'from-indigo-500 to-indigo-600',
      onClick: () => router.push('/student/profile') 
    },
  ];

  const activities = [
    {
      id: 1,
      title: 'Nova tarefa: Matemática',
      description: 'Exercícios sobre álgebra linear',
      time: '2 horas atrás',
      icon: <FiBook className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      title: 'Cardápio atualizado',
      description: 'Novas opções vegetarianas disponíveis',
      time: 'Ontem',
      icon: <FiCoffee className="w-4 h-4" />,
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      id: 3,
      title: 'Mensagem nova',
      description: 'Do professor de História',
      time: '5 horas atrás',
      icon: <FiMail className="w-4 h-4" />,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Head>
        <title>Painel do Estudante | Schola</title>
        <meta name="description" content="Painel de controle do estudante" />
      </Head>

      {/* Header aprimorado */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FiHome className="text-indigo-600 w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Schola</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 relative">
              <FiBell className="text-gray-600 w-5 h-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            
            <button 
              onClick={() => router.push('/logout')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:opacity-90 transition-all shadow-sm"
            >
              <FiLogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Seção de boas-vindas personalizada */}
        <div className="mb-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-1">Olá, {username || 'Estudante'}!</h2>
          <p className="opacity-90">O que vamos aprender hoje?</p>
          <div className="mt-4 flex items-center">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">2 novas notificações</span>
          </div>
        </div>
        
        {/* Grid de funcionalidades */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Seus atalhos</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                onClick={feature.onClick}
                className={`group bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 hover:border-transparent`}
              >
                <div className={`flex items-center justify-center w-12 h-12 mb-3 rounded-lg bg-gradient-to-r ${feature.color} text-white`}>
                  {feature.icon}
                </div>
                <h3 className="font-medium text-gray-800 group-hover:text-indigo-600">{feature.title}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Atividades recentes */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Atividades recentes</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push('/student/activities')}
              >
                <div className="flex items-start">
                  <div className={`p-2 mr-3 rounded-full ${activity.color}`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">{activity.title}</h4>
                    <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                  <FiChevronRight className="text-gray-400 w-5 h-5 ml-2 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 text-center border-t border-gray-100">
            <button 
              onClick={() => router.push('/student/activities')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Ver todas as atividades
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}