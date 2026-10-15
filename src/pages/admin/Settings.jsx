import React, { useState } from "react";
import { 
    FiSave, 
    FiShoppingBag,
    FiBell, 
    FiShield 
} from "react-icons/fi";

import "./Settings.css";

export default function Settings() {
  const [settings, setSettings] = useState({
    storeName: "SLG",
    email: "support@SLG.com",
    phone: "",
    currency: "INR",
    orderAlerts: true,
    messageAlerts: true,
    publicStore: true,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSaved(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <section className="settings-page">
      <div className="admin-page-heading">
        <div>
          <h2>Store settings</h2>
          <p>Configure your store profile and admin preferences.</p>
        </div>
      </div>

      {saved && (
        <p className="admin-inline-message" role="status">
          Settings updated in this demo view. Connect a backend to
          save changes permanently.
        </p>
      )}

      <form onSubmit={handleSubmit} className="settings-layout">
        <section className="admin-panel settings-panel">
          <div className="settings-heading">
            <span><FiShoppingBag /></span>
            <div>
              <h3>Store profile</h3>
              <p>Basic information for your furniture store.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-field">
              <label htmlFor="settings-store-name">Store name</label>
              <input
                id="settings-store-name"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="settings-currency">Currency</label>
              <select
                id="settings-currency"
                name="currency"
                value={settings.currency}
                onChange={handleChange}
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>

            <div className="admin-form-field">
              <label htmlFor="settings-email">Support email</label>
              <input
                id="settings-email"
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-field">
              <label htmlFor="settings-phone">Contact phone</label>
              <input
                id="settings-phone"
                type="tel"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                placeholder="Enter store phone"
              />
            </div>
          </div>
        </section>

        <section className="admin-panel settings-panel">
          <div className="settings-heading">
            <span><FiBell /></span>
            <div>
              <h3>Notifications</h3>
              <p>Choose which store activity to highlight.</p>
            </div>
          </div>

          <label className="settings-toggle-row">
            <span>
              <strong>New order alerts</strong>
              <small>Show alerts for new customer orders.</small>
            </span>

            <input
              type="checkbox"
              name="orderAlerts"
              checked={settings.orderAlerts}
              onChange={handleChange}
            />
          </label>

          <label className="settings-toggle-row">
            <span>
              <strong>Contact message alerts</strong>
              <small>Highlight incoming customer enquiries.</small>
            </span>

            <input
              type="checkbox"
              name="messageAlerts"
              checked={settings.messageAlerts}
              onChange={handleChange}
            />
          </label>
        </section>

        <section className="admin-panel settings-panel">
          <div className="settings-heading">
            <span><FiShield /></span>
            <div>
              <h3>Store visibility</h3>
              <p>Configure storefront visibility preferences.</p>
            </div>
          </div>

          <label className="settings-toggle-row">
            <span>
              <strong>Public storefront</strong>
              <small>Allow visitors to browse the store.</small>
            </span>

            <input
              type="checkbox"
              name="publicStore"
              checked={settings.publicStore}
              onChange={handleChange}
            />
          </label>
        </section>

        <div className="settings-save-row">
          <button type="submit" className="admin-primary-button">
            <FiSave />
            Save Settings
          </button>
        </div>
      </form>
    </section>
  );
}