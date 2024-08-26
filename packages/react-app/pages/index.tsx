// This is the main page of the app
import CreateReportModal from "@/components/CreateReportModal";
import DisasterReportList from "@/components/DisasterReportList";

export default function Home() {
  return (
    <div>
      {/* Render the modal for creating a new disaster report */}
      <CreateReportModal />

      {/* Render the list of disaster reports */}
      <DisasterReportList />
    </div>
  );
}
