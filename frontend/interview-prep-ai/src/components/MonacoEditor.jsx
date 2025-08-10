import React, { useEffect } from "react";
import MonacoEditorReact from "@monaco-editor/react";

const MonacoEditor = ({ value, onChange, language = "javascript", height = 350, options = {} }) => {
  useEffect(() => {
    // CSS to move suggestion dropdown below the cursor
    const style = document.createElement('style');
    style.textContent = `
      .monaco-editor .suggest-widget {
        transform: translateY(40px) !important;
        z-index: 1000 !important;
      }
      
      /* Hide chat/lightbulb widget */
      .monaco-editor .lightbulb-glyph,
      .monaco-editor .codicon-lightbulb,
      .monaco-editor .editor-widget.suggest-details-container {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div style={{
      border: "1px solid #e1e5e9",
      borderRadius: 12,
      background: "#ffffff",
      boxShadow: "0 4px 12px 0 rgba(0,0,0,0.08)",
      overflow: "hidden"
    }}>
      {/* Light VSCode-style top bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        background: "#f8f9fa",
        borderBottom: "1px solid #e1e5e9",
        height: 40,
        paddingLeft: 16
      }}>
        <div style={{
          color: "#495057",
          background: "#ffffff",
          borderRadius: "8px 8px 0 0",
          padding: "8px 20px 8px 14px",
          fontSize: 14,
          fontWeight: 600,
          marginRight: 8,
          boxShadow: "0 2px 4px 0 rgba(0,0,0,0.06)",
          border: "1px solid #e1e5e9",
          borderBottom: "none"
        }}>
           Answer
        </div>
      </div>
      <MonacoEditorReact
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme="vs"
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          fontFamily: 'Lexend, "Menlo", "Monaco", "Fira Code", "Liberation Mono", "Consolas", monospace',
          lineNumbers: "on",
          renderLineHighlight: "all",
          smoothScrolling: true,
          cursorSmoothCaretAnimation: true,
          // Enable suggestions with proper positioning
          lightbulb: { enabled: true },
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          acceptSuggestionOnCommitCharacter: true,
          // Force suggestion widget to appear below
          fixedOverflowWidgets: true,
          suggest: {
            showBelow: true,
            insertMode: "insert",
            filterGraceful: true,
            snippetsPreventQuickSuggestions: false
          },
          ...options,
        }}
      />
    </div>
  );
};

export default MonacoEditor; 