AOS.init({
  // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
  offset: 120, // offset (in px) from the original trigger point
  delay: 0, // values from 0 to 3000, with step 50ms
  duration: 900, // values from 0 to 3000, with step 50ms
  easing: "ease", // default easing for AOS animations
  once: false, // whether animation should happen only once - while scrolling down
  mirror: false, // whether elements should animate out while scrolling past them
  anchorPlacement: "top-bottom", // defines which position of the element regarding to window should trigger the animation
});

document
  .querySelector('a[href^="#"]')
  .addEventListener("click", function (event) {
    event.preventDefault();
    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);
    window.scrollTo({
      top: targetElement.offsetTop,
      behavior: "smooth",
    });
  });

document.addEventListener("DOMContentLoaded", function () {
  // Get the navbar collapse element and all navbar links
  var navbarCollapse = document.querySelector(".navbar-collapse");
  var navLinks = document.querySelectorAll(".navbar-nav .nav-link");

  // Add click event listener to each link
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      // If the navbar collapse is shown, trigger the collapse
      if (navbarCollapse.classList.contains("show")) {
        var navbarToggler = document.querySelector(".navbar-toggler");

        // Close the navbar with a timeout to allow for link processing
        setTimeout(function () {
          navbarToggler.click(); // Simulate click on the toggler to close
        }, 300); // Adjust timeout as needed
      }
    });
  });
});

const modal = document.getElementById("signupModal");
const signupBtn = document.getElementById("signupBtn");
const closeModal = document.getElementById("closeModal");

signupBtn.onclick = function () {
  modal.style.display = "block";
};

closeModal.onclick = function () {
  modal.style.display = "none";
  // Refresh the page if desired
  location.reload();
};
