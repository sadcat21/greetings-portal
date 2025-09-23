import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/AdminDashboard';
import RealWorkerDashboard from '@/components/RealWorkerDashboard';
import Header from "@/components/Header";

const Index = () => {
  const { isAdmin } = useAuth();

  return (
    <div>
      <Header />
      {isAdmin ? <AdminDashboard /> : <RealWorkerDashboard />}
    </div>
  );
};

export default Index;
