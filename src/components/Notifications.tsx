// src/components/Notifications/Notifications.tsx
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Notifications: React.FC = () => (
  <ToastContainer
    position="bottom-center"
    autoClose={1500}
    hideProgressBar
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    theme="dark"
  />
);

export default Notifications;
