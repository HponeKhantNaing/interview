import React, { useEffect, useState } from "react";
import { LuPlus } from "react-icons/lu";
import { CARD_BG } from "../../utils/data";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import SummaryCard from "../../components/Cards/SummaryCard";
import moment from "moment";
import Modal from "../../components/Modal";
import CreateSessionForm from "./CreateSessionForm";
import DeleteAlertContent from "../../components/DeleteAlertContent";

const Dashboard = () => {
  const navigate = useNavigate();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  const fetchAllSessions = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching session data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionData) => {
    try {
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(sessionData?._id));

      toast.success("Session Deleted Successfully");
      setOpenDeleteAlert({
        open: false,
        data: null,
      });
      fetchAllSessions();
    } catch (error) {
      console.error("Error deleting session data:", error);
    }
  };

  useEffect(() => {
    fetchAllSessions();
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white relative overflow-hidden">
        
        <div className="container mx-auto pt-4 pb-4 relative z-10">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-1 pb-6 px-4 md:px-0">
              {sessions.map((data, index) => (
                <div key={data?._id} className="h-full flex flex-col">
                  <div className="flex-1 h-full min-h-[400px]">
                    <SummaryCard
                      colors={CARD_BG[index % CARD_BG.length]}
                      role={data?.role || ""}
                      topicsToFocus={data?.topicsToFocus || ""}
                      experience={data?.experience || "-"}
                      questions={data?.questions?.length || "-"}
                      description={data?.description || ""}
                      lastUpdated={
                        data?.updatedAt
                          ? moment(data.updatedAt).format("Do MMM YYYY")
                          : ""
                      }
                      onSelect={() => navigate(`/interview-prep/${data?._id}`)}
                      onDelete={() => setOpenDeleteAlert({ open: true, data })}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-500 mb-4">Create your first interview session to get started</p>
              <button
                onClick={() => setOpenCreateModal(true)}
                className="px-6 py-2 text-white rounded-lg transition-colors"
                style={{ 
                  background: 'linear-gradient(to right, rgb(47, 114, 47), oklch(0.51 0.2 145.36))'
                }}
              >
                Create Session
              </button>
            </div>
          )}

          <button
            className="h-12 md:h-12 flex items-center justify-center gap-3 text-sm font-semibold text-white px-7 py-2.5 rounded-full transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-green-300 fixed bottom-10 md:bottom-20 right-10 md:right-20 z-20 backdrop-blur-sm"
            style={{ 
              background: 'linear-gradient(to right, rgb(47, 114, 47), oklch(0.51 0.2 145.36))'
            }}
            onClick={() => setOpenCreateModal(true)}
          >
            <LuPlus className="text-2xl text-white" />
            Add New
          </button>
        </div>

        <Modal
          isOpen={openCreateModal}
          onClose={() => {
            setOpenCreateModal(false);
          }}
          hideHeader
        >
          <div>
            <CreateSessionForm />
          </div>
        </Modal>

        <Modal
          isOpen={openDeleteAlert?.open}
          onClose={() => {
            setOpenDeleteAlert({ open: false, data: null });
          }}
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

export default Dashboard;
