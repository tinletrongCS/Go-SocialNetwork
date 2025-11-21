import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetcher } from "./api";

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (isLogin) {
        // --- LUỒNG ĐĂNG NHẬP ---
        // 1. Gọi API lấy Token
        const res = await fetcher("/authentication/token", {
          method: "POST",
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        
        // 2. Lưu token vào LocalStorage (SỬA LẠI DÒNG NÀY)
        // Backend trả về { data: "token..." } nên phải lấy .data
        localStorage.setItem("token", res.data); 
        
        // 3. Chuyển hướng vào Feed
        navigate("/");
      } else {
        // --- LUỒNG ĐĂNG KÝ ---
        // 1. Gọi API đăng ký
        await fetcher("/authentication/user", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        
        // 2. Thông báo thành công
        setMessage("Đăng ký thành công! Vui lòng kiểm tra Mailtrap để kích hoạt tài khoản.");
        setFormData({ username: "", email: "", password: "" });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ marginTop: "100px", textAlign: "center" }}>
      <h1 style={{ marginBottom: "30px" }}>Tho-ret-Ci-ty</h1>
      
      {message && <div style={{ color: "green", marginBottom: "10px" }}>{message}</div>}
      {error && <div style={{ color: "#ff3040", marginBottom: "10px" }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: "350px", margin: "0 auto" }}>
        {!isLogin && (
          <input
            className="input-field"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
        )}
        <input
          className="input-field"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          className="input-field"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        
        <button className="btn" type="submit">
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </button>
      </form>

      <div style={{ marginTop: "20px" }}>
        <span className="link" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
        </span>
      </div>
    </div>
  );
};