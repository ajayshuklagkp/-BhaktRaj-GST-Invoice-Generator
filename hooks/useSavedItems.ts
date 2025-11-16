import { useState, useEffect } from 'react';
import { type SavedItem } from '../types';

const STORAGE_KEY = 'gst-invoice-items';

export const useSavedItems = (): [
  SavedItem[],
  (item: Omit<SavedItem, 'id'>) => void,
  (item: SavedItem) => void,
  (itemId: string) => void
] => {
  const [items, setItems] = useState<SavedItem[]>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse items from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save items to localStorage", error);
    }
  }, [items]);

  const addItem = (item: Omit<SavedItem, 'id'>) => {
    const newItem = { ...item, id: crypto.randomUUID() };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (updatedItem: SavedItem) => {
    setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const deleteItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  return [items, addItem, updateItem, deleteItem];
};
