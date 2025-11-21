import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetcher } from "./api";

export const ConfirmationPage = () => {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Đang kích hoạt...");

  useEffect(() => {
    const activateAccount = async () => {
      try {
        await fetcher(`/users/activate/${token}`, { method: "PUT" });
        setStatus("Kích hoạt thành công! Đang chuyển hướng...");
        setTimeout(() => navigate("/auth"), 2000);
      } catch (error) {
        setStatus("Kích hoạt thất bại hoặc token đã hết hạn.");
      }
    };
    activateAccount();
  }, [token, navigate]);

  return (
    <div className="container" style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>{status}</h2>
      <button className="btn" onClick={() => navigate("/auth")}>Quay lại đăng nhập</button>
    </div>
  );
};