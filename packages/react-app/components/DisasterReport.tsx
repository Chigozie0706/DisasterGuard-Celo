/* eslint-disable @next/next/no-img-element */
// This component displays and enables the purchase of a product

// Importing the dependencies
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
// Import the useConnectModal hook to trigger the wallet connect modal
import { useConnectModal } from "@rainbow-me/rainbowkit";
// Import the useAccount hook to get the user's address
import { useAccount } from "wagmi";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import our custom identicon template to display the owner of the product
import { identiconTemplate } from "@/helpers";
// Import our custom hooks to interact with the smart contract
import { useContractCall } from "@/hooks/contracts/useContractRead";
import { useContractSend } from "@/hooks/contracts/useContractWrite";
// Import the useDebounce hook to debounce the input fields
import { useDebounce } from "use-debounce";
import { useRouter } from "next/router";

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

// Define the Product component which takes in the id of the product and some functions to display notifications
const DisasterReport = ({ id, setError, setLoading, clear }: any) => {
  const [showReview, setShowReview] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [disable, setDisable] = useState(false);
  const show = showReview ? "block" : "hidden";

  const router = useRouter();
  const toggleReview = () => {
    setShowReview(!showReview);
  };

  // Use the useAccount hook to store the user's address
  const { address } = useAccount();
  // Use the useContractCall hook to read the data of the product with the id passed in, from the marketplace contract
  const { data: reportData }: any = useContractCall(
    "getDisasterReport",
    [id],
    true
  );

  const [debouncedId] = useDebounce(id, 500);

  const { writeAsync: deleteDisasterReport } = useContractSend(
    "deleteDisasterReport",
    [debouncedId]
  );

  // Function to delete an image
  const handleDelete = async () => {
    if (!deleteDisasterReport) {
      throw "Failed to delete image";
    }
    setLoading("Deleting...");
    const deleteTx = await deleteDisasterReport();
    setLoading("Waiting for confirmation...");
    await deleteTx.wait();
  };

  const deleteReport = async (e: any) => {
    e.preventDefault();
    try {
      await toast.promise(handleDelete(), {
        pending: "Deleting image...",
        success: "Image deleted successfully",
        error: "Something went wrong. Try again.",
      });
    } catch (e: any) {
      console.log({ e });
      toast.error(e?.message || "Something went wrong. Try again.");
    } finally {
      setLoading("");
    }
  };

  // Use the useConnectModal hook to trigger the wallet connect modal
  const { openConnectModal } = useConnectModal();
  // Format the product data that we read from the smart contract
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

  useEffect(() => {
    getReportData();
  }, [getReportData]);

  if (!report) return null;

  return (
    <div className={"shadow-lg relative rounded-b-lg "}>
      <p className="group">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-white xl:aspect-w-7 xl:aspect-h-8 ">
          <img
            src="/delete.png"
            alt="Delete Image"
            className="absolute top-2 right-2 w-8 h-8 cursor-pointer "
            onClick={(e) => deleteReport(e)}
          />

          <img
            src={report.imgUrl}
            alt={"image"}
            className="w-full h-80 rounded-t-md  object-cover object-center "
          />
          {/* Shows the address of the report owner as an identicon and link to the address on the Celo Explorer */}
          <Link
            href={`https://explorer.celo.org/alfajores/address/${report.reporterId}`}
            className={"absolute -mt-7 ml-6 h-16 w-16 rounded-full"}
          >
            {identiconTemplate(report.reporterId)}
          </Link>
        </div>

        <div className={"m-5"} style={{ textTransform: "capitalize" }}>
          <div className={"pt-1"}>
            <p className="mt-4  font-bold">{report.reporterName}</p>

            <h3 className="mt-3 text-sm text-gray-700">
              Disaster Type: {report.disasterType}
            </h3>
          </div>

          <div>
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
