import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import SpinnerLoader from "../Loader/SpinnerLoader";

const TopicSelector = ({ selectedTopics, onTopicsChange, label = "Topics to Focus On", isCodingTest = false }) => {
  const [availableTopics, setAvailableTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch dataset topics for coding tests
    if (isCodingTest) {
      fetchAvailableTopics();
    }
  }, [isCodingTest]);

  const fetchAvailableTopics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching available topics from:", API_PATHS.ACTUAL.GET_AVAILABLE_TOPICS);
      const response = await axiosInstance.get(API_PATHS.ACTUAL.GET_AVAILABLE_TOPICS);
      console.log("Available topics response:", response.data);
      if (response.data.success) {
        setAvailableTopics(response.data.topics);
      } else {
        setError("Failed to load available topics");
      }
    } catch (error) {
      console.error("Error fetching available topics:", error);
      setError("Failed to load available topics. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicToggle = (topic) => {
    const updatedTopics = selectedTopics.includes(topic)
      ? selectedTopics.filter(t => t !== topic)
      : [...selectedTopics, topic];
    
    onTopicsChange(updatedTopics.join(", "));
  };

  const handleManualInput = (e) => {
    onTopicsChange(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center justify-center p-4 border border-gray-300 rounded-md">
          <SpinnerLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      
      {isCodingTest ? (
        // Coding Test: Show dataset topics only
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-2">Available topics from dataset (only include these in coding tests):</p>
          <div className="flex flex-wrap gap-2">
            {availableTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleTopicToggle(topic)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedTopics.includes(topic)
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      ) : (
        // AI Dashboard: Show manual input only
        <div>
          <p className="text-xs text-gray-600 mb-2">Enter topics for generated questions (comma-separated):</p>
          <input
            type="text"
            value={selectedTopics}
            onChange={handleManualInput}
            placeholder="(e.g., Python, Java, JavaScript, System Design, Algorithms)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}
    </div>
  );
};

export default TopicSelector; 