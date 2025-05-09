import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

function FileUpload() {
  const [jsonData, setJsonData] = useState(null);

  // Initialize PDF.js worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        
        let pdfData = [];
        
        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const text = textContent.items.map(item => item.str).join(' ');
          pdfData.push({
            page: i,
            content: text
          });
        }
        
        // Convert to JSON
        const jsonResult = JSON.stringify(pdfData, null, 2);
        setJsonData(jsonResult);
        
      } catch (error) {
        console.error('Error parsing PDF:', error);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h2 className='text-black'>PDF to JSON Converter</h2>
      <input className='text-black'type="file" accept=".pdf" onChange={handleFileUpload} />
      
      {jsonData && (
        <div>
          <h3 className='text-black'>JSON Output:</h3>
          <pre className='text-black'>{jsonData}</pre>
          <button onClick={() => navigator.clipboard.writeText(jsonData)}>
            Copy to Clipboard
          </button>
        </div>
      )}
    </div>
  );
}

export default FileUpload;