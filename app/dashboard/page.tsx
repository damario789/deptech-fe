'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import { adminService, employeeService, leaveService } from '@/lib/services';
import { Employee, Leave } from '@/lib/services';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0
  });
  const [recentLeaves, setRecentLeaves] = useState<Leave[]>([]);

  useEffect(() => {
    // Check authentication
    if (typeof window !== 'undefined' && !adminService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [employeesResponse, leavesResponse] = await Promise.all([
          employeeService.getAll(),
          leaveService.getAll(),
        ]);

        const employees = employeesResponse.data || [];
        const allLeaves = leavesResponse.data || [];

        // Calculate stats
        const pendingLeaves = allLeaves.filter((leave: Leave) => leave.status === 'PENDING');
        const approvedLeaves = allLeaves.filter((leave: Leave) => leave.status === 'APPROVED');
        const rejectedLeaves = allLeaves.filter((leave: Leave) => leave.status === 'REJECTED');

        // Get 5 most recent leaves
        const sortedLeaves = [...allLeaves].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5);

        setStats({
          totalEmployees: employees.length,
          totalLeaves: allLeaves.length,
          pendingLeaves: pendingLeaves.length,
          approvedLeaves: approvedLeaves.length,
          rejectedLeaves: rejectedLeaves.length
        });
        
        setRecentLeaves(sortedLeaves);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-black dark:text-gray-100">Selamat datang di sistem manajemen cuti pegawai</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card className="bg-blue-50 border-blue-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-800">Total Pegawai</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalEmployees}</p>
          </div>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-purple-800">Total Cuti</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalLeaves}</p>
          </div>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-yellow-800">Menunggu</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingLeaves}</p>
          </div>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-800">Disetujui</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.approvedLeaves}</p>
          </div>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-800">Ditolak</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejectedLeaves}</p>
          </div>
        </Card>
      </div>

      {/* Recent leaves */}
      <Card title="Pengajuan Cuti Terbaru">
        {recentLeaves.length === 0 ? (
          <p className="text-black dark:text-white text-center py-4">Belum ada pengajuan cuti</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">Pegawai</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">Alasan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-black dark:text-white">
                      {leave.employee?.firstName} {leave.employee?.lastName}
                    </td>
                    <td className="px-6 py-4 text-black dark:text-white">
                      <div className="line-clamp-1">{leave.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-black dark:text-white">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(leave.status)}`}>
                        {leave.status === 'PENDING' ? 'Menunggu' : leave.status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Layout>
  );
}
