'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

interface UploadResponse {
  id: string;
  message: string;
  title: string;
}

export default function BookUploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [isType, setIsType] = useState<'textbook' | 'past-paper'>('textbook');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!file || !title) {
      setMessage('❌ Please select a file and enter a title');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('author', author);
      formData.append('description', description || `${isType === 'textbook' ? 'Textbook' : 'Past Paper'}: ${title}`);
      formData.append('userId', 'current-user');
      formData.append('type', isType);

      const response = await fetch('/api/books', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}`);
        setFile(null);
        setTitle('');
        setAuthor('');
        setDescription('');
        // Refresh page to show new book
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(`❌ Upload failed: ${data.message}`);
      }
    } catch (error) {
      setMessage(`❌ Error uploading file: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">📚 Upload Your Materials</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-8 border-b pb-8">
        {/* Material Type Selection */}
        <div>
          <label className="block text-sm font-semibold mb-3">Material Type</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="textbook"
                checked={isType === 'textbook'}
                onChange={(e) => setIsType(e.target.value as 'textbook' | 'past-paper')}
                className="mr-2"
              />
              <span>📖 Textbook/Course Material</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="past-paper"
                checked={isType === 'past-paper'}
                onChange={(e) => setIsType(e.target.value as 'textbook' | 'past-paper')}
                className="mr-2"
              />
              <span>📝 Past Paper/Exam</span>
            </label>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-2">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Physics 2025 Exam, Advanced Mathematics Notes"
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
            placeholder="e.g., Prof. John Smith, Ministry of Education"
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
              id="file-input"
              required
            />
            <label htmlFor="file-input" className="cursor-pointer block">
              {file ? (
                <>
                  <p className="text-green-600 font-semibold">✅ {file.name}</p>
                  <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <p className="text-gray-700 font-semibold">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-600">PDF or TXT files up to 100MB</p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-md ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
        >
          {loading ? '⏳ Uploading...' : '⬆️ Upload Material'}
        </button>
      </form>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 How to Use Uploaded Materials:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Upload textbooks, notes, past papers, and exam questions</li>
          <li>✓ Click "📖 Read" to view the material content</li>
          <li>✓ Ask questions about the material - AI will reference it for answers</li>
          <li>✓ All uploaded materials are searchable by the AI system</li>
          <li>✓ Best results: Use clear titles and descriptions for better AI matching</li>
        </ul>
      </div>
    </div>
  );
}
