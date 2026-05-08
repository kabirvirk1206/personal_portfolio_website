const menuLinks = document.querySelectorAll('a[href^="#"]');

menuLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const sectionId = link.getAttribute("href");
    if (!sectionId || sectionId === "#") {
      return;
    }
    const section = document.querySelector(sectionId);
    if (!section){ 
      return;
    } 
    // Stop the instant jump and scroll there smoothly instead.
    event.preventDefault();
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

(function setupPhotoLightbox() {
  const dialog = document.querySelector("#photo-lightbox");
  if (!dialog) return;

  const dlgImg = dialog.querySelector(".photo-lightbox-img");
  const dlgCaption = dialog.querySelector(".photo-lightbox-caption");
  const closeBtn = dialog.querySelector(".photo-lightbox-close");
  const panel = dialog.querySelector(".photo-lightbox-panel");

  function resetLightbox() {
    dlgImg?.removeAttribute("src");
    if (dlgCaption) {
      dlgCaption.textContent = "";
      dlgCaption.setAttribute("hidden", "");
    }
  }

  function captionFor(zoomEl) {
    const project = zoomEl.closest(".project");
    if (project) {
      return project.querySelector("h3")?.textContent?.trim() ?? "";
    }
    const figure = zoomEl.closest("figure");
    const fc = figure?.querySelector(".hero-caption") ?? figure?.querySelector("figcaption");
    return fc?.textContent?.trim() ?? "";
  }

  function openLightbox(zoomEl) {
    const img = zoomEl.querySelector("img");
    if (!img?.src || !dlgImg) return;
    dlgImg.src = img.currentSrc || img.src;
    dlgImg.alt = img.alt || "";
    const cap = captionFor(zoomEl);
    if (dlgCaption) {
      if (cap) {
        dlgCaption.textContent = cap;
        dlgCaption.removeAttribute("hidden");
      } else {
        dlgCaption.textContent = "";
        dlgCaption.setAttribute("hidden", "");
      }
    }
    dialog.showModal();
    dlgImg.focus({ preventScroll: true });
  }

  document.body.addEventListener("click", (e) => {
    const zoom = e.target.closest(".zoomable");
    if (!zoom) return;
    e.preventDefault();
    openLightbox(zoom);
  });

  document.body.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const el = e.target;
    if (!el || !el.classList?.contains?.("zoomable")) return;
    e.preventDefault();
    openLightbox(el);
  });

  closeBtn?.addEventListener("click", () => {
    dialog.close();
  });

  dialog.addEventListener("click", (e) => {
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    const inside =
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    if (!inside) dialog.close();
  });

  dialog.addEventListener("close", resetLightbox);
})();