import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

function Loading({ show }: { show: boolean }) {
  return show ? (
    <div className="h-screen w-screen absolute flex items-center justify-center z-[1000000] top-0 left-0">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 64 }} spin />} />
    </div>
  ) : null;
}

export default Loading;
