(function () {
  // 어바웃 - Side nav active
  const sideLinks = Array.from(document.querySelectorAll(".about-side-nav a[href^='#']"));
  const sections = sideLinks
    .map((link) => ({
      link,
      section: document.querySelector(link.getAttribute("href")),
    }))
    .filter((item) => item.section);

  const setActiveLink = (activeLink) => {
    sideLinks.forEach((link) => {
      const isActive = link === activeLink;

      link.classList.toggle("is-active", isActive);
      link.toggleAttribute("aria-current", isActive);
    });
  };

  const updateActiveSection = () => {
    if (!sections.length) {
      return;
    }

    const anchorPosition = window.innerHeight * 0.22;

    const containedItem = sections.find((item) => {
      const rect = item.section.getBoundingClientRect();

      return rect.top <= anchorPosition && rect.bottom > anchorPosition;
    });

    const previousItem = sections.reduce((current, item) => {
      const rect = item.section.getBoundingClientRect();

      if (rect.top <= anchorPosition) {
        return item;
      }

      return current;
    }, null);

    const activeItem = containedItem || previousItem || sections[0];

    if (activeItem) {
      setActiveLink(activeItem.link);
    }
  };

  let ticking = false;

  const requestPageUpdate = () => {
    if (ticking) {
      return;
    }

    ticking = true;

    window.requestAnimationFrame(() => {
      updateActiveSection();
      ticking = false;
    });
  };

  window.addEventListener("scroll", requestPageUpdate, { passive: true });
  window.addEventListener("resize", requestPageUpdate);

  updateActiveSection();

  // 어바웃 - Keyword tabs
  const keywordTabs = Array.from(document.querySelectorAll("[data-keyword-tab]"));
  const keywordPanels = Array.from(document.querySelectorAll("[data-keyword-panel]"));
  const keywordTabList = document.querySelector(".keyword-tab-list");

  const activateKeyword = (activeTab) => {
    keywordTabs.forEach((tab) => {
      const isActive = tab === activeTab;

      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    keywordPanels.forEach((panel) => {
      const isActive = panel.id === activeTab.getAttribute("aria-controls");

      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });
  };

  if (keywordTabList) {
    keywordTabList.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-keyword-tab]");

      if (tab) {
        activateKeyword(tab);
      }
    });

    keywordTabList.addEventListener("mouseover", (e) => {
      const tab = e.target.closest("[data-keyword-tab]");

      if (tab) {
        activateKeyword(tab);
      }
    });
  }

  keywordTabs.forEach((tab) => {
    tab.addEventListener("focus", () => activateKeyword(tab));
    tab.addEventListener("keydown", (e) => {
      const currentIndex = keywordTabs.indexOf(tab);

      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") {
        return;
      }

      e.preventDefault();

      const nextIndex =
        e.key === "ArrowRight"
          ? (currentIndex + 1) % keywordTabs.length
          : (currentIndex - 1 + keywordTabs.length) % keywordTabs.length;

      keywordTabs[nextIndex].focus();
    });
  });

  // 어바웃 - Tool disclosure cards
  const toolGroups = Array.from(document.querySelectorAll(".tool-list"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animateTool = (tool, shouldOpen, options = {}) => {
    const summary = tool.querySelector("summary");

    if (!summary) {
      tool.open = shouldOpen;
      return;
    }

    if (reducedMotion || options.instant) {
      tool.style.height = "";
      tool.style.overflow = "";
      tool.open = shouldOpen;
      return;
    }

    const startHeight = tool.offsetHeight;
    tool.style.height = `${startHeight}px`;
    tool.style.overflow = "hidden";

    if (shouldOpen) {
      tool.open = true;
    }

    const endHeight = shouldOpen ? tool.scrollHeight : summary.offsetHeight + 2;

    requestAnimationFrame(() => {
      tool.style.height = `${endHeight}px`;
    });

    const finishAnimation = (e) => {
      if (e.propertyName !== "height") {
        return;
      }

      tool.removeEventListener("transitionend", finishAnimation);

      if (!shouldOpen) {
        tool.open = false;
      }

      tool.style.height = "";
      tool.style.overflow = "";
    };

    tool.addEventListener("transitionend", finishAnimation);
  };

  toolGroups.forEach((group) => {
    const tools = Array.from(group.querySelectorAll(".tool-item"));

    tools.forEach((tool) => {
      tool.addEventListener("click", (e) => {
        e.preventDefault();
        const shouldOpen = !tool.open;

        tools.forEach((item) => {
          if (item !== tool && item.open) {
            animateTool(item, false, { instant: true });
          }
        });

        animateTool(tool, shouldOpen);
      });
    });
  });

  // 어바웃 - History drag scroll
  const historyTrack = document.querySelector(".history-track");

  if (historyTrack) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    historyTrack.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX - historyTrack.offsetLeft;
      scrollLeft = historyTrack.scrollLeft;
      historyTrack.classList.add("is-dragging");
    });

    historyTrack.addEventListener("mousemove", (e) => {
      if (!isDown) {
        return;
      }

      e.preventDefault();

      const x = e.pageX - historyTrack.offsetLeft;
      const walk = (x - startX) * 1.2;

      historyTrack.scrollLeft = scrollLeft - walk;
    });

    historyTrack.addEventListener("mouseup", () => {
      isDown = false;
      historyTrack.classList.remove("is-dragging");
    });

    historyTrack.addEventListener("mouseleave", () => {
      isDown = false;
      historyTrack.classList.remove("is-dragging");
    });
  }
})();
