import { Dropdown, Space } from "antd";
import React from "react";
import { DownOutlined } from "@ant-design/icons";
import { UserAuth } from "../context/AuthContext";

function Navbar({ userName }: { userName: string }) {
  const { logOut } = UserAuth() as any;
  return (
    <nav className="bg-white flex items-end justify-end p-6">
      <Dropdown
        menu={{
          items: [
            {
              key: "1",
              label: "Log Out",
              onClick: async () => {
                await logOut();
              },
            },
          ],
        }}
      >
        <a onClick={(e) => e.preventDefault()}>
          <Space className="text-black">
            {userName}
            <DownOutlined />
          </Space>
        </a>
      </Dropdown>
    </nav>
  );
}

export default Navbar;
