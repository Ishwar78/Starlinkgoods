/**
 * Central API Client for SLG / SolarSystemEcommerce
 * Reads base URL from frontend .env (VITE_API_URL or VITE_API_BASE_URL)
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

/**
 * Universal fetch wrapper with token header & error handling
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");

  const isUserContext =
    (typeof window !== "undefined" && window.location.pathname.startsWith("/user")) ||
    endpoint.includes("/api/vendor-users/my-users") ||
    endpoint.includes("/api/kyc/my-status") ||
    endpoint.includes("/api/kyc/submit") ||
    endpoint.includes("/api/vendors/me") ||
    endpoint.includes("/api/vendors/profile-image") ||
    endpoint.includes("/api/vendors/my-wallet") ||
    endpoint.includes("/api/wallet-requests/my-requests") ||
    (endpoint.includes("/api/wallet-requests") && !endpoint.includes("/api/wallet-requests/all"));

  const authToken = isUserContext
    ? (userToken || adminToken)
    : (adminToken || userToken);

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      data.message ||
      data.error ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

/* =======================================
   Vendor API Methods
======================================= */

export async function getVendors() {
  return apiFetch("/api/vendors");
}

export async function getVendorMembers(vendorId) {
  return apiFetch(`/api/vendors/${vendorId}/members`);
}

export async function createVendorOrder(vendorData) {
  return apiFetch("/api/vendors/create-order", {
    method: "POST",
    body: JSON.stringify(vendorData),
  });
}

