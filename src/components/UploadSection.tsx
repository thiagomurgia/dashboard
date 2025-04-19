import React, { useState, useRef, useEffect } from 'react';
import { useTickets } from '../contexts/TicketsContext';

const UploadSection: React.FC = () => {
  const { uploadedFile, processExcelFile, errors, filteredData, originalData, forceUpdate } = useTickets();
  const [isDragging, setIsDragging] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    console.log('===== UPLOAD SECTION RENDERIZADO =====');
    console.log('uploadedFile:', uploadedFile);
    console.log('originalData:', originalData ? originalData.length : 0, 'registros');
    console.log('filteredData:', filteredData ? filteredData.length : 0, 'registros');
    console.log('forceUpdate:', forceUpdate);
    console.log('errors:', errors);
    console.log('ticketCount:', ticketCount);
  }, [uploadedFile, originalData, filteredData, forceUpdate, errors, ticketCount]);

  useEffect(() => {
    if (originalData && originalData.length > 0) {
      console.log('Atualizando contagem de tickets para:', originalData.length);
      setTicketCount(originalData.length);
    }
  }, [originalData]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      console.log('Arquivo recebido via drag-and-drop:', file.name);
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        processExcelFile(file);
      } else {
        console.error('Formato de arquivo inválido:', file.name);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log('Arquivo selecionado via input:', file.name);
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        processExcelFile(file);
      } else {
        console.error('Formato de arquivo inválido:', file.name);
      }
    }
  };

  const handleClick = () => {
    console.log('Clique no seletor de arquivo');
    fileInputRef.current?.click();
  };

  const handleReload = () => {
    console.log('Solicitando novo upload de arquivo');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="card">
      <h2 className="card-header">Upload de Planilhas</h2>
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer mb-4 ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".xlsx,.xls,.csv" 
          onChange={handleFileChange}
        />
        <p>Arraste e solte ou selecione um arquivo Excel</p>
      </div>

      {errors.upload && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-600">
          {errors.upload}
        </div>
      )}

      {uploadedFile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold">Arquivo carregado: {uploadedFile}</h3>
          <p>Total de {ticketCount} tickets processados com sucesso.</p>
        </div>
      )}

      {uploadedFile && (
        <div className="flex justify-center">
          <button 
            onClick={handleReload}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Carregar Nova Planilha
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadSection;
