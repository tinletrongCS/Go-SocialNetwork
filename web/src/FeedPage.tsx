import { useEffect, useState } from "react";
import { fetcher } from "./api";
import { useNavigate } from "react-router-dom";

interface Post {
  id: number;
  title: string;
  content: string;
  username: string;
  created_at: string;
  comments_count: number;
  tags: string[];
}

interface User {
  id: number;
  username: string;
  email: string;
  isFollowing: boolean; // Thêm trạng thái này để quản lý UI
}

export const FeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE CHO TÌM KIẾM ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  // --------------------------

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  // Load Feed
  useEffect(() => {
    const loadFeed = async () => {
      try {
        const data = await fetcher("/users/feed?limit=20&sort=desc");
        setPosts(data.data || []);
      } catch (error) {
        console.error(error);
        // navigate("/auth"); // Tạm comment để debug tiện hơn
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, [navigate]);

  // --- HÀM TÌM KIẾM ---
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      const data = await fetcher(`/users/search?q=${query}`);
      // Mặc định ban đầu là false (vì API Search chưa trả về trạng thái follow)
      // Nếu muốn chính xác 100%, cần gọi thêm API lấy danh sách following để map vào
      const mappedUsers = (data.data || []).map((u: any) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        isFollowing: u.is_following 
      }));
      setSearchResults(mappedUsers);
    } catch (error) {
      console.error("Search failed", error);
    }
  };

  // --- HÀM TOGGLE FOLLOW ---
  const handleToggleFollow = async (user: User) => {
    try {
      if (user.isFollowing) {
        // Đang follow -> Gọi API Unfollow
        await fetcher(`/users/${user.id}/unfollow`, { method: "PUT" });
      } else {
        // Chưa follow -> Gọi API Follow
        await fetcher(`/users/${user.id}/follow`, { method: "PUT" });
      }

      // Cập nhật lại trạng thái UI (Đảo ngược isFollowing)
      setSearchResults(prev => prev.map(u => 
        u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u
      ));

    } catch (error: any) {
      // Nếu lỗi là "Conflict" (đã follow rồi), ta cứ chuyển UI sang "Đang theo dõi" cho khớp
      if (!user.isFollowing && error.message?.includes("conflict")) {
         setSearchResults(prev => prev.map(u => 
          u.id === user.id ? { ...u, isFollowing: true } : u
        ));
      } else {
        alert("Thao tác thất bại: " + error.message);
      }
    }
  };

  return (
    <div className="container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0" }}>
        <h2 style={{ margin: 0 }}>🐢 Tho-ret-Ci-ty 🏢🏢🏬🏬</h2>
        <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #333", color: "white", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>Đăng xuất</button>
      </header>

      {/* --- THANH TÌM KIẾM --- */}
      <div style={{ marginBottom: "20px", position: "relative" }}>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Tìm kiếm người dùng..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        
        {/* Kết quả tìm kiếm */}
        {searchResults.length > 0 && (
          <div style={{ 
            position: "absolute", 
            top: "100%", 
            left: 0, 
            right: 0, 
            background: "#1e1e1e", 
            border: "1px solid #333", 
            borderRadius: "8px",
            zIndex: 100,
            maxHeight: "300px",
            overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
          }}>
            {searchResults.map(user => (
              <div key={user.id} style={{ 
                padding: "12px 16px", 
                borderBottom: "1px solid #333", 
                display: "flex", 
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                {/* Thông tin User */}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>{user.username}</div>
                  <div style={{ fontSize: "0.85rem", color: "#777", marginTop: "2px" }}>{user.email}</div>
                </div>

                {/* Nút Follow/Unfollow */}
                <button 
                  onClick={() => handleToggleFollow(user)}
                  style={{ 
                    // Logic màu sắc: Xanh lá nếu chưa follow, Xám nếu đang follow
                    backgroundColor: user.isFollowing ? "#333" : "#00C853", 
                    color: user.isFollowing ? "#ccc" : "#000",
                    border: user.isFollowing ? "1px solid #555" : "none",
                    padding: "6px 16px", 
                    borderRadius: "8px", 
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    minWidth: "120px", // Để kích thước nút không bị giật khi đổi chữ
                    transition: "all 0.2s"
                  }}
                >
                  {user.isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <h3 style={{marginBottom: "10px"}}>Gợi ý cho bạn</h3>

      {loading ? <p>Loading...</p> : (
        <div>
          {posts.length === 0 ? (
            <div style={{ textAlign: "center", color: "#777", marginTop: "50px" }}>
              <p>Chưa có bài viết nào.</p>
              <p>Hãy nhập tên vào ô tìm kiếm và <b>Theo dõi</b> mọi người nhé!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="card">
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>@{post.username}</div>
                <h3 style={{ fontSize: "1rem", margin: "5px 0" }}>{post.title}</h3>
                <p style={{ color: "#ccc", fontSize: "0.95rem" }}>{post.content}</p>
                
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  {post.tags && post.tags.map(tag => (
                    <span key={tag} style={{ color: "#1d9bf0", fontSize: "0.8rem" }}>#{tag}</span>
                  ))}
                </div>
                
                <div style={{ marginTop: "10px", color: "#777", fontSize: "0.85rem" }}>
                  {post.comments_count} comments • {new Date(post.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};