import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from '../../hooks/useLocalStorage';
import MarkdownEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { marked } from 'marked';
import { saveAs } from 'file-saver';
import { generateAPIDocumentation } from '../../services/openai';

function APIDocsStep({ projectId, onNext, onBack }) {
  const [images] = useLocalStorage(`project-${projectId}-images`, []);
  const [descriptions] = useLocalStorage(`project-${projectId}-descriptions`, {});
  const [screenOrder] = useLocalStorage(`project-${projectId}-screen-order`, []);
  const [requirements] = useLocalStorage(`project-${projectId}-requirements`, {});
  const [markdown, setMarkdown] = useLocalStorage(`project-${projectId}-api-docs`, '');
  const [apiSpecs, setApiSpecs] = useLocalStorage(`project-${projectId}-api-specs`, {});

  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const generateDocs = async () => {
    setIsGenerating(true);
    try {
      // Prepare app flow content for OpenAI
      const appFlowContent = screenOrder.map((screenId, index) => {
        const image = images.find(img => img.id === screenId);
        const prevScreen = index > 0 ? images.find(img => img.id === screenOrder[index - 1]) : null;
        const nextScreen = index < screenOrder.length - 1 ? images.find(img => img.id === screenOrder[index + 1]) : null;
        
        return `
# Screen: ${image.name}

Description: ${descriptions[screenId]}

Requirements: ${requirements[screenId]}

Flow:
${index === 0 ? '- Entry point to the application' : `- Previous screen: ${prevScreen.name}`}
${nextScreen ? `- Next screen: ${nextScreen.name}` : '- Exit point'}
`;
      }).join('\n\n');

      // Generate API documentation using OpenAI
      const apiDocs = await generateAPIDocumentation(appFlowContent);
      setMarkdown(apiDocs);
    } catch (error) {
      console.error('Failed to generate API documentation:', error);
      setMarkdown('# Error Generating Documentation\n\nFailed to generate API documentation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditorChange = ({ text }) => {
    setMarkdown(text);
  };

  const handleExport = async (format) => {
    if (format === 'pdf') {
      const content = marked(markdown);
      const file = { content, name: 'api-documentation.pdf' };
      
      try {
        const response = await fetch('http://localhost:3000/api/export/pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ html: content }),
        });
        
        const blob = await response.blob();
        saveAs(blob, 'api-documentation.pdf');
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    } else {
      const filename = `api-documentation.${format}`;
      const content = format === 'md' ? markdown : marked(markdown);
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, filename);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Generate API Documentation</h2>
        <p className="mt-1 text-sm text-gray-500">
          Edit the generated API documentation and export when ready
        </p>
      </div>

      {!markdown ? (
        <div className="flex justify-center py-12">
          <button
            onClick={generateDocs}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate API Documentation'}
          </button>
        </div>
      ) : (
        <div className="h-[600px] border rounded-lg overflow-hidden">
          <MarkdownEditor
            value={markdown}
            onChange={handleEditorChange}
            renderHTML={(text) => marked(text)}
            className="h-full"
          />
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Previous Step
        </button>
        <div className="space-x-4">
          <button
            onClick={() => handleExport('md')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Export as Markdown
          </button>
          <button
            onClick={() => handleExport('html')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Export as HTML
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Export as PDF
          </button>
          <button
            onClick={() => {
              // Update project status and clear currentStep
              const projects = JSON.parse(localStorage.getItem('projects') || '[]');
              const updatedProjects = projects.map(p => 
                p.id === projectId ? { ...p, isComplete: true, currentStep: null } : p
              );
              localStorage.setItem('projects', JSON.stringify(updatedProjects));
              
              // Navigate back to projects list
              navigate('/');
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Complete Project
          </button>
        </div>
      </div>
    </div>
  );
}

export default APIDocsStep;
