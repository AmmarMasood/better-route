"use client";

import React from "react";
import { withAuth } from "../hoc/withAuth";
import { UserAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function Dashboard() {
  const { emailPasswordSignin, initializeUser, setToken } = UserAuth() as any;

  return (
    <div className="h-screen w-screen">
      <Navbar userName="John Doe" />
      <h1>Welcome to dashboard</h1>
    </div>
  );
}

export default withAuth(Dashboard);
