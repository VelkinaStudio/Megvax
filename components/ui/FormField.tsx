import { type ReactNode } from 'react';
import { type FieldError } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  error?: FieldError;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}

export function FormField({ label, error, required, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-brand-black">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-brand-black/60">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 font-medium">{error.message}</p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      className={`
        w-full px-4 py-2.5 
        border-2 border-brand-black rounded-[2px]
        text-brand-black placeholder:text-brand-black/40
        focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary
        disabled:bg-brand-black/5 disabled:cursor-not-allowed
        transition-colors
        ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
        ${className}
      `}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`
        w-full px-4 py-2.5 
        border-2 border-brand-black rounded-[2px]
        text-brand-black placeholder:text-brand-black/40
        focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary
        disabled:bg-brand-black/5 disabled:cursor-not-allowed
        transition-colors
        resize-vertical
        ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
        ${className}
      `}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ error, className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`
        w-full px-4 py-2.5 
        border-2 border-brand-black rounded-[2px]
        text-brand-black
        focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary
        disabled:bg-brand-black/5 disabled:cursor-not-allowed
        transition-colors
        ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  );
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
}

export function Checkbox({ label, error, className = '', ...props }: CheckboxProps) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          className={`
            w-5 h-5 
            border-2 border-brand-black rounded-[2px]
            text-brand-primary
            focus:ring-2 focus:ring-brand-primary focus:ring-offset-0
            cursor-pointer
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        <span className="text-sm text-brand-black">{label}</span>
      </label>
      {error && (
        <p className="text-xs text-red-600 font-medium ml-7">{error.message}</p>
      )}
    </div>
  );
}
