export const createBlog = async (body, token) => {

    try {
    const res = await fetch("http://localhost:8000/blogs/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,   
      },
      body: JSON.stringify(body),
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Failed to create blog");
    }

    const data = await res.json();
    console.log("Created blog:", data);

    setFormData({ name: "", description: "" });

  } catch (error) {
    console.log(error.message);
  }

}

export const getAllBlogs = async (token) => {
    const res = await fetch("http://localhost:8000/blogs/all_blogs", {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    if (res.status === 401) {
      localStorage.removeItem("token");
      throw new Error("UNAUTHORIZED");
    }
  
    const data = await res.json().catch(() => ({}));
  
    if (!res.ok) {
      throw new Error(data.detail || "Failed to fetch blogs");
    }
  
    return data;
  };