'use client';

import { ChangeEvent } from 'react';

interface SelectProps {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export default function Select({
  id,
  name,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder = 'Pilih...',
}: SelectProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="form-label text-black dark:text-white">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <select
        id={id}
        name={name || id}
        value={value}
        onChange={onChange}
        className={`form-input text-black dark:text-white ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        required={required}
      >
        <option value="" className="text-black dark:text-white">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-black dark:text-white">
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
