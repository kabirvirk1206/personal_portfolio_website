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