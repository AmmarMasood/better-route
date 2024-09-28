import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const withoutAuth = (Component: any) => {
  const Wrapper = (props: any) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("auth");
      if (token) {
        router.push("/dashboard");
      }
    }, []);

    return <Component {...props} />;
  };

  return Wrapper;
};
