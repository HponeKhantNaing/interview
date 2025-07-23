import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import MonacoEditor from "../MonacoEditor";

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
  questionNumber // <-- add prop
}) => {
  const [userAnswer, setUserAnswer] = useState(initialAnswer || "");
  const [isSaved, setIsSaved] = useState(!!initialAnswer);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(!initialAnswer);

  useEffect(() => {
    setUserAnswer(initialAnswer || "");
    setIsSaved(!!initialAnswer);
    setEditMode(!initialAnswer);
  }, [initialAnswer]);

  const saveAnswer = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.post(API_PATHS.QUESTION.ANSWER(questionId), {
        answer: userAnswer,
      });
      setIsSaved(true);
      setEditMode(false);
    } catch (error) {
      console.error("Failed to save answer", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-4 px-6 rounded-lg mb-4 shadow-sm" id={id}>
      <h3 className="text-xl font-bold text-gray-800 mt-2.5">Q{questionNumber}: {question}</h3>
      {/* <div className="mt-2 mb-4 text-sm text-gray-600">AI Answer: {answer}</div> */}

      {isFinalSubmitted ? (
        <div className="bg-gray-50 p-3 rounded border text-sm text-gray-700">
          <p><strong>Your submitted answer:</strong></p>
          <p className="mt-1">{userAnswer || "No answer submitted."}</p>
          {answer && (
            <p className="mt-1 text-green-600">
              <strong>Correct answer:</strong> {answer}
            </p>
          )}
        </div>
      ) : (
        <>
          {editMode ? (
            <>
              <MonacoEditor
                value={userAnswer}
                onChange={(val) => {
                  setUserAnswer(val ?? "");
                  setIsSaved(false);
                }}
                language="javascript"
                height={250}
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={saveAnswer}
                  className="text-sm bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-white px-3 py-1 rounded hover:bg-orange-600 focus:ring-2 focus:ring-orange-400"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Answer"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 text-sm mt-2">
              <span className="text-green-600 font-medium">✔ Saved Answered</span>
              <button
                onClick={() => setEditMode(true)}
                className="text-blue-600 underline"
              >
                Modify Answer
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export { AnswerTextarea };
export default QuestionCard;