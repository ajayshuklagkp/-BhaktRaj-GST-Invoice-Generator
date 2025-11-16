import React, { useState } from 'react';
import { type Invoice, type LineItem, GstType, ClientDetails, SavedItem } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { formatDate } from '../constants';

interface InvoiceFormProps {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
  errors: Record<string, string>;
  savedCustomers: ClientDetails[];
  savedItems: SavedItem[];
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, setInvoice, errors, savedCustomers, savedItems }) => {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SavedItem[]>([]);

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoice(prev => ({ ...prev, client: { ...prev.client, [name]: value, id: undefined } })); // Clear ID on manual edit
  };

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    const selectedCustomer = savedCustomers.find(c => c.id === customerId);
    if (selectedCustomer) {
      setInvoice(prev => ({ ...prev, client: selectedCustomer }));
    } else {
      setInvoice(prev => ({ ...prev, client: { id: '', name: '', address: '', gstin: '', email: '', phone: '' } }));
    }
  };
  
  const handleInvoiceMetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'date') {
      const newInvoiceDate = new Date(value);
      const correctedDate = new Date(newInvoiceDate.valueOf() + newInvoiceDate.getTimezoneOffset() * 60 * 1000);
      
      const newDueDate = new Date(correctedDate);
      newDueDate.setDate(correctedDate.getDate() + 15);
      
      setInvoice(prev => ({
        ...prev,
        date: value,
        dueDate: formatDate(newDueDate)
      }));
    } else {
      setInvoice(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleItemChange = (id: string, field: keyof Omit<LineItem, 'id'>, value: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const numericValue = ['quantity', 'rate', 'gstRate'].includes(field) ? parseFloat(value) || 0 : value;
          return { ...item, [field]: numericValue };
        }
        return item;
      })
    }));
  };
  
  const handleItemBlur = (id: string, field: 'quantity' | 'rate') => {
    setInvoice(prev => ({
        ...prev,
        items: prev.items.map(item => {
            if (item.id === id) {
                const currentVal = item[field]
                const newVal = typeof currentVal === 'number' ? currentVal : parseFloat(String(currentVal))
                return { ...item, [field]: parseFloat(newVal.toFixed(2)) };
            }
            return item;
        })
    }));
  };

  const handleDescriptionChange = (id: string, value: string) => {
    // Update invoice state for the description
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, description: value } : item
      )
    }));
  
    // Filter and show suggestions
    if (value.length > 1) {
      const filtered = savedItems.filter(s =>
        s.description.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (itemId: string, suggestion: SavedItem) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId
          ? {
              ...item,
              description: suggestion.description,
              rate: suggestion.rate,
              gstRate: suggestion.gstRate,
              quantity: 1,
            }
          : item
      )
    }));
    setSuggestions([]);
    setActiveItemId(null);
  };

  const addItem = () => {
    const newItem: LineItem = { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, gstRate: 18 };
    setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setInvoice(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  };
  
  const handleGstChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'gstType') {
      setInvoice(prev => ({ ...prev, gstType: value as GstType }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInvoice(prev => ({
            ...prev,
            company: { ...prev.company, logoUrl: event.target!.result as string }
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setInvoice(prev => ({
      ...prev,
      company: { ...prev.company, logoUrl: undefined }
    }));
  };
  
  return (
    <div className="invoice-form-container">
        <section className="form-section form-section-header">
            <div className="logo-uploader">
                {invoice.company.logoUrl ? (
                  <div className="logo-preview-container">
                      <img src={invoice.company.logoUrl} alt="Company Logo" className="logo-preview" />
                      <button onClick={removeLogo} className="remove-logo-btn" title="Remove Logo">
                          <TrashIcon/>
                      </button>
                  </div>
                ) : (
                    <label className="add-logo">
                        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                        <span className="add-logo-label">
                            <svg data-name="Layer 1" viewBox="0 0 512 512"><path d="M340.7061,253.5177a21.0039,21.0039,0,0,1-29.7,0l-37.36-37.37v130.4a21,21,0,1,1-42,0v-130.4l-37.37,37.37a21.0011,21.0011,0,1,1-29.7-29.7l73.22-73.22a21.0035,21.0035,0,0,1,29.7,0l73.21,73.22A21.0041,21.0041,0,0,1,340.7061,253.5177Z"/><path d="M439.086,400.7277a20.9985,20.9985,0,1,1-33.43-25.42,192.0478,192.0478,0,0,0-17.24-251.77c-74.85-74.87-196.66-74.88-271.53-.03a192.0528,192.0528,0,0,0-17.29,251.76,20.9985,20.9985,0,1,1-33.43,25.42,234.019,234.019,0,0,1,186.47-375.4h.03a234.0221,234.0221,0,0,1,186.42,375.44Z"/><path d="M485.6461,470.0377a21.0039,21.0039,0,0,1-21,21h-424a21,21,0,0,1,0-42h424A21.004,21.004,0,0,1,485.6461,470.0377Z"/></svg>
                            <span>Upload Logo</span>
                        </span>
                    </label>
                )}
            </div>
            <div style={{width: "50%"}}>
                <input className="form-input invoice-title-input" type="text" value="TAX INVOICE" readOnly />
            </div>
        </section>

        <section className="form-section billing-details-section">
            <div className="billing-col">
                <span className="form-input bill-to-label">Bill To:</span>
                <select 
                    className="form-select" 
                    onChange={handleCustomerSelect} 
                    value={invoice.client.id || ''} 
                    style={{border: "1px dotted #e3e3e3", marginBottom: '0.5rem'}}
                >
                  <option value="">-- Select a saved customer --</option>
                  {savedCustomers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
                <input className="form-input" placeholder="Your Client's Company" value={invoice.client.name} name="name" onChange={handleClientChange} />
                <input className="form-input" placeholder="Client's GSTIN" value={invoice.client.gstin} name="gstin" onChange={handleClientChange} />
                <textarea className="form-textarea" placeholder="Client's Address" value={invoice.client.address} name="address" onChange={handleClientChange} rows={3}></textarea>
                 <input className="form-input" placeholder="Client's Email" value={invoice.client.email} name="email" type="email" onChange={handleClientChange} />
                 <input className="form-input" placeholder="Client's Phone" value={invoice.client.phone} name="phone" type="tel" onChange={handleClientChange} />
            </div>
            <div className="billing-col">
                <table className="invoice-meta-table">
                    <tbody>
                        <tr>
                            <td><input className="form-input" value="Invoice#" readOnly /></td>
                            <td><input className="form-input" name="invoiceNumber" value={invoice.invoiceNumber} onChange={handleInvoiceMetaChange}/></td>
                        </tr>
                        <tr>
                            <td><input className="form-input" value="Invoice Date" readOnly /></td>
                            <td><input className="form-input date-field" name="date" type="date" value={invoice.date} onChange={handleInvoiceMetaChange} /></td>
                        </tr>
                        <tr>
                            <td><input className="form-input" value="Due Date" readOnly /></td>
                            <td><input className="form-input date-field" name="dueDate" type="date" value={invoice.dueDate} onChange={handleInvoiceMetaChange} /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
        
        <section className="form-section">
            <table className="items-table">
                <thead>
                    <tr>
                        <th style={{width: "40%"}}>Item Description</th>
                        <th style={{width: "10%"}} className="text-right">Qty</th>
                        <th style={{width: "15%"}} className="text-right">Rate</th>
                        <th style={{width: "15%"}} className="text-right">GST %</th>
                        <th style={{width: "15%"}} className="text-right">Amount</th>
                        <th style={{width: "5%"}}></th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.map(item => (
                        <tr key={item.id}>
                            <td data-label="Item" style={{position: 'relative'}}>
                                <textarea
                                  className="form-textarea"
                                  value={item.description}
                                  onChange={e => handleDescriptionChange(item.id, e.target.value)}
                                  onFocus={() => {
                                    setActiveItemId(item.id);
                                    if (item.description.length > 1) {
                                      setSuggestions(savedItems.filter(s => s.description.toLowerCase().includes(item.description.toLowerCase())));
                                    }
                                  }}
                                  onBlur={() => setTimeout(() => { setActiveItemId(null); setSuggestions([]); }, 150)}
                                  placeholder="Item name/description"
                                  autoComplete="off"
                                  rows={2}
                                />
                                {activeItemId === item.id && suggestions.length > 0 && (
                                  <ul style={{position: 'absolute', zIndex: 10, width: '100%', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', marginTop: '2px', maxHeight: '150px', overflowY: 'auto'}}>
                                    {suggestions.map((suggestion, index) => (
                                      <li 
                                        key={index} 
                                        style={{padding: '8px', cursor: 'pointer'}} 
                                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                                        onMouseDown={() => handleSuggestionClick(item.id, suggestion)}>
                                        {suggestion.description}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                            </td>
                            <td data-label="Qty"><input type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} onBlur={() => handleItemBlur(item.id, 'quantity')} placeholder="Qty" className="form-input text-right" /></td>
                            <td data-label="Rate"><input type="number" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', e.target.value)} onBlur={() => handleItemBlur(item.id, 'rate')} placeholder="Rate" className="form-input text-right" /></td>
                            <td data-label="GST %">
                                <select value={item.gstRate} onChange={e => handleItemChange(item.id, 'gstRate', e.target.value)} className="form-select text-right">
                                    <option value="0">0%</option>
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18">18%</option>
                                    <option value="28">28%</option>
                                </select>
                            </td>
                            <td data-label="Amount" className="text-right amount-cell">{(item.quantity * item.rate).toFixed(2)}</td>
                            <td data-label="Remove" className="text-right">
                                <button onClick={() => removeItem(item.id)} className="remove-item-btn">
                                    <TrashIcon />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={addItem} className="add-item-btn">
                <PlusIcon />
                <span>Add Line Item</span>
            </button>
        </section>

        <section className="form-section">
           <div>
            <label htmlFor="gstType" style={{display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem"}}>GST Type (for Totals)</label>
            <select name="gstType" id="gstType" value={invoice.gstType} onChange={handleGstChange} className="form-select" style={{ border: "1px dotted #e3e3e3", width: "50%" }}>
              <option value={GstType.IGST}>IGST (Inter-state)</option>
              <option value={GstType.CGST_SGST}>CGST/SGST (Intra-state)</option>
            </select>
          </div>
        </section>

        <section className="notes-terms-section">
            <div>
                <h3>Notes</h3>
                <textarea className="form-textarea" name="notes" value={invoice.notes} onChange={(e) => setInvoice(p => ({...p, notes: e.target.value}))} />
            </div>
             <div style={{marginTop: "1rem"}}>
                <h3>Terms & Conditions</h3>
                <textarea className="form-textarea" name="terms" value={invoice.terms} onChange={(e) => setInvoice(p => ({...p, terms: e.target.value}))} />
            </div>
        </section>
    </div>
  );
};

export default InvoiceForm;