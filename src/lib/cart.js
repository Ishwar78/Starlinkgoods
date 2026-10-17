/**
 * SLG Isolated User Cart Utility
 * Strictly isolates cart state per logged-in user (Vendor / Customer).
 * Different users logging in on the same browser will NEVER share cart items.
 */

export function getLoggedInUser() {
  try {
    const raw = localStorage.getItem("userData");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("Failed to parse userData:", e);
    return null;
  }
}

export function getUserCartKey(user) {
  const u = user || getLoggedInUser();
  const id = u?._id || u?.id || u?.email;
  return id ? `slg_cart_${id}` : "slg_cart_guest";
}

/**
 * Get the isolated cart items for the currently logged in user
 */
export function getUserCart(user) {
  try {
    const key = getUserCartKey(user);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Failed to read user cart:", e);
    return [];
  }
}

/**
 * Save isolated cart items for the given user and emit a global notification event
 */
export function saveUserCart(cartItems, user) {
  try {
    const key = getUserCartKey(user);
    const validItems = Array.isArray(cartItems) ? cartItems : [];
    localStorage.setItem(key, JSON.stringify(validItems));

    // Emit custom event for cross-component reactive updates (Sidebar, Topbar, Badges)
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("slg-cart-updated", {
          detail: {
            userKey: key,
            count: validItems.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0),
            items: validItems,
          },
        })
      );
    }
    return validItems;
  } catch (e) {
    console.error("Failed to save user cart:", e);
    return [];
  }
}

/**
 * Add a product to the user's isolated cart
 */
export function addToUserCart(product, quantity = 1, user) {
  if (!product) return [];

  const currentCart = getUserCart(user);
  const prodId = product._id || product.id;
  const existingIndex = currentCart.findIndex((it) => (it._id || it.id) === prodId);

  const availableStock =
    typeof product.stock === "number" && product.stock > 0 ? product.stock : 999;

  let updatedCart;
  if (existingIndex > -1) {
    updatedCart = currentCart.map((it, idx) => {
      if (idx === existingIndex) {
        const newQty = Math.min((it.quantity || 1) + quantity, availableStock);
        return { ...it, quantity: newQty };
      }
      return it;
    });
  } else {
    const newItem = {
      _id: prodId,
      id: prodId,
      name: product.name || "Handcrafted Furniture Item",
      price: Number(product.price) || 0,
      oldPrice: Number(product.oldPrice) || 0,
      image: product.image || "",
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image].filter(Boolean),
      category: product.category || "Furniture",
      stock: availableStock,
      vendorName: product.vendorName || "SLG Official",
      quantity: Math.min(Math.max(1, quantity), availableStock),
      addedAt: new Date().toISOString(),
    };
    updatedCart = [...currentCart, newItem];
  }

  saveUserCart(updatedCart, user);
  return updatedCart;
}

/**
 * Update an item's quantity in the user's isolated cart
 */
export function updateUserCartQuantity(productId, quantity, user) {
  const currentCart = getUserCart(user);
  const numQty = parseInt(quantity, 10);

  if (isNaN(numQty) || numQty <= 0) {
    return removeFromUserCart(productId, user);
  }

  const updatedCart = currentCart.map((it) => {
    if ((it._id || it.id) === productId) {
      const maxStock = it.stock || 999;
      return { ...it, quantity: Math.min(numQty, maxStock) };
    }
    return it;
  });

  saveUserCart(updatedCart, user);
  return updatedCart;
}

/**
 * Remove an item completely from the user's isolated cart
 */
export function removeFromUserCart(productId, user) {
  const currentCart = getUserCart(user);
  const updatedCart = currentCart.filter((it) => (it._id || it.id) !== productId);
  saveUserCart(updatedCart, user);
  return updatedCart;
}

/**
 * Clear all items in the user's isolated cart
 */
export function clearUserCart(user) {
  return saveUserCart([], user);
}

/**
 * Get total quantity count of items in the user's cart
 */
export function getUserCartCount(user) {
  const items = getUserCart(user);
  return items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
}

/**
 * Compute total pricing, savings, and discounts for the user's cart
 */
export function getUserCartTotals(user, customItems = null) {
  const items = customItems || getUserCart(user);

  let subtotal = 0;
  let originalTotal = 0;
  let totalUnits = 0;

  items.forEach((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    const oldPrice = Number(item.oldPrice) && item.oldPrice > price ? Number(item.oldPrice) : price;

    subtotal += price * qty;
    originalTotal += oldPrice * qty;
    totalUnits += qty;
  });

  const discountSavings = originalTotal > subtotal ? originalTotal - subtotal : 0;
  const shippingFee = subtotal >= 2000 || subtotal === 0 ? 0 : 250;
  const grandTotal = subtotal + shippingFee;

  return {
    totalUnits,
    subtotal,
    originalTotal,
    discountSavings,
    shippingFee,
    grandTotal,
  };
}
