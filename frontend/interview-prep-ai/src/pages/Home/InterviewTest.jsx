import React, { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import Modal from "../../components/Modal";
import Input from "../../components/Inputs/Input";
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
    setIsLoading(true);
    setError(null);
    try {
      await axiosInstance.post(API_PATHS.ACTUAL.CREATE, form);
      setForm({ role: "", experience: "", topicsToFocus: "", description: "" });
      setOpenCreateModal(false);
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

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
      <div className="container mx-auto pt-4 pb-4">
        {isLoading && <SpinnerLoader />}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-7 pt-1 pb-6 px-4 md:px-0">
          {sessions.map((data, index) => (
            <div key={data._id}>
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
        <button
          className="h-12 md:h-12 flex items-center justify-center gap-3 bg-linear-to-r from-[#FF9324] to-[#e99a4b] text-sm font-semibold text-white px-7 py-2.5 rounded-full hover:bg-black hover:text-white transition-colors cursor-pointer hover:shadow-2xl hover:shadow-orange-300 fixed bottom-10 md:bottom-20 right-10 md:right-20"
          onClick={() => setOpenCreateModal(true)}
        >
          <LuPlus className="text-2xl text-white" />
          Add New
        </button>
        <Modal
          isOpen={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
          hideHeader
        >
          <div className="w-[90vw] md:w-[35vw] p-7 flex flex-col justify-center">
            <form onSubmit={handleAddSession} className="flex flex-col gap-4">
              <h3 className="text-2xl font-semibold text-black mb-2">Create a New Session</h3>
              <Input
                value={form.role}
                onChange={({ target }) => handleChange("role", target.value)}
                label="Target Role"
                placeholder="(e.g., Java Developer, Software Engineering, etc.)"
                type="text"
                required
              />
              <Input
                value={form.experience}
                onChange={({ target }) => handleChange("experience", target.value)}
                label="Years of Experience"
                placeholder="(e.g., 1 year, 3 years, 5+ years)"
                type="number"
                required
              />
              <Input
                value={form.topicsToFocus}
                onChange={({ target }) => handleChange("topicsToFocus", target.value)}
                label="Topics to Focus On"
                placeholder="(Comma-separated, e.g., Java, Python, Javascript)"
                type="text"
                required
              />
              <Input
                value={form.description}
                onChange={({ target }) => handleChange("description", target.value)}
                label="Description"
                placeholder="(Any specific goals or notes for this session)"
                type="text"
                required
              />
              {error && <div className="text-red-500 text-xs">{error}</div>}
              <button
                type="submit"
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors mt-2"
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