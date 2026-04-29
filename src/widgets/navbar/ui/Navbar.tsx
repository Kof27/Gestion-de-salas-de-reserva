'use client'
import Link from 'next/link'

export const Navbar = () => (
  <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 bg-red-500 rounded flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
          />
        </svg>
      </div>
      <span className="text-sm font-semibold text-gray-800">UAO - Secretaria</span>
    </div>

    <div className="flex items-center gap-3 flex-1 max-w-md mx-8">
      <div className="flex items-center gap-2 w-full bg-gray-100 rounded-lg px-3 py-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Buscar sala..."
          className="bg-transparent text-sm text-gray-600 outline-none w-full placeholder-gray-400"
        />
      </div>

      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
          />
        </svg>
      </button>
    </div>

    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-orange-200 flex items-center justify-center text-orange-600 text-sm font-medium">
        U
      </div>
    </div>
  </header>
)