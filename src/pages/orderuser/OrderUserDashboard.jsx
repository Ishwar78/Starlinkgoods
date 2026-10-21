import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FiMenu,
  FiUser,
  FiPackage,
  FiHeadphones,
  FiShield,
  FiBell,
} from "react-icons/fi";
import { getOrderUserProfile } from "../../lib/api";
import OrderUserSidebar from "./OrderUserSidebar";
import MyOrders from "./MyOrders";
import Support from "./Support";
import "./OrderUserDashboard.css";

export default function OrderUserDashboard({ defaultTab = "orders" }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [prefilledOrderId, setPrefilledOrderId] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("orderUserData");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [ordersCount, setOrdersCount] = useState(0);

  // Sync tab if route changes
  useEffect(() => {
    if (location.pathname.includes("/support")) {
      setActiveTab("support");
    } else if (location.pathname.includes("/orders") || location.pathname.includes("/dashboard")) {
      setActiveTab("orders");
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getOrderUserProfile();
        if (res && res.success && res.user) {
          setUser(res.user);
          localStorage.setItem("orderUserData", JSON.stringify(res.user));
          if (typeof res.user.ordersCount === "number") {
            setOrdersCount(res.user.ordersCount);
          }
        }
      } catch (err) {
        console.warn("Could not load fresh user profile:", err.message);
      }
    };

    fetchProfile();
  }, []);

  const handleNavigateToSupport = (orderId) => {
    setPrefilledOrderId(orderId || "");
    setActiveTab("support");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="order-dashboard-wrapper">
      {/* Sidebar Component */}
      <OrderUserSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== "support") setPrefilledOrderId("");
        }}
        user={user}
        ordersCount={ordersCount}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="order-dashboard-main">
        {/* Top Header Bar */}
        <header className="order-dashboard-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="topbar-menu-toggle"
              onClick={() => setMobileSidebarOpen(true)}
              title="Open Navigation"
            >
              <FiMenu />
            </button>

            <div>
              <span className="topbar-welcome">Customer Workspace</span>
              <h2 className="topbar-title">
                {activeTab === "orders" ? "Orders & Tracking" : "Help & Customer Support"}
              </h2>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-customer-pill">
              <div className="pill-dot"></div>
              <FiShield className="pill-icon" />
              <span className="pill-name">{user.name || "Customer Account"}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="order-dashboard-content">
          {activeTab === "orders" && (
            <MyOrders onNavigateToSupport={handleNavigateToSupport} />
          )}

          {activeTab === "support" && (
            <Support prefilledOrderId={prefilledOrderId} />
          )}
        </div>
      </main>
    </div>
  );
}
