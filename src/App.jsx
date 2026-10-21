import React from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Contact from "./pages/Contact.jsx";
import About from "./pages/About.jsx";
import WhatWeDo from "./pages/WhatWeDo";
import Founder from "./pages/Founder";
import OurTeam from "./pages/OurTeam";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail.jsx";
import MakingADifference from "./pages/MakingADifference.jsx";
import OurImpact from "./pages/OurImpact.jsx";
import Testimonials from "./pages/Testimonials.jsx";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";


import VendorRegister from "./pages/VendorRegister.jsx";
import MemberRegister from "./pages/MemberRegister.jsx";



import ScrollToTop from "./components/ScrollToTop.jsx";


import AdminLogin from "./pages/AdminLogin.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminProtectedRoute from "./components/AdminProtectedRoute.jsx";
import UserProtectedRoute from "./components/UserProtectedRoute.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Users from "./pages/admin/Users.jsx";
import VendorUsers from "./pages/admin/VendorUsers.jsx";
import AdminWalletRequests from "./pages/admin/WalletRequests.jsx";
import Products from "./pages/admin/Products.jsx";
import Categories from "./pages/admin/Categories.jsx";
import AdminKYC from "./pages/admin/KYC.jsx";
import Orders from "./pages/admin/Orders.jsx";
import ContactMessages from "./pages/admin/ContactMessages.jsx";
import ContactDetails from "./pages/admin/ContactDetails.jsx";
import Settings from "./pages/admin/Settings.jsx";

import UserDashboardLayout from "./layouts/UserDashboardLayout.jsx";
import UserDashboard from "./pages/user/Dashboard.jsx";
import UserProducts from "./pages/user/Products.jsx";
import UserWallet from "./pages/user/Wallet.jsx";
import UserKYC from "./pages/user/KYC.jsx";
import UserAddUser from "./pages/user/AddUser.jsx";
import UserOrders from "./pages/user/Orders.jsx";
import UserCart from "./pages/user/Cart.jsx";

// Order User / Customer Dashboard & Login Pages
import OrderUserLogin from "./pages/orderuser/OrderUserLogin.jsx";
import OrderUserDashboard from "./pages/orderuser/OrderUserDashboard.jsx";
import OrderUserProtectedRoute from "./pages/orderuser/OrderUserProtectedRoute.jsx";

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isUserRoute = location.pathname.startsWith("/user");
  const isOrderUserRoute = location.pathname.startsWith("/order-user");
  const hideNavbar = isAdminRoute || isUserRoute || isOrderUserRoute;

  return (
    <>
        <ScrollToTop />
      {!hideNavbar && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/what-we-do" element={<WhatWeDo />} />
        <Route path="/founder" element={<Founder />} />
        <Route path="/our-team" element={<OurTeam />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/making-deference" element={<MakingADifference />} />
        <Route path="/our-impact" element={<OurImpact />} />
        <Route path="/testimonial" element={<Testimonials />} />

        <Route
  path="/privacy-policy"
  element={<PrivacyPolicy />}
/>

<Route
  path="/terms-conditions"
  element={<TermsConditions />}
/>

        <Route path="/member-register" element={<MemberRegister />} />
        <Route path="/vendor-register" element={<VendorRegister />} />
        <Route path="/footer" element={<Footer />} />
       

        {/* Protected User Dashboard Routes */}
        <Route element={<UserProtectedRoute />}>
          <Route path="/user" element={<UserDashboardLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<UserDashboard />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="products" element={<UserProducts />} />
            <Route path="cart" element={<UserCart />} />
            <Route path="wallet" element={<UserWallet />} />
            <Route path="kyc" element={<UserKYC />} />
            <Route path="add-user" element={<UserAddUser />} />
            <Route path="orders" element={<UserOrders />} />
          </Route>
        </Route>

        {/* Public Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Public Order Customer Login Route */}
        <Route path="/order-user/login" element={<OrderUserLogin />} />

        {/* Protected Order Customer Dashboard Routes */}
        <Route element={<OrderUserProtectedRoute />}>
          <Route path="/order-user/dashboard" element={<OrderUserDashboard />} />
          <Route path="/order-user/orders" element={<OrderUserDashboard defaultTab="orders" />} />
          <Route path="/order-user/support" element={<OrderUserDashboard defaultTab="support" />} />
        </Route>

        {/* Protected Admin Routes (Requires Login) */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="vendor-users" element={<VendorUsers />} />
            <Route path="wallet-requests" element={<AdminWalletRequests />} />
            <Route path="kyc" element={<AdminKYC />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="messages" element={<ContactMessages />} />
            <Route path="contact-details" element={<ContactDetails />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
