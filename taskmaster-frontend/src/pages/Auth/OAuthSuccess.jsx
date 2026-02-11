import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OAuthSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, []);

  return <p style={{ textAlign: "center" }}>Logging you in…</p>;
};

export default OAuthSuccess;
