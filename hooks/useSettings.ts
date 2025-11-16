import { useState, useEffect } from 'react';
import { type AppSettings, type CompanyDetails } from '../types';

const emptyCompanyDetails: CompanyDetails = {
  name: '',
  address: '',
  gstin: '',
  email: '',
  phone: '',
  logoUrl: undefined,
  authorizedSignatureUrl: undefined,
  paymentDetails: '',
};

const initialSettings: AppSettings = {
  company: emptyCompanyDetails,
  notes: 'Thank you for your business. We look forward to working with you again.',
  terms: 'Payment is due within 15 days of the invoice date.',
};

export const useSettings = (): [AppSettings, (settings: AppSettings) => void] => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const savedSettings = window.localStorage.getItem('gst-invoice-settings');
      if (savedSettings) {
        // Basic validation to merge and ensure all keys exist
        const parsed = JSON.parse(savedSettings);
        return {
          ...initialSettings,
          ...parsed,
          company: {
            ...initialSettings.company,
            ...parsed.company,
          },
        };
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
    }
    return initialSettings;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('gst-invoice-settings', JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);

  return [settings, setSettings];
};