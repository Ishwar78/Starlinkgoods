import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiGift,
  FiHeart,
  FiTruck,
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiCalendar,
  FiMapPin,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiAlertCircle,
  FiCreditCard,
  FiShield,
  FiLoader,
} from "react-icons/fi";
import {
  getMembershipConfig,
  checkUserRegistration,
  createMembershipOrder,
  verifyAndRegisterMember,
} from "../lib/api";
import "./Vendorregister.css";

const membershipBenefits = [
  {
    icon: <FiGift />,
    title: "Exclusive Member Offers",
    text: "Get access to special dealer deals and discounts",
  },
  {
    icon: <FiHeart />,
    title: "Save Your Favorites",
    text: "Keep your favorite products in one place",
  },
  {
    icon: <FiTruck />,
    title: "Fast Priority Dispatch",
    text: "Enjoy express delivery and fulfillment",
  },
  {
    icon: <FiShield />,
    title: "Verified Member Dashboard",
    text: "Full access to inventory, wallet, and order management",
  },
];

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const citiesByState = {
  Haryana: [
    "Gurugram",
    "Faridabad",
    "Rohtak",
    "Panipat",
    "Hisar",
    "Karnal",
    "Sonipat",
    "Ambala",
    "Panchkula",
    "Rewari",
    "Bhiwani",
    "Sirsa",
    "Yamunanagar",
    "Kaithal",
    "Jind",
    "Kurukshetra",
    "Jhajjar",
    "Palwal",
  ],
  Punjab: [
    "Ludhiana",
    "Amritsar",
    "Jalandhar",
    "Patiala",
    "Bathinda",
    "Mohali",
    "Pathankot",
    "Hoshiarpur",
    "Moga",
    "Phagwara",
    "Kapurthala",
    "Barnala",
    "Sangrur",
  ],
  Delhi: [
    "New Delhi",
    "Delhi",
    "Dwarka",
    "Rohini",
    "Saket",
    "Karol Bagh",
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Noida",
    "Ghaziabad",
    "Agra",
    "Kanpur",
    "Varanasi",
    "Meerut",
    "Prayagraj",
    "Gorakhpur",
    "Mathura",
    "Bareilly",
    "Aligarh",
  ],
  Rajasthan: [
    "Jaipur",
    "Jodhpur",
    "Udaipur",
    "Kota",
    "Ajmer",
    "Bikaner",
    "Alwar",
    "Sikar",
  ],
  Maharashtra: [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Thane",
    "Nashik",
    "Aurangabad",
    "Solapur",
    "Navi Mumbai",
  ],
  Gujarat: [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Gandhinagar",
  ],
  Karnataka: [
    "Bengaluru",
    "Mysuru",
    "Hubballi",
    "Mangaluru",
    "Belagavi",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
  ],
  "West Bengal": [
    "Kolkata",
    "Howrah",
    "Durgapur",
    "Asansol",
    "Siliguri",
  ],
  "Madhya Pradesh": [
    "Bhopal",
    "Indore",
    "Gwalior",
    "Jabalpur",
    "Ujjain",
  ],
  Bihar: [
    "Patna",
    "Gaya",
    "Bhagalpur",
    "Muzaffarpur",
    "Purnia",
  ],
  Uttarakhand: [
    "Dehradun",
    "Haridwar",
    "Roorkee",
    "Haldwani",
    "Rishikesh",
  ],
  "Himachal Pradesh": [
    "Shimla",
    "Dharamshala",
    "Mandi",
    "Solan",
    "Manali",
  ],
  "Andhra Pradesh": [
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Tirupati",
    "Nellore",
    "Kurnool",
  ],
  "Jammu and Kashmir": [
    "Srinagar",
    "Jammu",
    "Anantnag",
    "Baramulla",
  ],
  Chandigarh: ["Chandigarh"],
  Puducherry: ["Puducherry", "Karaikal", "Yanam", "Mahe"],
  "Andaman and Nicobar Islands": ["Port Blair"],
  Ladakh: ["Leh", "Kargil"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Tawang"],
  Manipur: ["Imphal", "Thoubal", "Churachandpur"],
  Meghalaya: ["Shillong", "Tura", "Jowai"],
  Mizoram: ["Aizawl", "Lunglei", "Champhai"],
  Nagaland: ["Kohima", "Dimapur", "Mokokchung"],
  Sikkim: ["Gangtok", "Namchi", "Gyalshing"],
  Tripura: ["Agartala", "Udaipur", "Dharmanagar"],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Daman",
    "Diu",
    "Silvassa",
  ],
  Lakshadweep: ["Kavaratti", "Agatti", "Andrott"],
};

