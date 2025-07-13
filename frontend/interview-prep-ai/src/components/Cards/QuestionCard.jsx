import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const QuestionCard = ({
  question,
  answer,
  questionId,
  userAnswer: initialAnswer,
  isFinalSubmitted
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
    <div className="bg-white p-4 rounded-lg border mb-4 shadow">
      <h3 className="text-sm font-semibold text-gray-700">Q: {question}</h3>
      <div className="mt-2 mb-4 text-sm text-gray-600">AI Answer: {answer}</div>

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
              <textarea
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="Your answer..."
                className="w-full border rounded p-2 text-sm mb-2"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={saveAnswer}
                  className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
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

export default QuestionCard;