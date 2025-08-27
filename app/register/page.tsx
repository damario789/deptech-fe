'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Form from '@/components/Form';
import Layout from '@/components/Layout';
import DatePicker from '@/components/DatePicker';
import Select from '@/components/Select';
import { adminService } from '@/lib/services';
import { formatDateForAPI } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
    
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak sama';
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
      const { confirmPassword, ...registerData } = formData;
      
      await adminService.register(registerData);
      toast.success('Registrasi berhasil!');
      router.push('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      
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
        toast.error('Registrasi gagal. Silakan coba lagi.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="py-8">
        <Card className="w-full max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">Register Admin</h1>
          
          <Form onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Register">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="firstName"
                name="firstName"
                label="Nama Depan"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
              />
              
              <Input
                id="lastName"
                name="lastName"
                label="Nama Belakang"
                value={formData.lastName}
                onChange={handleChange}
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
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="email@example.com"
            />
            
            <DatePicker
              id="birthDate"
              name="birthDate"
              label="Tanggal Lahir"
              value={formData.birthDate}
              onChange={handleChange}
              error={errors.birthDate}
              required
            />
            
            <Select
              id="gender"
              name="gender"
              label="Jenis Kelamin"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { value: 'MALE', label: 'Laki-laki' },
                { value: 'FEMALE', label: 'Perempuan' },
              ]}
              error={errors.gender}
              required
            />
            
            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            
            <Input
              id="confirmPassword"
              name="confirmPassword"
              label="Konfirmasi Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
          </Form>
          
          <div className="mt-4 text-center">
            <p>
              Sudah punya akun?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
