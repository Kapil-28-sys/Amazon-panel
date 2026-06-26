import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { canAccessPath, getCurrentSession, getDefaultPath } from "./config/localAuth";

// Layout
import AdminLayout from "./components/common/AdminLayout";

// Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Orders from "./pages/orders/Orders";
import Users from "./pages/users/Users";
import Categories from "./pages/categories/Categories";
import SubCategories from "./pages/subcategory/SubCategories"; // ✅ Capital S + C
import SubToSubCategory from "./pages/subtosubcategory/SubToSubCategory";
import Categoryattribute from "./pages/categoryattribute/CategoryAttribute"; // ✅ Capital S + C

import Settings from "./pages/settings/Settings";
import AddProduct from "./pages/products/AddProduct";
import EditProduct from "./pages/products/EditProduct";
import Vendors from "./pages/vendors/Vendors";
import Login from "./pages/auth/Login";
import VendorProducts from "./pages/vendor/VendorProducts";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorSupplyChain from "./pages/vendor/VendorSupplyChain";
import VendorFinance from "./pages/vendor/VendorFinance";

function ProtectedAdminPage({ children }) {
  const location = useLocation();
  const session = getCurrentSession();

  if (!session.loggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessPath(session, location.pathname)) {
    return <Navigate to={getDefaultPath(session)} replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/vendor" element={<Navigate to="/vendor/products" replace />} />

        <Route
          path="/admin"
          element={
            <ProtectedAdminPage>
              <Dashboard />
            </ProtectedAdminPage>
          }
        />

        <Route
          path="/admin/vendors"
          element={
            <ProtectedAdminPage>
              <Vendors />
            </ProtectedAdminPage>
          }
        />

        <Route
          path="/admin/products"
          element={
            <ProtectedAdminPage>
              <Products />
            </ProtectedAdminPage>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedAdminPage>
              <Orders />
            </ProtectedAdminPage>
          }
        />

        {/* ✅ Fixed: SubCategories with capital letters */}
        <Route
          path="/admin/subcategory"
          element={
            <ProtectedAdminPage>
              <SubCategories />
            </ProtectedAdminPage>
          }
        />
        <Route
          path="/admin/subtosubcategory"
          element={
            <ProtectedAdminPage>
              <SubToSubCategory />
            </ProtectedAdminPage>
          }
        />

        <Route
          path="/admin/categoryattribute"
          element={
            <ProtectedAdminPage>
              <Categoryattribute />
            </ProtectedAdminPage>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedAdminPage>
              <Users />
            </ProtectedAdminPage>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedAdminPage>
              <Settings />
            </ProtectedAdminPage>
          }
        />

        <Route
          path="/admin/products/add"
          element={
            <ProtectedAdminPage>
              <AddProduct />
            </ProtectedAdminPage>
          }
        />

        <Route
          path="/admin/products/edit/:id"
          element={
            <ProtectedAdminPage>
              <EditProduct />
            </ProtectedAdminPage>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <ProtectedAdminPage>
              <Categories />
            </ProtectedAdminPage>
          }
        />

        <Route
          path="/vendor/products/*"
          element={
            <ProtectedAdminPage>
              <VendorProducts />
            </ProtectedAdminPage>
          }
        />

        <Route
          path="/vendor/orders/*"
          element={
            <ProtectedAdminPage>
              <VendorOrders />
            </ProtectedAdminPage>
          }
        />

        <Route
          path="/vendor/supply-chain/*"
          element={
            <ProtectedAdminPage>
              <VendorSupplyChain />
            </ProtectedAdminPage>
          }
        />

        <Route
          path="/vendor/finance/*"
          element={
            <ProtectedAdminPage>
              <VendorFinance />
            </ProtectedAdminPage>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}