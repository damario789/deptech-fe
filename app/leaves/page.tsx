'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import Form from '@/components/Form';
import Input from '@/components/Input';
import Select from '@/components/Select';
import DatePicker from '@/components/DatePicker';
import Textarea from '@/components/Textarea';
import { adminService, leaveService, employeeService, Leave, Employee } from '@/lib/services';
import { formatDate, calculateLeaveDuration, formatDateForInput } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function LeavesPage() {
  const router = useRouter();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    reason: '',
    startDate: '',
    endDate: '',
    employeeId: '',
    status: 'PENDING'
  });
  
  const [statusUpdate, setStatusUpdate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check authentication on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !adminService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leavesResponse, employeesResponse] = await Promise.all([
        leaveService.getAll(),
        employeeService.getAll()
      ]);
      
      setLeaves(leavesResponse.data || []);
      setEmployees(employeesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Alasan cuti harus diisi';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Tanggal mulai harus diisi';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'Tanggal selesai harus diisi';
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        newErrors.endDate = 'Tanggal selesai harus setelah tanggal mulai';
      }
      
      // Check if duration exceeds 12 days
      const duration = calculateLeaveDuration(formData.startDate, formData.endDate);
      if (duration > 12) {
        newErrors.endDate = 'Durasi cuti maksimal 12 hari';
      }
    }
    
    if (!formData.employeeId) {
      newErrors.employeeId = 'Pegawai harus dipilih';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        employeeId: parseInt(formData.employeeId)
      };
      
      if (selectedLeave) {
        // Update existing leave
        await leaveService.update(selectedLeave.id, payload);
        toast.success('Data cuti berhasil diperbarui');
      } else {
        // Create new leave
        await leaveService.create(payload);
        toast.success('Cuti berhasil ditambahkan');
      }
      
      // Refresh data and close modal
      fetchData();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving leave:', error);
      
      if (error.response?.data?.details) {
        // Handle validation errors from the server
        const serverErrors = error.response.data.details.reduce(
          (acc: Record<string, string>, curr: string) => {
            const match = curr.match(/^([a-zA-Z]+) (.+)$/);
            if (match) {
              acc[match[1]] = match[2];
            }
            return acc;
          },
          {}
        );
        setErrors(serverErrors);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Gagal menyimpan data cuti');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedLeave || !statusUpdate) return;
    
    setIsSubmitting(true);
    
    try {
      await leaveService.updateStatus(selectedLeave.id, statusUpdate as 'PENDING' | 'APPROVED' | 'REJECTED');
      toast.success('Status cuti berhasil diperbarui');
      fetchData();
      setIsStatusModalOpen(false);
    } catch (error: any) {
      console.error('Error updating leave status:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui status cuti');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLeave) return;
    
    setIsSubmitting(true);
    
    try {
      await leaveService.delete(selectedLeave.id);
      toast.success('Cuti berhasil dihapus');
      fetchData();
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      console.error('Error deleting leave:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus cuti');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setSelectedLeave(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (leave: Leave) => {
    setSelectedLeave(leave);
    
    setFormData({
      reason: leave.reason,
      startDate: formatDateForInput(leave.startDate),
      endDate: formatDateForInput(leave.endDate),
      employeeId: leave.employeeId.toString(),
      status: leave.status
    });
    setIsModalOpen(true);
  };

  const openStatusModal = (leave: Leave) => {
    setSelectedLeave(leave);
    setStatusUpdate(leave.status);
    setIsStatusModalOpen(true);
  };

  const openDeleteModal = (leave: Leave) => {
    setSelectedLeave(leave);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      reason: '',
      startDate: '',
      endDate: '',
      employeeId: '',
      status: 'PENDING'
    });
    setErrors({});
  };

  const getStatusBadge = (status: string) => {
    let classes = 'px-2 py-1 rounded-full text-xs font-medium ';
    
    switch (status) {
      case 'PENDING':
        classes += 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        return <span className={classes}>Menunggu</span>;
      case 'APPROVED':
        classes += 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        return <span className={classes}>Disetujui</span>;
      case 'REJECTED':
        classes += 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        return <span className={classes}>Ditolak</span>;
      default:
        return status;
    }
  };

  const columns = [
    { 
      header: 'Pegawai',
      accessor: (leave: Leave) => leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : `Pegawai #${leave.employeeId}`
    },
    { 
      header: 'Alasan',
      accessor: 'reason' as keyof Leave,
      className: 'max-w-xs truncate'
    },
    { 
      header: 'Tanggal Mulai',
      accessor: (leave: Leave) => formatDate(leave.startDate)
    },
    { 
      header: 'Tanggal Selesai',
      accessor: (leave: Leave) => formatDate(leave.endDate)
    },
    { 
      header: 'Durasi',
      accessor: (leave: Leave) => `${calculateLeaveDuration(leave.startDate, leave.endDate)} hari`
    },
    { 
      header: 'Status',
      accessor: (leave: Leave) => getStatusBadge(leave.status)
    }
  ];

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Cuti</h1>
        <button
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          Tambah Cuti
        </button>
      </div>

      <Card>
        <DataTable
          data={leaves}
          columns={columns}
          keyField="id"
          loading={loading}
          emptyMessage="Tidak ada data cuti"
          actions={(leave: Leave) => (
            <div className="flex space-x-2">
              <button
                onClick={() => openEditModal(leave)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Edit
              </button>
                <button
                onClick={() => openStatusModal(leave)}
                className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
              >
                Change Status
              </button>
              <button
                onClick={() => openDeleteModal(leave)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                Delete
              </button>
            </div>
          )}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLeave ? 'Edit Cuti' : 'Tambah Cuti Baru'}
        size="lg"
      >
        <Form 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          submitLabel={selectedLeave ? 'Simpan' : 'Tambah'}
        >
          <Select
            id="employeeId"
            name="employeeId"
            label="Pegawai"
            value={formData.employeeId}
            onChange={handleInputChange}
            options={employees.map(emp => ({
              value: emp.id.toString(),
              label: `${emp.firstName} ${emp.lastName}`
            }))}
            error={errors.employeeId}
            required
            placeholder="Pilih pegawai..."
          />
          
          <Textarea
            id="reason"
            name="reason"
            label="Alasan Cuti"
            value={formData.reason}
            onChange={handleInputChange}
            error={errors.reason}
            required
            rows={3}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              id="startDate"
              name="startDate"
              label="Tanggal Mulai"
              value={formData.startDate}
              onChange={handleInputChange}
              error={errors.startDate}
              required
            />
            
            <DatePicker
              id="endDate"
              name="endDate"
              label="Tanggal Selesai"
              value={formData.endDate}
              onChange={handleInputChange}
              error={errors.endDate}
              required
              min={formData.startDate}
            />
          </div>
          
          <Select
            id="status"
            name="status"
            label="Status"
            value={formData.status}
            onChange={handleInputChange}
            options={[
              { value: 'PENDING', label: 'Menunggu' },
              { value: 'APPROVED', label: 'Disetujui' },
              { value: 'REJECTED', label: 'Ditolak' },
            ]}
            error={errors.status}
            required
          />
        </Form>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Ubah Status Cuti"
        size="sm"
      >
        <div className="mb-4">
          <p className="mb-2">
            <span className="font-semibold">Pegawai:</span>{' '}
            {selectedLeave?.employee ? `${selectedLeave.employee.firstName} ${selectedLeave.employee.lastName}` : ''}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Alasan:</span>{' '}
            {selectedLeave?.reason}
          </p>
          <p className="mb-4">
            <span className="font-semibold">Tanggal:</span>{' '}
            {selectedLeave ? `${formatDate(selectedLeave.startDate)} - ${formatDate(selectedLeave.endDate)}` : ''}
          </p>
          
          <div className="mb-4">
            <label htmlFor="statusUpdate" className="form-label text-black dark:text-white">
              Status
            </label>
            <select
              id="statusUpdate"
              value={statusUpdate}
              onChange={(e) => setStatusUpdate(e.target.value)}
              className="form-input text-black dark:text-white"
            >
              <option value="PENDING" className="text-black dark:text-white">Menunggu</option>
              <option value="APPROVED" className="text-black dark:text-white">Disetujui</option>
              <option value="REJECTED" className="text-black dark:text-white">Ditolak</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            className="btn btn-secondary"
            onClick={() => setIsStatusModalOpen(false)}
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            className="btn btn-primary"
            onClick={handleStatusUpdate}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <p>Apakah Anda yakin ingin menghapus data cuti ini?</p>
        <div className="flex justify-end mt-6 space-x-2">
          <button
            className="btn btn-secondary"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
