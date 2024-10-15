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
import Map from "../components/dashboard/Map";
import * as XLSX from "xlsx";

function Dashboard() {
  const { user } = UserAuth() as any;
  const [mapData, setMapData] = React.useState({
    index: -1,
    paths: [],
  });
  const [random, setRandom] = React.useState(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [showAddAddressModal, setShowAddAddressModal] = React.useState(false);
  const [showImportDataModal, setShowImportDataModal] = React.useState(false);
  // const [uploadedPath, setUploadedPath] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showUpload, setShowUpload] = React.useState(true);
  const [selectedPath, setSelectedPath] = React.useState(null);
  const [filteredPaths, setFilteredPaths] = React.useState([]);
  const [paths, setPaths] = React.useState([]);
  const googleMatrixAPI = new GoogleMatrixAPI(
    process.env.NEXT_PUBLIC_GOOGLE_MATRIX_KEY || ""
  );

  const divideInChunks = (paths: any, listValue: number) => {
    const chunkedPaths = [];
    let i = 0;
    while (i < paths.length) {
      chunkedPaths.push(paths.slice(i, (i += listValue)));
    }
    return chunkedPaths;
  };
  const handleParsedAddresses = async (customPaths: any, listValue: number) => {
    if (customPaths.length === 0) {
      message.error("No addresses found in the file");
      return;
    }
    if (customPaths.length > BATCH_SIZE) {
      message.error(`You can upload only ${BATCH_SIZE} addresses at a time`);
      return;
    }

    const addresses = customPaths.map((adress: any) => `${adress}`);
    setLoading(true);
    try {
      const r = await googleMatrixAPI.getOptimalRoute(addresses);
      const chunkedPaths = divideInChunks(r.route, listValue) as any;
      setPaths(chunkedPaths);
      setShowUpload(false);
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


  const onSubmitAddress = async (address: string) => {
    if (!address) {
      message.error("Please enter an address");
      return;
    }

    if (paths.length === 0) {
      message.error("Please upload a file first");
      return;
    }

    if (mapData.index < 0) {
      message.error("Please select a path first");
      return;
    }

    const newPaths = [
      ...mapData.paths.map((data: any) => data.pointA),
      address,
    ];

    setLoading(true);
    try {
      const r = await googleMatrixAPI.getOptimalRoute(newPaths);
      const newPathsState = [...paths];
      (newPathsState[mapData.index] as any) = r.route;
      setPaths(newPathsState);
      setMapData({
        index: mapData.index,
        paths: r.route as any,
      });
      setRandom(Math.random());
    
    } catch (err) {
      console.log(err);
      message.error("Failed to get optimal route");
    }
    setLoading(false);
    // console.log("mapData", newPaths);

    // if (paths.flat().includes(address)) {
    //   message.error("Address already exists");
    //   return;
    // }

    // if (uploadedPath.length >= BATCH_SIZE) {
    //   message.error(`You can only add ${BATCH_SIZE} addresses at a time`);
    //   return;
    // }

    // const newPaths = [...uploadedPath, address];
    // setUploadedPath(newPaths);
    // handleParsedAddresses(newPaths);
  };

  const setPathsForMap = (index: number, paths: any) => {
    setMapData({
      index,
      paths,
    });
    setRandom(Math.random());
  };

  const handleExport = () => {
    if (paths.length === 0) {
      message.error("No data to export");
      return;
    }
    const myroutes = paths.map((route: any) => {
      return route.map((route: any) => {
        console.log(route);
        return {
          ...route,
          distance: route.distance.text,
          duration: route.duration.text,
        };
      });
    });

    myroutes.forEach((file) => {
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
  };

  return (
    <div className="h-screen w-screen">
      <Loading show={loading} />
      {contextHolder}
      <Navbar userName={user?.email} />
      <div className="flex items-center justify-end mb-4">
        <Button onClick={toggleUpload} type="primary" className="mr-4 mt-4">
          {showUpload ? "Open Paths" : "Upload File"}
        </Button>
        <Button onClick={handleExport} type="primary" className="mt-4 mr-4">
          Export Data
        </Button>
        {paths.length > 0 && mapData.index >= 0 && (
          <Button
            onClick={() => setShowAddAddressModal(true)}
            type="primary"
            className="mt-4 mr-4"
          >
            Add Address
          </Button>
        )}
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
          gridTemplateColumns: "1fr 1fr",
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
            setPathsForMap={setPathsForMap}
          />
        )}
        
        <Map mapData={mapData.paths} key={random} />
      </main>
    </div>
  );
}

export default withAuth(Dashboard);
