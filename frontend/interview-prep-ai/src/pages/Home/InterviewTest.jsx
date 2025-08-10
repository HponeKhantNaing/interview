import React, { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Modal from "../../components/Modal";
import Input from "../../components/Inputs/Input";
import TopicSelector from "../../components/Inputs/TopicSelector";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import QuestionCard from "../../components/Cards/QuestionCard";
import SummaryCard from "../../components/Cards/SummaryCard";
import { CARD_BG } from "../../utils/data";
import { useNavigate } from "react-router-dom";
import DeleteAlertContent from "../../components/DeleteAlertContent";
import { toast } from "react-toastify";

const InterviewTest = () => {
  const [sessions, setSessions] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [form, setForm] = useState({
    role: "",
    experience: "",
    topicsToFocus: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const navigate = useNavigate();
  const [openDeleteAlert, setOpenDeleteAlert] = useState({ open: false, data: null });
  
  // Form validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    
    // Role is required
    if (!form.role.trim()) {
      errors.role = "Please enter a target role";
    }
    
    // Experience is required
    if (!form.experience) {
      errors.experience = "Please enter years of experience";
    }
    
    // Topics to focus is required
    if (!form.topicsToFocus || form.topicsToFocus.trim() === "") {
      errors.topicsToFocus = "Please select at least one topic to focus on";
    }
    
    // Description is optional (no validation needed)
    
    setValidationErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
    return Object.keys(errors).length === 0;
  };

  // Clear validation errors when form changes
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  // Clear all validation errors when modal opens
  const handleOpenCreateModal = () => {
    setOpenCreateModal(true);
    setValidationErrors({});
    setIsFormValid(false);
  };

  // Clear form and validation when modal closes
  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    setForm({ role: "", experience: "", topicsToFocus: "", description: "" });
    setValidationErrors({});
    setIsFormValid(false);
    setError(null);
  };

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(API_PATHS.ACTUAL.GET_ALL);
      setSessions(res.data);
    } catch (err) {
      setError("Failed to fetch sessions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleAddSession = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await axiosInstance.post(API_PATHS.ACTUAL.CREATE, form);
      setForm({ role: "", experience: "", topicsToFocus: "", description: "" });
      handleCloseCreateModal();
      fetchSessions();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create session"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionData) => {
    try {
      await axiosInstance.delete(API_PATHS.ACTUAL.DELETE(sessionData?._id));
      toast.success("Session Deleted Successfully");
      setOpenDeleteAlert({ open: false, data: null });
      fetchSessions();
    } catch (error) {
      toast.error("Error deleting session");
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white relative overflow-hidden">
        
        <div className="container mx-auto pt-4 pb-4 relative z-10">
          {isLoading && <SpinnerLoader />}
          
          {!isLoading && sessions.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No coding test sessions found</h3>
              <p className="text-gray-500 mb-4">Create your first coding test session to get started</p>
              <button
                onClick={handleOpenCreateModal}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Coding Test
              </button>
            </div>
          )}
          
          {!isLoading && sessions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-1 pb-6 px-4 md:px-0">
              {sessions.map((data, index) => (
              <div key={data._id} className="h-full flex flex-col">
                <div className="flex-1 h-full min-h-[400px]">
                  <SummaryCard
                    colors={CARD_BG[index % CARD_BG.length]}
                    role={data.role}
                    topicsToFocus={data.topicsToFocus}
                    experience={data.experience}
                    questions={data.questions?.length || 0}
                    description={data.description}
                    lastUpdated={data.updatedAt?.slice(0, 10)}
                    onSelect={() => navigate(`/interview-test/${data._id}`)}
                    onDelete={() => setOpenDeleteAlert({ open: true, data })}
                  />
                </div>
                {expandedSessionId === data._id && data.questions && (
                  <div className="mt-4">
                    {data.questions.map((q, idx) => (
                      <QuestionCard
                        key={q._id || idx}
                        questionId={q._id}
                        question={q.question}
                        answer={q.answer}
                        userAnswer={q.userAnswer}
                        isFinalSubmitted={true}
                        id={`question-card-${q._id}`}
                        questionNumber={idx + 1}
                        type={q.type}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          )}

          <button
            className="h-12 md:h-12 flex items-center justify-center gap-3 text-sm font-semibold text-white px-7 py-2.5 rounded-full transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-green-300 fixed bottom-10 md:bottom-20 right-10 md:right-20 z-20 backdrop-blur-sm"
            style={{ 
              background: 'linear-gradient(to right, rgb(47, 114, 47), oklch(0.51 0.2 145.36))'
            }}
            onClick={handleOpenCreateModal}
          >
            <LuPlus className="text-2xl text-white" />
            Add New
          </button>
        </div>

        <Modal
          isOpen={openCreateModal}
          onClose={handleCloseCreateModal}
          hideHeader
        >
          <div className="w-[90vw] md:w-[35vw] p-7 flex flex-col justify-center">
            <form onSubmit={handleAddSession} className="flex flex-col gap-4">
              <h3 className="text-2xl font-semibold text-black mb-2">Create a New Coding Test</h3>
              <p className="text-sm text-gray-600 mb-4">This will create a coding test using questions from our curated dataset. Only dataset topics are available for coding tests.</p>
              
              {/* Validation Summary */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                  <div className="text-red-800 text-sm font-medium mb-2">Please fix the following errors:</div>
                  <ul className="text-red-700 text-xs space-y-1">
                    {Object.values(validationErrors).map((error, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Input
                value={form.role}
                onChange={({ target }) => handleChange("role", target.value)}
                label="Target Role"
                placeholder="(e.g., Java Developer, Software Engineering, etc.)"
                type="text"
                required
              />
              {validationErrors.role && (
                <div className="text-red-500 text-xs -mt-2">{validationErrors.role}</div>
              )}
              
              <Input
                value={form.experience}
                onChange={({ target }) => handleChange("experience", target.value)}
                label="Years of Experience"
                placeholder="(e.g., 1 year, 3 years, 5+ years)"
                type="number"
                required
              />
              {validationErrors.experience && (
                <div className="text-red-500 text-xs -mt-2">{validationErrors.experience}</div>
              )}
              
              <TopicSelector
                selectedTopics={form.topicsToFocus ? form.topicsToFocus.split(",").map(t => t.trim()).filter(Boolean) : []}
                onTopicsChange={(topics) => handleChange("topicsToFocus", topics)}
                label="Topics to Focus On"
                isCodingTest={true}
              />
              {validationErrors.topicsToFocus && (
                <div className="text-red-500 text-xs -mt-2">{validationErrors.topicsToFocus}</div>
              )}
              
              <Input
                value={form.description}
                onChange={({ target }) => handleChange("description", target.value)}
                label="Description"
                placeholder="(Any specific goals or notes for this session)"
                type="text"
              />
              {error && <div className="text-red-500 text-xs">{error}</div>}
              <button
                type="submit"
                className="text-white px-4 py-2 rounded transition-colors mt-2"
                style={{ 
                  background: 'linear-gradient(to right, rgb(47, 114, 47), oklch(0.51 0.2 145.36))'
                }}
                disabled={isLoading}
              >
                {isLoading ? <SpinnerLoader /> : "Add Session"}
              </button>
            </form>
          </div>
        </Modal>

        <Modal
          isOpen={openDeleteAlert?.open}
          onClose={() => setOpenDeleteAlert({ open: false, data: null })}
          title="Delete Alert"
        >
          <div className="w-[30vw]">
            <DeleteAlertContent
              content="Are you sure you want to delete this session detail?"
              onDelete={() => deleteSession(openDeleteAlert.data)}
            />
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default InterviewTest; 