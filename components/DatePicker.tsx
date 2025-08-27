'use client';

import React from 'react';

interface DatePickerProps {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  min?: string;
  max?: string;
}

export default function DatePicker({
  id,
  name,
  label,
  value,
  onChange,
  error,
  required = false,
  min,
  max,
}: DatePickerProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="form-label text-black dark:text-white">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <input
        id={id}
        name={name || id}
        type="date"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className={`form-input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        required={required}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
