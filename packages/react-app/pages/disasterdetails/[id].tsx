// This component is used to show the full detailt of the report according to it's id

// Import utility function to generate an identicon based on the reporter's ID
import { identiconTemplate } from "@/helpers";
// Import custom hook to read data from a smart contract
import { useContractCall } from "@/hooks/contracts/useContractRead";
// Import Next.js Link component for navigation
import Link from "next/link";
// Import Next.js router for programmatic navigation
import { useRouter } from "next/router";
// Import React hooks for component state and lifecycle management
import { useCallback, useEffect, useState } from "react";
// Import Map component to display location on a map
import Map from "@/components/map";
// Import modal component to add disaster report images
import AddDisasterImageModal from "@/components/AddDisasterImageModal";
// Import modal component to delete an image from the report
import DeleteReportImageModal from "@/components/DeleteReportImageModal";

export default function DisasterDetails() {
  // Define the structure of report details for type safety
  interface ReportDetails {
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

  // Define the structure of disaster images for type safety
  interface DisasterImage {
    reporterId: string;
    timestamp: string;
    disasterImageUrl: string;
  }

  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState("");
  const [reportDetails, setReportDetails] = useState<ReportDetails | null>(
    null
  );

  // State for storing report details
  const [images, setImages] = useState<DisasterImage[]>([]); // State for report images

  // Fetch the disaster report data from the contract using the ID
  const { data: report }: any = useContractCall(
    "getDisasterReport",
    [id],
    true
  );

  // Fetch the disaster images related to the report from the contract using the ID
  const { data: reportImages }: any = useContractCall(
    "getDisasterImages",
    [id],
    true
  );

  // Function to format and set the disaster report details in state
  const getDisasterReport = useCallback(() => {
    if (!report) return null;
    setReportDetails({
      reporterId: report[0],
      reporterName: report[1],
      email: report[2],
      disasterType: report[3],
      imgUrl: report[4],
      latitude: report[5],
      longitude: report[6],
      city: report[7],
      state: report[8],
      date: report[9],
      severity: report[10],
      impact: report[11],
    });

    if (reportImages) {
      const formattedImages = reportImages.map((image: any) => ({
        reporterId: image[0],
        timestamp: image[1],
        disasterImageUrl: image[2],
      }));
      setImages(formattedImages);
    }
  }, [report, reportImages]);

  // Fetch and update disaster report details when component mounts or when dependencies change
  useEffect(() => {
    getDisasterReport();
  }, [getDisasterReport, reportImages]);

  // Show loading text if report details are not yet available
  if (!reportDetails) return <p>Loading...</p>;

  return (
    <>
      <div className="flex space-x-2">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-700"
          onClick={() => router.push("/")}
        >
          Back
        </button>

        <AddDisasterImageModal id={id as string} />
      </div>
      <div className="flex flex-col md:flex-row space-x-0 md:space-x-6">
        <div className="w-full md:w-1/2 shadow-lg rounded-lg mb-5 p-5 bg-white">
          <div className="relative aspect-w-16 aspect-h-9 w-full overflow-hidden rounded-t-lg">
            <img
              src={reportDetails.imgUrl}
              alt="Disaster Image"
              className="w-full h-80 object-cover object-center"
            />
            <Link
              href={`https://explorer.celo.org/alfajores/address/${reportDetails.reporterId}`}
              className="absolute -bottom-5 left-4 h-12 w-12 rounded-full"
            >
              {identiconTemplate(reportDetails.reporterId)}
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex justify-between">
              <span className="font-bold">Reporter Name:</span>
              <span className="text-sm text-gray-700">
                {reportDetails.reporterName}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-bold">Email:</span>
              <span className="text-sm text-gray-700">
                {reportDetails.email}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-bold">Date:</span>
              <span className="text-sm text-gray-700">
                {reportDetails.date}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-bold">Disaster Type:</span>
              <span className="text-sm text-gray-700 text-uppercase">
                {reportDetails.disasterType}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-bold">Severity:</span>
              <span className="text-sm text-gray-700">
                {reportDetails.severity}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-bold">Latitude:</span>
              <span className="text-sm text-gray-700">
                {reportDetails.latitude}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-bold">Longitude:</span>
              <span className="text-sm text-gray-700">
                {reportDetails.longitude}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-bold">City, State:</span>
              <span className="text-sm text-gray-700">
                {reportDetails.city}, {reportDetails.state}
              </span>
            </div>

            <div>
              <span className="font-bold">Impact: {"  "}</span>
              <span className="text-sm text-gray-700">
                {reportDetails.impact}
              </span>
            </div>
          </div>

          {/* Image Gallery Section */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Additional Images</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200"
                >
                  <img
                    src={image.disasterImageUrl}
                    alt={`Disaster Image ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="p-2">
                    <p className="text-xs text-gray-700">
                      Reporter: {image.reporterId}
                    </p>
                    <p className="text-xs text-gray-700">
                      Timestamp: {new Date(image.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <DeleteReportImageModal
                    id={id as string}
                    imageIndex={index}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-5">
          <Map
            latitude={parseFloat(reportDetails.latitude)}
            longitude={parseFloat(reportDetails.longitude)}
          />
        </div>
      </div>
    </>
  );
}
