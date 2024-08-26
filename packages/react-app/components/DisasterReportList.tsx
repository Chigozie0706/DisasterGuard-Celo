// This component is used to display all the disaster reports in the system

// Importing the dependencies
import { useState } from "react";
// Import the useContractCall hook to read how many disaster reports are available via the smart contract
import { useContractCall } from "@/hooks/contracts/useContractRead";
// Import the DisasterReport and Alert components
import DisasterReport from "@/components/DisasterReport";
import ErrorAlert from "@/components/alerts/ErrorAlert";
import LoadingAlert from "@/components/alerts/LoadingAlert";
import SuccessAlert from "@/components/alerts/SuccessAlert";

// Define the DisasterReportList component
const DisasterReportList = () => {
  // Use the useContractCall hook to read how many disaster reports are available from the smart contract
  const { data } = useContractCall("getDisasterReportLength", [], true);
  // Convert the data to a number
  const reportLength = data ? Number(data.toString()) : 0;
  // Define the states to store the error, success, and loading messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState("");
  // Define a function to clear the error, success, and loading states
  const clear = () => {
    setError("");
    setSuccess("");
    setLoading("");
  };

  // Define a function to return the disaster reports
  const getReports = () => {
    // If there are no disaster reports, return null
    if (!reportLength) return null;
    const reports = [];
    // Loop through the reports, return the DisasterReport component, and push it to the reports array
    for (let i = 0; i < reportLength; i++) {
      reports.push(
        <DisasterReport
          key={i}
          id={i}
          setSuccess={setSuccess}
          setError={setError}
          setLoading={setLoading}
          loading={loading}
          clear={clear}
        />
      );
    }
    return reports;
  };

  // Return the JSX for the component
  return (
    <div>
      {/* If there is an alert, display it */}
      {error && <ErrorAlert message={error} clear={clear} />}
      {success && <SuccessAlert message={success} />}
      {loading && <LoadingAlert message={loading} />}
      {/* Display the disaster reports */}
      <div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Disaster Reports</h2>
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {/* Loop through the disaster reports and return the DisasterReport component */}
          {getReports()}
        </div>
      </div>
    </div>
  );
};

export default DisasterReportList;
