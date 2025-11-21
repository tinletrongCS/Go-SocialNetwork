export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/v1";

// Định nghĩa rõ kiểu trả về là một object chứa string
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const fetcher = async (endpoint: string, options: RequestInit = {}) => {
  // Tạo biến headers riêng và ép kiểu để tránh lỗi TypeScript
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> || {}), // Ép kiểu options.headers về dạng object đơn giản
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers, // Truyền object headers đã gộp vào đây
  });

  if (!res.ok) {
    // Xử lý an toàn khi response body có thể rỗng hoặc không phải JSON
    let errorMessage = "Something went wrong";
    try {
      const error = await res.json();
      errorMessage = error.error || errorMessage;
    } catch {
      // Nếu không parse được JSON thì giữ nguyên lỗi mặc định
    }
    throw new Error(errorMessage);
  }
  
  // Kiểm tra xem có nội dung trả về không (đề phòng trường hợp 204 No Content)
  if (res.status === 204) {
    return null;
  }

  return res.json();
};