// This component is used to add images to the report

// Importing the dependencies
import { useEffect, useState } from "react";
// Import ethers to convert the image-related data to appropriate format (if needed in future)
import { ethers } from "ethers";
// Import the useAccount and useBalance hooks to get the user's address and balance
import { useAccount, useBalance } from "wagmi";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import the useDebounce hook to debounce the input fields
import { useDebounce } from "use-debounce";
// Import our custom useContractSend hook to interact with the smart contract for adding disaster images
import { useContractSend } from "@/hooks/contracts/useContractWrite";
// Import the erc20 contract abi to get the cUSD balance
import erc20Instance from "../abi/erc20.json";

interface Props {
  id: string; // Props to receive the ID of the disaster report
}

const AddDisasterImageModal = ({ id }: Props) => {
  // The visible state is used to toggle the modal
  const [visible, setVisible] = useState(false);
  // The following states are used to store the values of the form fields
  const [imgUrl, setImgUrl] = useState("");

  // The following states are used to store the debounced values of the form fields
  const [debouncedImgUrl] = useDebounce(imgUrl, 500);
  const [debouncedTimestamp] = useDebounce(new Date().toISOString(), 500);
  const [debouncedId] = useDebounce(id, 500);

  // The loading state is used to display a loading message
  const [loading, setLoading] = useState("");
  // The displayBalance state is used to store the cUSD balance of the user
  const [displayBalance, setDisplayBalance] = useState(false);
  const [disable, setDisable] = useState(false);
  // Check if all the input fields are filled
  const isComplete = imgUrl;
  // Clear the input fields after the image is added to the report
  const clearForm = () => {
    setImgUrl("");
  };

  // Use the useContractSend hook to interact with the smart contract and add an image to the disaster report
  const { writeAsync: addDisasterImage } = useContractSend("addDisasterImage", [
    debouncedId,
    debouncedImgUrl,
    debouncedTimestamp,
  ]);

  // Define function that handles the addition of an image through the smart contract
  const handleAddImages = async () => {
    if (!addDisasterImage) {
      throw "Failed to add disaster image";
    }
    setLoading("Creating...");
    if (!isComplete) throw new Error("Please fill all fields");
    // Execute the smart contract call to add the disaster image
    const createImageTx = await addDisasterImage();
    setLoading("Waiting for confirmation...");
    // Wait for the transaction to be created
    await createImageTx.wait();
    // Close the modal and clear the input fields after the image is added to the report
    setVisible(false);
    clearForm();
  };

  // Function to handle the form submission for adding the disaster image
  const addDisasterImages = async (e: any) => {
    e.preventDefault();
    try {
      // Display a notification while the image is being added
      await toast.promise(handleAddImages(), {
        pending: "Adding disaster image...",
        success: "Disaster image added successfully",
        error: "Something went wrong. Try again.",
      });
      // Display an error message if something goes wrong
    } catch (e: any) {
      console.log({ e });
      toast.error(e?.message || "Something went wrong. Try again.");
      // Clear the loading state after the process is complete
    } finally {
      setLoading("");
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

  // Define the JSX that will be rendered
  return (
    <div className={"flex flex-row w-full justify-between"}>
      <div>
        {/* Add Disaster Image Button that opens the modal */}
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="inline-block ml-4 px-6 py-2.5 bg-black text-white font-medium text-md leading-tight rounded-2xl shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          data-bs-toggle="modal"
          data-bs-target="#exampleModalCenter"
        >
          Add Images
        </button>

        {/* Modal for adding a disaster image */}
        {visible && (
          <div
            className="fixed z-40 overflow-y-auto top-0 w-full left-0"
            id="modal"
          >
            {/* Form with input fields for the image URL, that triggers the addDisasterImages function on submit */}
            <form onSubmit={addDisasterImages}>
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
                      Add Disaster Image
                    </h2>
                  </div>

                  {/* Modal Body */}
                  <div
                    className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 overflow-y-auto"
                    style={{ maxHeight: "400px" }}
                  >
                    <label>Image URL</label>
                    <input
                      onChange={(e) => {
                        let location = e.target.value;
                        setImgUrl(location.trim());
                      }}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />
                  </div>
                  {/* Button to close the modal */}
                  <div className="bg-gray-200 px-4 py-3 text-right">
                    <button
                      type="button"
                      className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                      onClick={() => setVisible(false)}
                    >
                      <i className="fas fa-times"></i> Cancel
                    </button>
                    {/* Button to add the image to the disaster report */}
                    <button
                      type="submit"
                      disabled={!!loading || !isComplete || !addDisasterImage}
                      className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
                    >
                      {loading ? loading : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Display the user's cUSD balance */}
      {displayBalance && (
        <span
          className="inline-block text-dark ml-4 px-6 py-2.5 font-medium text-md leading-tight rounded-2xl shadow-none "
          data-bs-toggle="modal"
          data-bs-target="#exampleModalCenter"
        >
          Balance: {Number(cusdBalance?.formatted || 0).toFixed(2)} cUSD
        </span>
      )}
    </div>
  );
};

export default AddDisasterImageModal;
