//src\features\applications\context\application.context.jsx
import { createContext, useContext, useState } from "react";
import { fetchApplicationsByApplicantId } from "../services/application.service";

const ApplicationContext = createContext(null);

export function ApplicationProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);

  async function getAllApplications(applicantID) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApplicationsByApplicantId(applicantID);
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ApplicationContext.Provider value={{ loading, applications, error, getAllApplications }}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplications() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error("useApplications must be used within an ApplicationProvider");
  }
  return context;
}
