
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiShoppingCart,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiStar,
  FiCheckCircle,
  FiTag,
  FiMessageSquare,
  FiUsers,
  FiFileText,
  FiBookOpen,
} from "react-icons/fi";
import "./Home.css";
 
import EnquireNow from "./EnquireNow.jsx";


import Footer from "../components/Footer";
import { 
  getCategories, 
  getProducts, 
  getBanners,
  formatImageUrl 
} from "../lib/api.js";

const fallbackCategories = [];
const fallbackProducts = [];

const testimonials = [
  { name: "Anjali Sharma", city: "Jaipur", quote: "Amazing quality and designs! The sofa set is super comfortable and looks beautiful in my living room." },
  { name: "Rahul Verma", city: "Delhi", quote: "Excellent service and fast delivery. The bed and mattress quality is top-notch. Great shopping experience!" },
  { name: "Neha Kapoor", city: "Chandigarh", quote: "Stylish furniture at reasonable prices. The dining set completely transformed my home." },
  { name: "Priya Mehta", city: "Gurugram", quote: "Beautiful furniture, premium finishing and a smooth shopping experience. My living room looks completely different now." },
  { name: "Aman Gupta", city: "Noida", quote: "The furniture quality exceeded my expectations. Delivery was smooth and the products look just like the pictures." },
];

/* What We Do content */
const workItems = [
  {
    title: "Intervention",
    icon: FiBookOpen,
    description:
      "We work directly with individuals and families to provide practical guidance, support and assistance when it matters most.",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1100&q=85",
  },
  {
    title: "Content",
    icon: FiFileText,
    description:
      "We use informative content, digital media and meaningful stories to raise awareness and encourage positive social change.",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1100&q=85",
  },
  {
    title: "Awareness",
    icon: FiBookOpen,
    description:
      "We share knowledge, promote informed conversations and help communities better understand equality, rights and responsibilities.",
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1100&q=85",
  },
  {
    title: "Community Support",
    icon: FiUsers,
    description:
      "We encourage community participation, compassionate dialogue and access to resources that help people move forward.",
    image:
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1100&q=85",
  },
];

/* HERO SLIDES - SINGLE IMAGE SLIDER (CLEAN, NO TEXT / NO OVERLAY) */
const heroSlides = [
  {
    image:
      "/Solar-Energy.png",
    alt: "Modern Living Furniture",
  },
  {
    image:
      "/Solar Energy Commercial Banner.png",
    alt: "Premium Sofa Sets",
  },
  // {
  //   image:
  //     "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1920&q=85",
  //   alt: "Luxury Beds and Mattresses",
  // },
  // {
  //   image:
  //     "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1920&q=85",
  //   alt: "Designer Dining Sets",
  // },
];

/* OUR HEROES & DOCUMENTARIES */

const impactSlides = [
  {
    category: "Documentaries",
    title: "Martyrs Of Marriage",
    description:
      "Martyrs of Marriage is a feature-length documentary directed and produced by Deepika Narayan Bhardwaj. It documents concerns about the misuse of Section 498A of the Indian Penal Code and its impact on families.",
    image: "/Logo-1.png",
    imageAlt: "Martyrs of Marriage documentary",
    buttonText: "WATCH DOCUMENTARY",
    link: "/documentaries",
  },
  {
    category: "Our Heroes",
    title: "Standing Strong Through Adversity",
    description:
      "Meet the people whose courage, determination and resilience inspire others. Discover their journeys, the challenges they have faced and the positive difference their stories can make.",
    image: "/download.png",
    imageAlt: "Our Heroes inspirational story",
    buttonText: "READ THEIR STORY",
    link: "/our-heroes",
  },
  {
    category: "Documentaries",
    title: "Stories That Need To Be Heard",
    description:
      "Explore documentaries that bring important social issues into focus, encourage informed conversations and give audiences an opportunity to understand different perspectives.",
    image: "/documentary-2.jpg",
    imageAlt: "Social awareness documentary",
    buttonText: "EXPLORE DOCUMENTARIES",
    link: "/documentaries",
  },
  {
    category: "Our Heroes",
    title: "Real People. Real Stories.",
    description:
      "Celebrate the individuals who speak up, support others and work towards a more informed and compassionate society. Every story has the power to inspire meaningful change.",
    image: "/our-hero-2.jpg",
    imageAlt: "People making a difference",
    buttonText: "DISCOVER MORE",
    link: "/our-heroes",
  },
];

