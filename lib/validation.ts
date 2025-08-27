import { z } from 'zod';
export const adminLoginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const adminRegisterSchema = z.object({
  firstName: z.string().min(1, 'Nama depan harus diisi'),
  lastName: z.string().min(1, 'Nama belakang harus diisi'),
  email: z.string().email('Email tidak valid'),
  birthDate: z.string().refine(date => {
    return !isNaN(new Date(date).getTime());
  }, 'Tanggal lahir tidak valid'),
  gender: z.enum(['MALE', 'FEMALE']),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const adminUpdateSchema = adminRegisterSchema.omit({ password: true }).partial();
export const employeeSchema = z.object({
  firstName: z.string().min(1, 'Nama depan harus diisi'),
  lastName: z.string().min(1, 'Nama belakang harus diisi'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(6, 'No HP minimal 6 digit'),
  address: z.string().min(1, 'Alamat harus diisi'),
  gender: z.enum(['MALE', 'FEMALE']),
});

export const employeeUpdateSchema = employeeSchema.partial();
export const leaveSchema = z.object({
  reason: z.string().min(1, 'Alasan cuti harus diisi'),
  startDate: z.string().refine(date => {
    return !isNaN(new Date(date).getTime());
  }, 'Tanggal mulai tidak valid'),
  endDate: z.string().refine(date => {
    return !isNaN(new Date(date).getTime());
  }, 'Tanggal selesai tidak valid'),
  employeeId: z.number().positive('Pilih pegawai'),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return start <= end;
  },
  {
    message: 'Tanggal selesai harus setelah tanggal mulai',
    path: ['endDate'],
  }
);

export const leaveUpdateSchema = leaveSchema.partial();

export const leaveStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
});
