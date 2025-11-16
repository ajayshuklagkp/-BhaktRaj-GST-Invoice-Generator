import { type Invoice, GstType, type AppSettings } from './types';

export const formatDate = (date: Date): string => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
};

export const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
};


export const generateBlankInvoice = (settings: AppSettings): Invoice => {
  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 15);

  return {
    invoiceNumber: 'INV-001',
    date: formatDate(today),
    dueDate: formatDate(dueDate),
    company: settings.company,
    client: {name: '', address: '', gstin: '', email: '', phone: ''},
    items: [],
    gstType: GstType.IGST,
    notes: settings.notes,
    terms: settings.terms,
  };
};