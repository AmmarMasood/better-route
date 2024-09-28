"use client";

import Link from "next/link";
import { button, formContainer, heading, input, label } from "../styles";
import { useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";
import { withoutAuth } from "../hoc/withoutAuth";

function Register() {
  const {
    emailPasswordSignup,
    initializeUser,
    sendVerificationEmail,
    setToken,
  } = UserAuth() as any;
  const [details, setDetails] = useState({
    fullName: "",
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
    const { fullName, email, password } = details;
    if (!fullName || !email || !password) {
      setError("Please fill in all fields");
      return false;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
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
        const { user } = await emailPasswordSignup(
          details.email,
          details.password
        );
        await initializeUser({
          fullName: details.fullName,
          email: user.email,
          uid: user.uid,
        });

        await sendVerificationEmail();
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
      <div>
        <h1 className={`${heading} mb-8 text-center`}>Register</h1>
        <form className={formContainer}>
          <label htmlFor="fullName" className={label}>
            Full Name
          </label>
          <input
            type="fullName"
            id="fullName"
            name="fullName"
            value={details.fullName}
            onChange={onValueChange}
            className={`${input} mb-6`}
          />
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
            disabled={loading}
          >
            Register
          </button>

          <p className="mt-4 text-sm text-center text-black">
            Already have an account?{" "}
            <Link href="/" className="text-blue-500">
              Login
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default withoutAuth(Register);
