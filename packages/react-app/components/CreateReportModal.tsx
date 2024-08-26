// This component is used to create report

// Importing the dependencies
import { useEffect, useState } from "react";
// Import the useAccount and useBalance hooks to get the user's address and balance
import { useAccount, useBalance } from "wagmi";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import the useDebounce hook to debounce the input fields
import { useDebounce } from "use-debounce";
// Custom hook to write to the contract
import { useContractSend } from "@/hooks/contracts/useContractWrite";
// Import the erc20 contract abi to get the cUSD balance
import erc20Instance from "../abi/erc20.json";

// Component to create a disaster report
const CreateReportModal = () => {
  // The visible state is used to toggle the modal
  const [visible, setVisible] = useState(false);
  // The following states are used to store the values of the form fields
  const [reporterName, setReporterName] = useState("");
  const [email, setEmail] = useState("");
  const [disasterType, setDisasterType] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [date, setDate] = useState("");
  const [severity, setSeverity] = useState("");
  const [impact, setImpact] = useState("");

  // The following states are used to store the debounced values of the form fields
  const [debouncedReporterName] = useDebounce(reporterName, 500);
  const [debouncedEmail] = useDebounce(email, 500);
  const [debouncedDisasterType] = useDebounce(disasterType, 500);
  const [debouncedImgUrl] = useDebounce(imgUrl, 500);
  const [debouncedLatitude] = useDebounce(latitude, 500);
  const [debouncedLongitude] = useDebounce(longitude, 500);
  const [debouncedCity] = useDebounce(city, 500);
  const [debouncedState] = useDebounce(state, 500);
  const [debouncedDate] = useDebounce(date, 500);
  const [debouncedSeverity] = useDebounce(severity, 500);
  const [debouncedImpact] = useDebounce(impact, 500);
  // The loading state is used to display a loading message
  const [loading, setLoading] = useState("");
  // The displayBalance state is used to store the cUSD balance of the user
  const [displayBalance, setDisplayBalance] = useState(false);
  const [disable, setDisable] = useState(false);
  // Check if all the input fields are filled
  const isComplete =
    reporterName &&
    email &&
    disasterType &&
    imgUrl &&
    latitude &&
    longitude &&
    city &&
    state &&
    date &&
    severity &&
    impact;

  const clearForm = () => {
    setReporterName("");
    setEmail("");
    setDisasterType("");
    setImgUrl("");
    setLatitude("");
    setLongitude("");
    setCity("");
    setState("");
    setDate("");
    setSeverity("");
    setImpact("");
  };

  const { writeAsync: createReport } = useContractSend("createDisasterReport", [
    debouncedReporterName,
    debouncedEmail,
    debouncedDisasterType,
    debouncedImgUrl,
    debouncedLatitude,
    debouncedLongitude,
    debouncedCity,
    debouncedState,
    debouncedDate,
    debouncedSeverity,
    debouncedImpact,
  ]);

  // Function to handle report creation logic
  const handleCreateReport = async () => {
    if (!createReport) {
      throw "Failed to create report";
    }
    setLoading("Creating...");
    if (!isComplete) throw new Error("Please fill all fields");
    // Call smart contract function to create report
    const createReportTx = await createReport();
    setLoading("Waiting for confirmation...");
    // Wait for the transaction to be created
    await createReportTx.wait();
    setVisible(false); // Close the modal
    clearForm(); // Clear the form fields
  };

  // Function to handle form submission
  const addReport = async (e: any) => {
    e.preventDefault();
    try {
      await toast.promise(handleCreateReport(), {
        pending: "Creating Report...", // Show pending toast message
        success: "Report created successfully", // Show success toast message
        error: "Something went wrong. Try again.", // Show error toast message
      });
      // Display an error message if something goes wrong
    } catch (e: any) {
      console.log({ e });
      toast.error(e?.message || "Something went wrong. Try again.");
    } finally {
      setLoading("");
    }
  };

  // Function to get the user's current location coordinates
  const getCoordinates = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          console.log("Coordinates set:", position.coords.latitude);
        },
        (error) => {
          console.error("Error fetching coordinates: ", error);
          alert("Unable to fetch location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Get the user's address and balance
  const { address, isConnected } = useAccount();
  const { data: cusdBalance } = useBalance({
    address,
    token: erc20Instance.address as `0x${string}`,
  });

  // If the user is connected and has a balance, display the balance
  useEffect(() => {
    if (isConnected && cusdBalance) {
      setDisplayBalance(true);
      return;
    }
    setDisplayBalance(false);
  }, [cusdBalance, isConnected]);

  return (
    <div className={"flex flex-row w-full justify-between"}>
      <div>
        {/* Button that opens the modal */}
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="inline-block ml-4 px-6 py-2.5 bg-black text-white font-medium text-md leading-tight rounded-1xl shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          data-bs-toggle="modal"
          data-bs-target="#exampleModalCenter"
        >
          Create Report
        </button>

        {/* Modal for creating a report */}
        {visible && (
          <div
            className="fixed z-40 overflow-y-auto top-0 w-full left-0"
            id="modal"
          >
            {/* Form for creating a disaster report */}
            <form onSubmit={addReport}>
              <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity">
                  <div className="absolute inset-0 bg-gray-900 opacity-75" />
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
                  &#8203;
                </span>
                <div
                  className="inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="modal-headline"
                >
                  {/* Modal Header */}
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">
                      Create Report
                    </h2>
                  </div>

                  {/* Modal Body with input fields */}
                  <div
                    className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 overflow-y-auto"
                    style={{ maxHeight: "400px" }}
                  >
                    <label>Reporter Name</label>
                    <input
                      onChange={(e) => setReporterName(e.target.value)}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Email</label>
                    <input
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Disaster Type</label>
                    <select
                      onChange={(e) => setDisasterType(e.target.value)}
                      required
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    >
                      <option value=""></option>
                      <option value="earthquake">Earthquake</option>
                      <option value="flood">Flood</option>
                      <option value="fire">Fire</option>
                      <option value="hurricane">Hurricane</option>
                      <option value="tornado">Tornado</option>
                    </select>

                    <label>Image URL</label>
                    <input
                      onChange={(e) => setImgUrl(e.target.value)}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Latitude</label>
                    <input
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Longitude</label>
                    <input
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <button
                      type="button"
                      className="mb-3 py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                      onClick={getCoordinates}
                    >
                      Get Location
                    </button>

                    <br />

                    <label>City</label>
                    <input
                      onChange={(e) => setCity(e.target.value)}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>State</label>
                    <input
                      onChange={(e) => setState(e.target.value)}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Date</label>
                    <input
                      onChange={(e) => setDate(e.target.value)}
                      required
                      type="date"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Severity</label>
                    <select
                      onChange={(e) => setSeverity(e.target.value)}
                      required
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    >
                      <option value=""></option>
                      <option value="Minor">Minor</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>

                    <label>Impact</label>
                    <textarea
                      onChange={(e) => setImpact(e.target.value)}
                      required
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />
                  </div>

                  {/* Modal Footer with submit button */}
                  <div className="bg-gray-200 px-4 py-3 text-right">
                    <button
                      type="button"
                      className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                      onClick={() => setVisible(false)}
                    >
                      <i className="fas fa-times"></i> Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={!!loading || !isComplete || !createReport}
                      className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
                    >
                      {loading ? loading : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateReportModal;
