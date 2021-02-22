import React from 'react';
import dragAndDropStyles from './drag-and-drop.module.scss';

const DragAndDrop: React.FC<{
  setFileName: (fileName: string) => void;
  dropsiteLabel: string;
  fileName: string;
}> = ({ setFileName, dropsiteLabel, fileName }) => {
  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    for (const f of Array.from(e.dataTransfer.files)) {
      // Using the path attribute to get absolute file path
      console.log('File Path of dragged files: ', f.path);
      setFileName(f.path);
    }
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (): void => {
    console.log('File is in the Drop Space');
  };

  const handleDragLeave = (): void => {
    console.log('File has left the Drop Space');
  };

  return (
    <div>
      <div
        className={dragAndDropStyles['main']}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        {dropsiteLabel}
      </div>
      <div>{fileName}</div>
    </div>
  );
};

export default DragAndDrop;
