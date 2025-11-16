import React, { useState } from 'react';
import { type Invoice } from '../types';
import InvoicePreview from './InvoicePreview';
import { DownloadIcon } from './icons/ActionIcons';

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

interface PreviewScreenProps {
  invoice: Invoice;
  onBack: () => void;
}

const PreviewScreen: React.FC<PreviewScreenProps> = ({ invoice, onBack }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
      const invoicePreviewElement = document.getElementById('invoice-preview');
      if (!invoicePreviewElement) {
        console.error("Invoice preview element not found!");
        alert("Could not find the invoice content to download.");
        return;
      }
      
      setIsDownloading(true);

      try {
          const canvas = await window.html2canvas(invoicePreviewElement, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
          });
          
          const imgData = canvas.toDataURL('image/png');
          
          const { jsPDF } = window.jspdf;
          
          // A4 page dimensions in mm: 210 x 297
          const pdfWidth = 210;
          const pdfHeight = 297;
          
          const imgProps = {
            width: canvas.width,
            height: canvas.height,
          };
          const imgRatio = imgProps.height / imgProps.width;
          
          let finalImgWidth = pdfWidth;
          let finalImgHeight = pdfWidth * imgRatio;
          
          // If the scaled height is greater than the page height, it means the content is very long.
          // In this case, we'll scale by height instead to make sure it fits, even if it leaves more horizontal space.
          if (finalImgHeight > pdfHeight) {
            finalImgHeight = pdfHeight;
            finalImgWidth = pdfHeight / imgRatio;
          }

          // Center the image on the page
          const xOffset = (pdfWidth - finalImgWidth) / 2;
          const yOffset = (pdfHeight - finalImgHeight) / 2;
          
          const pdf = new jsPDF('p', 'mm', 'a4');
          pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalImgWidth, finalImgHeight);
          pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);

      } catch (error) {
          console.error("Error generating PDF:", error);
          alert("An error occurred while generating the PDF. Please try again.");
      } finally {
          setIsDownloading(false);
      }
  };

  return (
    <div className="preview-screen-container">
      <div className="preview-actions no-print">
        <button onClick={onBack} className="action-btn" style={{width: 'auto', padding: '0 1rem', borderRadius: '6px'}}>
          &larr; Back to Edit
        </button>
        <div className="header-actions">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="action-btn primary"
              style={{width: 'auto', padding: '0 1rem', borderRadius: '6px', gap: '0.5rem'}}
            >
              <DownloadIcon />
              <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
        </div>
      </div>
      <div className="invoice-preview-wrapper print-area">
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  );
};

export default PreviewScreen;