import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import TopicSelector from "../../components/Inputs/TopicSelector";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import PDFDropzone from "../../components/Inputs/PDFDropzone";

const CreateSessionForm = () => {
  const [formData, setFormData] = useState({
    role: "",
    experience: "",
    topicsToFocus: "",
    description: "",
    numberOfQuestions: 10, // Add default
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUploadInfo, setPdfUploadInfo] = useState(null);

  const navigate = useNavigate();

  const handleChange = (key, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();

    const { role, experience, topicsToFocus, numberOfQuestions } = formData;

    if (!role || !experience || !topicsToFocus) {
      setError("Please fill all the required fields.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      let pdfInfo = null;
      if (pdfFile) {
        const formDataPDF = new FormData();
        formDataPDF.append("pdf", pdfFile);
        // Optionally, you can pass sessionId if you want to link to a session
        const pdfRes = await axiosInstance.post(API_PATHS.SESSION.UPLOAD_PDF, formDataPDF, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        pdfInfo = pdfRes.data;
        setPdfUploadInfo(pdfInfo);
      }
      // Call AI API to generate questions
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role,
          experience,
          topicsToFocus,
          numberOfQuestions,
          pdf: pdfInfo, // Pass PDF info to backend for skill extraction
        }
      );
      // Should be array like [{question, answer}, ...]
      const generatedQuestions = aiResponse.data;
      const response = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
        ...formData,
        questions: generatedQuestions,
        pdf: pdfInfo,
      });
      if (response.data?.session?._id) {
        navigate(`/interview-prep/${response.data?.session?._id}`);
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="w-[90vw] md:w-[35vw] p-7 flex flex-col justify-center">
      <h3 className="text-2xl font-semibold text-black">
        Create a New Session
      </h3>
      <p className="text-[14px] text-slate-700 mt-[5px] mb-6">
        Fill out a few quick details and unlock your personalized set of
        AI-generated interview questions!
      </p>

      <form onSubmit={handleCreateSession} className="flex flex-col gap-4">
        <Input
          value={formData.role}
          onChange={({ target }) => handleChange("role", target.value)}
          label="Target Role"
          placeholder="(e.g., Java Developer, Software Engineering, etc.)"
          type="text"
        />

        <Input
          value={formData.experience}
          onChange={({ target }) => handleChange("experience", target.value)}
          label="Years of Experience"
          placeholder="(e.g., 1 year, 3 years, 5+ years)"
          type="number"
        />

        <TopicSelector
          selectedTopics={formData.topicsToFocus ? formData.topicsToFocus.split(",").map(t => t.trim()).filter(Boolean) : []}
          onTopicsChange={(topics) => handleChange("topicsToFocus", topics)}
          label="Topics to Focus On"
          isCodingTest={false}
        />

        <Input
          value={formData.description}
          onChange={({ target }) => handleChange("description", target.value)}
          label="Description"
          placeholder="(Any specific goals or notes for this session)"
          type="text"
        />

        <Input
          value={formData.numberOfQuestions}
          onChange={({ target }) => handleChange("numberOfQuestions", Number(target.value))}
          label="Number of Questions"
          placeholder="(e.g., 5, 10, 15, 30)"
          type="number"
          min={2}
          max={30}
        />

        <PDFDropzone pdfFile={pdfFile} setPdfFile={setPdfFile} />

        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

        <button
          type="submit"
          className="btn-primary w-full mt-2 text-white transition ease-in-out duration-100 cursor-pointer p-2 rounded-md"
          style={{ 
            background: 'linear-gradient(to right, rgb(47, 114, 47), oklch(0.51 0.2 145.36))'
          }}
          disabled={isLoading}
        >
        {isLoading ? <SpinnerLoader /> : 'Create Session'}
        </button>
      </form>
    </div>
};

export default CreateSessionForm;
