const initApp = () => {
  const config = window.WASFI_CONFIG || {};
  const items = Array.isArray(window.MENU_ITEMS) ? window.MENU_ITEMS : [];
  const specials = Array.isArray(window.SPECIALS) ? window.SPECIALS : [];

  // Hide broken dish photos without inline event handlers (keeps CSP-friendly markup).
  document.addEventListener(
    "error",
    (event) => {
      const target = event.target;
      if (target instanceof HTMLImageElement) {
        target.style.visibility = "hidden";
      }
    },
    true
  );

  const safeStorage = {
    get(key, fallback = null) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        return false;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        return false;
      }
    }
  };

  const setTheme = (mode) => {
    const normalized = mode === "dark" || mode === "light" ? mode : "light";
    document.documentElement.setAttribute("data-theme", normalized);
    safeStorage.set(config.theme?.storageKey || "wasfi-theme", normalized);
    const btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      btn.setAttribute("aria-label", normalized === "dark" ? "Switch to light mode" : "Switch to dark mode");
      btn.textContent = normalized === "dark" ? "☀" : "☾";
    }
  };

  const detectInitialTheme = () => {
    const saved = safeStorage.get(config.theme?.storageKey || "wasfi-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const themeButton = document.querySelector("[data-theme-toggle]");
  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  setTheme(detectInitialTheme());

  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-mobile-nav]");
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navMenu.hidden = expanded;
    });
  }

  const renderDaySpecial = () => {
    const specialCard = document.querySelector("[data-special-card]");
    if (!specialCard || specials.length === 0) return;

    const today = new Date();
    const chicagoTime = new Intl.DateTimeFormat("en-US", {
      timeZone: config.timezone || "America/Chicago",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(today);

    const weekdayName = chicagoTime.find((part) => part.type === "weekday")?.value || "Monday";
    const matchedDay = specials.find((special) => special.day.toLowerCase() === weekdayName.toLowerCase());
    const selected = matchedDay || specials[0];

    specialCard.querySelector("[data-special-name]").textContent = selected.name;
    specialCard.querySelector("[data-special-day]").textContent = selected.day;
    specialCard.querySelector("[data-special-price]").textContent = `$${selected.price.toFixed(2)}`;
    specialCard.querySelector("[data-special-description]").textContent = selected.description;
    specialCard.querySelector("[data-special-note]").textContent = selected.note || "Availability should be confirmed before ordering.";

    document.querySelectorAll("[data-day-button]").forEach((button) => {
      const active = button.dataset.dayButton === selected.day;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  document.querySelectorAll("[data-day-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const special = specials.find((item) => item.day === button.dataset.dayButton) || specials[0];
      if (!special) return;
      const card = document.querySelector("[data-special-card]");
      if (!card) return;
      card.querySelector("[data-special-name]").textContent = special.name;
      card.querySelector("[data-special-day]").textContent = special.day;
      card.querySelector("[data-special-price]").textContent = `$${special.price.toFixed(2)}`;
      card.querySelector("[data-special-description]").textContent = special.description;
      card.querySelector("[data-special-note]").textContent = special.note || "Availability should be confirmed before ordering.";
      document.querySelectorAll("[data-day-button]").forEach((element) => {
        const active = element.dataset.dayButton === special.day;
        element.classList.toggle("is-active", active);
        element.setAttribute("aria-pressed", String(active));
      });
    });
  });

  if (specials.length) {
    renderDaySpecial();
  }

  const selectionKey = config.selection?.storageKey || "wasfi-selection-v1";
  const readSelection = () => {
    const raw = safeStorage.get(selectionKey, "[]") || "[]";
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      safeStorage.set(selectionKey, "[]");
      return [];
    }

    if (!Array.isArray(parsed)) {
      safeStorage.set(selectionKey, "[]");
      return [];
    }

    return parsed.reduce((valid, entry) => {
      const menuItem = items.find((item) => item.id === entry?.id);
      const quantity = Number(entry?.quantity);
      if (!menuItem || !Number.isSafeInteger(quantity) || quantity < 1) return valid;
      valid.push({
        id: menuItem.id,
        name: menuItem.name,
        price: Number(menuItem.price),
        quantity
      });
      return valid;
    }, []);
  };

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

  const updateSelectionSummary = () => {
    const panel = document.querySelector("[data-selection-panel]");
    const list = document.querySelector("[data-selection-list]");
    const totalEl = document.querySelector("[data-selection-total]");
    const count = document.querySelector("[data-selection-count]") || document.querySelector("[data-selection-badge]");
    const toggleBadge = document.querySelector("[data-selection-badge]");
    const toggleButton = document.querySelector("[data-toggle-selection]");
    if (!list || !totalEl || !toggleBadge || !panel) return;

    const current = readSelection();
    const total = current.reduce((sum, item) => sum + item.quantity * Number(item.price), 0);
    const totalCount = current.reduce((sum, item) => sum + item.quantity, 0);

    if (count) count.textContent = totalCount;
    toggleBadge.textContent = totalCount;
    totalEl.textContent = formatCurrency(total);

    if (toggleButton) {
      const hasItems = totalCount > 0;
      toggleButton.classList.toggle("is-active", hasItems);
      toggleButton.setAttribute("aria-label", hasItems ? `Open My Selection with ${totalCount} item${totalCount === 1 ? "" : "s"}` : "Open My Selection");
    }

    if (current.length === 0) {
      list.innerHTML = '<div class="empty-state">Your selection is empty. Add dishes from the menu to compare and review them.</div>';
      return;
    }

    list.innerHTML = current
      .map((item) => `
        <div class="selection-item">
          <div>
            <h4>${item.name}</h4>
            <div class="selection-footnote">${formatCurrency(item.price)}</div>
          </div>
          <div class="qty-controls" aria-label="Quantity controls for ${item.name}">
            <button type="button" data-qty-change="decrease" data-item-id="${item.id}" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-qty-change="increase" data-item-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="small-button" data-remove-item="${item.id}">Remove</button>
        </div>
      `)
      .join("");
  };

  const persistSelection = (itemsList) => {
    const stored = JSON.stringify(itemsList);
    safeStorage.set(selectionKey, stored);
    updateSelectionSummary();
  };

  const addToSelection = (itemId) => {
    const selectedItem = items.find((item) => item.id === itemId);
    if (!selectedItem) return;
    const current = readSelection();
    const existing = current.find((entry) => entry.id === itemId);

    if (existing) {
      existing.quantity += 1;
    } else {
      current.push({ id: itemId, name: selectedItem.name, price: selectedItem.price, quantity: 1 });
    }

    persistSelection(current);
    const panel = document.querySelector("[data-selection-panel]");
    if (panel) panel.classList.add("is-open");
  };

  document.body.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-item]");
    if (addButton) {
      addToSelection(addButton.dataset.addItem);
      return;
    }

    const removeButton = event.target.closest("[data-remove-item]");
    if (removeButton) {
      const current = readSelection();
      const filtered = current.filter((entry) => entry.id !== removeButton.dataset.removeItem);
      persistSelection(filtered);
      return;
    }

    const qtyButton = event.target.closest("[data-qty-change]");
    if (qtyButton) {
      const current = readSelection();
      const item = current.find((entry) => entry.id === qtyButton.dataset.itemId);
      if (!item) return;
      if (qtyButton.dataset.qtyChange === "increase") item.quantity += 1;
      if (qtyButton.dataset.qtyChange === "decrease") item.quantity = Math.max(0, item.quantity - 1);
      const next = current.filter((entry) => entry.quantity > 0);
      persistSelection(next);
      return;
    }

    const toggleButton = event.target.closest("[data-toggle-selection]");
    if (toggleButton) {
      const panel = document.querySelector("[data-selection-panel]");
      if (panel) {
        const isOpen = !panel.classList.contains("is-open");
        panel.classList.toggle("is-open", isOpen);
        toggleButton.classList.toggle("is-active", isOpen || readSelection().length > 0);
      }
      return;
    }

    const clearButton = event.target.closest("[data-clear-selection]");
    if (clearButton) {
      persistSelection([]);
      const toggleButton = document.querySelector("[data-toggle-selection]");
      if (toggleButton) toggleButton.classList.remove("is-active");
      return;
    }

    const closeButton = event.target.closest("[data-close-selection]");
    if (closeButton) {
      const panel = document.querySelector("[data-selection-panel]");
      const toggleButton = document.querySelector("[data-toggle-selection]");
      if (panel) panel.classList.remove("is-open");
      if (toggleButton) toggleButton.classList.toggle("is-active", readSelection().length > 0);
      return;
    }

    const copyButton = event.target.closest("[data-copy-selection]");
    if (copyButton) {
      const list = readSelection();
      const text = list.length
        ? list.map((item) => `${item.name} x${item.quantity} — ${formatCurrency(item.price * item.quantity)}`).join("\n")
        : "Selection is empty.";

      const fallback = document.querySelector("[data-selection-fallback]");

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
          .then(() => {
            const notice = document.querySelector("[data-copy-status]");
            if (notice) {
              notice.textContent = "Selection copied to your clipboard.";
              notice.className = "notice success";
            }
          })
          .catch(() => {
            if (fallback) {
              fallback.hidden = false;
              fallback.value = text;
            }
          });
      } else if (fallback) {
        fallback.hidden = false;
        fallback.value = text;
      }
    }
  });

  const renderMenu = () => {
    const listRoot = document.querySelector("[data-menu-list]");
    const detailRoot = document.querySelector("[data-menu-detail]");
    const categoryButtons = document.querySelectorAll("[data-category-button]");
    const searchInput = document.querySelector("[data-menu-search]");
    const resultCount = document.querySelector("[data-result-count]");

    if (!listRoot || !detailRoot || !searchInput || !resultCount) return;

    const availableItems = items.filter((item) => item.available !== false);
    const categoryNames = ["All", ...new Set(availableItems.map((item) => item.category).filter(Boolean))];
    const currentCategory = categoryNames.includes(document.body.dataset.menuCategory || "All") ? document.body.dataset.menuCategory || "All" : "All";
    document.body.dataset.menuCategory = currentCategory;

    categoryButtons.forEach((button) => {
      const category = button.dataset.categoryButton || "All";
      const isAvailable = category === "All" || categoryNames.includes(category);
      button.hidden = !isAvailable;
      const isActive = category === currentCategory;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    const query = searchInput.value.trim().toLowerCase();
    const filtered = availableItems.filter((item) => {
      const matchesCategory = currentCategory === "All" || item.category === currentCategory;
      const haystack = `${item.name} ${item.description}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      return matchesCategory && matchesQuery;
    });

    resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`;

    if (!filtered.length) {
      listRoot.innerHTML = '<div class="empty-state">No dishes match your search. Try another term or clear the filters.</div>';
      detailRoot.innerHTML = '<div class="empty-state">Select a dish to see details.</div>';
      return;
    }

    listRoot.innerHTML = filtered
      .map((item) => `
        <article class="menu-item" data-menu-item="${item.id}">
          <div class="item-thumb">
            <img src="${item.photo}" alt="${item.name}" loading="lazy" width="900" height="900" />
          </div>
          <div class="item-main">
            <div class="item-name-row">
              <h3 class="item-name">${item.name}</h3>
              <span class="item-price">$${Number(item.price).toFixed(2)}</span>
            </div>
            <p class="item-description">${item.description}</p>
          </div>
          <div class="item-actions">
            <button type="button" class="small-button primary" data-view-item="${item.id}">Details</button>
            <button type="button" class="small-button" data-add-item="${item.id}">Add</button>
          </div>
        </article>
      `)
      .join("");

    const firstItem = filtered[0];
    const currentDetail = filtered.some((item) => item.id === document.body.dataset.activeItem) ? document.body.dataset.activeItem : firstItem.id;
    const activeItem = filtered.find((item) => item.id === currentDetail) || firstItem;
    document.body.dataset.activeItem = activeItem.id;
    detailRoot.innerHTML = `
      <div class="detail-card">
        <div class="detail-image">
          <img src="${activeItem.photo || ""}" alt="${activeItem.name}" loading="lazy" width="900" height="900" />
        </div>
        <div>
          <div class="chip">${activeItem.category}</div>
          <h3>${activeItem.name}</h3>
        </div>
        <div class="detail-price">$${Number(activeItem.price).toFixed(2)}</div>
        <p>${activeItem.description}</p>
        <button type="button" class="button" data-add-item="${activeItem.id}">Add to My Selection</button>
      </div>
    `;
  };

  const categoryButtons = document.querySelectorAll("[data-category-button]");
  if (categoryButtons.length) {
    categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        document.body.dataset.menuCategory = button.dataset.categoryButton || "All";
        renderMenu();
      });
    });
  }

  const searchInput = document.querySelector("[data-menu-search]");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderMenu();
    });
  }

  document.querySelectorAll("[data-clear-search]").forEach((clearSearchButton) => {
    clearSearchButton.addEventListener("click", () => {
      if (!searchInput) return;
      searchInput.value = "";
      document.body.dataset.menuCategory = "All";
      renderMenu();
      searchInput.focus();
    });
  });

  document.body.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view-item]");
    if (viewButton) {
      document.body.dataset.activeItem = viewButton.dataset.viewItem;
      renderMenu();
      return;
    }
  });

  document.body.dataset.menuCategory = "All";
  document.body.dataset.activeItem = items[0]?.id || "";
  const initialSelection = readSelection();
  if (initialSelection.length) {
    const panel = document.querySelector("[data-selection-panel]");
    if (panel) panel.classList.add("is-open");
  }

  updateSelectionSummary();
  renderMenu();

  const fallback = document.querySelector("[data-selection-fallback]");
  const copyStatus = document.querySelector("[data-copy-status]");
  if (fallback) {
    fallback.addEventListener("focus", () => fallback.hidden = false);
  }
  if (copyStatus) {
    copyStatus.className = "notice info";
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const panel = document.querySelector("[data-selection-panel]");
      if (panel && panel.classList.contains("is-open")) {
        panel.classList.remove("is-open");
      }
    }
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
