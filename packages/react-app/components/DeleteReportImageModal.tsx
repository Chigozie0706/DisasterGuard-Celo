// This component is used to delete an image from a disaster report and display the user's cUSD balance

// Importing the dependencies
import { useEffect, useState } from "react";
// Import the useAccount and useBalance hooks to get the user's address and balance
import { useAccount, useBalance } from "wagmi";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import the useDebounce hook to debounce the input fields
import { useDebounce } from "use-debounce";
// Import our custom useContractSend hook to interact with the smart contract
import { useContractSend } from "@/hooks/contracts/useContractWrite";
// Import the erc20 contract ABI to get the cUSD balance
import erc20Instance from "../abi/erc20.json";

// Define the component props interface
interface Props {
  id: string; // The ID of the disaster report
  imageIndex: number; // The index of the image to delete
}

// The DeleteReportImageModal component is used to delete an image from a disaster report
const DeleteReportImageModal = ({ id, imageIndex }: Props) => {
  // State to toggle the modal visibility
  const [visible, setVisible] = useState(false);

  // State to display a loading message during the deletion process
  const [loading, setLoading] = useState("");

  // State to display the user's cUSD balance
  const [displayBalance, setDisplayBalance] = useState(false);

  // State to disable the delete button during loading
  const [disable, setDisable] = useState(false);

  // Get the user's address and balance using Wagmi hooks
  const { address, isConnected } = useAccount();
  const { data: cusdBalance } = useBalance({
    address,
    token: erc20Instance.address as `0x${string}`,
  });

  // Debounce the id and imageIndex to avoid unnecessary contract calls
  const [debouncedId] = useDebounce(id, 500);
  const [debouncedImageIndex] = useDebounce(imageIndex, 500);

  // Get the contract function for deleting an image from a disaster report
  const { writeAsync: deleteDisasterImage } = useContractSend(
    "deleteDisasterImage",
    [debouncedId, debouncedImageIndex]
  );

  // Function to handle the image deletion process
  const handleDeleteImage = async () => {
    if (!deleteDisasterImage) {
      throw "Failed to delete image"; // Throw an error if the contract function is unavailable
    }
    setLoading("Deleting...");
    const deleteTx = await deleteDisasterImage(); // Send the transaction to delete the image
    setLoading("Waiting for confirmation...");
    await deleteTx.wait(); // Wait for the transaction to be confirmed
    setVisible(false); // Close the modal after deletion
  };

  // Function to handle the delete image action when the user submits the delete request
  const deleteDisasterImageById = async (e: any) => {
    e.preventDefault();
    try {
      await toast.promise(handleDeleteImage(), {
        pending: "Deleting image...", // Display a pending notification
        success: "Image deleted successfully", // Display a success notification
        error: "Something went wrong. Try again.", // Display an error notification
      });
    } catch (e: any) {
      console.log({ e });
      toast.error(e?.message || "Something went wrong. Try again."); // Handle errors
    } finally {
      setLoading(""); // Clear the loading state after deletion
    }
  };

  // Use an effect to update the displayBalance state based on the user's connection and balance
  useEffect(() => {
    if (isConnected && cusdBalance) {
      setDisplayBalance(true);
      return;
    }
    setDisplayBalance(false);
  }, [cusdBalance, isConnected]);

  // Define the JSX that will be rendered
  return (
    <>
      <div>
        <img
          src="/delete.png" // Replace with the path to your delete icon image
          alt="Delete Image"
          className="absolute top-2 right-2 w-8 h-8 cursor-pointer hover:opacity-80"
          onClick={(e) => {
            setVisible(true);
            deleteDisasterImageById(e); // Trigger the delete action when the delete icon is clicked
          }}
          data-bs-toggle="modal"
          data-bs-target="#exampleModalCenter"
        />

        {/* Render the modal if visible */}
        {visible && (
          <div
            className="fixed z-40 overflow-y-auto top-0 w-full left-0"
            id="modal"
          ></div>
        )}
      </div>
    </>
  );
};

export default DeleteReportImageModal;
