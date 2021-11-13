import React from 'react';
import './form.css';

interface FormProps {
  children: React.ReactNode;
}

const Form: React.FC<FormProps> = ({ children }: FormProps) => {
  return (
    <div className="form">
      <form className="space-y-6">{children}</form>
    </div>
  );
};

export default Form;
