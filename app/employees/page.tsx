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
import Textarea from '@/components/Textarea';
import { adminService, employeeService, Employee } from '@/lib/services';
import toast from 'react-hot-toast';

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    gender: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    if (typeof window !== 'undefined' && !adminService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    fetchEmployees();
  }, [router]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAll();
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Gagal memuat data pegawai');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    

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
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'No telepon harus diisi';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Alamat harus diisi';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Jenis kelamin harus dipilih';
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
      if (selectedEmployee) {
        await employeeService.update(selectedEmployee.id, formData);
        toast.success('Data pegawai berhasil diperbarui');
      } else {
        await employeeService.create(formData);
        toast.success('Pegawai berhasil ditambahkan');
      }
      
      // Refresh data and close modal
      fetchEmployees();
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      
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
        toast.error('Gagal menyimpan data pegawai');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    
    setIsSubmitting(true);
    
    try {
      await employeeService.delete(selectedEmployee.id);
      toast.success('Pegawai berhasil dihapus');
      fetchEmployees();
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus pegawai');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setSelectedEmployee(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      address: employee.address,
      gender: employee.gender
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      gender: ''
    });
    setErrors({});
  };

  const columns = [
    { 
      header: 'Nama',
      accessor: (employee: Employee) => `${employee.firstName} ${employee.lastName}`
    },
    { header: 'Email', accessor: 'email' as keyof Employee },
    { header: 'No. Telepon', accessor: 'phone' as keyof Employee },
    { 
      header: 'Jenis Kelamin',
      accessor: (employee: Employee) => employee.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'
    },
    { 
      header: 'Alamat',
      accessor: 'address' as keyof Employee,
      className: 'max-w-xs truncate'
    }
  ];

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Pegawai</h1>
        <button
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          Tambah Pegawai
        </button>
      </div>

      <Card>
        <DataTable
          data={employees}
          columns={columns}
          keyField="id"
          loading={loading}
          emptyMessage="Tidak ada data pegawai"
          actions={(employee: Employee) => (
            <div className="flex space-x-2">
              <button
                onClick={() => openEditModal(employee)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => openDeleteModal(employee)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                Delete
              </button>
            </div>
          )}
        />
      </Card>


      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEmployee ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}
        size="lg"
      >
        <Form 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          submitLabel={selectedEmployee ? 'Simpan' : 'Tambah'}
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
          
          <Input
            id="phone"
            name="phone"
            label="No. Telepon"
            value={formData.phone}
            onChange={handleInputChange}
            error={errors.phone}
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
          
          <Textarea
            id="address"
            name="address"
            label="Alamat"
            value={formData.address}
            onChange={handleInputChange}
            error={errors.address}
            required
            rows={3}
          />
        </Form>
      </Modal>


      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <p>Apakah Anda yakin ingin menghapus pegawai {selectedEmployee?.firstName} {selectedEmployee?.lastName}?</p>
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
