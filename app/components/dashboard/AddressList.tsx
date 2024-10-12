import React from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Input, Collapse } from "antd";

function AddressList({
  paths,
  selectedPath,
  onSelect,
  filterPaths,
  setPathsForMap,
}: any) {
  const [currentKey, setCurrentKey] = React.useState("-1");
  const onChange = (key: any) => {
    const ind = parseInt(key[1]);
    if (ind === undefined || Number.isNaN(ind)) return;
    // console.log(ind);
    // console.log(paths[ind]);
    setPathsForMap(ind, paths[ind]);
  };
  return (
    <div className="bg-white border rounded-xl shadow-lg h-[700px] m-4 overflow-auto">
      {/* <Input
        placeholder="Search paths"
        onChange={(e) => filterPaths(e.target.value)}
        className="m-2 w-[96.5%] bg-gray-100"
      /> */}
      <div>
        <Collapse defaultActiveKey={[currentKey]} onChange={onChange}>
          {paths.map((paths: any, index: number) => (
            <Collapse.Panel key={index} header={`List ${index + 1}`}>
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
                  <div>{path.distance.text ?? "0"}</div>
                  <div>{path.duration.text ?? "0"}</div>
                </div>
              ))}
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
    </div>
  );
}

export default AddressList;
