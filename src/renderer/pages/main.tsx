import React, { useState } from 'react';
import DragAndDrop from '../components/drag-and-drop/Drag-And-Drop';
import './main.scss';

const Application: React.FC = () => {
  const [fileName, setFileName] = useState<string>('');
  const [tokenFileName, setTokenFileName] = useState<string>('');

  const extractFile = () => {
    window.postMessage({ action: 'EXTRACT_FILE', payload: { fileName, tokenFileName } }, '*');
  };

  return (
    <div className={'container'}>
      <DragAndDrop
        fileName={fileName}
        setFileName={setFileName}
        dropsiteLabel={'Drop Template Here'}
      />

      <DragAndDrop
        fileName={tokenFileName}
        setFileName={setTokenFileName}
        dropsiteLabel={'Drop Variable File Here'}
      />

      <button onClick={() => extractFile()}>Export</button>
    </div>
  );
};

export default Application;
