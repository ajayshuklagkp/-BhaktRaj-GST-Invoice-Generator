import React, { useState, useEffect } from 'react';
import InvoiceForm from './components/InvoiceForm';
import SettingsModal from './components/SettingsModal';
import PreviewScreen from './components/PreviewScreen';
import { type Invoice } from './types';
import { generateBlankInvoice } from './constants';
import { SettingsIcon } from './components/icons/SettingsIcon';
import { useSettings } from './hooks/useSettings';
import { useSavedCustomers } from './hooks/useSavedCustomers';
import { useSavedItems } from './hooks/useSavedItems';
import { ResetIcon } from './components/icons/ResetIcon';
import { PreviewIcon } from './components/icons/PreviewIcon';

const formatDate = (date: Date): string => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

const App: React.FC = () => {
  const [settings, updateSettings] = useSettings();
  const [savedCustomers, addCustomer, updateCustomer, deleteCustomer] = useSavedCustomers();
  const [savedItems, addItem, updateItem, deleteItem] = useSavedItems();

  const [invoice, setInvoice] = useState<Invoice>(() => generateBlankInvoice(settings));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form');

  // Sync settings changes to the current invoice
  useEffect(() => {
    setInvoice(prev => ({
      ...prev,
      company: settings.company,
      notes: settings.notes,
      terms: settings.terms,
    }));
  }, [settings]);


  const validateInvoice = (invoiceData: Invoice): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    const requiredError = "This field is required";

    // Invoice Details
    if (!invoiceData.invoiceNumber.trim()) newErrors.invoiceNumber = requiredError;
    if (!invoiceData.date) newErrors.date = requiredError;
    if (!invoiceData.dueDate) newErrors.dueDate = requiredError;
    
    // Bill From (from settings)
    if (!invoiceData.company.name.trim()) newErrors['company.name'] = requiredError;
    if (!invoiceData.company.address.trim()) newErrors['company.address'] = requiredError;
    if (!invoiceData.company.gstin.trim()) newErrors['company.gstin'] = requiredError;
    if (!invoiceData.company.email.trim()) newErrors['company.email'] = requiredError;
    if (!invoiceData.company.phone.trim()) newErrors['company.phone'] = requiredError;

    // Bill To
    if (!invoiceData.client.name.trim()) newErrors['client.name'] = requiredError;
    if (!invoiceData.client.address.trim()) newErrors['client.address'] = requiredError;
    if (!invoiceData.client.gstin.trim()) newErrors['client.gstin'] = requiredError;
    if (!invoiceData.client.email.trim()) newErrors['client.email'] = requiredError;
    
    return newErrors;
  }
  
  const handleResetInvoice = () => {
    if (window.confirm('Are you sure you want to reset the invoice? All current data will be lost.')) {
      setInvoice(generateBlankInvoice(settings));
      setErrors({});
    }
  };

  const handlePreview = () => {
    const validationErrors = validateInvoice(invoice);
    
    const companyErrorsExist = Object.keys(validationErrors).some(key => key.startsWith('company.'));
    
    if (companyErrorsExist) {
        alert('Please fill in your company details in the Settings panel before generating an invoice.');
        setErrors({}); // Clear form errors, as the issue is in settings
        setIsSettingsOpen(true); // Open settings for the user
        return;
    }
    
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      alert('Please fill in all required fields on the form.');
      return;
    }
    
    setViewMode('preview');
  };

  return (
    <div className="app-container">
       {viewMode === 'form' && (
          <header className="app-header no-print">
            <a
              href="https://bhaktraj.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="logo"
            >
              BhaktRaj GST Billing
            </a>
            <div className="header-actions">
              <button
                onClick={handleResetInvoice}
                className="action-btn danger"
                aria-label="Reset Invoice"
                title="Reset Invoice"
              >
                <ResetIcon />
              </button>
              <button
                onClick={handlePreview}
                className="action-btn primary"
                aria-label="Preview Invoice"
                title="Preview Invoice"
              >
                <PreviewIcon />
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="action-btn secondary"
                aria-label="Open settings"
                title="Settings"
              >
                <SettingsIcon />
              </button>
            </div>
          </header>
        )}
      
      <main className="main-content">
        {viewMode === 'form' ? (
            <div className="invoice-form-wrapper no-print">
              <InvoiceForm 
                invoice={invoice} 
                setInvoice={setInvoice} 
                errors={errors}
                savedCustomers={savedCustomers}
                savedItems={savedItems}
              />
            </div>
        ) : (
            <PreviewScreen 
              invoice={invoice}
              onBack={() => {
                setViewMode('form');
                setErrors({});
              }}
            />
        )}
      </main>
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        updateSettings={updateSettings}
        savedCustomers={savedCustomers}
        addCustomer={addCustomer}
        updateCustomer={updateCustomer}
        deleteCustomer={deleteCustomer}
        savedItems={savedItems}
        addItem={addItem}
        updateItem={updateItem}
        deleteItem={deleteItem}
      />
    </div>
  );
};

export default App;