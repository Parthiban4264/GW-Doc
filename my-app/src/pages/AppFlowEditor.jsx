import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MarkdownEditor from '../components/MarkdownEditor.jsx';

const AppFlowEditor = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/docs/flow');
        setContent(response.data.content);
        setError(null);
      } catch (err) {
        setError('Failed to fetch document content');
        console.error('Error fetching content:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleSave = async (markdown) => {
    setIsLoading(true);
    try {
      await axios.post('http://localhost:3000/api/docs/flow', { content: markdown });
      setContent(markdown);
      setError(null);
    } catch (err) {
      setError('Failed to save document');
      console.error('Error saving content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">App Flow Editor</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <MarkdownEditor 
        initialValue={content}
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AppFlowEditor;
