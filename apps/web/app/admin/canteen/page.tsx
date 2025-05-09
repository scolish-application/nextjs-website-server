'use client'

import { useAuth } from '../../hooks/userAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { FiClock, FiUser, FiSearch, FiPlus, FiEdit, FiTrash2, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';

type FarinaTemporal = 'BREAKFAST' | 'LUNCH' | 'DINNER';
type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface Farina {
  id: number;
  name: string;
  description: string;
  date: string;
  temporal: FarinaTemporal;
  maxReservations: number;
  vegetarian: boolean;
  reservationDeadline: string;
  currentReservations: number;
  available: boolean;
  price: number;
}

interface Reservation {
  id: number;
  farina: {
    id: number;
    name: string;
    date: string;
    temporal: FarinaTemporal;
  };
  user: {
    id: number;
    username: string;
  };
  reservationTime: string;
  status: ReservationStatus;
  specialRequirements?: string;
}

export default function CanteenManagement() {
    const { userRole, isLoading, username } = useAuth();
    const router = useRouter();
    const [farinas, setFarinas] = useState<Farina[]>([]);
    const [filteredFarinas, setFilteredFarinas] = useState<Farina[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showMealModal, setShowMealModal] = useState(false);
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedMeal, setSelectedMeal] = useState<Farina | null>(null);
    const [newFarina, setNewFarina] = useState<Omit<Farina, 'id'>>({
      name: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      temporal: 'LUNCH',
      maxReservations: 50,
      vegetarian: false,
      reservationDeadline: '',
      available: true,
      currentReservations: 0,
      price: 0
    });
    const [specialRequirements, setSpecialRequirements] = useState('');

    useEffect(() => {
      if (!isLoading && userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_STUDENT') {
        router.push('/');
        return;
      }

      if (!isLoading) {
        fetchFarinas();
        fetchUserReservations();
      }
    }, [userRole, router, isLoading]);

    const fetchFarinas = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/canteen/meals/available');
        if (!response.ok) throw new Error('Failed to fetch meals');
        const data = await response.json();
        setFarinas(data.content || data);
        setFilteredFarinas(data.content || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserReservations = async () => {
      try {
        const response = await fetch('/api/canteen/reservations/user/upcoming');
        if (!response.ok) throw new Error('Failed to fetch reservations');
        const data = await response.json();
        setReservations(data.content || data);
      } catch (err) {
        console.error('Error fetching reservations:', err);
      }
    };

    useEffect(() => {
      const filtered = farinas.filter((farina) =>
        farina.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farina.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farina.date.includes(searchTerm)
      );
      setFilteredFarinas(filtered);
    }, [searchTerm, farinas]);

    const createFarina = async () => {
      try {
        const response = await fetch('/api/canteen/meals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newFarina),
        });

        if (!response.ok) throw new Error('Failed to create meal');
        
        const createdFarina: Farina = await response.json();
        setFarinas((prev) => [...prev, createdFarina]);
        setNewFarina({ 
          name: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          temporal: 'LUNCH',
          maxReservations: 50,
          vegetarian: false,
          reservationDeadline: '',
          available: true,
          currentReservations: 0,
          price: 0
        });
        setShowMealModal(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    const createReservation = async () => {
      if (!selectedMeal) return;
      
      try {
        const response = await fetch(`/api/canteen/reservations/meal/${selectedMeal.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            specialRequirements
          }),
        });

        if (!response.ok) throw new Error('Failed to create reservation');
        
        const createdReservation: Reservation = await response.json();
        setReservations((prev) => [...prev, createdReservation]);
        setSpecialRequirements('');
        setShowReservationModal(false);
        fetchFarinas(); // Refresh availability
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    const cancelReservation = async (id: number) => {
      if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;
      
      try {
        const response = await fetch(`/api/canteen/reservations/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to cancel reservation');
        
        setReservations((prev) => prev.filter((res) => res.id !== id));
        fetchFarinas(); // Refresh availability
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    const getTemporalLabel = (temporal: FarinaTemporal) => {
      switch (temporal) {
        case 'BREAKFAST': return 'Café da Manhã';
        case 'LUNCH': return 'Almoço';
        case 'DINNER': return 'Jantar';
        default: return temporal;
      }
    };

    const getStatusLabel = (status: ReservationStatus) => {
      switch (status) {
        case 'PENDING': return 'Pendente';
        case 'CONFIRMED': return 'Confirmada';
        case 'CANCELLED': return 'Cancelada';
        case 'COMPLETED': return 'Concluída';
        default: return status;
      }
    };

    const getStatusColor = (status: ReservationStatus) => {
      switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'CONFIRMED': return 'bg-green-100 text-green-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        case 'COMPLETED': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
      }
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

    if (userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_STUDENT') {
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
          <title>Gestão da Cantina | Schola</title>
        </Head>

        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FiCalendar className="text-indigo-600 w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 hidden sm:block">Schola - Gestão da Cantina</h1>
            </div>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
            >
              Voltar
            </button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="mb-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Cardápio da Cantina</h2>
            <p className="opacity-90">Gerencie refeições e reservas</p>
          </div>

          {userRole === 'ROLE_ADMIN' && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowMealModal(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-all"
              >
                <FiPlus className="mr-2" />
                Adicionar Refeição
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <div className="relative w-full">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar refeições..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refeição</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibilidade</th>
                        {userRole === 'ROLE_STUDENT' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                          </td>
                        </tr>
                      ) : filteredFarinas.length > 0 ? (
                        filteredFarinas.map((farina) => (
                          <tr key={farina.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{farina.name}</div>
                              <div className="text-sm text-gray-500">{farina.description}</div>
                              {farina.vegetarian && (
                                <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                  Vegetariano
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(farina.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getTemporalLabel(farina.temporal)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                farina.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {farina.available ? 
                                  `${farina.maxReservations - farina.currentReservations} vagas` : 
                                  'Esgotado'}
                              </span>
                            </td>
                            {userRole === 'ROLE_STUDENT' && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {farina.available && (
                                  <button
                                    onClick={() => {
                                      setSelectedMeal(farina);
                                      setShowReservationModal(true);
                                    }}
                                    className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                  >
                                    Reservar
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                            Nenhuma refeição encontrada
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-medium text-gray-800">Minhas Reservas</h3>
                </div>
                <div className="p-5">
                  {reservations.length > 0 ? (
                    <ul className="space-y-4">
                      {reservations.map((reservation) => (
                        <li key={reservation.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <div className="font-medium">{reservation.farina.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(reservation.farina.date).toLocaleDateString('pt-BR')} - {getTemporalLabel(reservation.farina.temporal)}
                          </div>
                          <div className="mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(reservation.status)}`}>
                              {getStatusLabel(reservation.status)}
                            </span>
                          </div>
                          {reservation.specialRequirements && (
                            <div className="mt-1 text-sm text-gray-600">
                              <strong>Observações:</strong> {reservation.specialRequirements}
                            </div>
                          )}
                          <div className="mt-2">
                            <button
                              onClick={() => cancelReservation(reservation.id)}
                              className="text-sm text-red-600 hover:text-red-800 flex items-center"
                              disabled={reservation.status === 'CANCELLED'}
                            >
                              <FiXCircle className="mr-1" />
                              Cancelar
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhuma reserva encontrada</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Modal para adicionar nova refeição (admin) */}
        {showMealModal && (
          <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Refeição</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={newFarina.name}
                    onChange={(e) => setNewFarina({...newFarina, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={newFarina.description}
                    onChange={(e) => setNewFarina({...newFarina, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input
                      type="date"
                      value={newFarina.date}
                      onChange={(e) => setNewFarina({...newFarina, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={newFarina.temporal}
                      onChange={(e) => setNewFarina({...newFarina, temporal: e.target.value as FarinaTemporal})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="BREAKFAST">Café da Manhã</option>
                      <option value="LUNCH">Almoço</option>
                      <option value="DINNER">Jantar</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vagas</label>
                    <input
                      type="number"
                      value={newFarina.maxReservations}
                      onChange={(e) => setNewFarina({...newFarina, maxReservations: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newFarina.price}
                      onChange={(e) => setNewFarina({...newFarina, price: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prazo para Reserva</label>
                  <input
                    type="datetime-local"
                    value={newFarina.reservationDeadline}
                    onChange={(e) => setNewFarina({...newFarina, reservationDeadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="vegetarian"
                    checked={newFarina.vegetarian}
                    onChange={(e) => setNewFarina({...newFarina, vegetarian: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="vegetarian" className="ml-2 block text-sm text-gray-700">
                    Opção Vegetariana
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowMealModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={createFarina}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Criar Refeição
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para fazer reserva (estudante) */}
        {showReservationModal && selectedMeal && (
          <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Fazer Reserva</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{selectedMeal.name}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedMeal.date).toLocaleDateString('pt-BR')} - {getTemporalLabel(selectedMeal.temporal)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações Especiais</label>
                  <textarea
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Alergias, restrições alimentares, etc."
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowReservationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={createReservation}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Confirmar Reserva
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}