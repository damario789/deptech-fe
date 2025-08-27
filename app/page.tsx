import Link from 'next/link';
import Layout from '@/components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col justify-center items-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Sistem Manajemen Cuti Pegawai</h1>
        <p className="text-lg text-gray-600 max-w-2xl text-center mb-8">
          Platform pengelolaan data cuti pegawai untuk memudahkan administrasi dan monitoring pengajuan cuti.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login" className="btn btn-primary text-center">
            Login Admin
          </Link>
          <Link href="/register" className="btn btn-secondary text-center">
            Register
          </Link>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8 w-full max-w-4xl">
          <div className="card text-center">
            <h3 className="text-xl font-semibold mb-2">Manajemen Admin</h3>
            <p className="text-gray-600">
              Pengelolaan data admin untuk mengakses sistem
            </p>
          </div>
          
          <div className="card text-center">
            <h3 className="text-xl font-semibold mb-2">Data Pegawai</h3>
            <p className="text-gray-600">
              Pengelolaan data pegawai secara lengkap
            </p>
          </div>
          
          <div className="card text-center">
            <h3 className="text-xl font-semibold mb-2">Pengajuan Cuti</h3>
            <p className="text-gray-600">
              Pengelolaan data pengajuan cuti pegawai
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
