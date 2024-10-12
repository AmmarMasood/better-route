"use client";

import Link from "next/link";
import { button, formContainer, heading, input, label } from "./styles";
import { useState } from "react";
import { withoutAuth } from "./hoc/withoutAuth";
import { UserAuth } from "./context/AuthContext";
import { useRouter } from "next/navigation";
import Loading from "./components/Loading";
import Image from "next/image";
import Logo from "../images/Better_Route_Logo_3-01-removebg-preview.png";

function Login() {
  const { emailPasswordSignin, setToken } = UserAuth() as any;

  const [details, setDetails] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetails({
      ...details,
      [e.target.name]: e.target.value,
    });
  };

  const handleValidation = () => {
    const { email, password } = details;
    if (!email || !password) {
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
        const { user } = await emailPasswordSignin(
          details.email,
          details.password
        );
        setToken(user.accessToken);
        router.push("/dashboard");
      } catch (e: any) {
        setError(e?.message || "An error occurred while registering");
      }
      setLoading(false);
    }
  };
  return (
    <main className="flex items-center justify-center h-screen">
      <Loading show={loading} />

      <div className="flex flex-col items-center">
        <Image src={Logo} alt="Better Route Logo" width={100} height={50} />

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
          <label htmlFor="password" className={label}>
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className={`${input} mb-6`}
            value={details.password}
            onChange={onValueChange}
          />

          {error && <p className="text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className={`${button} mt-4`}
            onClick={handleSubmit}
          >
            Login
          </button>

          <p className="mt-4 text-sm text-center text-black">
            Don&apos;t have an account?{" "}
            <Link href="/auth" className="text-blue-500">
              Register
            </Link>
          </p>

          <p className="mt-4 text-sm text-center text-black">
            Forgot Password?{" "}
            <Link href="/auth/reset" className="text-blue-500">
              Reset Password
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default withoutAuth(Login);
