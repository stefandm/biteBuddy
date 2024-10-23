import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import useClickOutside from '../hooks/useClickOutside';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  useClickOutside({
    ref: modalRef,
    handler: onClose,
  });

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
    <div
      ref={modalRef}
      className="
        bg-slate-800 
        rounded-lg 
        overflow-y-auto 
        max-h-[90vh] 
        w-11/12 
        md:w-3/4 
        lg:w-1/2 
        p-4 
        mt-4
        transform 
        transition-transform 
        duration-300 
        scale-100
      "
    >
        {children}
      </div>
    </div>,
    document.getElementById('modal-root') as HTMLElement
  );
};

export default Modal;
