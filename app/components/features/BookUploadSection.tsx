'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

interface UploadResponse {
  id: string;
  message: string;
  title: string;
}

interface UploadedFile {
  name: string;
  title: string;
  author: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function BookUploadSection() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [isType, setIsType] = useState<'textbook' | 'past-paper' | 'novel' | 'reference'>('textbook');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [batchMode, setBatchMode] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (batchMode) {
        setFiles(Array.from(e.target.files));
        setUploadedFiles(Array.from(e.target.files).map(f => ({
          name: f.name,
          title: f.name.replace(/\.[^/.]+$/, ""),
          author: '',
          status: 'pending',
          progress: 0
        })));
      } else {
        setFiles([e.target.files[0]]);
      }
    }
  };

  const handleTitleChange = (index: number, newTitle: string) => {
    const updated = [...uploadedFiles];
    updated[index].title = newTitle;
    setUploadedFiles(updated);
  };

  const handleAuthorChange = (index: number, newAuthor: string) => {
    const updated = [...uploadedFiles];
    updated[index].author = newAuthor;
    setUploadedFiles(updated);
  };

  const handleSingleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!files.length || !title) {
      setMessage('❌ Please select a file and enter a title');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('title', title);
      formData.append('author', author);
      formData.append('description', description || `${isType === 'textbook' ? 'Textbook' : isType === 'past-paper' ? 'Past Paper' : 'Novel'}: ${title}`);
      formData.append('userId', 'current-user');
      formData.append('type', isType);

      const response = await fetch('/api/books', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setFiles([]);
        setTitle('');
        setAuthor('');
        setDescription('');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const errorMsg = (data as any).error || (data as any).message || 'Unknown error';
        setMessage(`❌ Upload failed: ${errorMsg}`);
      }
    } catch (error) {
      setMessage(`❌ Error uploading file: ${String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (uploadedFiles.length === 0) {
      setMessage('❌ Please select files to upload');
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileInfo = uploadedFiles[i];

      try {
        // Update status
        const updated = [...uploadedFiles];
        updated[i].status = 'uploading';
        setUploadedFiles(updated);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', fileInfo.title || file.name);
        formData.append('author', fileInfo.author);
        formData.append('description', `${isType === 'textbook' ? 'Textbook' : isType === 'past-paper' ? 'Past Paper' : 'Novel'}: ${fileInfo.title}`);
        formData.append('userId', 'current-user');
        formData.append('type', isType);

        const response = await fetch('/api/books', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const updated = [...uploadedFiles];
          updated[i].status = 'success';
          updated[i].progress = 100;
          setUploadedFiles(updated);
          successCount++;
        } else {
          const errorData = await response.json();
          const errorMsg = errorData.error || errorData.message || 'Upload failed';
          const updated = [...uploadedFiles];
          updated[i].status = 'error';
          updated[i].error = errorMsg;
          setUploadedFiles(updated);
          errorCount++;
          console.error(`File ${i} error:`, errorMsg);
        }
      } catch (error) {
        const updated = [...uploadedFiles];
        updated[i].status = 'error';
        updated[i].error = String(error);
        setUploadedFiles(updated);
        errorCount++;
      }
    }

    setIsLoading(false);
    setMessage(`✅ Batch upload complete: ${successCount} succeeded, ${errorCount} failed`);
    
    if (errorCount === 0) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">📚 Upload Books & Past Papers</h2>
      
      {/* Mode Selection */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-semibold mb-3">Upload Mode</label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="single"
              checked={!batchMode}
              onChange={() => {
                setBatchMode(false);
                setFiles([]);
                setUploadedFiles([]);
              }}
              className="mr-2"
            />
            <span>📄 Single File Upload</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="batch"
              checked={batchMode}
              onChange={() => {
                setBatchMode(true);
                setFiles([]);
                setUploadedFiles([]);
              }}
              className="mr-2"
            />
            <span>📂 Batch Upload (Multiple Files)</span>
          </label>
        </div>
      </div>

      {/* Single Upload Form */}
      {!batchMode && (
        <form onSubmit={handleSingleUpload} className="space-y-4 mb-8 border-b pb-8">
          {/* Material Type Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3">Material Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['textbook', 'past-paper', 'novel', 'reference'] as const).map((type) => (
                <label key={type} className="flex items-center cursor-pointer p-2 border rounded hover:bg-blue-50">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={isType === type}
                    onChange={(e) => setIsType(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {type === 'textbook' && '📖 Textbook'}
                    {type === 'past-paper' && '📝 Past Paper'}
                    {type === 'novel' && '📚 Novel'}
                    {type === 'reference' && '📕 Reference'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Physics 2025 Exam, A Man of the People"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-semibold mb-2">Author/Source (Optional)</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g., Prof. John Smith, Chinua Achebe"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this material..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Upload File (PDF or TXT) *</label>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-600 transition">
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="single-file-input"
                required
              />
              <label htmlFor="single-file-input" className="cursor-pointer">
                <p className="text-lg">📁 Click to select file or drag & drop</p>
                <p className="text-sm text-gray-500">PDF, TXT (Max 100MB)</p>
                {files.length > 0 && <p className="text-sm text-green-600 mt-2">✓ {files[0].name}</p>}
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400 transition"
          >
            {isLoading ? '⏳ Uploading...' : '📤 Upload Book'}
          </button>
        </form>
      )}

      {/* Batch Upload Form */}
      {batchMode && (
        <form onSubmit={handleBatchUpload} className="space-y-4 mb-8 border-b pb-8">
          {/* Material Type */}
          <div>
            <label className="block text-sm font-semibold mb-3">Material Type (applies to all)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['textbook', 'past-paper', 'novel', 'reference'] as const).map((type) => (
                <label key={type} className="flex items-center cursor-pointer p-2 border rounded hover:bg-blue-50">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={isType === type}
                    onChange={(e) => setIsType(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {type === 'textbook' && '📖 Textbook'}
                    {type === 'past-paper' && '📝 Past Paper'}
                    {type === 'novel' && '📚 Novel'}
                    {type === 'reference' && '📕 Reference'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Select Multiple Files (PDF or TXT) *</label>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-600 transition">
              <input
                type="file"
                multiple
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="batch-file-input"
                required
              />
              <label htmlFor="batch-file-input" className="cursor-pointer">
                <p className="text-lg">📁 Click to select multiple files or drag & drop</p>
                <p className="text-sm text-gray-500">PDF, TXT (Max 100MB each)</p>
                {uploadedFiles.length > 0 && <p className="text-sm text-green-600 mt-2">✓ {uploadedFiles.length} files selected</p>}
              </label>
            </div>
          </div>

          {/* File List with Editing */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
              <h3 className="font-semibold text-sm">Files to Upload:</h3>
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Title</label>
                      <input
                        type="text"
                        value={file.title}
                        onChange={(e) => handleTitleChange(idx, e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="Auto-filled from filename"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Author</label>
                      <input
                        type="text"
                        value={file.author}
                        onChange={(e) => handleAuthorChange(idx, e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">📄 {file.name}</p>
                  {file.status !== 'pending' && (
                    <div className="mt-2">
                      {file.status === 'uploading' && <p className="text-xs text-blue-600">⏳ Uploading...</p>}
                      {file.status === 'success' && <p className="text-xs text-green-600">✓ Uploaded</p>}
                      {file.status === 'error' && <p className="text-xs text-red-600">❌ {file.error}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || uploadedFiles.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400 transition"
          >
            {isLoading ? `⏳ Uploading (${uploadedFiles.filter(f => f.status === 'success').length}/${uploadedFiles.length})...` : `📤 Upload ${uploadedFiles.length} Files`}
          </button>
        </form>
      )}

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Supported Formats Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
        <p className="font-semibold mb-2">✓ Supported Formats & Features:</p>
        <ul className="space-y-1 text-gray-700">
          <li>• PDF & TXT files (up to 100MB each)</li>
          <li>• Automatic text extraction from PDFs</li>
          <li>• AI-powered summaries generated in background</li>
          <li>• Searchable by title, author, and content</li>
          <li>• Available for students to browse and borrow</li>
        </ul>
      </div>
    </div>
  );
}
