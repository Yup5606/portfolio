(function () {
  const includeTargets = Array.from(document.querySelectorAll("[data-include]"));

  const applyHeaderVariant = (target, fragment) => {
    const header = fragment.querySelector("header");
    const logo = fragment.querySelector(".main-nav-logo");
    const variant = target.dataset.headerVariant || "main";

    if (!header || !logo) {
      return;
    }

    if (variant === "project") {
      header.className = "site-nav";
      logo.className = "site-nav__logo";
      return;
    }

    header.className = variant === "about" ? "main-nav about-nav" : "main-nav";
    logo.className = "main-nav-logo";
  };

  const loadInclude = async (target) => {
    const source = target.dataset.include;

    if (!source) {
      return;
    }

    const response = await fetch(source);

    if (!response.ok) {
      throw new Error(`${source} 파일을 불러오지 못했습니다.`);
    }

    const template = document.createElement("template");
    template.innerHTML = await response.text();
    const fragment = template.content.cloneNode(true);

    if (target.dataset.headerVariant) {
      applyHeaderVariant(target, fragment);
    }

    target.replaceWith(fragment);
  };

  const initNavigation = () => {
    const currentFile = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".site-nav nav a, .main-nav nav a");
    const homeLinks = document.querySelectorAll(".site-nav__logo, .main-nav-logo");
    const activeFile = document.body.classList.contains("project-page") ? "" : currentFile;

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");

      if (href === activeFile) {
        link.classList.add("is-current");
        link.setAttribute("aria-current", "page");
      }
    });

    homeLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        if (currentFile !== "index.html") {
          return;
        }

        event.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    });
  };

  window.portfolioIncludesReady = Promise.all(includeTargets.map(loadInclude))
    .catch((error) => {
      console.warn(error);
    })
    .then(() => {
      initNavigation();
      document.dispatchEvent(new CustomEvent("portfolio:includes-ready"));
    });
})();
