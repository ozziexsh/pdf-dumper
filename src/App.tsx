import React, { useState } from 'react';
// @ts-ignore
import * as pdfjs from 'pdfjs-dist/build/pdf';

pdfjs.GlobalWorkerOptions.workerSrc =
  '../node_modules/pdfjs-dist/build/pdf.worker.js';

function App() {
  const [url, setUrl] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
      if (!e.target?.result) {
        return setError('Failed to read PDF');
      }
      loadPdf(new Uint8Array(e.target.result as ArrayBuffer));
    };
    fileReader.readAsArrayBuffer(file);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadPdf(url);
  }

  async function loadPdf(pdfUrl: string | Uint8Array) {
    setLoading(true);

    try {
      const source =
        typeof pdfUrl === 'string' ? { url: pdfUrl } : { data: pdfUrl };

      const pdfDocument = await pdfjs.getDocument({
        ...source,
        enableXfa: true,
      }).promise;

      setOutput(JSON.stringify(pdfDocument.allXfaHtml, null, 2));
    } catch (e) {
      setError('Could not load pdf, please check browser console');
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p>Encountered an error:</p>
        <code>
          <pre>{error}</pre>
        </code>
      </div>
    );
  }

  if (output) {
    return (
      <div>
        {output && (
          <button onClick={() => navigator.clipboard.writeText(output)}>
            Copy
          </button>
        )}

        <code>
          <pre>{output}</pre>
        </code>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div>
          <label>Pdf Url:</label>
          <input value={url} onChange={e => setUrl(e.currentTarget.value)} />
        </div>
        <input type={'submit'} />
      </form>

      <div>
        <p>Or upload a file</p>
        <input type={'file'} onChange={onFileChange} />
      </div>
    </div>
  );
}

export default App;
