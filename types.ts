export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  gstRate: number; // in percentage
}

export interface SavedItem {
  id: string;
  description: string;
  rate: number;
  gstRate: number;
}

export interface CompanyDetails {
  name: string;
  address: string;
  gstin: string;
  logoUrl?: string;
  email: string;
  phone: string;
  authorizedSignatureUrl?: string;
  paymentDetails?: string;
}

export interface ClientDetails {
  id?: string;
  name:string;
  address: string;
  gstin: string;
  email: string;
  phone: string;
}

export enum GstType {
  CGST_SGST = 'CGST_SGST',
  IGST = 'IGST',
}

export interface Invoice {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  company: CompanyDetails;
  client: ClientDetails;
  items: LineItem[];
  gstType: GstType;
  notes: string;
  terms: string;
}

export interface AppSettings {
  company: CompanyDetails;
  notes: string;
  terms: string;
}