import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout
import AdminLayout from "./components/common/AdminLayout";

// Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Orders from "./pages/orders/Orders";
import Users from "./pages/users/Users";
import Categories from "./pages/categories/Categories";
import Settings from "./pages/settings/Settings";
import AddProduct from "./pages/products/AddProduct";
import EditProduct from "./pages/products/EditProduct";
import Vendors from "./pages/vendors/Vendors";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />

        <Route
          path="/admin"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/vendors"
          element={
            <AdminLayout>
              <Vendors />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/products"
          element={
            <AdminLayout>
              <Products />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminLayout>
              <Orders />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminLayout>
              <Users />
            </AdminLayout>
          }
        />
		
		<Route
		  path="/admin/settings"
		  element={
			<AdminLayout>
			  <Settings />
			</AdminLayout>
		}
		/>
		
		<Route
		  path="/admin/products/add"
		  element={
			<AdminLayout>
			  <AddProduct />
			</AdminLayout>
		  }
		/>
		
		<Route
		  path="/admin/products/edit/:id"
		  element={
			<AdminLayout>
			  <EditProduct />
			</AdminLayout>
		  }
		/>


        <Route
          path="/admin/categories"
          element={
            <AdminLayout>
              <Categories />
            </AdminLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
