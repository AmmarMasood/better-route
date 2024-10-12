import { Dropdown, Space } from "antd";
import React from "react";
import { DownOutlined } from "@ant-design/icons";
import { UserAuth } from "../context/AuthContext";
import Logo from "../../images/Better_Route_Logo_3-01-removebg-preview.png";
import Image from "next/image";

function Navbar({ userName }: { userName: string }) {
  const { logOut } = UserAuth() as any;
  return (
    <nav className="bg-white flex items-center justify-between px-6">
      <Image src={Logo} alt="Better Route Logo" width={100} height={50} />
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
