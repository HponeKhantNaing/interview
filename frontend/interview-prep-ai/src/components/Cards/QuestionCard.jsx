import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import MonacoEditor from "../MonacoEditor";
import { useRef } from "react";

const AnswerTextarea = ({ value, onChange, placeholder, disabled }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full min-h-44 bg-gray-100 rounded p-4 text-sm mt-6 mb-2"
    disabled={disabled}
  />
);

const QuestionCard = ({
  question,
  answer,
  questionId,
  userAnswer: initialAnswer,
  isFinalSubmitted,
  id,
  questionNumber, // <-- add prop
  type, // <-- add type prop
  customApiEndpoint // <-- add custom API endpoint prop
}) => {
  const [userAnswer, setUserAnswer] = useState(initialAnswer || "");
  // Remove isSaved, isSaving, editMode
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeout = useRef(null);

  useEffect(() => {
    setUserAnswer(initialAnswer || "");
  }, [initialAnswer]);

  // Debounced autosave effect
  useEffect(() => {
    if (isFinalSubmitted) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      if (userAnswer !== initialAnswer && userAnswer.trim() !== '') {
        // Use custom endpoint if provided, otherwise use default
        const endpoint = customApiEndpoint || API_PATHS.QUESTION.ANSWER(questionId);
        console.log('Auto-saving answer for question:', questionId, 'Answer:', userAnswer);
        setIsSaving(true);
        axiosInstance.post(endpoint, {
          answer: userAnswer,
        }).then(() => {
          console.log('Answer saved successfully for question:', questionId);
          setIsSaving(false);
        }).catch((error) => {
          console.error('Failed to save answer for question:', questionId, error);
          setIsSaving(false);
        });
      }
    }, 300); // Reduced to 300ms for faster saving
    return () => clearTimeout(saveTimeout.current);
    // eslint-disable-next-line
  }, [userAnswer, isFinalSubmitted, questionId, customApiEndpoint]);

  // Remove saveAnswer and related logic

  return (
    <div className="bg-white p-4 px-6 rounded-lg mb-4 shadow-sm" id={id}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-800 mt-2.5">Q{questionNumber}: {question}</h3>
        {isSaving && (
          <div className="text-xs text-blue-600 flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            Saving...
          </div>
        )}
      </div>
      {/* <div className="mt-2 mb-4 text-sm text-gray-600">AI Answer: {answer}</div> */}

      {isFinalSubmitted ? (
        <div className="bg-gray-50 p-3 rounded border text-xs text-gray-700">
          <p><strong>Your submitted answer:</strong></p>
          <p className="mt-1">{userAnswer || "No answer submitted."}</p>
          {/* {answer && (
            <p className="mt-1 text-green-600">
              <strong>Correct answer:</strong> {answer}
            </p>
          )} */}
        </div>
      ) : (
        <>
          {type === "coding" ? (
            <>
              <div className="mb-2 flex items-center gap-2">
                <label htmlFor={`language-select-${questionId}`} className="text-sm font-medium text-gray-700">Language:</label>
                <select
                  id={`language-select-${questionId}`}
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="csharp">C#</option>
                  <option value="go">Go</option>
                  <option value="php">PHP</option>
                  <option value="ruby">Ruby</option>
                  <option value="swift">Swift</option>
                  <option value="kotlin">Kotlin</option>
                  <option value="rust">Rust</option>
                  <option value="scala">Scala</option>
                  <option value="sql">SQL</option>
                </select>
              </div>
              <MonacoEditor
                value={userAnswer}
                onChange={(val) => {
                  setUserAnswer(val ?? "");
                }}
                language={selectedLanguage}
                height={250}
              />
            </>
          ) : (
            <AnswerTextarea
              value={userAnswer}
              onChange={(e) => {
                setUserAnswer(e.target.value);
              }}
              placeholder="Type your answer here..."
              disabled={false}
            />
          )}
        </>
      )}
    </div>
  );
};

export { AnswerTextarea };
export default QuestionCard;