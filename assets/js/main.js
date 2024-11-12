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

//Sign Up Modal Config

document
  .getElementById("SignUpBtn")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Prevent form submission to handle validation

    // Get form input values
    const email = document.getElementById("SignupInputEmail").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmpassword").value;
    const checkBox = document.getElementById("SignUpCheckBox");

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert(
        "Please enter a valid email that includes '@' and a domain like 'example@domain.com'."
      );
      return;
    }

    // Password confirmation validation
    if (password !== confirmPassword) {
      alert(
        "Passwords do not match. Please make sure both passwords are identical."
      );
      return;
    }

    // Empty fields and checkbox validation
    if (
      email === "" ||
      password === "" ||
      confirmPassword === "" ||
      !checkBox.checked
    ) {
      alert(
        "All fields must be filled, and you must agree to the terms by checking the checkbox."
      );
      return;
    }
    // Close the Sign Up Modal
    const signUpModal = bootstrap.Modal.getInstance(
      document.getElementById("ModalSignUpForm")
    );
    signUpModal.hide(); // Close the Sign Up modal

    // Show success modal if all validations pass
    const successModal = new bootstrap.Modal(
      document.getElementById("mySuccessModal")
    );
    successModal.show();

    // Reset the form fields
    document.getElementById("signup").reset(); // Resets the form with id "signup"
  });

//LogIn Modal Config

// Set the correct login credentials
const correctEmail = "beemoedunnohowtododge@manokPH.com";
const correctPassword = "beemoedunnohow2danceapatepate";

// Add event listener for the login button click on Log In Modal
document
  .querySelector("#ModalForm form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission to handle validation

    // Get the input values
    const email = document.getElementById("exampleInputEmail1").value;
    const password = document.getElementById("exampleInputPassword1").value;

    // Check for empty fields
    if (email === "" || password === "") {
      alert("Please enter both email and password.");
      return;
    }

    // Validate credentials
    if (email === correctEmail && password === correctPassword) {
      // Close the login modal and show success
      alert("Login successful!");
      // Optionally, hide the login modal here
      const loginModal = bootstrap.Modal.getInstance(
        document.getElementById("ModalForm")
      );
      loginModal.hide();

      // Redirect to home.html
      window.location.href = "home.html";
    } else {
      // Show error message
      alert("Incorrect email or password. Please try again.");
    }
  });

//Succesful Modal config
// Add event listener for the login button click on Success Modal
document.getElementById("loginButton").addEventListener("click", function () {
  // Close the success modal
  const successModal = bootstrap.Modal.getInstance(
    document.getElementById("mySuccessModal")
  );
  successModal.hide(); // Close the success modal

  // Show the login modal
  const loginModal = new bootstrap.Modal(document.getElementById("ModalForm"));
  loginModal.show(); // Open the login modal
});
