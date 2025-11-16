import React, { useState } from 'react';
import { SavedItem } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface CreateItemTabProps {
  savedItems: SavedItem[];
  addItem: (item: Omit<SavedItem, 'id'>) => void;
  updateItem: (item: SavedItem) => void;
  deleteItem: (itemId: string) => void;
}

const BLANK_ITEM: Omit<SavedItem, 'id'> = {
  description: '', rate: 0, gstRate: 18
};

const CreateItemTab: React.FC<CreateItemTabProps> = ({ savedItems, addItem, updateItem, deleteItem }) => {
  const [formData, setFormData] = useState<Omit<SavedItem, 'id'>>({...BLANK_ITEM});
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['rate', 'gstRate'].includes(name);
    setFormData(prev => ({...prev, [name]: isNumeric ? parseFloat(value) || 0 : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateItem({ ...formData, id: editingId });
    } else {
      addItem(formData);
    }
    setFormData({...BLANK_ITEM});
    setEditingId(null);
  };

  const handleEdit = (item: SavedItem) => {
    setEditingId(item.id!);
    setFormData(item);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({...BLANK_ITEM});
  };

  return (
    <div>
      <section className="modal-form-section">
        <h3>{editingId ? 'Edit Item' : 'Add New Item'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="modal-grid" style={{gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'flex-end'}}>
            <div className="modal-grid-span-2">
              <label>Description</label>
              <input name="description" value={formData.description} onChange={handleChange} placeholder="Item description" className="modal-input" required />
            </div>
            <div>
              <label>Rate</label>
              <input name="rate" type="number" value={formData.rate} onChange={handleChange} placeholder="Rate" className="modal-input" required />
            </div>
             <div>
              <label>GST %</label>
              <select name="gstRate" value={formData.gstRate} onChange={handleChange} className="modal-input">
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18%</option>
                  <option value="28">28%</option>
              </select>
            </div>
          </div>
          <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
            <button type="submit" className="modal-btn modal-btn-primary">{editingId ? 'Update' : 'Save'}</button>
            {editingId && <button type="button" onClick={handleCancelEdit} className="modal-btn modal-btn-default">Cancel</button>}
          </div>
        </form>
      </section>

      <section>
        <h3>Saved Items</h3>
        <div className="modal-list">
          {savedItems.length > 0 ? (
            savedItems.map(item => (
              <div key={item.id} className="modal-list-item">
                <div>
                  <p><strong>{item.description}</strong></p>
                  <p style={{fontSize: '0.8rem', color: '#6b7280'}}>Rate: {item.rate.toFixed(2)} | GST: {item.gstRate}%</p>
                </div>
                <div className="modal-list-actions">
                  <button onClick={() => handleEdit(item)} title="Edit"><EditIcon /></button>
                  <button onClick={() => deleteItem(item.id!)} title="Delete"><TrashIcon /></button>
                </div>
              </div>
            ))
          ) : (
            <p style={{textAlign: 'center', padding: '1rem', color: '#6b7280'}}>No items saved yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default CreateItemTab;
