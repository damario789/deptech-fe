'use client';

import { ChangeEvent } from 'react';

interface InputProps {
  id: string;
  name?: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

export default function Input({
  id,
  name,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  required = false,
}: InputProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="form-label text-black dark:text-white">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <input
        id={id}
        name={name || id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`form-input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        required={required}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
