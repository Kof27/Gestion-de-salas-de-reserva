'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar2 } from '@/src/widgets/navbar2/ui/Navbar2'

interface Resource {
  id: string
  name: string
  description: string
  quantity: number
}

const resourceOptions = [
  'Pantalla Interactiva 65"',
  'Sistema de Videoconferencia',
  'Aire Acondicionado',
  'Proyector',
  'Pizarrón',
  'Micrófono',
]

const initialResources: Resource[] = [
  { id: '1', name: 'Pantalla Interactiva 65"',    description: 'Pantalla táctil',    quantity: 1 },
  { id: '2', name: 'Sistema de Videoconferencia', description: 'Logitech MeetUp',    quantity: 1 },
  { id: '3', name: 'Aire Acondicionado',           description: 'Control independiente', quantity: 1 },
]

export const EditRoomPage = () => {
  const router = useRouter()

  const [enabled,     setEnabled]     = useState(true)
  const [name,        setName]        = useState('Sala de Reuniones A-301')
  const [location,    setLocation]    = useState('Edificio A - Piso 3')
  const [capacity,    setCapacity]    = useState('12')
  const [description, setDescription] = useState('Sala de reuniones estándar, ideal para reuniones departamentales. Cuenta con mesa central grande.')
  const [resources,   setResources]   = useState<Resource[]>(initialResources)
  const [selectedResource, setSelectedResource] = useState(resourceOptions[0])
  const [quantity,    setQuantity]    = useState(1)

  const deleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id))
  }

  const addResource = () => {
    if (!selectedResource) return
    setResources(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: selectedResource,
        description: '',
        quantity,
      }
    ])
    setQuantity(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />

      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
            <span className="hover:text-gray-600 cursor-pointer" onClick={() => router.push('/dashboard')}>Salas</span>
            <span>›</span>
            <span className="text-gray-600">A-301</span>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Sala y Recursos</h1>
              <p className="text-sm text-gray-400 mt-1">Actualizar detalles de la sala, estado y gestionar recursos disponibles</p>
            </div>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5">
              <span className="text-sm text-gray-600">Estado de la Sala</span>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 flex items-center justify-center ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}>
                  {enabled && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </button>
              <span className={`text-sm font-medium ${enabled ? 'text-green-600' : 'text-gray-400'}`}>
                {enabled ? 'Habilitada' : 'Inhabilitada'}
              </span>
            </div>
          </div>

          {/* Alerta */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-orange-600">Deshabilitar esta sala afectará las reservas activas</p>
              <p className="text-sm text-orange-500 mt-0.5">Esta sala tiene una reserva activa. Se notificará al usuario y se cancelará la reserva.</p>
            </div>
          </div>

          {/* Contenido en dos columnas */}
          <div className="grid grid-cols-2 gap-10">

            {/* Columna izquierda — Detalles */}
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-5">Detalles de la Sala</h2>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nombre</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-red-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Ubicación</label>
                  <input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-red-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Capacidad</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-red-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Descripción / Notas</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-red-400 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Columna derecha — Recursos */}
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-5">Recursos Tecnológicos</h2>

              <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                {resources.map((resource, index) => (
                  <div
                    key={resource.id}
                    className={`flex items-center justify-between px-4 py-3 ${
                      index !== resources.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-50 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{resource.name}</p>
                        {resource.description && (
                          <p className="text-xs text-gray-400">{resource.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">Cant: {resource.quantity}</span>
                      <button
                        onClick={() => deleteResource(resource.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Agregar recurso */}
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-800 mb-3">Agregar Recurso</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Recurso</label>
                    <select
                      value={selectedResource}
                      onChange={e => setSelectedResource(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-400"
                    >
                      {resourceOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={e => setQuantity(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-red-400"
                    />
                  </div>
                </div>
                <button
                  onClick={addResource}
                  className="w-full border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  + Agregar
                </button>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Guardar Cambios
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}