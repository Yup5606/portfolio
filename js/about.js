(function () {
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
