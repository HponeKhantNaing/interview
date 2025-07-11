import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const QuestionCard = ({ question, answer, questionId, userAnswer: initialAnswer }) => {
  const [userAnswer, setUserAnswer] = useState(initialAnswer || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(!!initialAnswer); // Mark saved if initial answer exists

  const saveAnswer = async () => {
    setIsSaving(true);
    try {
      await axiosInstance.post(API_PATHS.QUESTION.ANSWER(questionId), {
        answer: userAnswer,
      });
      setIsSaved(true); // Keep it visible
    } catch (error) {
      console.error("Failed to save answer", error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setUserAnswer(initialAnswer || "");
    setIsSaved(!!initialAnswer);
  }, [initialAnswer]);

  return (
    <div className="bg-white p-4 rounded-lg border mb-4 shadow">
      <h3 className="text-sm font-semibold text-gray-700">Q: {question}</h3>
      <div className="mt-2 mb-4 text-sm text-gray-600">AI Answer: {answer}</div>

      <textarea
        value={userAnswer}
        onChange={(e) => {
          setUserAnswer(e.target.value);
          setIsSaved(false); // Clear "Saved" when editing
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

        {isSaved && (
          <span className="text-green-600 text-sm font-medium">Saved</span>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;