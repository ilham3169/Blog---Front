const API_URL = "http://127.0.0.1:8000/auth";

export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password_hash: password, 
    }),
  });
  
  const data = await response.json();
  if(!response.ok) { throw new Error(data.detail || "Login failed"); }
  return data; 
};

export const update_login = async (username) => {
  await fetch(`http://127.0.0.1:8000/auth/last_login/${username}`, { 
    method: "PATCH" 
  });
}

export const verifyToken = async (token) => {
  const response = await fetch(`http://localhost:8000/auth/verify-token?token=${token}`);
  return await response.json();
};

export const register = async (username, password, email) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password_hash: password, 
      email: email
    }),
  });
  
  const data = await response.json();
  if(!response.ok) { throw new Error(data.detail || "Login failed"); }
  return data; 
};



