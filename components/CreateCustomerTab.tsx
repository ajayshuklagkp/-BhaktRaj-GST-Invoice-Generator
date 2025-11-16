import React, { useState, useEffect } from 'react';
import { ClientDetails } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface CreateCustomerTabProps {
  savedCustomers: ClientDetails[];
  addCustomer: (customer: Omit<ClientDetails, 'id'>) => void;
  updateCustomer: (customer: ClientDetails) => void;
  deleteCustomer: (customerId: string) => void;
}

const BLANK_CUSTOMER: Omit<ClientDetails, 'id'> = {
  name: '', address: '', gstin: '', email: '', phone: ''
};

const CreateCustomerTab: React.FC<CreateCustomerTabProps> = ({ savedCustomers, addCustomer, updateCustomer, deleteCustomer }) => {
  const [formData, setFormData] = useState<ClientDetails>({...BLANK_CUSTOMER});
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCustomer({ ...formData, id: editingId });
    } else {
      addCustomer(formData);
    }
    setFormData({...BLANK_CUSTOMER});
    setEditingId(null);
  };

  const handleEdit = (customer: ClientDetails) => {
    setEditingId(customer.id!);
    setFormData(customer);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({...BLANK_CUSTOMER});
  };

  return (
    <div>
      <section className="modal-form-section">
        <h3>{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="modal-grid" style={{gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Customer Name" className="modal-input" required />
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="modal-input" required />
            <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Phone" className="modal-input" />
            <input name="gstin" value={formData.gstin} onChange={handleChange} placeholder="GSTIN" className="modal-input" />
            <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="modal-textarea modal-grid-span-2" rows={3}></textarea>
          </div>
          <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
            <button type="submit" className="modal-btn modal-btn-primary">{editingId ? 'Update' : 'Save'}</button>
            {editingId && <button type="button" onClick={handleCancelEdit} className="modal-btn modal-btn-default">Cancel</button>}
          </div>
        </form>
      </section>

      <section>
        <h3>Saved Customers</h3>
        <div className="modal-list">
          {savedCustomers.length > 0 ? (
            savedCustomers.map(customer => (
              <div key={customer.id} className="modal-list-item">
                <div>
                  <p><strong>{customer.name}</strong></p>
                  <p style={{fontSize: '0.8rem', color: '#6b7280'}}>{customer.email}</p>
                </div>
                <div className="modal-list-actions">
                  <button onClick={() => handleEdit(customer)} title="Edit"><EditIcon /></button>
                  <button onClick={() => deleteCustomer(customer.id!)} title="Delete"><TrashIcon /></button>
                </div>
              </div>
            ))
          ) : (
            <p style={{textAlign: 'center', padding: '1rem', color: '#6b7280'}}>No customers saved yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default CreateCustomerTab;
