const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const ACCESS_KEY = "token";         
const REFRESH_KEY = "refresh_token"; 
const USER_KEY = "user";             

function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

function setSession({ access_token, refresh_token, user }) {
  if (access_token) localStorage.setItem(ACCESS_KEY, access_token);
  if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}


export async function login(username, password) {
  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);

  const res = await fetch(`${API_BASE}/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    throw new Error("Invalid credentials");
  }

  const data = await res.json();
  setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: data.user,
  });

  return data;
}


export async function refreshAccessToken() {
  const refresh_token = getRefreshToken();
  if (!refresh_token) throw new Error("No refresh token");

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });

  if (!res.ok) {
    clearSession();
    throw new Error("Refresh failed");
  }

  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem(ACCESS_KEY, data.access_token);
  }
  return data;
}

/**
 * Standard verify-token:
 * GET /auth/verify-token with Authorization header
 */
export async function verifyToken() {
  const token = getAccessToken();
  if (!token) return { isValid: false };

  const res = await fetch(`${API_BASE}/auth/verify-token`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // If expired/invalid -> backend returns 401
  if (!res.ok) return { isValid: false };

  const data = await res.json();
  return {
    isValid: data.status === "valid",
    user: data.user,
    time_left_seconds: data.time_left_seconds,
  };
}

/**
 * Your Login.jsx calls checkExistingSession().
 * This version verifies the access token; if invalid, tries refresh once.
 */
export async function checkExistingSession() {
  const verified = await verifyToken();
  if (verified.isValid) return verified;

  // try refresh once (optional but recommended)
  try {
    await refreshAccessToken();
    const verifiedAgain = await verifyToken();
    return verifiedAgain.isValid ? verifiedAgain : { isValid: false };
  } catch {
    return { isValid: false };
  }
}

/**
 * Helper for authenticated requests (optional but very useful).
 * Automatically refreshes once on 401.
 */
export async function authFetch(url, options = {}) {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const first = await fetch(url, { ...options, headers });

  if (first.status !== 401) return first;

  // Attempt refresh and retry once
  try {
    await refreshAccessToken();
    const newToken = getAccessToken();
    if (newToken) headers.set("Authorization", `Bearer ${newToken}`);
    return await fetch(url, { ...options, headers });
  } catch {
    return first;
  }
}

/**
 * Register: keep your existing backend endpoint here.
 * Update the URL/body to match YOUR backend register endpoint.
 * (I cannot see it in the uploaded file.)
 */
export async function register(username, password, email) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "username": username, "email":email, "password_hash":password }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Registration failed");
  }
  return res.json();
}

/**
 * update_login: keep your existing implementation if backend still supports it.
 * Placeholder example:
 */
export async function update_login(username) {
  // If you still need this endpoint, use authFetch:
  // return authFetch(`${API_BASE}/users/update-login`, {...})
  return true;
}

export { clearSession, getAccessToken };
