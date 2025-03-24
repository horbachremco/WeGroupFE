import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  show: boolean;
  type: ToastType;
  message: string;
  onClose: () => void;
}

export function Toast({ show, type, message, onClose }: ToastProps) {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: CheckCircleIcon,
  };

  const colors = {
    success: 'text-green-400 bg-green-50',
    error: 'text-red-400 bg-red-50',
    info: 'text-blue-400 bg-blue-50',
  };

  const Icon = icons[type];

  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed bottom-0 right-0 z-50 p-4">
        <div className={`rounded-lg p-4 shadow-lg ${colors[type]}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{message}</p>
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
} 