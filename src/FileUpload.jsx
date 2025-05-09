import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

function FileUpload() {
  const [jsonData, setJsonData] = useState(null);

  // Initialize PDF.js worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonData)
      .then(() => alert('JSON copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">PDF to JSON Converter</h2>
      <input 
        type="file" 
        accept=".pdf" 
        onChange={handleFileUpload}
        className="mb-4 block w-full text-sm text-gray-500 border-2 border-black
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      
      {jsonData && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">JSON Output:</h3>
            <button 
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Copy to Clipboard
            </button>
          </div>
          <div className="border rounded-md p-4 bg-gray-50">
            <pre className="max-h-96 overflow-auto p-2 bg-white border rounded text-sm font-serif">
              {jsonData}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;