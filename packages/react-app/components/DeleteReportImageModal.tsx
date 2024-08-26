// This component is used to add a product to the marketplace and show the user's cUSD balance

// Importing the dependencies
import { useEffect, useState } from "react";
// import ethers to convert the product price to wei
import { ethers } from "ethers";
// Import the useAccount and useBalance hooks to get the user's address and balance
import { useAccount, useBalance } from "wagmi";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import the useDebounce hook to debounce the input fields
import { useDebounce } from "use-debounce";
// Import our custom useContractSend hook to write a product to the marketplace contract
import { useContractSend } from "@/hooks/contracts/useContractWrite";
// Import the erc20 contract abi to get the cUSD balance
import erc20Instance from "../abi/erc20.json";

interface Props {
  id: string;
  imageIndex: number;
}

// The DeleteReportImageModal component is used to add a product to the marketplace
const DeleteReportImageModal = ({ id, imageIndex }: Props) => {
  // The visible state is used to toggle the modal
  const [visible, setVisible] = useState(false);

  // The loading state is used to display a loading message
  const [loading, setLoading] = useState("");
  // The displayBalance state is used to store the cUSD balance of the user
  const [displayBalance, setDisplayBalance] = useState(false);
  const [disable, setDisable] = useState(false);

  // Get the user's address and balance
  const { address, isConnected } = useAccount();
  const { data: cusdBalance } = useBalance({
    address,
    token: erc20Instance.address as `0x${string}`,
  });

  const [debouncedId] = useDebounce(id, 500);
  const [debouncedImageIndex] = useDebounce(imageIndex, 500);

  const { writeAsync: deleteDisasterImage } = useContractSend(
    "deleteDisasterImage",
    [debouncedId, debouncedImageIndex]
  );

  // Function to delete an image
  const handleDeleteImage = async () => {
    if (!deleteDisasterImage) {
      throw "Failed to delete image";
    }
    setLoading("Deleting...");
    const deleteTx = await deleteDisasterImage();
    setLoading("Waiting for confirmation...");
    await deleteTx.wait();
    setVisible(false);
  };

  const deleteDisasterImageById = async (e: any) => {
    e.preventDefault();
    try {
      await toast.promise(handleDeleteImage(), {
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
    <>
      <div>
        <img
          src="/delete.png" // Replace with the path to your delete icon image
          alt="Delete Image"
          className="absolute top-2 right-2 w-8 h-8 cursor-pointer hover:opacity-80"
          onClick={(e) => {
            setVisible(true);
            deleteDisasterImageById(e);
          }}
          data-bs-toggle="modal"
          data-bs-target="#exampleModalCenter"
        />

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
