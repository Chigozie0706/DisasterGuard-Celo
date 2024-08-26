/* eslint-disable @next/next/no-img-element */
// This component displays a disaster report and enables the deletion of the report

// Importing the dependencies
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
// Import the useConnectModal hook to trigger the wallet connect modal
import { useConnectModal } from "@rainbow-me/rainbowkit";
// Import the useAccount hook to get the user's address
import { useAccount } from "wagmi";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import our custom identicon template to display the reporter's address as an identicon
import { identiconTemplate } from "@/helpers";
// Import our custom hooks to interact with the smart contract
import { useContractCall } from "@/hooks/contracts/useContractRead";
import { useContractSend } from "@/hooks/contracts/useContractWrite";
// Import the useDebounce hook to debounce the input fields
import { useDebounce } from "use-debounce";
import { useRouter } from "next/router";

// Define the interface for the disaster report data structure
interface Report {
  reporterId: string;
  reporterName: string;
  email: string;
  disasterType: string;
  imgUrl: string;
  latitude: string;
  longitude: string;
  city: string;
  state: string;
  date: string;
  severity: string;
  impact: string;
}

// Define the DisasterReport component which takes in the id of the report and some functions to display notifications
const DisasterReport = ({ id, setError, setLoading, clear }: any) => {
  // State to control the visibility of the review section
  const [showReview, setShowReview] = useState(false);
  // State to store the disaster report details
  const [report, setReport] = useState<Report | null>(null);
  // State to disable the delete button during the loading process
  const [disable, setDisable] = useState(false);
  const show = showReview ? "block" : "hidden";

  const router = useRouter();

  // Function to toggle the review section visibility
  const toggleReview = () => {
    setShowReview(!showReview);
  };

  // Use the useAccount hook to store the user's address
  const { address } = useAccount();

  // Use the useContractCall hook to read the data of the disaster report with the id passed in, from the smart contract
  const { data: reportData }: any = useContractCall(
    "getDisasterReport",
    [id],
    true
  );

  // Debounce the id to avoid unnecessary contract calls
  const [debouncedId] = useDebounce(id, 500);

  // Get the contract function for deleting the disaster report
  const { writeAsync: deleteDisasterReport } = useContractSend(
    "deleteDisasterReport",
    [debouncedId]
  );

  // Function to handle the disaster report deletion process
  const handleDelete = async () => {
    if (!deleteDisasterReport) {
      throw "Failed to delete report"; // Throw an error if the contract function is unavailable
    }
    setLoading("Deleting...");
    const deleteTx = await deleteDisasterReport(); // Send the transaction to delete the report
    setLoading("Waiting for confirmation...");
    await deleteTx.wait(); // Wait for the transaction to be confirmed
  };

  // Function to handle the delete report action when the user submits the delete request
  const deleteReport = async (e: any) => {
    e.preventDefault();
    try {
      await toast.promise(handleDelete(), {
        pending: "Deleting Report...", // Display a pending notification
        success: "Report deleted successfully", // Display a success notification
        error: "Something went wrong. Try again.", // Display an error notification
      });
    } catch (e: any) {
      console.log({ e });
      toast.error(e?.message || "Something went wrong. Try again."); // Handle errors
    } finally {
      setLoading(""); // Clear the loading state after deletion
    }
  };

  // Use the useConnectModal hook to trigger the wallet connect modal
  const { openConnectModal } = useConnectModal();

  // Format the report data that we read from the smart contract
  const getReportData = useCallback(() => {
    if (!reportData) return null;
    setReport({
      reporterId: reportData[0],
      reporterName: reportData[1],
      email: reportData[2],
      disasterType: reportData[3],
      imgUrl: reportData[4],
      latitude: reportData[5],
      longitude: reportData[6],
      city: reportData[7],
      state: reportData[8],
      date: reportData[9],
      severity: reportData[10],
      impact: reportData[11],
    });

    console.log(reportData);
  }, [reportData]);

  // Effect to get the report data when the component mounts or when reportData changes
  useEffect(() => {
    getReportData();
  }, [getReportData]);

  // If no report data is available, return null
  if (!report) return null;

  // Render the component UI
  return (
    <div className={"shadow-lg relative rounded-b-lg "}>
      <p className="group">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-white xl:aspect-w-7 xl:aspect-h-8 ">
          {/* Delete icon to trigger the deleteReport function */}
          <img
            src="/delete.png"
            alt="Delete Image"
            className="absolute top-2 right-2 w-8 h-8 cursor-pointer "
            onClick={(e) => deleteReport(e)}
          />

          {/* Display the disaster image */}
          <img
            src={report.imgUrl}
            alt={"image"}
            className="w-full h-80 rounded-t-md  object-cover object-center "
          />

          {/* Show the reporter's address as an identicon and link to the address on the Celo Explorer */}
          <Link
            href={`https://explorer.celo.org/alfajores/address/${report.reporterId}`}
            className={"absolute -mt-7 ml-6 h-16 w-16 rounded-full"}
          >
            {identiconTemplate(report.reporterId)}
          </Link>
        </div>

        <div className={"m-5"} style={{ textTransform: "capitalize" }}>
          <div className={"pt-1"}>
            {/* Display the reporter's name */}
            <p className="mt-4  font-bold">{report.reporterName}</p>

            {/* Display the disaster type */}
            <h3 className="mt-3 text-sm text-gray-700">
              Disaster Type: {report.disasterType}
            </h3>
          </div>

          <div>
            {/* Button to view detailed disaster report */}
            <button
              onClick={() => router.push(`/disasterdetails/${id}`)}
              className="mt-4 h-14 w-full border-[1px] border-gray-500 text-black p-2 rounded-lg hover:bg-black hover:text-white"
            >
              View
            </button>
          </div>
        </div>
      </p>
    </div>
  );
};

export default DisasterReport;
