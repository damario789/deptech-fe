'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Form from '@/components/Form';
import Layout from '@/components/Layout';
import { adminService } from '@/lib/services';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      if (!email.trim()) {
        throw new Error('Email harus diisi');
      }
      
      if (!password.trim()) {
        throw new Error('Password harus diisi');
      }
      const response = await adminService.login({ email, password });
      toast.success('Login berhasil!');
      router.push('/dashboard');
    } catch (error: any) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Login gagal. Silakan coba lagi.');
      }
      toast.error(error.response?.data?.message || error.message || 'Login gagal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[80vh]">
        <Card className="w-full max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">Login Admin</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <Form onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Login">
            <Input
              id="email"
              name="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
            />
            
            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password"
            />
          </Form>
          
          <div className="mt-4 text-center">
            <p>
              Belum punya akun?{' '}
              <Link href="/register" className="text-blue-600 hover:underline">
                Register
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
