'use client';

import React from 'react';

interface TextareaProps {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
}

export default function Textarea({
  id,
  name,
  label,
  value,
  onChange,
  error,
  required = false,
  rows = 3,
  placeholder = '',
}: TextareaProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="form-label text-black dark:text-white">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <textarea
        id={id}
        name={name || id}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className={`form-input text-black dark:text-white ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        required={required}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
