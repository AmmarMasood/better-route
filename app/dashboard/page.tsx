"use client";

import React from "react";
import { withAuth } from "../hoc/withAuth";
import { UserAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Upload from "../components/dashboard/Upload";
import AddressList from "../components/dashboard/AddressList";
import Map from "../components/dashboard/Map";
import { Button } from "antd";

function Dashboard() {
  const { user } = UserAuth() as any;
  const [showUpload, setShowUpload] = React.useState(true);
  const [selectedPath, setSelectedPath] = React.useState(null);
  const [filteredPaths, setFilteredPaths] = React.useState([]);
  const [paths, setPaths] = React.useState([]);

  const handleParsedAddresses = (paths: any) => {
    setPaths(paths);
    setShowUpload(false);
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

  return (
    <div className="h-screen w-screen">
      <Navbar userName={user?.email} />
      <main
        className="grid items-start justify-start w-screen h-screen relative"
        style={{
          gridTemplateColumns: "550px 1fr",
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
        <Map />
        <Button
          onClick={toggleUpload}
          type="primary"
          className="absolute top-4 right-4 z-10 rounded-full w-16 h-16 flex items-center justify-center"
        >
          {showUpload ? "Paths" : "Upload"}
        </Button>
      </main>
    </div>
  );
}

export default withAuth(Dashboard);
