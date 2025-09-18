import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { containerRef } = useAccessibility({ 
    focusOnMount: true, 
    trapFocus: true,
    announcePageChange: true 
  });

  useKeyboardNavigation({
    onEscape: onClose,
    enabled: isOpen
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('aria-hidden', 'true');
    } else {
      document.body.style.overflow = '';
      document.body.removeAttribute('aria-hidden');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.removeAttribute('aria-hidden');
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-fade-in"
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={containerRef}
          className={`
            inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl 
            transform transition-all animate-scale-in sm:my-8 sm:align-middle w-full
            ${sizeClasses[size]} ${className}
          `}
          role="document"
        >
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 
                id="modal-title"
                className="text-lg font-medium text-gray-900"
              >
                {title}
              </h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 p-1"
                  aria-label="Close modal"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 max-h-[60vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;