export async function verifyAndCreateVendor(payload) {
  return apiFetch("/api/vendors/verify-and-create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createVendor(vendorData) {
  return apiFetch("/api/vendors", {
    method: "POST",
    body: JSON.stringify(vendorData),
  });
}

export async function deleteVendor(vendorId) {
  return apiFetch(`/api/vendors/${vendorId}`, {
    method: "DELETE",
  });
}

export async function toggleVendorStatus(vendorId) {
  return apiFetch(`/api/vendors/${vendorId}/status`, {
    method: "PATCH",
  });
}

/* =======================================
   Admin Auth API Methods
======================================= */

export async function adminLogin(email, password) {
  return apiFetch("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/* =======================================
   Vendor / User Auth API Methods
======================================= */

export async function vendorLogin(identifier, password) {
  return apiFetch("/api/vendors/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export async function getCurrentVendor() {
  return apiFetch("/api/vendors/me");
}

export async function uploadUserProfilePhoto(formData) {
  return apiFetch("/api/vendors/profile-image", {
    method: "POST",
    body: formData,
  });
}

export async function addVendorWalletMoney(vendorId, walletData) {
  return apiFetch(`/api/vendors/${vendorId}/wallet`, {
    method: "POST",
    body: JSON.stringify(walletData),
  });
}

export async function getMyWalletBalance(params = {}) {
  const query = new URLSearchParams();
  if (params.userId) query.append("userId", params.userId);
  if (params.email) query.append("email", params.email);
  const qs = query.toString();
  return apiFetch(`/api/vendors/my-wallet${qs ? `?${qs}` : ""}`);
}

/* =======================================
   Vendor Users (Users added by Vendors)
======================================= */

export async function addVendorUserWalletMoney(userId, walletData) {
  return apiFetch(`/api/vendor-users/${userId}/wallet`, {
    method: "POST",
    body: JSON.stringify(walletData),
  });
}

export async function createVendorUser(userData) {
  return apiFetch("/api/vendor-users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function getMyVendorUsers(params = {}) {
  const query = new URLSearchParams();
  if (params.vendorId) query.append("vendorId", params.vendorId);
  if (params.vendorEmail) query.append("vendorEmail", params.vendorEmail);
  const qs = query.toString();
  return apiFetch(`/api/vendor-users/my-users${qs ? `?${qs}` : ""}`);
}

export async function getAllVendorUsers() {
  return apiFetch("/api/vendor-users/all");
}

export async function deleteVendorUser(userId) {
  return apiFetch(`/api/vendor-users/${userId}`, {
    method: "DELETE",
  });
}

export async function toggleVendorUserStatus(userId, status) {
  return apiFetch(`/api/vendor-users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

/* =======================================
   Contact & Inquiries API Methods
======================================= */

export async function submitContactMessage(messageData) {
  return apiFetch("/api/contact/messages", {
    method: "POST",
    body: JSON.stringify(messageData),
  });
}

export async function getContactMessages() {
  return apiFetch("/api/contact/messages");
}

export async function markContactMessageAsRead(messageId) {
  return apiFetch(`/api/contact/messages/${messageId}/read`, {
    method: "PATCH",
  });
}

export async function deleteContactMessage(messageId) {
  return apiFetch(`/api/contact/messages/${messageId}`, {
    method: "DELETE",
  });
}

export async function getContactInfo() {
  return apiFetch("/api/contact/info");
}

export async function updateContactInfo(infoData) {
  return apiFetch("/api/contact/info", {
    method: "PUT",
    body: JSON.stringify(infoData),
  });
}

/* =======================================
   Product Catalog API Methods
======================================= */

export async function getProducts(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== "All") query.append("category", params.category);
  if (params.search) query.append("search", params.search);
  if (params.vendorId) query.append("vendorId", params.vendorId);

  const qs = query.toString();
  return apiFetch(`/api/products${qs ? `?${qs}` : ""}`);
}

export async function createProduct(formDataOrData) {
  const isFormData = typeof FormData !== "undefined" && formDataOrData instanceof FormData;
  return apiFetch("/api/products", {
    method: "POST",
    body: isFormData ? formDataOrData : JSON.stringify(formDataOrData),
  });
}

export async function updateProduct(productId, formDataOrData) {
  const isFormData = typeof FormData !== "undefined" && formDataOrData instanceof FormData;
  return apiFetch(`/api/products/${productId}`, {
    method: "PUT",
    body: isFormData ? formDataOrData : JSON.stringify(formDataOrData),
  });
}

export async function deleteProduct(productId) {
  return apiFetch(`/api/products/${productId}`, {
    method: "DELETE",
  });
}

/* =======================================
   Category API Methods (CRUD with File Upload)
======================================= */

export async function getCategories(params = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== "All") query.append("status", params.status);
  if (params.search) query.append("search", params.search);

  const qs = query.toString();
  return apiFetch(`/api/categories${qs ? `?${qs}` : ""}`);
}

export async function createCategory(formDataOrData) {
  const isFormData = typeof FormData !== "undefined" && formDataOrData instanceof FormData;
  return apiFetch("/api/categories", {
    method: "POST",
    body: isFormData ? formDataOrData : JSON.stringify(formDataOrData),
  });
}

export async function updateCategory(id, formDataOrData) {
  const isFormData = typeof FormData !== "undefined" && formDataOrData instanceof FormData;
  return apiFetch(`/api/categories/${id}`, {
    method: "PUT",
    body: isFormData ? formDataOrData : JSON.stringify(formDataOrData),
  });
}

export async function toggleCategoryStatus(id, status) {
  return apiFetch(`/api/categories/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteCategory(id) {
  return apiFetch(`/api/categories/${id}`, {
    method: "DELETE",
  });
}

export function formatImageUrl(imagePath) {
  if (!imagePath) return "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80";
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }
  return `${API_BASE_URL}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
}

/* =======================================
   KYC Verification API Methods
======================================= */

export async function submitKYC(formData) {
  return apiFetch("/api/kyc/submit", {
    method: "POST",
    body: formData,
  });
}

export async function getMyKYCStatus(params = {}) {
  const query = new URLSearchParams();
  if (params.email) query.append("email", params.email);
  if (params.userId) query.append("userId", params.userId);

  const qs = query.toString();
  return apiFetch(`/api/kyc/my-status${qs ? `?${qs}` : ""}`);
}

export async function getAllKYCSubmissions(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.status && params.status !== "All") query.append("status", params.status);

  const qs = query.toString();
  return apiFetch(`/api/kyc/all${qs ? `?${qs}` : ""}`);
}

export async function updateKYCStatus(id, { status, remarks }) {
  return apiFetch(`/api/kyc/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, remarks }),
  });
}

export async function deleteKYC(id) {
  return apiFetch(`/api/kyc/${id}`, {
    method: "DELETE",
  });
}

/* =======================================
   Membership Registration & Razorpay API
======================================= */

export async function verifyVendorId(vendorId) {
  return apiFetch("/api/membership/verify-vendor", {
    method: "POST",
    body: JSON.stringify({ vendorId }),
  });
}

export async function getMembershipConfig() {
  return apiFetch("/api/membership/config");
}

export async function checkUserRegistration(email, mobile) {
  return apiFetch("/api/membership/check-user", {
    method: "POST",
    body: JSON.stringify({ email, mobile }),
  });
}

export async function createMembershipOrder(userData) {
  return apiFetch("/api/membership/create-order", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function verifyAndRegisterMember(paymentAndUserData) {
  return apiFetch("/api/membership/verify-and-register", {
    method: "POST",
    body: JSON.stringify(paymentAndUserData),
  });
}

/* =======================================
   Wallet Payout & Withdrawal Request API
======================================= */

export async function submitWalletRequest(requestData) {
  return apiFetch("/api/wallet-requests", {
    method: "POST",
    body: JSON.stringify(requestData),
  });
}

export async function getMyWalletRequests(params = {}) {
  const query = new URLSearchParams();
  if (params.userId) query.append("userId", params.userId);
  if (params.email) query.append("email", params.email);
  const qs = query.toString();
  return apiFetch(`/api/wallet-requests/my-requests${qs ? `?${qs}` : ""}`);
}

export async function getAllWalletRequests(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.status && params.status !== "All") query.append("status", params.status);
  const qs = query.toString();
  return apiFetch(`/api/wallet-requests/all${qs ? `?${qs}` : ""}`);
}

export async function updateWalletRequestStatus(requestId, { status, adminRemarks, adminTransactionId }) {
  return apiFetch(`/api/wallet-requests/${requestId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, adminRemarks, adminTransactionId }),
  });
}

export async function deleteWalletRequest(requestId) {
  return apiFetch(`/api/wallet-requests/${requestId}`, {
    method: "DELETE",
  });
}

// ==========================================
// ORDER API HELPERS
// ==========================================

export async function getOrderRazorpayConfig() {
  return apiFetch("/api/orders/razorpay-config");
}

export async function createOrderRazorpayOrder(orderPayload) {
  return apiFetch("/api/orders/create-razorpay-order", {
    method: "POST",
    body: JSON.stringify(orderPayload),
  });
}

export async function createOrder(orderFormData) {
  return apiFetch("/api/orders", {
    method: "POST",
    body: orderFormData,
  });
}

export async function getMyOrders(params = {}) {
  const query = new URLSearchParams();
  if (params.vendorId) query.append("vendorId", params.vendorId);
  if (params.vendorEmail) query.append("vendorEmail", params.vendorEmail);
  const qs = query.toString();
  return apiFetch(`/api/orders/my-orders${qs ? `?${qs}` : ""}`);
}

export async function getAllOrders(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.status && params.status !== "All") query.append("status", params.status);
  const qs = query.toString();
  return apiFetch(`/api/orders/all${qs ? `?${qs}` : ""}`);
}

export async function updateOrderStatus(orderId, { orderStatus, adminNotes }) {
  return apiFetch(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ orderStatus, adminNotes }),
  });
}


