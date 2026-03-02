'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import LandingPage from './components/home';
import Header from './components/Header';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <>

    <Header/>
    <LandingPage /></>
  );
}