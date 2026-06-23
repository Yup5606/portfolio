(function () {
  const revealItems = document.querySelectorAll(
    ".content-section, .image-story, .parley-role-section, .parley-research-section, .parley-persona-section, .parley-point-section"
  );

  if (!revealItems.length || !("IntersectionObserver" in window)) {
    return;
  }

  revealItems.forEach((item) => item.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => observer.observe(item));
})();

(function () {
  const charts = document.querySelectorAll(".parley-pie-chart");
  const namespace = "http://www.w3.org/2000/svg";

  if (!charts.length) {
    return;
  }

  const toPoint = (angle, radius) => {
    const radian = (angle - 90) * (Math.PI / 180);

    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  };

  const getSectorPath = (startAngle, endAngle) => {
    const sweep = Math.max(endAngle - startAngle, 0);

    if (sweep <= 0.01) {
      return "M 0 0";
    }

    const start = toPoint(startAngle, 100);
    const end = toPoint(endAngle, 100);
    const largeArc = sweep > 180 ? 1 : 0;

    return `M 0 0 L ${start.x} ${start.y} A 100 100 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };

  const getLabelLines = (label, display) => {
    return [label, display];
  };

  const buildChart = (chart) => {
    const segmentGroup = chart.querySelector(".parley-pie-segments");
    const labelGroup = chart.querySelector(".parley-pie-labels");
    const dataItems = chart.querySelectorAll(".parley-pie-data li");
    const data = Array.from(dataItems).map((item) => ({
      label: item.dataset.label,
      value: Number(item.dataset.value),
      display: item.dataset.display,
      color: item.dataset.color,
      textColor: item.dataset.textColor
    }));
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const maxValue = Math.max(...data.map((item) => item.value));
    let currentAngle = 0;

    data.forEach((item) => {
      const path = document.createElementNS(namespace, "path");
      const text = document.createElementNS(namespace, "text");
      const angle = (item.value / total) * 360;
      const midAngle = currentAngle + angle / 2;
      const hoverPoint = toPoint(midAngle, 8);
      const labelRadius = item.value < 10 ? 78 : 54;
      const labelPoint = toPoint(midAngle, labelRadius);

      path.dataset.start = currentAngle;
      path.dataset.angle = angle;
      path.setAttribute("fill", item.color);
      path.setAttribute("d", getSectorPath(currentAngle, currentAngle));
      path.classList.add("parley-pie-segment");
      path.style.setProperty("--hover-x", `${hoverPoint.x}px`);
      path.style.setProperty("--hover-y", `${hoverPoint.y}px`);

      text.setAttribute("x", labelPoint.x);
      text.setAttribute("y", labelPoint.y);
      text.setAttribute("fill", item.textColor);
      text.classList.toggle("is-primary", item.value === maxValue);
      text.classList.toggle("is-muted", item.value !== maxValue);
      text.classList.toggle("is-on-color", item.color !== "#ffffff");
      text.classList.toggle("is-small", item.value < 10);

      getLabelLines(item.label, item.display).forEach((line, index) => {
        const tspan = document.createElementNS(namespace, "tspan");

        tspan.setAttribute("x", labelPoint.x);
        tspan.setAttribute("dy", index === 0 ? "-0.55em" : "1.15em");
        tspan.textContent = line;
        text.appendChild(tspan);
      });

      segmentGroup.appendChild(path);
      labelGroup.appendChild(text);
      currentAngle += angle;
    });
  };

  const drawChart = (chart, progress) => {
    chart.querySelectorAll(".parley-pie-segments path").forEach((path) => {
      const startAngle = Number(path.dataset.start);
      const angle = Number(path.dataset.angle);
      const filledAngle = Math.min(Math.max(progress * 360 - startAngle, 0), angle);

      path.setAttribute("d", getSectorPath(startAngle, startAngle + filledAngle));
    });
  };

  const animateChart = (chart) => {
    const duration = 1800;
    const startTime = performance.now();

    const tick = (currentTime) => {
      const rawProgress = Math.min((currentTime - startTime) / duration, 1);
      const progress = 1 - Math.pow(1 - rawProgress, 3);

      drawChart(chart, progress);

      if (rawProgress < 1) {
        window.requestAnimationFrame(tick);
        return;
      }

      chart.classList.add("is-complete");
    };

    window.requestAnimationFrame(tick);
  };

  charts.forEach((chart) => buildChart(chart));

  const startVisibleCharts = () => {
    charts.forEach((chart) => {
      const rect = chart.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight * 0.86 && rect.bottom > window.innerHeight * 0.14;

      if (!isVisible || chart.dataset.pieAnimated === "true") {
        return;
      }

      chart.dataset.pieAnimated = "true";
      animateChart(chart);
    });
  };

  let ticking = false;

  const requestChartCheck = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      startVisibleCharts();
      ticking = false;
    });
  };

  window.addEventListener("scroll", requestChartCheck, { passive: true });
  window.addEventListener("resize", requestChartCheck);
  requestChartCheck();
})();

(function () {
  const skillItems = document.querySelectorAll(".parley-skill-list li");

  skillItems.forEach((item) => {
    item.addEventListener("mousemove", (event) => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      item.style.setProperty("--card-x", `${x}px`);
      item.style.setProperty("--card-y", `${y}px`);
    });
  });
})();

(function () {
  const wireItems = document.querySelectorAll(".parley-wire-list li");

  if (!wireItems.length) {
    return;
  }

  wireItems.forEach((item) => {
    const button = item.querySelector(".parley-wire-button");

    if (!button) {
      return;
    }

    button.addEventListener("click", () => {
      wireItems.forEach((target) => {
        target.classList.remove("is-active");
        target.querySelector(".parley-wire-button")?.setAttribute("aria-pressed", "false");
      });

      item.classList.add("is-active");
      button.setAttribute("aria-pressed", "true");
    });
  });
})();

(function () {
  const tabGroups = document.querySelectorAll(".lotte-component-tabs ul");

  if (!tabGroups.length) {
    return;
  }

  tabGroups.forEach((group) => {
    const buttons = group.querySelectorAll("button");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((target) => {
          target.classList.remove("is-active");
          target.setAttribute("aria-selected", "false");
        });

        button.classList.add("is-active");
        button.setAttribute("aria-selected", "true");
      });
    });
  });
})();

(function () {
  const wireframeShots = document.querySelectorAll(".lotte-wireframe-shot");

  if (!wireframeShots.length || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    return;
  }

  const zoom = 2.15;

  wireframeShots.forEach((shot) => {
    const image = shot.querySelector("img");

    if (!image) {
      return;
    }

    const magnifier = document.createElement("span");
    magnifier.className = "lotte-wireframe-magnifier";
    magnifier.setAttribute("aria-hidden", "true");
    shot.appendChild(magnifier);

    const updateMagnifier = (event) => {
      const imageRect = image.getBoundingClientRect();
      const shotRect = shot.getBoundingClientRect();
      const lensSize = Number.parseFloat(window.getComputedStyle(magnifier).width) || 112;
      const x = event.clientX - imageRect.left;
      const y = event.clientY - imageRect.top;

      if (x < 0 || y < 0 || x > imageRect.width || y > imageRect.height) {
        shot.classList.remove("is-magnifier-visible");
        return;
      }

      magnifier.style.left = `${event.clientX - shotRect.left}px`;
      magnifier.style.top = `${event.clientY - shotRect.top}px`;
      magnifier.style.backgroundImage = `url("${image.currentSrc || image.src}")`;
      magnifier.style.backgroundSize = `${imageRect.width * zoom}px ${imageRect.height * zoom}px`;
      magnifier.style.backgroundPosition = `${-(x * zoom - lensSize / 2)}px ${-(y * zoom - lensSize / 2)}px`;
      shot.classList.add("is-magnifier-visible");
    };

    shot.addEventListener("pointermove", updateMagnifier);
    shot.addEventListener("pointerleave", () => {
      shot.classList.remove("is-magnifier-visible");
    });
  });
})();

(function () {
  const flowCards = document.querySelectorAll(".rockfish-flow-card");
  const painList = document.querySelector(".rockfish-pain-list");
  const painCard = document.querySelector(".rockfish-pain-card");

  if (!flowCards.length || !painList || !painCard) {
    return;
  }

  const painData = [
    {
      label: "Pain Point 01",
      title: "브랜드의 헤리티지 전달 부족",
      text: "영국 해안 감성과 브랜드 배경이 충분히 전달되지 않아, 사용자가 브랜드를 단순히 트렌디한 패션 브랜드로 인식할 가능성이 있었습니다."
    },
    {
      label: "Pain Point 02",
      title: "상품 중심 구조로 인한 브랜드 경험 약화",
      text: "제품 정보는 다양하게 제공되지만 브랜드 스토리와 무드가 함께 연결되지 않아, 사용자가 브랜드 정체성을 깊게 경험하기 어려웠습니다."
    },
    {
      label: "Pain Point 03",
      title: "브랜드 정체성 각인 부족",
      text: "사이트를 탐색한 뒤에도 브랜드는 기억되지만, 왜 특별한 브랜드인지와 어떤 감성적 가치를 제공하는지는 명확하게 남지 않았습니다."
    }
  ];

  const setFlowActive = (index) => {
    flowCards.forEach((card, cardIndex) => {
      const button = card.querySelector("button");
      const isActive = cardIndex === index;

      card.classList.toggle("is-active", isActive);
      button?.setAttribute("aria-pressed", String(isActive));
    });

    painList.classList.add("is-changing");

    window.setTimeout(() => {
      painCard.querySelector("span").textContent = painData[index].label;
      painCard.querySelector("h3").textContent = painData[index].title;
      painCard.querySelector("p").textContent = painData[index].text;
      painList.classList.remove("is-changing");
    }, 180);
  };

  flowCards.forEach((card) => {
    const button = card.querySelector("button");

    button?.addEventListener("click", () => {
      setFlowActive(Number(card.dataset.flowIndex));
    });
  });

  setFlowActive(0);
})();

(function () {
  const posterSection = document.querySelector(".rockfish-poster-section");

  if (!posterSection) {
    return;
  }

  const modal = posterSection.querySelector(".rockfish-poster-modal");
  const modalImage = modal?.querySelector(".rockfish-poster-modal-inner img");
  const closeButton = modal?.querySelector(".rockfish-poster-modal-close");
  const posterButtons = posterSection.querySelectorAll(".rockfish-poster-button");

  if (!modal || !modalImage || !closeButton || !posterButtons.length) {
    return;
  }

  const closePosterModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  };

  const openPosterModal = (button) => {
    modalImage.src = button.dataset.posterSrc;
    modalImage.alt = button.dataset.posterAlt || "";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    closeButton.focus();
  };

  posterButtons.forEach((button) => {
    button.addEventListener("click", () => openPosterModal(button));
  });

  closeButton.addEventListener("click", closePosterModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closePosterModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closePosterModal();
    }
  });
})();

(function () {
  const phones = document.querySelectorAll("[data-drag-scroll]");

  if (!phones.length) {
    return;
  }

  phones.forEach((phone) => {
    const screen = phone.querySelector(".rockfish-brand-phone-screen");

    if (!screen) {
      return;
    }

    let isDragging = false;
    let startY = 0;
    let startScrollTop = 0;

    const getClientY = (event) => {
      if (event.touches?.length) {
        return event.touches[0].clientY;
      }

      if (event.changedTouches?.length) {
        return event.changedTouches[0].clientY;
      }

      return event.clientY;
    };

    const startDragging = (event) => {
      isDragging = true;
      startY = getClientY(event);
      startScrollTop = screen.scrollTop;
      screen.classList.add("is-dragging");
    };

    const moveDragging = (event) => {
      if (!isDragging) {
        return;
      }

      event.preventDefault();
      screen.scrollTop = startScrollTop - (getClientY(event) - startY);
    };

    const stopDragging = () => {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      screen.classList.remove("is-dragging");
    };

    screen.addEventListener("pointerdown", (event) => {
      startDragging(event);
      screen.setPointerCapture?.(event.pointerId);
    });
    screen.addEventListener("pointermove", moveDragging);
    screen.addEventListener("pointerup", stopDragging);
    screen.addEventListener("pointercancel", stopDragging);
    screen.addEventListener("pointerleave", stopDragging);
    screen.addEventListener("mousedown", startDragging);
    window.addEventListener("mousemove", moveDragging);
    window.addEventListener("mouseup", stopDragging);
    screen.addEventListener("touchstart", startDragging, { passive: false });
    screen.addEventListener("touchmove", moveDragging, { passive: false });
    screen.addEventListener("touchend", stopDragging);
    screen.addEventListener("touchcancel", stopDragging);
  });
})();

(function () {
  if (!window.AOS) {
    return;
  }

  window.AOS.init({
    duration: 720,
    easing: "ease",
    once: true,
    offset: 80
  });
})();

(function () {
  const initProjectNav = () => {
    const projectNav = document.querySelector(".project-page .site-nav");

    if (!projectNav || projectNav.dataset.scrollReady === "true") {
      return;
    }

    projectNav.dataset.scrollReady = "true";
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateProjectNav = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const distance = currentScrollY - lastScrollY;

      if (currentScrollY < 32) {
        projectNav.classList.remove("is-nav-hidden");
      } else if (distance > 8) {
        projectNav.classList.add("is-nav-hidden");
      } else if (distance < -8) {
        projectNav.classList.remove("is-nav-hidden");
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const requestProjectNavUpdate = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(updateProjectNav);
    };

    window.addEventListener("scroll", requestProjectNavUpdate, { passive: true });
  };

  if (window.portfolioIncludesReady) {
    window.portfolioIncludesReady.then(initProjectNav);
    return;
  }

  initProjectNav();
})();