const faqs = [
  {
    question: "How can I place an order?",
    answer:
      "Choose a product, add it to your cart and follow the checkout instructions on the website.",
  },
  {
    question: "Do you offer home delivery?",
    answer:
      "Delivery availability depends on your location and the product. Check the delivery options available at checkout.",
  },
  {
    question: "How can I check product availability?",
    answer:
      "Please check the product details on the website or contact the support team for assistance.",
  },
  {
    question: "Can I return or exchange a product?",
    answer:
      "Returns and exchanges are subject to the applicable store policy and product eligibility. Please review the policy before placing your order.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "Use the contact information provided on the website to get in touch with the support team.",
  },
];

const money = (value) => `₹${value.toLocaleString("en-IN")}`;

export default function Home() {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeWork, setActiveWork] = useState(0);
  const [categories, setCategories] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const [catRes, prodRes, bannerRes] = await Promise.all([
          getCategories({ status: "Active" }).catch(() => ({ categories: [] })),
          getProducts().catch(() => ({ products: [] })),
          getBanners({ status: "Active" }).catch(() => ({ banners: [] })),
        ]);

        if (isMounted) {
          if (catRes?.success && Array.isArray(catRes.categories)) {
            setCategories(catRes.categories);
          } else {
            setCategories([]);
          }

          if (prodRes?.success && Array.isArray(prodRes.products)) {
            const formattedDbProducts = prodRes.products.map((p) => ({
              id: p._id,
              _id: p._id,
              name: p.name,
              category: p.category,
              price: p.price,
              oldPrice: p.oldPrice || Math.round(p.price * 1.25),
              stock: p.stock ?? 10,
              badge: p.badge || (p.stock < 5 ? "Limited" : "In Stock"),
              rating: p.rating || "4.8",
              reviews: p.reviews || 0,
              image: formatImageUrl(p.image),
              description: p.description || "",
              status: p.status || "In Stock",
            }));
            setProductsList(formattedDbProducts);
          } else {
            setProductsList([]);
          }

          if (bannerRes?.success && Array.isArray(bannerRes.banners) && bannerRes.banners.length > 0) {
            setBanners(bannerRes.banners);
          }
        }
      } catch (err) {
        console.warn("Error loading live catalog for home page:", err);
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const onSearch = (event) => setSearchTerm(event.detail || "");
    window.addEventListener("SLG-search", onSearch);
    return () => window.removeEventListener("SLG-search", onSearch);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        setActiveWork((current) => (current + 1) % workItems.length);
      }

      if (event.key === "ArrowLeft") {
        setActiveWork(
          (current) => (current - 1 + workItems.length) % workItems.length
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* HERO SLIDES - DYNAMIC FROM BANNER API OR FALLBACK */
  const activeSlides = useMemo(() => {
    if (banners && banners.length > 0) {
      return banners.map((b) => ({
        id: b._id,
        image: formatImageUrl(b.image),
        alt: b.title || "Solar System Banner",
        link: b.link || "",
      }));
    }
    return heroSlides;
  }, [banners]);

  /* HERO SLIDER STATE & AUTOPLAY */
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  const nextHeroSlide = () => {
    if (activeSlides.length === 0) return;
    setCurrentHeroSlide((curr) => (curr + 1) % activeSlides.length);
  };

  const prevHeroSlide = () => {
    if (activeSlides.length === 0) return;
    setCurrentHeroSlide((curr) => (curr - 1 + activeSlides.length) % activeSlides.length);
  };

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const heroTimer = window.setInterval(() => {
      setCurrentHeroSlide((curr) => (curr + 1) % activeSlides.length);
    }, 5000);

    return () => window.clearInterval(heroTimer);
  }, [activeSlides.length]);

  const [activeImpactSlide, setActiveImpactSlide] = useState(0);

  const currentImpact = impactSlides[activeImpactSlide];

  const nextImpactSlide = () => {
    setActiveImpactSlide(
      (current) => (current + 1) % impactSlides.length
    );
  };

  const previousImpactSlide = () => {
    setActiveImpactSlide(
      (current) =>
        (current - 1 + impactSlides.length) % impactSlides.length
    );
  };

  /* Automatic carousel */
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveImpactSlide(
        (current) => (current + 1) % impactSlides.length
      );
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const filteredProducts = useMemo(
    () =>
      productsList.filter((product) => {
        const categoryMatch =
          selectedCategory === "All" ||
          product.category?.trim().toLowerCase() === selectedCategory?.trim().toLowerCase();

        const searchMatch = `${product.name} ${product.category}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        return categoryMatch && searchMatch;
      }),
    [productsList, selectedCategory, searchTerm]
  );

  const addToCart = (product) => {
    setCart((current) => [...current, product]);
    setNotice(`${product.name} added to cart`);
    window.setTimeout(() => setNotice(""), 2400);
  };

  const toggleWishlist = (id) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const previousTestimonial = () =>
    setActiveTestimonial(
      (current) => (current - 1 + testimonials.length) % testimonials.length
    );

  const nextTestimonial = () =>
    setActiveTestimonial((current) => (current + 1) % testimonials.length);

  const activeReview = testimonials[activeTestimonial];
  const currentWork = workItems[activeWork];
  const WorkIcon = currentWork.icon;

  return (
    <>
      <main>
        {notice && (
          <div className="toast-message" role="status">
            {notice}
          </div>
        )}

        {/* HERO SECTION - SINGLE SLIDER */}
        {activeSlides.length > 0 && (
          <section className="hero container" aria-label="Featured collection">
            <div className="hero-single-slider">
              <div
                className="hero-slider-track"
                style={{ transform: `translateX(-${currentHeroSlide * 100}%)` }}
              >
                {activeSlides.map((slide, index) => (
                  <div key={slide.id || index} className="hero-slide-item">
                    {slide.link ? (
                      <a href={slide.link} className="hero-slide-link" tabIndex={currentHeroSlide === index ? 0 : -1}>
                        <img
                          src={slide.image}
                          alt={slide.alt || `Slide ${index + 1}`}
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                      </a>
                    ) : (
                      <img
                        src={slide.image}
                        alt={slide.alt || `Slide ${index + 1}`}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              {activeSlides.length > 1 && (
                <>
                  <button
                    type="button"
                    className="hero-nav-arrow prev"
                    onClick={prevHeroSlide}
                    aria-label="Previous slide"
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    type="button"
                    className="hero-nav-arrow next"
                    onClick={nextHeroSlide}
                    aria-label="Next slide"
                  >
                    <FiChevronRight />
                  </button>

                  {/* Slider Dots */}
                  <div className="hero-dots">
                    {activeSlides.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`hero-dot-btn ${currentHeroSlide === index ? "selected" : ""}`}
                        onClick={() => setCurrentHeroSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* CATEGORIES */}
        {categories.length > 0 && (
          <section className="hs-category-section" id="categories">
            <div className="hs-category-container">
              <div className="hs-category-heading">
                <h2>Shop by Category</h2>
                <p>
                  Find the perfect pieces for every corner of your home
                </p>
              </div>

              <div className="hs-category-grid">
                {categories.map((category) => (
                  <button
                    type="button"
                    className={`hs-category-card ${selectedCategory.trim().toLowerCase() === (category.name || "").trim().toLowerCase()
                        ? "hs-category-active"
                        : ""
                      }`}
                    key={category._id || category.name}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      document
                        .getElementById("products")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <span className="hs-category-image">
                      <img
                        src={formatImageUrl(category.image)}
                        alt={category.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=85";
                        }}
                      />
                    </span>

                    <strong>{category.name}</strong>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}



        {/* ================= FEATURED PRODUCTS ================= */}

        {/* <section className="fp-section" id="products">
          <div className="fp-container">
            <div className="fp-heading">
              <div className="fp-heading-copy">
                <span className="fp-eyebrow">OUR COLLECTION</span>
                <h2>Featured Products</h2>
                <p>
                  Handpicked furniture to make your home more beautiful
                </p>
              </div>

              <div className="fp-heading-actions">
                {selectedCategory !== "All" && (
                  <button
                    className="fp-clear-filter"
                    type="button"
                    onClick={() => setSelectedCategory("All")}
                  >
                    Clear filter
                  </button>
                )}

                <a className="fp-view-all" href="#products">
                  View All Products <FiArrowRight />
                </a>
              </div>
            </div>

            {searchTerm && (
              <div className="fp-search-message">
                <span>
                  Search results for "{searchTerm}"
                </span>

                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </button>
              </div>
            )}

            <div className="fp-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <article className="fp-card" key={product.id}>
                    <div className="fp-image-wrap">
                      <img
                        className="fp-product-image"
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />

                      {product.badge && (
                        <span
                          className={`fp-badge ${product.badge === "10% OFF"
                              ? "fp-badge-sale"
                              : ""
                            }`}
                        >
                          {product.badge}
                        </span>
                      )}

                      <button
                        className={`fp-wishlist ${wishlist.includes(product.id)
                            ? "fp-wishlist-active"
                            : ""
                          }`}
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        aria-label={`Toggle wishlist for ${product.name}`}
                        aria-pressed={wishlist.includes(product.id)}
                      >
                        <FiHeart />
                      </button>
                    </div>

                    <div className="fp-info">
                      <span className="fp-category">
                        {product.category}
                      </span>

                      <h3 className="fp-product-name">
                        {product.name}
                      </h3>

                      <div
                        className="fp-rating"
                        aria-label={`${product.rating} out of 5 stars`}
                      >
                        <span className="fp-stars" aria-hidden="true">
                          ★★★★★
                        </span>

                        <span className="fp-rating-value">
                          {product.rating}
                        </span>

                        <span className="fp-review-count">
                          ({product.reviews})
                        </span>
                      </div>

                      <div className="fp-price">
                        <strong>{money(product.price)}</strong>
                        <del>{money(product.oldPrice)}</del>
                      </div>

                      <button
                        className="fp-add-cart"
                        type="button"
                        onClick={() => addToCart(product)}
                      >
                        <FiShoppingCart />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="fp-empty">
                  <h3>No products found</h3>
                  <p>
                    {productsList.length === 0
                      ? "Products added by the admin will appear here."
                      : "Try another search or browse our complete furniture collection."}
                  </p>

                  {productsList.length > 0 && (
                    <button
                      type="button"
                      className="fp-empty-button"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("All");
                      }}
                    >
                      Show All Products
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section> */}


        {/* OFFER BANNER */}
        <section className="container offer-banner" id="offers">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1500&q=85"
            alt="Stylish living room"
            loading="lazy"
          />

          <div className="offer-content">
            <span>LIMITED TIME OFFER</span>
            <h2>FLAT 20% OFF</h2>
            <p>on selected furniture collections</p>
            <a className="light-btn" href="#products">
              Shop the Sale <FiArrowRight />
            </a>
          </div>
        </section>

        {/* WHAT WE DO */}
        <section className="what-we-do-section" id="what-we-do">
          <div className="what-we-do-grid">
            <div className="what-we-do-copy">
              <span className="what-we-do-eyebrow">OUR PURPOSE</span>
              <h2>What <span>We Do</span></h2>
              <p>
                We believe that a beautiful home begins with thoughtful choices.
                Our collection brings together comfort, functionality and
                timeless design to help you create spaces that feel truly yours.
                From everyday essentials to statement furniture, we make it
                easier to build a home that reflects your style.
              </p>
              <a className="what-we-do-link" href="#categories">
                Explore Our Collections <FiArrowRight />
              </a>
            </div>

            <div className="what-we-do-visual">
              <img
                className="what-we-do-background"
                src={currentWork.image}
                alt={`${currentWork.title} furniture and home lifestyle`}
                key={currentWork.image}
              />

              <div className="what-we-do-gold-circle" key={currentWork.title}>
                <div className="what-we-do-content">
                  <div className="what-we-do-icon">
                    <WorkIcon />
                  </div>
                  <h3>{currentWork.title}</h3>
                  <p>{currentWork.description}</p>
                </div>

                <div className="what-we-do-dots" aria-label="Choose a feature">
                  {workItems.map((item, index) => (
                    <button
                      type="button"
                      key={item.title}
                      className={activeWork === index ? "active" : ""}
                      onClick={() => setActiveWork(index)}
                      aria-label={`Show ${item.title}`}
                      aria-pressed={activeWork === index}
                    >
                      <span />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OUR HEROES & DOCUMENTARIES */}
        <section
          className="impact-showcase"
          id="our-heroes"
          aria-label="Our Heroes and Documentaries"
        >
          <div className="impact-showcase-container">
            {/* Section heading */}
            <div className="impact-showcase-heading">
              <h2>
                <span className="impact-heading-highlight">
                  {currentImpact.category}
                </span>
              </h2>

              <a
                className="impact-view-all"
                href={currentImpact.link}
              >
                VIEW ALL
                <FiChevronRight />
                <FiChevronRight className="impact-double-chevron" />
              </a>
            </div>

            {/* Featured slide */}
            <div className="impact-slider">
              <div className="impact-slider-shadow" />

              <article
                className="impact-feature-card"
                key={currentImpact.title}
              >
                <div className="impact-feature-content">
                  <span className="impact-feature-eyebrow">
                    {currentImpact.category === "Our Heroes"
                      ? "COURAGE • RESILIENCE • INSPIRATION"
                      : "REAL STORIES • SOCIAL AWARENESS"}
                  </span>

                  <h3>{currentImpact.title}</h3>

                  <p>{currentImpact.description}</p>

                  <a
                    className="impact-read-more"
                    href={currentImpact.link}
                  >
                    {currentImpact.buttonText}
                    <FiArrowRight />
                  </a>
                </div>

                <div className="impact-feature-image">
                  <img
                    src={currentImpact.image}
                    alt={currentImpact.imageAlt}
                    loading="lazy"
                  />

                  <div className="impact-image-overlay" />

                  <span className="impact-image-label">
                    {currentImpact.category}
                  </span>
                </div>
              </article>
            </div>

            {/* Slider controls */}
            <div className="impact-slider-controls">
              {/* <button
        type="button"
        className="impact-slider-arrow"
        onClick={previousImpactSlide}
        aria-label="Previous story"
      >
        <FiChevronLeft />
      </button> */}

              <div
                className="impact-slider-dots"
                aria-label="Choose a story"
              >
                {impactSlides.map((slide, index) => (
                  <button
                    type="button"
                    key={slide.title}
                    className={
                      activeImpactSlide === index
                        ? "active"
                        : ""
                    }
                    onClick={() => setActiveImpactSlide(index)}
                    aria-label={`Show ${slide.category}: ${slide.title}`}
                    aria-pressed={activeImpactSlide === index}
                  >
                    <span />
                  </button>
                ))}
              </div>

              {/* <button
        type="button"
        className="impact-slider-arrow"
        onClick={nextImpactSlide}
        aria-label="Next story"
      >
        <FiChevronRight />
      </button> */}
            </div>
          </div>
        </section>

        {/* SHOPPING BENEFITS */}
        <section className="container service-row" aria-label="Shopping benefits">
          <div className="service-item">
            <span><FiTruck /></span>
            <div>
              <strong>Free Shipping</strong>
              <small>On orders above ₹999</small>
            </div>
          </div>

          <div className="service-item">
            <span><FiShield /></span>
            <div>
              <strong>Secure Payment</strong>
              <small>Safe and secure checkout</small>
            </div>
          </div>

          <div className="service-item">
            <span><FiRefreshCw /></span>
            <div>
              <strong>Easy Returns</strong>
              <small>7-day hassle-free return</small>
            </div>
          </div>

          <div className="service-item">
            <span><FiStar /></span>
            <div>
              <strong>Premium Quality</strong>
              <small>Made for everyday living</small>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="about-section" id="about">
          <div className="container about-grid">
            <div className="about-image">
              <img
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85"
                alt="Contemporary home interior"
                loading="lazy"
              />
            </div>

            <div className="about-copy">
              <span className="eyebrow">ABOUT SLG</span>
              <h2>Creating Beautiful Homes<br />For a Better Tomorrow</h2>
              <p>
                We believe great furniture should feel as good as it looks.
                Explore thoughtfully selected sofas, beds, dining sets and
                home essentials designed to bring comfort, quality and
                timeless style to your everyday life.
              </p>
              <a className="primary-btn" href="#footer">
                Know More <FiArrowRight />
              </a>
            </div>

            <div className="about-stats">
              <div>
                <span><FiCheckCircle /></span>
                <strong>1,000+</strong>
                <small>Happy Customers</small>
              </div>
              <div>
                <span><FiShoppingCart /></span>
                <strong>500+</strong>
                <small>Furniture Choices</small>
              </div>
              <div>
                <span><FiTag /></span>
                <strong>10+</strong>
                <small>Trusted Collections</small>
              </div>
              <div>
                <span><FiStar /></span>
                <strong>4.8 / 5</strong>
                <small>Customer Rating</small>
              </div>
            </div>
          </div>
        </section>

        
{/* TESTIMONIALS */}
<section
  className="container section testimonial-section"
  aria-label="Customer testimonials"
>
  <div className="testimonial-heading">
    <h2>
      <span>Testimonials</span>
    </h2>
    <span className="testimonial-kicker">PATRONS</span>
  </div>

  <div className="testimonial-stage">
    <div className="testimonial-layer testimonial-layer-back" />
    <div className="testimonial-layer testimonial-layer-mid" />

    <article
      className="testimonial-feature"
      key={activeReview.name}
    >
      {/* LEFT: Existing testimonial artwork */}
      <div className="testimonial-art" aria-hidden="true">
        <img
          className="testimonial-thumb"
          src="/download.png"
          alt=""
          loading="lazy"
        />
        <span className="testimonial-art-spark">✦</span>
      </div>

      {/* CENTER: Testimonial content */}
      <div className="testimonial-copy">
        <div className="testimonial-quote-icon">
          <FiMessageSquare />
        </div>

        <p className="testimonial-quote">
          “{activeReview.quote}”
        </p>

        <div className="testimonial-reviewer">
          <strong>{activeReview.name}</strong>
          <span>
            {activeReview.city} · Customer Review
          </span>
        </div>

        <div
          className="testimonial-rating"
          aria-label="5 out of 5 stars"
        >
          ★★★★★
        </div>
      </div>

      {/* RIGHT: Customer image frame */}
      <div className="testimonial-customer">
        <div className="testimonial-customer-frame">
          <img
            src={
              activeReview.image ||
              "/images (3).jpeg"
            }
            alt={`${activeReview.name} customer portrait`}
            className="testimonial-customer-image"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/download.png";
            }}
          />

          <span className="testimonial-image-label">
            CUSTOMER STORY
          </span>
        </div>
      </div>
    </article>
  </div>

  {/* Clickable testimonial pagination */}
  <div
    className="testimonial-pagination"
    aria-label="Choose a customer review"
  >
    {testimonials.map((testimonial, index) => (
      <button
        type="button"
        key={testimonial.name}
        className={
          activeTestimonial === index ? "active" : ""
        }
        onClick={() => setActiveTestimonial(index)}
        aria-label={`Show review ${index + 1} by ${testimonial.name}`}
        aria-current={
          activeTestimonial === index ? "true" : undefined
        }
      >
        <span />
      </button>
    ))}
  </div>
</section>


        {/* FAQ SECTION */}
        <section
          className="container section faq-section"
          id="faq"
          aria-labelledby="faq-heading"
        >
          <div className="faq-heading">
            <span className="faq-eyebrow">NEED SOME HELP?</span>
            <h2 id="faq-heading">
              Frequently Asked <span>Questions</span>
            </h2>
            <p>Quick answers to common questions about shopping with us.</p>
          </div>

          <div className="faq-grid">
            {faqs.map((faq) => (
              <details className="faq-item" key={faq.question}>
                <summary>
                  <span>{faq.question}</span>
                  <span className="faq-plus" aria-hidden="true">+</span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>



        <EnquireNow />


        {/* FLOATING CART */}
        {cart.length > 0 && (
          <button
            className="floating-cart"
            onClick={() =>
              setNotice(
                `You have ${cart.length} item${cart.length === 1 ? "" : "s"} in your cart`
              )
            }
            aria-label={`Cart with ${cart.length} items`}
          >
            <FiShoppingCart />
            <span>{cart.length}</span>
          </button>
        )}
      </main>
      <Footer />
    </>
  );
}
