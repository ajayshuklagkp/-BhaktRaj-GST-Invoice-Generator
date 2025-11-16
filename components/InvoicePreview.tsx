import React from 'react';
import { type Invoice, GstType } from '../types';
import { formatDateForDisplay } from '../constants';

interface InvoicePreviewProps {
  invoice: Invoice;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const subtotal = invoice.items.reduce((acc, item) => acc + item.quantity * item.rate, 0);

  const totalGst = invoice.items.reduce((acc, item) => {
    const itemTotal = item.quantity * item.rate;
    const gstAmount = itemTotal * (item.gstRate / 100);
    return acc + gstAmount;
  }, 0);
  
  let cgst = 0, sgst = 0, igst = 0;
  
  if (invoice.gstType === GstType.CGST_SGST) {
    cgst = totalGst / 2;
    sgst = totalGst / 2;
  } else {
    igst = totalGst;
  }
  
  const total = subtotal + totalGst;

  const numberToWords = (num: number): string => {
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    
    if (isNaN(num)) return '';
    if (num === 0) return 'zero';

    const inWords = (n: number): string => {
        let str = '';
        if (n >= 10000000) { str += inWords(Math.floor(n / 10000000)) + ' crore '; n %= 10000000; }
        if (n >= 100000) { str += inWords(Math.floor(n / 100000)) + ' lakh '; n %= 100000; }
        if (n >= 1000) { str += inWords(Math.floor(n / 1000)) + ' thousand '; n %= 1000; }
        if (n >= 100) { str += inWords(Math.floor(n / 100)) + ' hundred '; n %= 100; }
        if (n > 0) {
            if (str !== '' && n < 100) str += 'and ';
            if (n < 20) str += a[n];
            else {
                str += b[Math.floor(n / 10)];
                if (n % 10 > 0) str += '-' + a[n % 10];
            }
        }
        return str;
    };

    const [integerPart, decimalPart] = num.toFixed(2).split('.');
    let words = inWords(parseInt(integerPart));
    if (parseInt(decimalPart) > 0) {
        words += ' and ' + inWords(parseInt(decimalPart)) + ' paise';
    }
    return words.replace(/\s+/g, ' ').trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  return (
    <div id="invoice-preview" className="invoice-preview">
        {/* Header Section */}
        <header className="preview-header">
            <div className="preview-header-left">
                {invoice.company.logoUrl && <img src={invoice.company.logoUrl} alt="Company Logo" className="preview-logo" />}
                <h1 className="preview-company-name">{invoice.company.name || 'Your Company'}</h1>
                <p className="preview-company-address">{invoice.company.address}</p>
                <p className="preview-company-contact">{invoice.company.email} | {invoice.company.phone}</p>
            </div>
            <div className="preview-header-right">
                <h2 className="preview-title">Invoice</h2>
                <p className="preview-inv-number"># {invoice.invoiceNumber}</p>
            </div>
        </header>

        {/* Billing Info Section */}
        <section className="preview-billing-info">
            <div className="preview-billing-col">
                <h3 className="preview-billing-label">Bill To</h3>
                <p className="preview-client-name">{invoice.client.name || 'Client Name'}</p>
                <p className="preview-company-address">{invoice.client.address}</p>
                <p>GSTIN: {invoice.client.gstin}</p>
                <p>{invoice.client.email}</p>
                {invoice.client.phone && <p>{invoice.client.phone}</p>}
            </div>
            <div className="preview-billing-col">
                <table className="preview-meta-table">
                    <tbody>
                        <tr><td>Invoice Date:</td><td>{formatDateForDisplay(invoice.date)}</td></tr>
                        <tr><td>Due Date:</td><td>{formatDateForDisplay(invoice.dueDate)}</td></tr>
                        <tr><td>Company GSTIN:</td><td>{invoice.company.gstin}</td></tr>
                    </tbody>
                </table>
            </div>
        </section>
        
        {/* Items Table */}
        <section>
            <table className="preview-items-table items-table">
                <thead>
                    <tr>
                        <th style={{ width: '5%' }}>#</th>
                        <th>Item Description</th>
                        <th className="text-right" style={{ width: '10%' }}>Qty</th>
                        <th className="text-right" style={{ width: '15%' }}>Rate</th>
                        <th className="text-right" style={{ width: '15%' }}>GST %</th>
                        <th className="text-right" style={{ width: '20%' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                  {invoice.items.length > 0 ? invoice.items.map((item, index) => (
                    <tr key={item.id}>
                      <td data-label="#">{index + 1}</td>
                      <td data-label="Item">{item.description}</td>
                      <td data-label="Qty" className="text-right">{item.quantity}</td>
                      <td data-label="Rate" className="text-right">{item.rate.toFixed(2)}</td>
                      <td data-label="GST %" className="text-right">{item.gstRate}%</td>
                      <td data-label="Amount" className="text-right">₹{(item.quantity * item.rate).toFixed(2)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} style={{textAlign: 'center', color: '#888'}}>No items added yet.</td></tr>
                  )}
                </tbody>
            </table>
        </section>

        {/* Totals Section */}
        <section className="preview-totals">
            <div className="preview-totals-wrapper">
                <div className="preview-total-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {invoice.gstType === GstType.CGST_SGST && (
                  <>
                    <div className="preview-total-row">
                      <span>CGST</span>
                      <span>₹{cgst.toFixed(2)}</span>
                    </div>
                    <div className="preview-total-row">
                      <span>SGST</span>
                      <span>₹{sgst.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {invoice.gstType === GstType.IGST && (
                  <div className="preview-total-row">
                    <span>IGST</span>
                    <span>₹{igst.toFixed(2)}</span>
                  </div>
                )}
                 <div className="preview-total-row gst-total">
                  <span>Total GST</span>
                  <span>₹{totalGst.toFixed(2)}</span>
                </div>
                <div className="preview-grand-total">
                  <span>Grand Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
            </div>
        </section>

        {/* Amount in Words */}
        <section className="preview-words-section">
            <p className="label">Amount in words:</p>
            <p className="words">{numberToWords(total)} Only</p>
        </section>

        {/* Footer */}
        <footer className="preview-footer">
            <div className="preview-footer-grid">
                <div className="preview-footer-col">
                    {invoice.company.paymentDetails && (
                        <div style={{ marginBottom: '1rem' }}>
                            <h4>Payment Details</h4>
                            <p>{invoice.company.paymentDetails}</p>
                        </div>
                    )}
                    {invoice.notes && (
                        <div style={{ marginBottom: '1rem' }}>
                            <h4>Notes</h4>
                            <p>{invoice.notes}</p>
                        </div>
                    )}
                    {invoice.terms && (
                        <div>
                            <h4>Terms & Conditions</h4>
                            <p>{invoice.terms}</p>
                        </div>
                    )}
                </div>
                <div className="preview-footer-col signature">
                    <div style={{ textAlign: 'center' }}>
                        {invoice.company.authorizedSignatureUrl && (
                            <img src={invoice.company.authorizedSignatureUrl} alt="Authorized Signature" className="signature-img"/>
                        )}
                        <div className="signature-line"></div>
                        <p style={{ fontWeight: 500 }}>Authorized Signatory</p>
                        <p className="signature-name">{invoice.company.name}</p>
                    </div>
                </div>
            </div>
            <div className="preview-powered-by">
                <p>This is a computer-generated invoice and does not require a physical signature.</p>
                <p style={{marginTop: '0.5rem'}}>Powered by <a href="https://bhaktraj.in/" target="_blank" rel="noopener noreferrer">BhaktRaj GST Billing</a></p>
            </div>
        </footer>
    </div>
  );
};

export default InvoicePreview;