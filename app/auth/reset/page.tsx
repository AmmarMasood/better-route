"use client";

import Link from "next/link";
import { button, formContainer, heading, input, label } from "../../styles";
import { useState } from "react";
import { withoutAuth } from "@/app/hoc/withoutAuth";
import { UserAuth } from "@/app/context/AuthContext";
import { message } from "antd";
import Loading from "@/app/components/Loading";

function ResetPassword() {
  const [messageApi, contextHolder] = message.useMessage();
  const { sendUserPasswordResetEmail } = UserAuth() as any;
  const [details, setDetails] = useState({
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({
      ...details,
      [e.target.name]: e.target.value,
    });
  };

  const handleValidation = () => {
    const { email } = details;
    if (!email) {
      setError("Please fill in all fields");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (handleValidation()) {
      setLoading(true);
      try {
        await sendUserPasswordResetEmail(details.email);
        messageApi.open({
          content: "Password reset email sent successfully",
          type: "success",
          duration: 2,
        });
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    }
  };
  return (
    <main className="flex items-center justify-center h-screen">
      {contextHolder}
      <Loading show={loading} />
      <div>
        <h1 className={`${heading} mb-8 text-center`}>Login</h1>
        <form className={formContainer}>
          <label htmlFor="email" className={label}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={details.email}
            onChange={onValueChange}
            className={`${input} mb-6`}
          />

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className={`${button} mt-4`}
            onClick={handleSubmit}
          >
            Reset My Password
          </button>

          <p className="mt-4 text-sm text-center text-black">
            Go back to{" "}
            <Link href="/" className="text-blue-500">
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default withoutAuth(ResetPassword);
