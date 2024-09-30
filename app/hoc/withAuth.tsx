import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const withAuth = (Component: any) => {
  const Wrapper = (props: any) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("auth");
      if (!token) {
        router.push("/");
      }
    }, []);

    return <Component {...props} />;
  };

  return Wrapper;
};
