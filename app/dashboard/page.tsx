"use client";

import React from "react";
import { withAuth } from "../hoc/withAuth";
import { UserAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Upload from "../components/dashboard/Upload";
import AddressList from "../components/dashboard/AddressList";

import { Button, message } from "antd";
import GoogleMatrixAPI from "./google-matrix";
import Loading from "../components/Loading";
import AddAddressModal from "../components/dashboard/AddAddressModal";
import ImportFilesModal from "../components/dashboard/ImportFilesModal";
import { BATCH_SIZE } from "../contants";

function Dashboard() {
  const { user } = UserAuth() as any;

  const [messageApi, contextHolder] = message.useMessage();
  const [showAddAddressModal, setShowAddAddressModal] = React.useState(false);
  const [showImportDataModal, setShowImportDataModal] = React.useState(false);
  const [uploadedPath, setUploadedPath] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showUpload, setShowUpload] = React.useState(true);
  const [selectedPath, setSelectedPath] = React.useState(null);
  const [filteredPaths, setFilteredPaths] = React.useState([]);
  const [paths, setPaths] = React.useState([]);
  const googleMatrixAPI = new GoogleMatrixAPI(
    process.env.NEXT_PUBLIC_GOOGLE_MATRIX_KEY || ""
  );

  const handleParsedAddresses = async (customPaths: any) => {
    if (customPaths.length === 0) {
      message.error("No addresses found in the file");
      return;
    }
    if (customPaths.length > BATCH_SIZE) {
      message.error(`You can upload only ${BATCH_SIZE} addresses at a time`);
      return;
    }

    console.log("customPaths", customPaths);

    setUploadedPath(customPaths);
    const addresses = customPaths.map((adress: any) => `${adress}`);
    setLoading(true);
    try {
      const r = await googleMatrixAPI.getOptimalRoute(addresses);
      setPaths(r.route as any);
      setShowUpload(false);
      console.log(r.route);
    } catch (e) {
      messageApi.error("Failed to get optimal route");
      console.log(e);
    }
    setLoading(false);
  };

  const onSelect = (path: any) => {
    setSelectedPath(path);
  };

  const filterPaths = (search: string) => {
    const filtered = paths.filter(
      (path: any) =>
        path.pointA.toLowerCase().includes(search.toLowerCase()) ||
        path.pointB.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredPaths(filtered);
  };

  const toggleUpload = () => {
    setShowUpload(!showUpload);
  };

  const onSubmitAddress = (address: string) => {
    if (!address) {
      message.error("Please enter an address");
      return;
    }

    if (uploadedPath.includes(address)) {
      message.error("Address already exists");
      return;
    }

    if (uploadedPath.length >= BATCH_SIZE) {
      message.error(`You can only add ${BATCH_SIZE} addresses at a time`);
      return;
    }

    const newPaths = [...uploadedPath, address];
    setUploadedPath(newPaths);
    handleParsedAddresses(newPaths);
  };
  return (
    <div className="h-screen w-screen">
      <Loading show={loading} />
      {contextHolder}
      <Navbar userName={user?.email} />
      <div className="flex items-center justify-end">
        <Button onClick={toggleUpload} type="primary" className="mr-4 mt-4">
          {showUpload ? "Open Paths" : "Upload File"}
        </Button>
        <Button
          onClick={() => setShowImportDataModal(true)}
          type="primary"
          className="mt-4 mr-4"
        >
          Export Data
        </Button>
        <Button
          onClick={() => setShowAddAddressModal(true)}
          type="primary"
          className="mt-4 mr-4"
        >
          Add Address
        </Button>
      </div>
      <AddAddressModal
        open={showAddAddressModal}
        setOpen={setShowAddAddressModal}
        onSubmitAddress={onSubmitAddress}
      />
      <ImportFilesModal
        open={showImportDataModal}
        routes={paths}
        setOpen={setShowImportDataModal}
      />
      <main
        className="grid items-start justify-start w-screen h-screen relative"
        style={{
          gridTemplateColumns: "1fr",
        }}
      >
        {showUpload ? (
          <Upload handleParsedAddresses={handleParsedAddresses} />
        ) : (
          <AddressList
            paths={filteredPaths.length ? filteredPaths : paths}
            selectedPath={selectedPath}
            onSelect={onSelect}
            filterPaths={filterPaths}
          />
        )}
        {/* <Map /> */}
      </main>
    </div>
  );
}

export default withAuth(Dashboard);
