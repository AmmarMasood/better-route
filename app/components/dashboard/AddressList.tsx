import React from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Input } from "antd";

function AddressList({ paths, selectedPath, onSelect, filterPaths }: any) {
  return (
    <div className="bg-white border rounded-xl shadow-lg h-[700px] m-4 overflow-auto">
      <Input
        placeholder="Search paths"
        onChange={(e) => filterPaths(e.target.value)}
        className="m-2 w-[96.5%] bg-gray-100"
      />
      <div>
        {paths.map((path: any) => (
          <div
            onClick={() => onSelect(path)}
            key={path.id}
            className={`flex items-center justify-between p-4 border-b text-black  cursor-pointer ${
              selectedPath?.id === path.id ? "bg-gray-200" : ""
            }`}
          >
            <div className="w-[150px]">{path.pointA}</div>
            <ArrowRightOutlined />
            <div className="w-[150px]">{path.pointB}</div>
            <div>{path.distance ?? "0"} km</div>
            <div>{path.duration ?? "0"} min</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AddressList;
