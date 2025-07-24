import React from "react";
import MonacoEditorReact from "@monaco-editor/react";

const MonacoEditor = ({ value, onChange, language = "javascript", height = 350, options = {} }) => {
  return (
    <div style={{
      border: "1px solid #222C32",
      borderRadius: 8,
      background: "#1e1e1e",
      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
      overflow: "hidden"
    }}>
      {/* VSCode-style top bar with fake tab */}
      <div style={{
        display: "flex",
        alignItems: "center",
        background: "#23272e",
        borderBottom: "1px solid #222C32",
        height: 36,
        paddingLeft: 16
      }}>
        <div style={{
          color: "#fff",
          background: "#1e1e1e",
          borderRadius: "6px 6px 0 0",
          padding: "6px 18px 6px 12px",
          fontSize: 13,
          fontWeight: 500,
          marginRight: 8,
          boxShadow: "0 2px 4px 0 rgba(0,0,0,0.04)"
        }}>
          Answer
        </div>
      </div>
      <MonacoEditorReact
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          fontFamily: 'Menlo, Monaco, "Fira Code", "Liberation Mono", "Consolas", monospace',
          lineNumbers: "on",
          renderLineHighlight: "all",
          smoothScrolling: true,
          cursorSmoothCaretAnimation: true,
          ...options,
        }}
      />
    </div>
  );
};

export default MonacoEditor; 