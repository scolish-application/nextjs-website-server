'use client'

import { useAuth } from '../../hooks/userAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { FiClock, FiUser, FiSearch, FiPlus, FiEdit, FiTrash2, FiCreditCard, FiLink, FiChevronDown, FiChevronUp } from 'react-icons/fi';

type CarteColor = 'RED' | 'YELLOW' | 'GREEN';
type RegistrationDirection = 'ENTRY' | 'EXIT';
type RegistrationStatus = 'ACTIVE' | 'INACTIVE';

interface User {
  id: number;
  code: string;
  name: string;
}

interface Carte {
  id: number;
  code: string;
  color: CarteColor;
  user?: User;
}

interface Registration {
  id: number;
  direction: RegistrationDirection;
  status: RegistrationStatus;
  user?: User;
  details?: string;
  createdAt?: string;
}

export default function AccessManagement() {
    const { userRole, isLoading, username } = useAuth();
    const router = useRouter();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
    const [cartes, setCartes] = useState<Carte[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCarteModal, setShowCarteModal] = useState(false);
    const [showUserAssociationModal, setShowUserAssociationModal] = useState(false);
    const [selectedCarte, setSelectedCarte] = useState<Carte | null>(null);
    const [newRegistration, setNewRegistration] = useState<Omit<Registration, 'id'>>({
      direction: 'ENTRY',
      status: 'ACTIVE',
      details: ''
    });
    const [newCarte, setNewCarte] = useState<Omit<Carte, 'id'>>({
      code: '',
      color: 'GREEN'
    });
    const [associationData, setAssociationData] = useState({
      registrationId: '',
      carteCode: ''
    });

    useEffect(() => {
      if (!isLoading && userRole !== 'ROLE_ADMIN') {
        router.push('/');
        return;
      }

      if (userRole === 'ROLE_ADMIN') {
        fetchRegistrations();
        fetchCartes();
        fetchUsers();
      }
    }, [userRole, router, isLoading]);

    const fetchRegistrations = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/registrations');
        if (!response.ok) throw new Error('Failed to fetch registrations');
        const data: Registration[] = await response.json();
        setRegistrations(data);
        setFilteredRegistrations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    const fetchCartes = async () => {
      try {
        const response = await fetch('/api/registrations/carte');
        if (!response.ok) throw new Error('Failed to fetch cartes');
        const data: Carte[] = await response.json();
        setCartes(data);
      } catch (err) {
        console.error('Error fetching cartes:', err);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data: User[] = await response.json();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    const createRegistration = async () => {
      try {
        const response = await fetch('/api/registrations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newRegistration),
        });

        if (!response.ok) throw new Error('Failed to create registration');
        
        const createdReg: Registration = await response.json();
        setRegistrations((prev) => [...prev, createdReg]);
        setNewRegistration({ 
          direction: 'ENTRY',
          status: 'ACTIVE',
          details: '' 
        });
        setShowAddModal(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    const updateRegistration = async (id: number, updatedData: Partial<Registration>) => {
      try {
        const response = await fetch(`/api/registrations/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        });

        if (!response.ok) throw new Error('Failed to update registration');
        
        const updatedReg: Registration = await response.json();
        setRegistrations((prev) =>
          prev.map((reg) => (reg.id === id ? updatedReg : reg))
        );
        setExpandedId(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    const deleteRegistration = async (id: number) => {
      if (!confirm('Tem certeza que deseja excluir este registro?')) return;
      
      try {
        const response = await fetch(`/api/registrations/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete registration');
        
        setRegistrations((prev) => prev.filter((reg) => reg.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    const createCarte = async () => {
      try {
        const response = await fetch('/api/registrations/carte', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // set code first
            code: newCarte.code,
            color: newCarte.color,
            userId: 1
          }),
        });

        if (!response.ok) throw new Error('Failed to create carte');
        
        const createdCarte: Carte = await response.json();
        setCartes((prev) => [...prev, createdCarte]);
        setNewCarte({ code: '', color: 'GREEN' });
        setShowCarteModal(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    const associateCarte = async () => {
      try {
        const response = await fetch(
          `/api/registrations/${associationData.registrationId}/carte/${associationData.carteCode}`, 
          { method: 'PUT' }
        );

        if (!response.ok) throw new Error('Failed to associate carte');
        
        const updatedReg: Registration = await response.json();
        setRegistrations((prev) =>
          prev.map((reg) => (reg.id === updatedReg.id ? updatedReg : reg))
        );
        setAssociationData({ registrationId: '', carteCode: '' });
        alert('Associação realizada com sucesso!');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    const associateUserToCarte = async (carteId: number, userId: number) => {
      try {
        const response = await fetch(`/api/cartes/${carteId}/user/${userId}`, {
          method: 'PUT'
        });
        
        if (!response.ok) throw new Error('Failed to associate user to carte');
        
        const updatedCarte: Carte = await response.json();
        setCartes(prev => prev.map(c => c.id === updatedCarte.id ? updatedCarte : c));
        setShowUserAssociationModal(false);
        alert('Usuário associado com sucesso!');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    const toggleExpansion = (id: number) => {
      setExpandedId(expandedId === id ? null : id);
    };

    const openUserAssociationModal = (carte: Carte) => {
      setSelectedCarte(carte);
      setShowUserAssociationModal(true);
    };

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-white">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-indigo-600 font-medium">Carregando...</p>
          </div>
        </div>
      );
    }

    if (userRole !== 'ROLE_ADMIN') {
      return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-50 to-white">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md border border-red-100">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso não autorizado</h1>
            <p className="text-gray-600 mb-6">Você não tem permissões para aceder a esta página.</p>
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
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Head>
          <title>Gestão de Acessos | Schola</title>
        </Head>

        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FiClock className="text-indigo-600 w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Schola - Gestão de Acessos</h1>
            </div>
            <button 
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
            >
              Voltar ao Painel
            </button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="mb-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Registros de Acesso</h2>
            <p className="opacity-90">Gerencie registros de acesso e cartões associados</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <div className="relative w-full">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar registros..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="ml-4 flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-all"
                >
                  <FiPlus className="mr-2" />
                  Novo Registro
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-medium text-gray-800">Cartões de Acesso</h3>
                <button
                  onClick={() => setShowCarteModal(true)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-all"
                >
                  <FiPlus className="mr-2" />
                  Novo Cartão
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direção</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cartão Associado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRegistrations.length > 0 ? (
                        filteredRegistrations.map((reg) => (
                          <>
                            <tr key={reg.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {reg.direction === 'ENTRY' ? 'Entrada' : 'Saída'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  reg.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {reg.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {reg.user ? (
                                  <span className="flex items-center">
                                    <FiCreditCard className="mr-1" /> {reg.user.code}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">Nenhum</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => toggleExpansion(reg.id)}
                                    className="p-1 text-indigo-600 hover:text-indigo-900"
                                  >
                                    {expandedId === reg.id ? <FiChevronUp /> : <FiChevronDown />}
                                  </button>
                                  <button
                                    onClick={() => deleteRegistration(reg.id)}
                                    className="p-1 text-red-600 hover:text-red-900"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {expandedId === reg.id && (
                              <tr className="bg-gray-50">
                                <td colSpan={5} className="px-6 py-4">
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Direção</label>
                                      <select
                                        value={reg.direction}
                                        onChange={(e) =>
                                          setRegistrations(prev =>
                                            prev.map(r =>
                                              r.id === reg.id ? { ...r, direction: e.target.value as RegistrationDirection } : r
                                            )
                                          )}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                      >
                                        <option value="ENTRY">Entrada</option>
                                        <option value="EXIT">Saída</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                      <select
                                        value={reg.status}
                                        onChange={(e) =>
                                          setRegistrations(prev =>
                                            prev.map(r =>
                                              r.id === reg.id ? { ...r, status: e.target.value as RegistrationStatus } : r
                                            )
                                          )}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                      >
                                        <option value="ACTIVE">Ativo</option>
                                        <option value="INACTIVE">Inativo</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes</label>
                                      <input
                                        type="text"
                                        value={reg.details || ''}
                                        onChange={(e) =>
                                          setRegistrations(prev =>
                                            prev.map(r =>
                                              r.id === reg.id ? { ...r, details: e.target.value } : r
                                            )
                                          )
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                      />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <button
                                        onClick={() => setExpandedId(null)}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        onClick={() => updateRegistration(reg.id, {
                                          direction: reg.direction,
                                          status: reg.status,
                                          details: reg.details
                                        })}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                      >
                                        Guardar Alterações
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                            Nenhum registro encontrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário Associado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cartes.length > 0 ? (
                        cartes.map((carte) => (
                          <tr key={carte.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{carte.code}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                carte.color === 'GREEN' ? 'bg-green-100 text-green-800' : 
                                carte.color === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {carte.color === 'GREEN' ? 'Verde' : carte.color === 'YELLOW' ? 'Amarelo' : 'Vermelho'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {carte.user ? (
                                <span className="flex items-center">
                                  <FiUser className="mr-1" /> {carte.user.name} ({carte.user.code})
                                </span>
                              ) : (
                                <span className="text-gray-400">Nenhum</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => openUserAssociationModal(carte)}
                                className="p-1 text-indigo-600 hover:text-indigo-900"
                              >
                                <FiLink />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                            Nenhum cartão encontrado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-medium text-gray-800">Associar Cartão a Registro</h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID do Registro</label>
                      <input
                        type="text"
                        value={associationData.registrationId}
                        onChange={(e) => setAssociationData({...associationData, registrationId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código do Cartão</label>
                      <select
                        value={associationData.carteCode}
                        onChange={(e) => setAssociationData({...associationData, carteCode: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Selecione um cartão</option>
                        {cartes.map(carte => (
                          <option key={carte.code} value={carte.code}>{carte.code} ({carte.color})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={associateCarte}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all"
                  >
                    <FiLink className="mr-2" />
                    Associar Cartão
                  </button>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Modal para adicionar novo registro */}
        {showAddModal && (
          <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Novo Registro de Acesso</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Direção</label>
                  <select
                    value={newRegistration.direction}
                    onChange={(e) => setNewRegistration({...newRegistration, direction: e.target.value as RegistrationDirection})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="ENTRY">Entrada</option>
                    <option value="EXIT">Saída</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newRegistration.status}
                    onChange={(e) => setNewRegistration({...newRegistration, status: e.target.value as RegistrationStatus})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="ACTIVE">Ativo</option>
                    <option value="INACTIVE">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detalhes</label>
                  <textarea
                    value={newRegistration.details || ''}
                    onChange={(e) => setNewRegistration({...newRegistration, details: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={createRegistration}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Criar Registro
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para adicionar novo cartão */}
        {showCarteModal && (
          <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Novo Cartão de Acesso</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código do Cartão</label>
                  <input
                    type="text"
                    value={newCarte.code}
                    onChange={(e) => setNewCarte({...newCarte, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                  <select
                    value={newCarte.color}
                    onChange={(e) => setNewCarte({...newCarte, color: e.target.value as CarteColor})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="GREEN">Verde</option>
                    <option value="YELLOW">Amarelo</option>
                    <option value="RED">Vermelho</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCarteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={createCarte}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Criar Cartão
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para associar usuário ao cartão */}
        {showUserAssociationModal && selectedCarte && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Associar Usuário ao Cartão {selectedCarte.code}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Usuário</label>
                  <select
                    value={selectedCarte.user?.id || ''}
                    onChange={(e) => setSelectedCarte({
                      ...selectedCarte,
                      user: e.target.value ? users.find(u => u.id === Number(e.target.value)) : undefined
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Nenhum usuário</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name} ({user.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowUserAssociationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => selectedCarte.user && associateUserToCarte(selectedCarte.id, selectedCarte.user.id)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Associar Usuário
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}