'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import Card from '@/components/Card';
import Form from '@/components/Form';
import Input from '@/components/Input';
import DatePicker from '@/components/DatePicker';
import Select from '@/components/Select';
import { adminService, Admin } from '@/lib/services';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    gender: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check authentication
    if (typeof window !== 'undefined' && !adminService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const loadAdminProfile = () => {
      setLoading(true);
      // Get admin from localStorage
      const currentAdmin = adminService.getCurrentAdmin();
      
      if (currentAdmin) {
        setAdmin(currentAdmin);
        setFormData({
          firstName: currentAdmin.firstName || '',
          lastName: currentAdmin.lastName || '',
          email: currentAdmin.email || '',
          birthDate: currentAdmin.birthDate || '',
          gender: currentAdmin.gender || '',
        });
      } else {
        toast.error('Tidak dapat memuat profil admin');
        router.push('/dashboard');
      }
      
      setLoading(false);
    };

    loadAdminProfile();
  }, [router]);

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors(prev => {
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
    
    return newErrors;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Password lama harus diisi';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Password baru harus diisi';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password minimal 6 karakter';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak sama';
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
      if (!admin) {
        throw new Error('Data admin tidak ditemukan');
      }
      
      // Update admin profile
      await adminService.update(admin.id, formData);
      
      // Update admin in localStorage
      const updatedAdmin = {
        ...admin,
        ...formData
      };
      localStorage.setItem('admin', JSON.stringify(updatedAdmin));
      
      toast.success('Profil berhasil diperbarui');
      setAdmin(updatedAdmin);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
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
        toast.error(error.message || 'Gagal memperbarui profil');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate password form
    const passwordFormErrors = validatePasswordForm();
    if (Object.keys(passwordFormErrors).length > 0) {
      setPasswordErrors(passwordFormErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!admin) {
        throw new Error('Data admin tidak ditemukan');
      }
      
      // In a real app, you would call a dedicated password change API
      // For now, we'll mock it with a simple toast message
      toast.success('Password berhasil diubah');
      
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Close password modal
      setIsPasswordModalOpen(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Gagal mengubah password');
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Profil Saya</h1>
        
        <Card>
          <Form 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
            submitLabel="Simpan Perubahan"
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
          </Form>
          
          <div className="border-t mt-6 pt-6">
            <h3 className="text-lg font-medium mb-4">Keamanan Akun</h3>
            <button
              className="btn btn-secondary"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Ubah Password
            </button>
          </div>
        </Card>
      </div>
      
      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Ubah Password</h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handlePasswordSubmit}>
              <Input
                id="currentPassword"
                name="currentPassword"
                label="Password Saat Ini"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.currentPassword}
                required
              />
              
              <Input
                id="newPassword"
                name="newPassword"
                label="Password Baru"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.newPassword}
                required
              />
              
              <Input
                id="confirmPassword"
                name="confirmPassword"
                label="Konfirmasi Password Baru"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.confirmPassword}
                required
              />
              
              <div className="flex justify-end mt-6 space-x-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
