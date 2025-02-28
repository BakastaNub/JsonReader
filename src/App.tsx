'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Clipboard, FileJson } from 'lucide-react';
import './index.css';

export default function Home() {
  const [theme, setTheme] = useState('light');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [issuerName, setIssuerName] = useState('');
  const [shoppingCenter, setShoppingCenter] = useState('');
  const [description, setDescription] = useState('');
  const [processedData, setProcessedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const processJsonFile = async (selectedFile: File) => {
    setIsLoading(true);
    setError('');
    setProcessedData(null); // Resetear los datos procesados

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('issuerName', '');
    formData.append('shoppingCenter', '');
    formData.append('description', ''); // Enviamos descripción vacía inicialmente

    try {
      const response = await fetch('66.241.124.7/process-json', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al procesar el archivo JSON.');
      }

      const data = await response.json();
      setProcessedData(data);
      setIssuerName(data.nombreCliente); // Actualizar el nombre del emisor con el nuevo JSON
      setShoppingCenter(data.centroComercial); // Actualizar el centro comercial con el nuevo JSON
      setDescription(data.descripcion); // Actualizar la descripción con el nuevo JSON
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error desconocido al procesar el archivo.'
      );
      setProcessedData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type === 'application/json' ||
        selectedFile.name.endsWith('.json')
      ) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError('');
        await processJsonFile(selectedFile);
      } else {
        setError('Por favor, selecciona un archivo JSON válido.');
        setFile(null);
        setFileName('');
        setProcessedData(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (
        droppedFile.type === 'application/json' ||
        droppedFile.name.endsWith('.json')
      ) {
        setFile(droppedFile);
        setFileName(droppedFile.name);
        setError('');
        await processJsonFile(droppedFile);
      } else {
        setError('Por favor, selecciona un archivo JSON válido.');
        setFile(null);
        setFileName('');
        setProcessedData(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Por favor, selecciona un archivo JSON.');
      return;
    }

    if (!issuerName.trim()) {
      setError('Por favor, ingresa el nombre del emisor.');
      return;
    }

    if (!shoppingCenter.trim()) {
      setError('Por favor, ingresa el centro comercial.');
      return;
    }

    if (!description.trim()) {
      setError('Por favor, ingresa la descripción.');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('issuerName', issuerName);
    formData.append('shoppingCenter', shoppingCenter);
    formData.append('description', description);

    try {
      const response = await fetch('http://localhost:5000/process-json', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al procesar el archivo JSON.');
      }

      const data = await response.json();
      setProcessedData(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error desconocido al procesar el archivo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (processedData) {
      const formattedText = `Nombre del cliente: ${processedData.nombreCliente}
Centro Comercial: ${processedData.centroComercial}
Fecha de pago: ${processedData.fechaPago}
Hora de pago: ${processedData.horaPago}
Modelo de la placa: ${processedData.modeloPlaca}

Descripción del caso:
${processedData.descripcion}`;

      navigator.clipboard
        .writeText(formattedText)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          setError('No se pudo copiar al portapapeles.');
        });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <main className='container'>
      <div
        className='theme-toggle'
        onClick={toggleTheme}
      >
        {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
      </div>

      <div className='card'>
        <h1>Procesador de Archivos JSON</h1>

        <div
          className='file-upload-area'
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <FileJson size={48} />
          <p>
            Arrastra y suelta tu archivo JSON aquí o haz clic para seleccionar
          </p>
          {fileName && <p className='file-name'>{fileName}</p>}
          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            accept='.json,application/json'
            className='file-input'
          />
        </div>

        {processedData && (
          <>
            <div className='results-container'>
              <h2>Información del JSON</h2>
              <div className='json-display'>
                <div className='result-item'>
                  <strong>Nombre del cliente:</strong>{' '}
                  {processedData.nombreCliente}
                </div>
                <div className='result-item'>
                  <strong>Centro Comercial:</strong>{' '}
                  {processedData.centroComercial}
                </div>
                <div className='result-item'>
                  <strong>Fecha de pago:</strong> {processedData.fechaPago}
                </div>
                <div className='result-item'>
                  <strong>Hora de pago:</strong> {processedData.horaPago}
                </div>
                <div className='result-item model-plate'>
                  <strong>Modelo de la placa:</strong>{' '}
                  {processedData.modeloPlaca}
                </div>
                {processedData.descripcion && (
                  <div className='result-item case-description'>
                    <strong>Descripción del caso:</strong>
                    <p>{processedData.descripcion}</p>
                  </div>
                )}
              </div>
            </div>
            {processedData && (
              <button
                className='copy-button'
                onClick={copyToClipboard}
              >
                <Clipboard size={16} />
                {copied ? '¡Copiado!' : 'Copiar al Portapapeles'}
              </button>
            )}

            <form
              onSubmit={handleSubmit}
              className='description-form'
            >
              <div className='form-group'>
                <label htmlFor='issuerName'>Nombre del Emisor:</label>
                <input
                  type='text'
                  id='issuerName'
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                  placeholder='Ingresa el nombre del emisor'
                />
              </div>

              <div className='form-group'>
                <label htmlFor='shoppingCenter'>Centro Comercial:</label>
                <input
                  type='text'
                  id='shoppingCenter'
                  value={shoppingCenter}
                  onChange={(e) => setShoppingCenter(e.target.value)}
                  placeholder='Ingresa el centro comercial'
                />
              </div>

              <div className='form-group'>
                <label htmlFor='description'>Descripción del caso:</label>
                <textarea
                  id='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Ingresa la descripción detallada del caso'
                  className='description-textarea'
                  rows={4}
                />
              </div>

              <button
                type='submit'
                className='submit-button'
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : 'Agregar Descripción del Caso'}
              </button>
            </form>
          </>
        )}

        {error && <div className='error-message'>{error}</div>}
      </div>
    </main>
  );
}
