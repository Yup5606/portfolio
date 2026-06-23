(function () {
  const projects = document.querySelectorAll(".index-project");

  if (!projects.length || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    return;
  }

  projects.forEach((project) => {
    project.addEventListener("pointermove", (event) => {
      const rect = project.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const xRatio = x / rect.width - 0.5;
      const yRatio = y / rect.height - 0.5;

      project.style.setProperty("--hover-x", `${x}px`);
      project.style.setProperty("--hover-y", `${y}px`);
      project.style.setProperty("--tilt-x", `${yRatio * -4}deg`);
      project.style.setProperty("--tilt-y", `${xRatio * 5}deg`);
    });

    project.addEventListener("pointerleave", () => {
      project.style.setProperty("--tilt-x", "0deg");
      project.style.setProperty("--tilt-y", "0deg");
    });

    project.addEventListener("pointerdown", () => {
      project.classList.add("is-pressed");
    });

    project.addEventListener("pointerup", () => {
      project.classList.remove("is-pressed");
    });

    project.addEventListener("pointercancel", () => {
      project.classList.remove("is-pressed");
    });
  });
})();

(function () {
  const slider = document.querySelector("[data-main-slider]");
  const panels = slider ? Array.from(slider.querySelectorAll("[data-main-panel]")) : [];
  let activeIndex = panels.findIndex((panel) => panel.classList.contains("is-active"));
  let isChanging = false;
  let wheelDelta = 0;
  let wheelResetTimer;

  if (!panels.length) {
    return;
  }

  document.body.classList.add("is-locked");
  activeIndex = activeIndex < 0 ? 0 : activeIndex;

  const loaderStartedAt = window.performance.now();
  const loaderDuration = 2200;
  const transitionDuration = 1180;
  const wheelThreshold = 80;
  let pageLoaded = document.readyState === "complete";
  let loaderFinished = false;

  const finishLoading = () => {
    if (loaderFinished || !pageLoaded) {
      return;
    }

    loaderFinished = true;
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-loaded");
  };

  const requestLoaderFinish = () => {
    const elapsed = window.performance.now() - loaderStartedAt;
    window.setTimeout(finishLoading, Math.max(0, loaderDuration - elapsed));
  };

  requestLoaderFinish();
  window.addEventListener("load", () => {
    pageLoaded = true;
    requestLoaderFinish();
  });

  panels.forEach((panel, index) => {
    panel.style.zIndex = index === activeIndex ? "2" : "0";
  });

  const controls = document.createElement("div");
  controls.className = "panel-controls";
  controls.setAttribute("aria-label", "프로젝트 슬라이드 선택");

  const controlButtons = panels.map((panel, index) => {
    const button = document.createElement("button");
    const title = panel.querySelector(".panel-title")?.textContent.trim() || `Project ${index + 1}`;

    button.type = "button";
    button.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span>`;
    button.setAttribute("aria-label", `${title} 보기`);
    button.addEventListener("click", () => {
      if (document.body.classList.contains("is-loading")) {
        return;
      }

      showPanel(index);
    });
    controls.appendChild(button);

    return button;
  });

  slider.appendChild(controls);

  const updateControls = () => {
    controlButtons.forEach((button, index) => {
      const isActive = index === activeIndex;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const showPanel = (nextIndex) => {
    const safeIndex = (nextIndex + panels.length) % panels.length;

    if (safeIndex === activeIndex || isChanging) {
      return false;
    }

    const direction = nextIndex > activeIndex ? 1 : -1;
    const currentPanel = panels[activeIndex];
    const nextPanel = panels[safeIndex];

    isChanging = true;

    if (direction > 0) {
      currentPanel.style.zIndex = "2";
      nextPanel.style.zIndex = "3";
      nextPanel.classList.remove("from-left", "from-right", "is-under", "is-exiting", "is-active");
      nextPanel.classList.add("from-right");

      window.requestAnimationFrame(() => {
        nextPanel.classList.add("is-active");
      });

      window.setTimeout(() => {
        currentPanel.classList.remove("is-active", "is-under", "is-exiting");
        currentPanel.style.zIndex = "1";
        nextPanel.classList.remove("from-right");
        nextPanel.style.zIndex = "2";
        activeIndex = safeIndex;
        isChanging = false;
        updateControls();
      }, transitionDuration);

      return true;
    }

    nextPanel.style.zIndex = "2";
    currentPanel.style.zIndex = "3";
    nextPanel.classList.remove("from-left", "from-right", "is-exiting");
    nextPanel.classList.add("is-under");

    window.requestAnimationFrame(() => {
      currentPanel.classList.add("is-exiting");
    });

    window.setTimeout(() => {
      currentPanel.classList.remove("is-active", "is-under", "is-exiting");
      currentPanel.style.zIndex = "0";
      nextPanel.classList.remove("is-under");
      nextPanel.classList.add("is-active");
      nextPanel.style.zIndex = "2";
      activeIndex = safeIndex;
      isChanging = false;
      updateControls();
    }, transitionDuration);

    return true;
  };

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    slider.addEventListener("pointermove", (event) => {
      const panel = panels[activeIndex];
      const rect = panel.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const driftX = (x / rect.width - 0.5) * -18;
      const driftY = (y / rect.height - 0.5) * -12;

      panel.style.setProperty("--cursor-x", `${x}px`);
      panel.style.setProperty("--cursor-y", `${y}px`);
      panel.style.setProperty("--drift-x", `${driftX}px`);
      panel.style.setProperty("--drift-y", `${driftY}px`);
    });

    slider.addEventListener("pointerleave", () => {
      panels[activeIndex].style.setProperty("--drift-x", "0px");
      panels[activeIndex].style.setProperty("--drift-y", "0px");
    });
  }

  updateControls();

  window.addEventListener(
    "wheel",
    (event) => {
      if (document.body.classList.contains("is-loading")) {
        event.preventDefault();
        return;
      }

      event.preventDefault();

      if (isChanging) {
        return;
      }

      wheelDelta += event.deltaY;
      window.clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => {
        wheelDelta = 0;
      }, 160);

      if (Math.abs(wheelDelta) < wheelThreshold) {
        return;
      }

      showPanel(activeIndex + (wheelDelta > 0 ? 1 : -1));
      wheelDelta = 0;
    },
    { passive: false }
  );

  window.addEventListener("keydown", (event) => {
    if (document.body.classList.contains("is-loading")) {
      return;
    }

    const nextKeys = ["ArrowDown", "PageDown", " "];
    const prevKeys = ["ArrowUp", "PageUp"];

    if (nextKeys.includes(event.key)) {
      event.preventDefault();
      showPanel(activeIndex + 1);
    }

    if (prevKeys.includes(event.key)) {
      event.preventDefault();
      showPanel(activeIndex - 1);
    }
  });
})();
