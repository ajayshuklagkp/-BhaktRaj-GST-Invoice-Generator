import React, { useState, useEffect } from 'react';
import { AppSettings, ClientDetails, SavedItem } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import CreateCustomerTab from './CreateCustomerTab';
import CreateItemTab from './CreateItemTab';
import { UserIcon } from './icons/UserIcon';
import { CubeIcon } from './icons/CubeIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
  savedCustomers: ClientDetails[];
  addCustomer: (customer: Omit<ClientDetails, 'id'>) => void;
  updateCustomer: (customer: ClientDetails) => void;
  deleteCustomer: (customerId: string) => void;
  savedItems: SavedItem[];
  addItem: (item: Omit<SavedItem, 'id'>) => void;
  updateItem: (item: SavedItem) => void;
  deleteItem: (itemId: string) => void;
}

type ActiveTab = 'company' | 'customers' | 'items' | 'developer';

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  updateSettings,
  savedCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  savedItems,
  addItem,
  updateItem,
  deleteItem,
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<ActiveTab>('company');
  const [logoError, setLogoError] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setLogoError(null);
      setSignatureError(null);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalSettings(prev => ({ ...prev, company: { ...prev.company, [e.target.name]: e.target.value } }));
  };
  
  const handleDefaultsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleFileChange = (field: 'logoUrl' | 'authorizedSignatureUrl') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const setError = field === 'logoUrl' ? setLogoError : setSignatureError;
    setError(null);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const MAX_SIZE_MB = 1;
      const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`Invalid file type. Please use JPG, PNG, GIF, or WEBP.`);
        e.target.value = '';
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        setError(`File is too large. Max size: ${MAX_SIZE_MB}MB.`);
        e.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLocalSettings(prev => ({
            ...prev,
            company: { ...prev.company, [field]: event.target!.result as string }
          }));
        }
      };
      reader.onerror = () => {
        setError('Error reading file. Please try again.');
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeFile = (field: 'logoUrl' | 'authorizedSignatureUrl') => () => {
     setLocalSettings(prev => ({
        ...prev,
        company: { ...prev.company, [field]: undefined }
     }));
     
     if (field === 'logoUrl') setLogoError(null);
     else setSignatureError(null);

     const fileInput = document.getElementById(field) as HTMLInputElement;
     if(fileInput) fileInput.value = '';
  };

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'company':
        return (
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
            <section>
              <h3>My Company Details</h3>
              <div className="modal-grid">
                 <input name="name" value={localSettings.company.name} onChange={handleCompanyChange} placeholder="e.g., Your Company Pvt. Ltd." className="modal-input" />
                 <input name="email" value={localSettings.company.email} onChange={handleCompanyChange} placeholder="e.g., contact@yourcompany.com" className="modal-input" />
                 <input name="phone" value={localSettings.company.phone} onChange={handleCompanyChange} placeholder="e.g., +91-9876543210" className="modal-input" />
                 <input name="gstin" value={localSettings.company.gstin} onChange={handleCompanyChange} placeholder="e.g., 22AAAAA0000A1Z5" className="modal-input" />
                 <textarea name="address" value={localSettings.company.address} onChange={handleCompanyChange} placeholder="e.g., 123 Business Avenue, Metro City, State, 12345" className="modal-textarea modal-grid-span-2" rows={3}></textarea>
                 <textarea name="paymentDetails" value={localSettings.company.paymentDetails || ''} onChange={handleCompanyChange} placeholder="e.g., Bank: Example Bank&#10;Account No: 1234567890&#10;IFSC: EXBK0001234" className="modal-textarea modal-grid-span-2" rows={4}></textarea>
                 <div className="modal-grid-span-2">
                   <label className="block text-sm font-medium text-gray-600 mb-1">Default Logo</label>
                   <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      {localSettings.company.logoUrl && <img src={localSettings.company.logoUrl} alt="Logo" style={{height: '2.5rem', width: 'auto', objectFit: 'contain', border: '1px solid #eee', padding: '0.25rem', borderRadius: '4px'}} />}
                      <input type="file" id="logoUrl" onChange={handleFileChange('logoUrl')} style={{fontSize: '0.875rem', color: '#6b7280'}}/>
                      {localSettings.company.logoUrl && <button onClick={removeFile('logoUrl')}><TrashIcon /></button>}
                   </div>
                   {logoError && <p style={{fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem'}}>{logoError}</p>}
                 </div>
                 <div className="modal-grid-span-2">
                   <label className="block text-sm font-medium text-gray-600 mb-1">Default Signature</label>
                   <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      {localSettings.company.authorizedSignatureUrl && <img src={localSettings.company.authorizedSignatureUrl} alt="Signature" style={{height: '2.5rem', width: '5rem', objectFit: 'contain', border: '1px solid #eee', padding: '0.25rem', borderRadius: '4px'}} />}
                      <input type="file" id="authorizedSignatureUrl" onChange={handleFileChange('authorizedSignatureUrl')} style={{fontSize: '0.875rem', color: '#6b7280'}}/>
                      {localSettings.company.authorizedSignatureUrl && <button onClick={removeFile('authorizedSignatureUrl')}><TrashIcon /></button>}
                   </div>
                   {signatureError && <p style={{fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem'}}>{signatureError}</p>}
                 </div>
              </div>
            </section>
            <section>
              <h3>Invoice Defaults</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Default Notes</label>
                  <textarea name="notes" value={localSettings.notes} onChange={handleDefaultsChange} placeholder="e.g., Thank you for your business." className="modal-textarea" rows={3}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Default Terms & Conditions</label>
                  <textarea name="terms" value={localSettings.terms} onChange={handleDefaultsChange} placeholder="e.g., Payment is due within 15 days." className="modal-textarea" rows={3}></textarea>
                </div>
              </div>
            </section>
          </div>
        );
      case 'customers':
        return <CreateCustomerTab savedCustomers={savedCustomers} addCustomer={addCustomer} updateCustomer={updateCustomer} deleteCustomer={deleteCustomer} />;
      case 'items':
        return <CreateItemTab savedItems={savedItems} addItem={addItem} updateItem={updateItem} deleteItem={deleteItem} />;
      case 'developer':
        return (
          <section>
            <h3>Developer Support</h3>
            <div style={{backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '8px'}}>
                <p style={{color: '#000', marginBottom: '1rem'}}>This application was developed by BhaktRaj. Have questions, feedback, or need custom features? Feel free to reach out!</p>
                <a href="https://wa.me/919716459716" target="_blank" rel="noopener noreferrer" style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#25D366', color: 'white', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '8px', textDecoration: 'none'}}>
                    <WhatsAppIcon />
                    <span>Contact on WhatsApp</span>
                </a>
                <p style={{fontSize: '0.75rem', color: '#000', marginTop: '1rem'}}>Visit <a href="https://bhaktraj.in" target="_blank" rel="noopener noreferrer" style={{color: '#4f46e5', textDecoration: 'underline'}}>bhaktraj.in</a> for more information.</p>
            </div>
          </section>
        );
      default:
        return null;
    }
  };


  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Settings</h2>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close settings">&times;</button>
        </div>
        
        <div className="modal-body">
          <nav className="modal-tabs-nav">
              <button onClick={() => setActiveTab('company')} className={`modal-tab-btn ${activeTab === 'company' ? 'active' : ''}`}>
                Company Details
              </button>
              <button onClick={() => setActiveTab('customers')} className={`modal-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}>
                <UserIcon /> Create Customer
              </button>
              <button onClick={() => setActiveTab('items')} className={`modal-tab-btn ${activeTab === 'items' ? 'active' : ''}`}>
                <CubeIcon /> Create Item
              </button>
              <button onClick={() => setActiveTab('developer')} className={`modal-tab-btn ${activeTab === 'developer' ? 'active' : ''}`}>
                Developer Support
              </button>
          </nav>
          
          <div className="modal-tab-content">
            {renderTabContent()}
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="modal-btn modal-btn-default">Cancel</button>
          <button onClick={handleSave} className="modal-btn modal-btn-primary">Save Settings</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;