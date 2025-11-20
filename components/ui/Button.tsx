import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  // Fix: Use React.JSX.Element to avoid "Cannot find namespace 'JSX'" error.
  icon?: React.JSX.Element;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, icon, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-semibold text-white flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary hover:bg-blue-600',
    secondary: 'bg-secondary hover:bg-gray-600',
    danger: 'bg-danger hover:bg-red-600',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {icon}
      {children}
    </button>
  );
};