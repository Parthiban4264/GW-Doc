import React from 'react';

const APIRequestGenerator = () => {
  const [endpoint, setEndpoint] = React.useState('');
  const [method, setMethod] = React.useState('GET');
  const [requestBody, setRequestBody] = React.useState('');

  const generateSpec = () => {
    // TODO: Generate OpenAPI spec
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Request Generator</h1>
      <form className="space-y-4">
        <div>
          <label className="block mb-2">Endpoint</label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-2">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>
        </div>
        <button
          type="button"
          onClick={generateSpec}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Generate Spec
        </button>
      </form>
    </div>
  );
};

export default APIRequestGenerator;
