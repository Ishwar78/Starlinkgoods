

import { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight, FiChevronLeft, FiChevronRight, FiHeart, FiShoppingCart,
  FiTruck, FiShield, FiRefreshCw, FiStar, FiCheckCircle, FiTag
} from "react-icons/fi";
import "./Home.css";
import Footer from "../components/Footer";

const categories = [
  { name: "Sofa Sets", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=85" },
  { name: "Beds", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=85" },
  { name: "Mattresses", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=500&q=85" },
  { name: "Dining Sets", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=500&q=85" },
  { name: "Chairs", image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=500&q=85" },
  { name: "Wardrobes", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=500&q=85" },
  { name: "TV Units", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=500&q=85" },
  { name: "Storage", image: "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?auto=format&fit=crop&w=500&q=85" },
  { name: "Home Decor", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=500&q=85" }
];

const products = [
  { id: 1, name: "Modern 3 Seater Sofa", category: "Sofa Sets", price: 24999, oldPrice: 32999, badge: "Best Seller", rating: "4.8", reviews: 120, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=85" },
  { id: 2, name: "King Size Storage Bed", category: "Beds", price: 28999, oldPrice: 35999, badge: "10% OFF", rating: "4.7", reviews: 85, image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=85" },
  { id: 3, name: "Orthopedic Mattress", category: "Mattresses", price: 15999, oldPrice: 22000, badge: "Popular", rating: "4.6", reviews: 92, image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=700&q=85" },
  { id: 4, name: "6 Seater Dining Set", category: "Dining Sets", price: 26999, oldPrice: 34999, badge: "Best Seller", rating: "4.8", reviews: 64, image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=700&q=85" },
  { id: 5, name: "Premium Accent Chair", category: "Chairs", price: 8999, oldPrice: 12499, badge: "10% OFF", rating: "4.5", reviews: 48, image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=700&q=85" },
  { id: 6, name: "Modern TV Unit", category: "TV Units", price: 13999, oldPrice: 18999, badge: "New", rating: "4.7", reviews: 76, image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=700&q=85" }
];

const testimonials = [
  { name: "Anjali Sharma", city: "Jaipur", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80", quote: "Amazing quality and designs! The sofa set is super comfortable and looks beautiful in my living room." },
  { name: "Rahul Verma", city: "Delhi", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80", quote: "Excellent service and fast delivery. The bed and mattress quality is top-notch. Great shopping experience!" },
  { name: "Neha Kapoor", city: "Chandigarh", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80", quote: "Stylish furniture at reasonable prices. The dining set completely transformed my home." }
];

const money = (value) => `₹${value.toLocaleString("en-IN")}`;

export default function Home() {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const onSearch = (event) => setSearchTerm(event.detail || "");
    window.addEventListener("SLG-search", onSearch);
    return () => window.removeEventListener("SLG-search", onSearch);
  }, []);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
    const searchMatch = `${product.name} ${product.category}`.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  }), [selectedCategory, searchTerm]);

  const addToCart = (product) => {
    setCart((current) => [...current, product]);
    setNotice(`${product.name} added to cart`);
    window.setTimeout(() => setNotice(""), 2400);
  };

  const toggleWishlist = (id) => {
    setWishlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <>
    <main>
      {notice && <div className="toast-message" role="status">{notice}</div>}

      <section className="hero container" aria-label="Featured furniture collections">
        <a className="side-promo promo-sofa" href="#products">
          <span className="promo-kicker">COMFORT MEETS STYLE</span>
          <strong>Premium<br />Sofa Sets</strong>
          <span className="promo-button">Shop Now <FiArrowRight /></span>
          <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=650&q=85" alt="Neutral modern sofa" />
        </a>

        <div className="hero-main">
          <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=90" alt="Beautiful contemporary living room with comfortable furniture" />
          <div className="hero-overlay">
            <span className="eyebrow">MODERN FURNITURE FOR MODERN LIVING</span>
            <h1>Transform<br />Your Home</h1>
            <p>Stylish · Comfortable · Affordable</p>
            <a className="primary-btn" href="#products">Shop Collection <FiArrowRight /></a>
          </div>
          <div className="hero-dots"><i className="selected" /><i /><i /></div>
        </div>

        <a className="side-promo promo-bed" href="#categories">
          <span className="promo-kicker">REST. RELAX. RECHARGE.</span>
          <strong>Luxury<br />Mattresses</strong>
          <span className="promo-button">Shop Now <FiArrowRight /></span>
          <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=650&q=85" alt="Luxury bedroom with soft bedding" />
        </a>
      </section>

      <section className="container section" id="categories">
        <div className="section-heading">
          <div><h2>Shop by Category</h2><p>Find the perfect pieces for every corner of your home</p></div>
          <a className="text-link" href="#products">View All Categories <FiArrowRight /></a>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <button
              className={`category-card ${selectedCategory === category.name ? "category-selected" : ""}`}
              key={category.name}
              onClick={() => { setSelectedCategory(category.name); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }}
            >
              <span className="category-image"><img src={category.image} alt={category.name} loading="lazy" /></span>
              <strong>{category.name}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="container section products-section" id="products">
        <div className="section-heading">
          <div>
            <h2>Featured Products</h2>
            <p>Handpicked furniture to make your home more beautiful</p>
          </div>
          <div className="product-heading-actions">
            {selectedCategory !== "All" && <button className="clear-filter" onClick={() => setSelectedCategory("All")}>Clear filter</button>}
            <a className="text-link" href="#products">View All Products <FiArrowRight /></a>
          </div>
        </div>
        {searchTerm && <div className="search-result-line">Search results for “{searchTerm}” <button onClick={() => setSearchTerm("")}>Clear search</button></div>}
        <div className="product-grid">
          {filteredProducts.length ? filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image-wrap">
                <span className={`product-badge ${product.badge === "10% OFF" ? "sale-badge" : ""}`}>{product.badge}</span>
                <button className={`wishlist-button ${wishlist.includes(product.id) ? "wishlisted" : ""}`} onClick={() => toggleWishlist(product.id)} aria-label={`Toggle wishlist for ${product.name}`}><FiHeart /></button>
                <img src={product.image} alt={product.name} loading="lazy" />
              </div>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3>{product.name}</h3>
                <div className="rating-line"><span className="stars">★★★★★</span><span>{product.rating} ({product.reviews})</span></div>
                <div className="price-line"><strong>{money(product.price)}</strong><del>{money(product.oldPrice)}</del></div>
                <button className="add-cart-btn" onClick={() => addToCart(product)}><FiShoppingCart /> Add to Cart</button>
              </div>
            </article>
          )) : (
            <div className="empty-products">
              <h3>No products found</h3>
              <p>Try another search or browse all furniture.</p>
              <button className="primary-btn" onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}>Show all products</button>
            </div>
          )}
        </div>
      </section>

      <section className="container offer-banner" id="offers">
        <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1500&q=85" alt="Stylish green sofa in a warm living room" loading="lazy" />
        <div className="offer-content">
          <span>LIMITED TIME OFFER</span>
          <h2>FLAT 20% OFF</h2>
          <p>on selected furniture collections</p>
          <a className="light-btn" href="#products">Shop the Sale <FiArrowRight /></a>
        </div>
      </section>

      <section className="container service-row" aria-label="Shopping benefits">
        <div className="service-item"><span><FiTruck /></span><div><strong>Free Shipping</strong><small>On orders above ₹999</small></div></div>
        <div className="service-item"><span><FiShield /></span><div><strong>Secure Payment</strong><small>Safe and secure checkout</small></div></div>
        <div className="service-item"><span><FiRefreshCw /></span><div><strong>Easy Returns</strong><small>7-day hassle-free return</small></div></div>
        <div className="service-item"><span><FiStar /></span><div><strong>Premium Quality</strong><small>Made for everyday living</small></div></div>
      </section>

      <section className="about-section" id="about">
        <div className="container about-grid">
          <div className="about-image"><img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85" alt="Tastefully styled contemporary home interior" loading="lazy" /></div>
          <div className="about-copy">
            <span className="eyebrow">ABOUT SLG</span>
            <h2>Creating Beautiful Homes<br />For a Better Tomorrow</h2>
            <p>We believe great furniture should feel as good as it looks. Explore thoughtfully selected sofas, beds, dining sets and home essentials designed to bring comfort, quality and timeless style to your everyday life.</p>
            <a className="primary-btn" href="#footer">Know More <FiArrowRight /></a>
          </div>
          <div className="about-stats">
            <div><span><FiCheckCircle /></span><strong>1,000+</strong><small>Happy Customers</small></div>
            <div><span><FiShoppingCart /></span><strong>500+</strong><small>Furniture Choices</small></div>
            <div><span><FiTag /></span><strong>10+</strong><small>Trusted Collections</small></div>
            <div><span><FiStar /></span><strong>4.8 / 5</strong><small>Customer Rating</small></div>
          </div>
        </div>
      </section>

      <section className="container section testimonial-section">
        <div className="section-heading">
          <div><h2>What Our Customers Say</h2><p>Real stories from people who made their house a home</p></div>
          <div className="testimonial-controls"><button aria-label="Previous reviews"><FiChevronLeft /></button><button aria-label="Next reviews"><FiChevronRight /></button></div>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.name}>
              <div className="testimonial-person"><img src={testimonial.image} alt={testimonial.name} loading="lazy" /><div><strong>{testimonial.name}</strong><small>{testimonial.city}</small></div><span className="quote-mark">”</span></div>
              <div className="testimonial-stars">★★★★★</div>
              <p>“{testimonial.quote}”</p>
            </article>
          ))}
        </div>
      </section>

      {/* <footer className="site-footer" id="footer">
        <div className="container footer-inner">
          <div><span className="footer-kicker">MAKE YOUR SPACE YOURS</span><h2>Make Your Dream Home a Reality</h2><p>Explore furniture that brings comfort, style and togetherness.</p></div>
          <a className="light-btn" href="#products">Explore Collection <FiArrowRight /></a>
        </div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} SLG Furniture. All rights reserved.</span><span>Designed for comfortable living.</span></div>
      </footer> */}

      {cart.length > 0 && (
        <button className="floating-cart" onClick={() => setNotice(`You have ${cart.length} item${cart.length === 1 ? "" : "s"} in your cart`)}>
          <FiShoppingCart /><span>{cart.length}</span>
        </button>
      )}
    </main>
    {/* <Footer /> */}
    </>
  );
}