import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUser, updateUser, ApiError } from '../services/api';
import { User } from '../types/user';
import { ArrowLeftIcon, UserCircleIcon, CalendarIcon, ClockIcon, ShieldCheckIcon, PowerIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Modal } from './Modal';
import { Toast } from './Toast';
import { UserForm } from './UserForm';

export const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'User' | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'status' | 'role' | null>(null);
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error' | 'info'; message: string }>({
    show: false,
    type: 'info',
    message: '',
  });
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['user', id],
    queryFn: () => fetchUser(Number(id)),
    retry: 1,
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ['user', id] });
      const previousUser = queryClient.getQueryData(['user', id]);
      queryClient.setQueryData(['user', id], newUser);
      return { previousUser };
    },
    onError: (err: ApiError, newUser, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['user', id], context.previousUser);
      }
      setToast({
        show: true,
        type: 'error',
        message: err.message || 'Failed to update user',
      });
    },
    onSuccess: () => {
      setToast({
        show: true,
        type: 'success',
        message: 'User updated successfully',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      setShowRoleModal(false);
      setShowConfirmModal(false);
      setSelectedRole(null);
      setActionType(null);
    },
  });

  const handleRoleChange = (newRole: 'Admin' | 'User') => {
    setSelectedRole(newRole);
  };

  const handleSaveRole = () => {
    if (!user || !selectedRole) return;
    setActionType('role');
    setShowConfirmModal(true);
  };

  const handleToggleStatus = () => {
    if (!user) return;
    setActionType('status');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    if (!user) return;

    if (actionType === 'role' && selectedRole) {
      updateUserMutation.mutate({
        ...user,
        role: selectedRole,
      });
    } else if (actionType === 'status') {
      updateUserMutation.mutate({
        ...user,
        isActive: !user.isActive,
      });
    }
  };

  const handleEditSubmit = (formData: User | Omit<User, 'id'>) => {
    if (!user) return;
    updateUserMutation.mutate({ ...formData, id: user.id });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-200"></div>
          <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <p className="text-red-600 font-medium">Error loading user details</p>
        <p className="text-red-500 text-sm mt-2">
          {error instanceof ApiError ? error.message : 'Please try again later'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">User Details</h1>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
          <div className="lg:col-span-4 bg-white rounded-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:border-gray-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                  <UserCircleIcon className="w-10 h-10 text-orange-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Edit user details"
                    >
                      <PencilIcon className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'Admin' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Role</label>
                  <p className="mt-1 text-sm text-gray-900">{user.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1 text-sm text-gray-900">{user.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:border-gray-200">
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Activity</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Joined</p>
                    <p className="text-sm text-gray-500">January 1, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                    <ClockIcon className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">Last Active</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-lg border border-gray-100 overflow-hidden transition-all duration-200 hover:border-gray-200">
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowRoleModal(true)}
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all duration-150 cursor-pointer"
                  title="Change user's role"
                  disabled={updateUserMutation.isPending}
                >
                  <ShieldCheckIcon className="w-6 h-6 text-orange-500 mb-2" />
                  <span className="text-sm text-gray-600">Change Role</span>
                </button>
                <button 
                  onClick={handleToggleStatus}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-150 cursor-pointer ${
                    user.isActive
                      ? 'border-green-200 bg-green-50 hover:border-green-300'
                      : 'border-red-200 bg-red-50 hover:border-red-300'
                  }`}
                  title={`${user.isActive ? 'Deactivate' : 'Activate'} user`}
                  disabled={updateUserMutation.isPending}
                >
                  <PowerIcon className={`w-6 h-6 mb-2 ${
                    user.isActive ? 'text-green-500' : 'text-red-500'
                  }`} />
                  <span className={`text-sm ${
                    user.isActive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedRole(null);
        }}
        title="Change User Role"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Select New Role</h3>
              <p className="text-sm text-gray-500">Choose a role for {user.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleRoleChange('Admin')}
              className={`p-4 rounded-lg border transition-all duration-150 cursor-pointer ${
                selectedRole === 'Admin'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <ShieldCheckIcon className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Admin</p>
                  <p className="text-sm text-gray-500">Full access</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => handleRoleChange('User')}
              className={`p-4 rounded-lg border transition-all duration-150 cursor-pointer ${
                selectedRole === 'User'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserCircleIcon className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">User</p>
                  <p className="text-sm text-gray-500">Limited access</p>
                </div>
              </div>
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowRoleModal(false);
                setSelectedRole(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRole}
              disabled={!selectedRole || updateUserMutation.isPending}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer ${
                !selectedRole || updateUserMutation.isPending
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {updateUserMutation.isPending ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setActionType(null);
        }}
        title={actionType === 'role' ? 'Confirm Role Change' : 'Confirm Status Change'}
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {actionType === 'role' 
                  ? `Change role to ${selectedRole}?`
                  : `${user.isActive ? 'Deactivate' : 'Activate'} user?`}
              </h3>
              <p className="text-sm text-gray-500">
                {actionType === 'role'
                  ? `This will change ${user.name}'s role to ${selectedRole}.`
                  : `This will ${user.isActive ? 'deactivate' : 'activate'} ${user.name}'s account.`}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => {
                setShowConfirmModal(false);
                setActionType(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAction}
              disabled={updateUserMutation.isPending}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer ${
                updateUserMutation.isPending
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {updateUserMutation.isPending ? 'Updating...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
      >
        <UserForm
          initialData={user}
          mode="edit"
          onSubmit={handleEditSubmit}
          onClose={() => setShowEditModal(false)}
        />
      </Modal>

      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}; 