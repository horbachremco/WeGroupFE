import { useState, useEffect } from 'react';
import { User } from '../types/user';

interface UserFormProps {
  onSubmit: (user: Omit<User, 'id'> | User) => void;
  onClose: () => void;
  initialData?: User;
  mode: 'create' | 'edit';
}

type UserRole = 'User' | 'Admin';

export const UserForm = ({ onSubmit, onClose, initialData, mode }: UserFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'User' as UserRole,
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
        isActive: initialData.isActive,
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(mode === 'edit' ? { ...formData, id: initialData!.id } : formData);
    setFormData({ name: '', email: '', role: 'User' as UserRole, isActive: true });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-150"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-150"
          required
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          id="role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-150"
        >
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-150"
      >
        {mode === 'create' ? 'Add User' : 'Save Changes'}
      </button>
    </form>
  );
}; 