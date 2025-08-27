'use client';

import { useRouter } from 'next/navigation';
import { adminService } from '@/lib/services';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const isAuthenticated = typeof window !== 'undefined' && adminService.isAuthenticated();
  const admin = typeof window !== 'undefined' ? adminService.getCurrentAdmin() : null;
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    adminService.logout();
    router.push('/login');
  };

  return (
    <nav className="bg-blue-600 text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Sistem Cuti Pegawai
        </Link>
        

        <button 
          className="md:hidden focus:outline-none" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>


        <div className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="hover:text-blue-200 transition">
                Dashboard
              </Link>
              <Link href="/admin" className="hover:text-blue-200 transition">
                Admin
              </Link>
              <Link href="/employees" className="hover:text-blue-200 transition">
                Pegawai
              </Link>
              <Link href="/leaves" className="hover:text-blue-200 transition">
                Cuti
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button 
                  className="flex items-center hover:text-blue-200 transition"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {admin?.firstName} {admin?.lastName}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Profil Saya
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-200 transition">
                Login
              </Link>
              <Link href="/register" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition">
                Register
              </Link>
            </>
          )}
        </div>
      </div>


      {isOpen && (
        <div className="md:hidden mt-4 space-y-4 pb-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="block hover:text-blue-200 transition py-2">
                Dashboard
              </Link>
              <Link href="/admin" className="block hover:text-blue-200 transition py-2">
                Admin
              </Link>
              <Link href="/employees" className="block hover:text-blue-200 transition py-2">
                Pegawai
              </Link>
              <Link href="/leaves" className="block hover:text-blue-200 transition py-2">
                Cuti
              </Link>
              <Link href="/profile" className="block hover:text-blue-200 transition py-2">
                Profil Saya ({admin?.firstName})
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 text-red-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block hover:text-blue-200 transition py-2">
                Login
              </Link>
              <Link href="/register" className="block hover:text-blue-200 transition py-2">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
