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
import { adminService, Admin } from '@/lib/services';
import { formatDate, formatDateForInput } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    gender: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    if (typeof window !== 'undefined' && !adminService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    fetchAdmins();
  }, [router]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAll();
      setAdmins(response.data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Gagal memuat data admin');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nama depan harus diisi';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nama belakang harus diisi';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'Tanggal lahir harus diisi';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Jenis kelamin harus dipilih';
    }
    
    // Password only required for new admin
    if (!selectedAdmin && !formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (!selectedAdmin && formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (selectedAdmin) {
        const { password, ...updateData } = formData;
        await adminService.update(selectedAdmin.id, updateData);
        toast.success('Admin berhasil diperbarui');
      } else {
        await adminService.register(formData);
        toast.success('Admin berhasil ditambahkan');
      }
      
      // Refresh data and close modal
      fetchAdmins();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving admin:', error);
      
      if (error.response?.data?.details) {
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
        toast.error('Gagal menyimpan data admin');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;
    
    setIsSubmitting(true);
    
    try {
      await adminService.delete(selectedAdmin.id);
      toast.success('Admin berhasil dihapus');
      fetchAdmins();
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setSelectedAdmin(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    
    setFormData({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      birthDate: formatDateForInput(admin.birthDate),
      gender: admin.gender,
      password: ''
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      birthDate: '',
      gender: '',
      password: ''
    });
    setErrors({});
  };

  const columns = [
    { header: 'Nama', accessor: (admin: Admin) => `${admin.firstName} ${admin.lastName}` },
    { header: 'Email', accessor: (admin: Admin) => admin.email },
    { 
      header: 'Tanggal Lahir', 
      accessor: (admin: Admin) => formatDate(admin.birthDate)
    },
    { 
      header: 'Jenis Kelamin', 
      accessor: (admin: Admin) => admin.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'
    },
    { 
      header: 'Dibuat Pada', 
      accessor: (admin: Admin) => formatDate(admin.createdAt)
    }
  ];

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Admin</h1>
        <button
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          Tambah Admin
        </button>
      </div>

      <Card>
        <DataTable
          data={admins}
          columns={columns}
          keyField="id"
          loading={loading}
          emptyMessage="Tidak ada data admin"
          actions={(admin: Admin) => (
            <div className="flex space-x-2">
              <button
                onClick={() => openEditModal(admin)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => openDeleteModal(admin)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                Hapus
              </button>
            </div>
          )}
        />
      </Card>


      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAdmin ? 'Edit Admin' : 'Tambah Admin Baru'}
        size="md"
      >
        <Form 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          submitLabel={selectedAdmin ? 'Simpan' : 'Tambah'}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="firstName"
              name="firstName"
              label="Nama Depan"
              value={formData.firstName}
              onChange={handleInputChange}
              error={errors.firstName}
              required
            />
            
            <Input
              id="lastName"
              name="lastName"
              label="Nama Belakang"
              value={formData.lastName}
              onChange={handleInputChange}
              error={errors.lastName}
              required
            />
          </div>
          
          <Input
            id="email"
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            required
            placeholder="email@example.com"
          />
          
          <DatePicker
            id="birthDate"
            name="birthDate"
            label="Tanggal Lahir"
            value={formData.birthDate}
            onChange={handleInputChange}
            error={errors.birthDate}
            required
          />
          
          <Select
            id="gender"
            name="gender"
            label="Jenis Kelamin"
            value={formData.gender}
            onChange={handleInputChange}
            options={[
              { value: 'MALE', label: 'Laki-laki' },
              { value: 'FEMALE', label: 'Perempuan' },
            ]}
            error={errors.gender}
            required
          />
          
          {!selectedAdmin && (
            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              required={!selectedAdmin}
            />
          )}
        </Form>
      </Modal>


      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <p>Apakah Anda yakin ingin menghapus admin {selectedAdmin?.firstName} {selectedAdmin?.lastName}?</p>
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
