import { Button, Input, Modal, message } from "antd";
import React from "react";
import * as XLSX from "xlsx";

function ImportFilesModal({ open, setOpen, routes }: any) {
  const [numberOfFiles, setNumberOfFiles] = React.useState(1);

  const isAllowedWithMessage = () => {
    if (routes.length === 0) {
      return { allowed: false, message: "No routes found" };
    }

    if (numberOfFiles < 1) {
      return {
        allowed: false,
        message: "Number of files should be greater than 0",
      };
    }

    if (numberOfFiles > routes.length) {
      return {
        allowed: false,
        message:
          "Number of files should be less than or equal to the number of routes",
      };
    }

    if (routes.length % numberOfFiles !== 0) {
      return {
        allowed: false,
        message: "Number of files should be a factor of the number of routes",
      };
    }

    return { allowed: true, message: "" };
  };

  const handleExport = () => {
    if (!isAllowedWithMessage().allowed) {
      return;
    }

    const myroutes = routes.map((route: any) => {
      console.log(route);
      return {
        ...route,
        distance: route.distance.text,
        duration: route.duration.text,
      };
    });
    // divide the routes into the number of files
    const dividedRoutes = [];
    const routesCopy = [...myroutes];
    const routesPerFile = myroutes.length / numberOfFiles;
    for (let i = 0; i < numberOfFiles; i++) {
      dividedRoutes.push(routesCopy.splice(0, routesPerFile));
    }

    dividedRoutes.forEach((file) => {
      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Convert the data to a worksheet
      const ws = XLSX.utils.json_to_sheet(file);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      // Write the workbook and force a download
      XLSX.writeFile(wb, `optimized-paths.xlsx`);
    });

    message.success("Exported successfully");
    setOpen(false);
  };

  return (
    <Modal
      title="Export Data"
      open={open}
      footer={false}
      onCancel={() => setOpen(false)}
    >
      <label className="block text-primary-black text-base font-semibold mb-1">
        Number of files to divide the export
      </label>
      <Input
        placeholder="Enter number of files to divide the export"
        type="number"
        className="m-2 w-[96.5%] bg-gray-100"
        value={numberOfFiles}
        onChange={(e) => setNumberOfFiles(Number(e.target.value))}
      />
      <p
        className={`text-red-500 text-sm font-semibold mb-1 ${
          isAllowedWithMessage().allowed ? "hidden" : ""
        }`}
      >
        {isAllowedWithMessage().message}
      </p>

      <Button
        type="primary"
        className="mt-4"
        onClick={handleExport}
        disabled={!isAllowedWithMessage().allowed}
      >
        Export
      </Button>
    </Modal>
  );
}

export default ImportFilesModal;
