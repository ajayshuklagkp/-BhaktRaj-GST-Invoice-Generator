import { useState, useEffect } from 'react';
import { type ClientDetails } from '../types';

const STORAGE_KEY = 'gst-invoice-customers';

export const useSavedCustomers = (): [
  ClientDetails[],
  (customer: Omit<ClientDetails, 'id'>) => void,
  (customer: ClientDetails) => void,
  (customerId: string) => void
] => {
  const [customers, setCustomers] = useState<ClientDetails[]>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse customers from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    } catch (error) {
      console.error("Failed to save customers to localStorage", error);
    }
  }, [customers]);

  const addCustomer = (customer: Omit<ClientDetails, 'id'>) => {
    const newCustomer = { ...customer, id: crypto.randomUUID() };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (updatedCustomer: ClientDetails) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  };

  return [customers, addCustomer, updateCustomer, deleteCustomer];
};