// Helper to ensure Razorpay script is loaded in browser
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function VendorRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: "",
    state: "",
    city: "",
    address: "",
    agreeToTerms: false,
  });

  const [membershipFee, setMembershipFee] = useState(5000);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch membership configuration from server
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await getMembershipConfig();
        if (res.success && res.fee) {
          setMembershipFee(res.fee);
        }
      } catch (err) {
        console.warn("Could not load membership config, using default:", err);
      }
    }
    fetchConfig();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "state" ? { city: "" } : {}),
    }));

    setError("");
    setAlreadyRegistered(false);
    setSuccess("");
  };

  // Check email/mobile uniqueness on blur for proactive instant feedback
  const handleCheckUnique = async () => {
    const cleanEmail = formData.email.trim();
    const cleanMobile = formData.mobile.replace(/\D/g, "").trim();

    if (cleanEmail || cleanMobile.length === 10) {
      try {
        const res = await checkUserRegistration(cleanEmail, cleanMobile);
        if (res && res.registered) {
          setAlreadyRegistered(true);
          setError(res.message || "Already registered. Please sign in.");
        } else {
          setAlreadyRegistered(false);
        }
      } catch (err) {
        // silent check error
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setAlreadyRegistered(false);
    setSuccess("");

    const cleanMobile = formData.mobile.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    if (!formData.state.trim()) {
      setError("Please select your state.");
      return;
    }

    if (!formData.city.trim()) {
      setError("Please select or enter your city.");
      return;
    }

    if (!formData.address.trim()) {
      setError("Please enter your complete address.");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("Please accept the Terms & Conditions to continue.");
      return;
    }

    try {
      setSubmitting(true);

      // 1. Check if user is already registered before initiating payment
      const checkRes = await checkUserRegistration(formData.email.trim(), cleanMobile);
      if (checkRes && checkRes.registered) {
        setAlreadyRegistered(true);
        setError(checkRes.message || "Already registered. Please sign in.");
        setSubmitting(false);
        return;
      }

      // 2. Create Razorpay order on backend
      const orderRes = await createMembershipOrder({
        name: formData.fullName.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        mobile: cleanMobile,
        password: formData.password,
        city: formData.city.trim(),
        state: formData.state.trim(),
        address: formData.address.trim(),
      });

      if (!orderRes.success) {
        if (orderRes.registered) {
          setAlreadyRegistered(true);
        }
        setError(orderRes.message || "Already registered. Please sign in.");
        setSubmitting(false);
        return;
      }

      // 3. Ensure Razorpay Checkout SDK is ready
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !window.Razorpay) {
        setError("Unable to load Razorpay payment gateway. Please check your internet connection and try again.");
        setSubmitting(false);
        return;
      }

      // 4. Configure Razorpay modal
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency || "INR",
        name: "Star Link Goods",
        description: `Member VIP Registration (₹${orderRes.fee || membershipFee})`,
        image: "/Logo.jpeg",
        order_id: orderRes.orderId,
        prefill: {
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          contact: cleanMobile,
        },
        theme: {
          color: "#ffd044",
        },
        handler: async function (response) {
          try {
            setSubmitting(true);
            setSuccess("Payment successful! Verifying and setting up your account...");

            // 5. Verify payment and register user in database
            const verifyRes = await verifyAndRegisterMember({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              name: formData.fullName.trim(),
              fullName: formData.fullName.trim(),
              email: formData.email.trim(),
              mobile: cleanMobile,
              password: formData.password,
              city: formData.city.trim(),
              state: formData.state.trim(),
              address: formData.address.trim(),
              dateOfBirth: formData.dateOfBirth,
              gender: formData.gender,
            });

            if (verifyRes.success && verifyRes.token) {
              // Store user credentials and token for immediate login
              localStorage.setItem("userToken", verifyRes.token);
              localStorage.setItem("userData", JSON.stringify(verifyRes.user));
              const vendorIdStr = verifyRes.user?.vendorId ? ` (Vendor ID: ${verifyRes.user.vendorId})` : "";
              setSuccess(`Membership registration successful!${vendorIdStr} Redirecting to your dashboard...`);

              // Navigate directly to User Dashboard
              setTimeout(() => {
                navigate("/user/dashboard");
              }, 1200);
            } else {
              if (verifyRes.registered) {
                setAlreadyRegistered(true);
              }
              setError(verifyRes.message || "Registration failed. Please contact support.");
              setSubmitting(false);
            }
          } catch (verErr) {
            console.error("Verification error:", verErr);
            setError(verErr.message || "Payment verification failed. Please try again.");
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            setError("Payment was cancelled. Please complete payment to activate your account.");
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("Razorpay payment failure:", response.error);
        setSubmitting(false);
        setError(`Payment failed: ${response.error?.description || "Transaction failed"}. Please retry.`);
      });

      rzp.open();
    } catch (err) {
      console.error("Error initiating payment:", err);
      setError(err.message || "Error initiating payment. Please try again.");
      setSubmitting(false);
    }
  };

  const cityOptions = citiesByState[formData.state] || [];

  return (
    <main className="slg-register-page">
      <section className="slg-register-layout">
        {/* Left membership introduction */}
        <div className="slg-register-intro">
          <div className="slg-register-intro-content">
            <span className="slg-register-eyebrow">
              <i />
              BECOME A MEMBER
            </span>

            <h1>
              Join Star Link
              <span>Goods</span>
            </h1>

            <p className="slg-register-intro-description">
              Create your account, complete membership registration via secure Razorpay checkout, and get instant access to your User Dashboard.
            </p>

            {/* Membership VIP Pricing Badge */}
            <div className="slg-membership-fee-card">
              <div className="membership-fee-badge">
                <FiCreditCard />
                <span>VIP Lifetime Membership</span>
              </div>
              <div className="membership-fee-pricing">
                <span className="fee-symbol">₹</span>
                <span className="fee-amount">{membershipFee}</span>
                <span className="fee-period">One-time registration fee</span>
              </div>
              <p className="membership-fee-note">
                Instant access to dealer catalog, custom wallet, KYC, and direct login credentials.
              </p>
            </div>

            <div className="slg-register-benefits">
              {membershipBenefits.map((benefit) => (
                <article
                  className="slg-register-benefit"
                  key={benefit.title}
                >
                  <span className="slg-register-benefit-icon">
                    {benefit.icon}
                  </span>

                  <div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* Registration form */}
        <div className="slg-register-form-panel">
          <div className="slg-register-card">
            <div className="slg-register-card-heading">
              <span className="slg-register-card-kicker">
                STEP 1: ENTER DETAILS &bull; STEP 2: RAZORPAY CHECKOUT
              </span>

              <h2>Create Member Account</h2>
              <p>Fill in your details below. You will be redirected to Razorpay to complete your membership.</p>
            </div>

            <form
              className="slg-register-form"
              onSubmit={handleSubmit}
            >
              <div className="slg-register-fields">
                {/* Full name */}
                <div className="slg-register-field">
                  <label htmlFor="register-full-name">
                    Full Name <span>*</span>
                  </label>

                  <div className="slg-register-input-wrap">
                    <FiUser />

                    <input
                      id="register-full-name"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      autoComplete="name"
                      maxLength={100}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="slg-register-field">
                  <label htmlFor="register-email">
                    Email Address <span>*</span>
                  </label>

                  <div className="slg-register-input-wrap">
                    <FiMail />

                    <input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleCheckUnique}
                      autoComplete="email"
                      maxLength={254}
                      required
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="slg-register-field slg-register-field-full">
                  <label htmlFor="register-mobile">
                    Mobile Number <span>*</span>
                  </label>

                  <div className="slg-register-input-wrap slg-register-mobile-wrap">
                    <FiPhone />

                    <span className="slg-register-country-code">
                      +91
                    </span>

                    <input
                      id="register-mobile"
                      name="mobile"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={formData.mobile}
                      onChange={handleChange}
                      onBlur={handleCheckUnique}
                      autoComplete="tel-national"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      title="Enter a 10-digit mobile number"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="slg-register-field">
                  <label htmlFor="register-password">
                    Password <span>*</span>
                  </label>

                  <div className="slg-register-input-wrap">
                    <FiLock />

                    <input
                      id="register-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password (min 6 chars)"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      minLength={6}
                      maxLength={128}
                      required
                    />

                    <button
                      className="slg-register-password-toggle"
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="slg-register-field">
                  <label htmlFor="register-confirm-password">
                    Confirm Password <span>*</span>
                  </label>

                  <div className="slg-register-input-wrap">
                    <FiLock />

                    <input
                      id="register-confirm-password"
                      name="confirmPassword"
                      type={
                        showConfirmPassword ? "text" : "password"
                      }
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      minLength={6}
                      maxLength={128}
                      required
                    />

                    <button
                      className="slg-register-password-toggle"
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) => !previous
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff />
                      ) : (
                        <FiEye />
                      )}
                    </button>
                  </div>
                </div>

                {/* Date of birth */}
                <div className="slg-register-field">
                  <label htmlFor="register-dob">
                    Date of Birth
                  </label>

                  <div className="slg-register-input-wrap">
                    <FiCalendar />

                    <input
                      id="register-dob"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      autoComplete="bday"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="slg-register-field">
                  <label htmlFor="register-gender">
                    Gender <span>*</span>
                  </label>

                  <div className="slg-register-input-wrap">
                    <FiUser />

                    <select
                      id="register-gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>
                </div>

                {/* State */}
                <div className="slg-register-field">
                  <label htmlFor="register-state">
                    State <span>*</span>
                  </label>

                  <div className="slg-register-input-wrap">
                    <FiMapPin />

                    <select
                      id="register-state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      autoComplete="address-level1"
                      required
                    >
                      <option value="">Select State</option>

                      {indianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* City */}
                <div className="slg-register-field">
                  <label htmlFor="register-city">
                    City <span>*</span>
                  </label>

                  <div className="slg-register-input-wrap">
                    <FiMapPin />

                    <input
                      id="register-city"
                      name="city"
                      type="text"
                      list="register-city-options"
                      placeholder={
                        formData.state
                          ? "Select or enter city"
                          : "Select state first"
                      }
                      value={formData.city}
                      onChange={handleChange}
                      autoComplete="address-level2"
                      maxLength={100}
                      required
                    />

                    <datalist id="register-city-options">
                      {cityOptions.map((city) => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                  </div>

                  <small className="slg-register-field-hint">
                    {formData.state
                      ? "Choose a suggestion or type your city name."
                      : "Select your state to see city suggestions."}
                  </small>
                </div>

                {/* Address */}
                <div className="slg-register-field slg-register-field-full">
                  <label htmlFor="register-address">
                    Complete Address <span>*</span>
                  </label>

                  <div className="slg-register-input-wrap slg-register-address-wrap">
                    <FiMapPin />

                    <textarea
                      id="register-address"
                      name="address"
                      placeholder="Enter your complete delivery/store address"
                      value={formData.address}
                      onChange={handleChange}
                      autoComplete="street-address"
                      maxLength={500}
                      rows={3}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <label className="slg-register-terms">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  required
                />

                <span className="slg-register-custom-checkbox">
                  <FiCheckCircle />
                </span>

                <span>
                  I agree to the{" "}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Terms &amp; Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {/* Error Message with Sign In Link if already registered */}
              {error && (
                <div
                  className="slg-register-message slg-register-error"
                  role="alert"
                >
                  <div className="error-message-content">
                    <FiAlertCircle className="error-icon" />
                    <span>{error}</span>
                  </div>
                  {alreadyRegistered && (
                    <Link to="/login" className="error-signin-btn">
                      Sign In to Account &rarr;
                    </Link>
                  )}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div
                  className="slg-register-message slg-register-success"
                  role="status"
                >
                  <FiCheckCircle className="success-icon" />
                  <span>{success}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                className="slg-register-submit"
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FiLoader className="btn-spinner-icon" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Next: Pay ₹{membershipFee} &amp; Register</span>
                    <FiArrowRight />
                  </>
                )}
              </button>

              <p className="slg-register-login">
                Already have an account?{" "}
                <Link to="/login">Login here</Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
