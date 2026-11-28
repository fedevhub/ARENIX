export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

export const getToken = () => localStorage.getItem("token");

export const isLoggedIn = () => Boolean(getToken() && getUser());

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("isLogin");
  localStorage.removeItem("user");
}

// Halaman utama tiap role setelah login
export function rumahRole(role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "petugas") return "/petugas/dashboard";
  if (role === "penyewa") return "/";
  return "/login";
}
