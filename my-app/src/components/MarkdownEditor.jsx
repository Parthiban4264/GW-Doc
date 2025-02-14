import React from 'react';

const MarkdownEditor = ({ initialValue = '', onSave, isLoading }) => {
  const [value, setValue] = React.useState(initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleSave = () => {
    onSave(value);
  };

  return (
    <div className="space-y-4">
      <textarea
        value={value}
        onChange={handleChange}
        className="w-full h-64 p-2 border rounded"
        placeholder="Write your markdown here..."
      />
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

export default MarkdownEditor;
