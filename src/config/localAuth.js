export const LOCAL_USERS = [
  {
    email: "superadmin@example.com",
    password: "super123",
    name: "Super Admin",
    role: "Super Admin",
    defaultPath: "/admin",
    allowedPaths: [
      "/admin",
      "/admin/vendors",
      "/admin/products",
      "/admin/products/add",
      "/admin/products/edit",
      "/admin/orders",
      "/admin/users",
      "/admin/categories",
      "/admin/subcategory",
      "/admin/subtosubcategory",
      "/admin/categoryattribute",  // ✅ add this
      "/admin/settings",
    ],
  },
  {
    email: "assistant@example.com",
    password: "assistant123",
    name: "Assistant Super Admin",
    role: "Assistant Super Admin",
    defaultPath: "/admin",
    allowedPaths: [
      "/admin",
      "/admin/products",
      "/admin/products/add",
      "/admin/products/edit",
      "/admin/orders",
      "/admin/users",
      "/admin/categories",
      "/admin/subcategory",        // ✅ added
      "/admin/subtosubcategory",   // ✅ added (for future)
    ],
  },
  {
    email: "vendor@example.com",
    password: "vendor123",
    name: "Vendor Admin",
    role: "Vendor",
    vendorId: "vdr-apex",
    defaultPath: "/vendor/products",
    allowedPaths: [
      "/vendor/products",
      "/vendor/products/add",
      "/vendor/products/inventory",
      "/vendor/orders",
      "/vendor/orders/returns",
      "/vendor/supply-chain",
      "/vendor/supply-chain/shipments",
      "/vendor/finance",
      "/vendor/finance/payouts",
    ],
  },
];

const SESSION_KEY = "adminSession";
const TOKEN_KEY = "adminToken";

export const getCurrentSession = () => {
  const fallback = {
    loggedIn: false,
    role: "Guest",
    name: "Not signed in",
    defaultPath: "/login",
    allowedPaths: [],
  };

  if (!localStorage.getItem(TOKEN_KEY)) return fallback;

  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    return session ? { loggedIn: true, ...session } : fallback;
  } catch {
    return fallback;
  }
};

export const saveSession = (user, token = "local-admin-token") => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      email: user.email,
      name: user.name,
      role: user.role,
      vendorId: user.vendorId,
      defaultPath: user.defaultPath,
      allowedPaths: user.allowedPaths,
    })
  );
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
};

export const findLocalUser = ({ email, password }) =>
  LOCAL_USERS.find(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password
  );

export const userForRole = (role = "", fallback = {}) => {
  const normalizedRole = role.toLowerCase().replace(/[\s_-]/g, "");
  const roleMap = {
    superadmin: "Super Admin",
    admin: "Super Admin",
    assistantsuperadmin: "Assistant Super Admin",
    assistantadmin: "Assistant Super Admin",
    vendor: "Vendor",
    seller: "Vendor",
  };
  const displayRole = roleMap[normalizedRole] || "Vendor";
  const template = LOCAL_USERS.find((user) => user.role === displayRole) || LOCAL_USERS[2];

  return {
    ...template,
    email: fallback.email || template.email,
    name: fallback.name || template.name,
    role: displayRole,
    vendorId: fallback.vendorId || template.vendorId,
  };
};

export const canAccessPath = (session, path) => {
  if (!session.loggedIn) return false;
  return session.allowedPaths.some((allowedPath) => {
    if (path === allowedPath) return true;
    if (allowedPath === "/admin") return false;
    return path.startsWith(`${allowedPath}/`);
  });
};

export const getDefaultPath = (session) => session.defaultPath || session.allowedPaths?.[0] || "/admin";