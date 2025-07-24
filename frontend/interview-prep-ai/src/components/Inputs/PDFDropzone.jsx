import React, { useRef } from "react";
import { LuUpload, LuTrash, LuFileText } from "react-icons/lu";

const PDFDropzone = ({ pdfFile, setPdfFile }) => {
  const inputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setPdfFile(file);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <input
        type="file"
        accept="application/pdf"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      {!pdfFile ? (
        <div
          className="w-full h-24 flex flex-col items-center justify-center bg-orange-50 rounded-lg border-2 border-dashed border-orange-300 cursor-pointer relative"
          onClick={onChooseFile}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <LuFileText className="text-4xl text-orange-500 mb-2" />
          <span className="text-sm text-orange-700">Drag & drop PDF here, or click to select</span>
          <LuUpload className="text-xl text-orange-400 mt-2" />
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-orange-50 rounded-lg px-4 py-3 w-full justify-between">
          <div className="flex items-center gap-2">
            <LuFileText className="text-2xl text-orange-500" />
            <span className="text-sm text-orange-900 font-medium">{pdfFile.name}</span>
          </div>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full cursor-pointer"
            onClick={handleRemoveFile}
          >
            <LuTrash />
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFDropzone; 