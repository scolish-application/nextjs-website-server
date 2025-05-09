'use client'

import { useAuth } from '../../hooks/userAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { FiUsers, FiEdit, FiTrash2, FiPlus, FiLock, FiUnlock, FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function UserManagement() {
  const { userRole, isLoading, username } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    authorities: []
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const availableRoles = [
    { value: 'ROLE_ADMIN', label: 'Administrador' },
    { value: 'ROLE_TEACHER', label: 'Professor' },
    { value: 'ROLE_STUDENT', label: 'Estudante' }
  ];

  useEffect(() => {
    checkAdminStatus();
    fetchUsers();
  }, [userRole]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch(`/api/authentication/hasAuthority/admin/${username}`);
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleRoleChange = (userId, role, isChecked) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? {
              ...user,
              authorities: isChecked
                ? [...user.authorities, role]
                : user.authorities.filter(r => r !== role)
            }
          : user
      )
    );
  };

  const saveUserChanges = async (userId) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;

      const response = await fetch(`/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userToUpdate.username,
          authorities: userToUpdate.authorities
        }),
      });

      if (!response.ok) throw new Error('Failed to update user');
      
      const updatedUser = await response.json();
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === userId ? updatedUser : u))
      );
      setExpandedUserId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Tem certeza que deseja excluir este utilizador?')) return;
    
    try {
      const response = await fetch(`/api/user/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');
      
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  const createUser = async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) throw new Error('Failed to create user');
      
      const createdUser = await response.json();
      setUsers(prevUsers => [...prevUsers, createdUser]);
      setNewUser({
        username: '',
        password: '',
        authorities: []
      });
      setShowAddUserModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleUserExpansion = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
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

  if (!isAdmin) {
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
        <title>Gestão de Utilizadores | Schola</title>
      </Head>

      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FiUsers className="text-indigo-600 w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Schola - Gestão de Utilizadores</h1>
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
          <h2 className="text-2xl font-bold mb-2">Gestão de Utilizadores</h2>
          <p className="opacity-90">Gerencie contas e permissões de acesso</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <div className="relative w-full max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar utilizadores..."
                className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-all"
            >
              <FiPlus className="mr-2" />
              Adicionar Utilizador
            </button>
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
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome de Utilizador</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissões</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <>
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex flex-wrap gap-1">
                              {user.authorities.map((role) => (
                                <span 
                                  key={role} 
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' :
                                    role === 'ROLE_TEACHER' ? 'bg-blue-100 text-blue-800' :
                                    'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {role.replace('ROLE_', '')}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => toggleUserExpansion(user.id)}
                                className="p-1 text-indigo-600 hover:text-indigo-900"
                              >
                                {expandedUserId === user.id ? <FiChevronUp /> : <FiChevronDown />}
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="p-1 text-red-600 hover:text-red-900"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedUserId === user.id && (
                          <tr className="bg-gray-50">
                            <td colSpan="4" className="px-6 py-4">
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Utilizador</label>
                                  <input
                                    type="text"
                                    value={user.username}
                                    onChange={(e) =>
                                      setUsers(prevUsers =>
                                        prevUsers.map(u =>
                                          u.id === user.id ? { ...u, username: e.target.value } : u
                                        )
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Permissões</label>
                                  <div className="space-y-2">
                                    {availableRoles.map((role) => (
                                      <div key={role.value} className="flex items-center">
                                        <input
                                          type="checkbox"
                                          id={`${user.id}-${role.value}`}
                                          checked={user.authorities.includes(role.value)}
                                          onChange={(e) =>
                                            handleRoleChange(user.id, role.value, e.target.checked)
                                          }
                                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`${user.id}-${role.value}`} className="ml-2 block text-sm text-gray-700">
                                          {role.label}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => setExpandedUserId(null)}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => saveUserChanges(user.id)}
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
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        Nenhum utilizador encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal para adicionar novo utilizador */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Novo Utilizador</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Utilizador</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Palavra-passe</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permissões</label>
                <div className="space-y-2">
                  {availableRoles.map((role) => (
                    <div key={role.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`new-${role.value}`}
                        checked={newUser.authorities.includes(role.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewUser({
                              ...newUser,
                              authorities: [...newUser.authorities, role.value]
                            });
                          } else {
                            setNewUser({
                              ...newUser,
                              authorities: newUser.authorities.filter(r => r !== role.value)
                            });
                          }
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`new-${role.value}`} className="ml-2 block text-sm text-gray-700">
                        {role.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancelar
              </button>
              <button
                onClick={createUser}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Criar Utilizador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}