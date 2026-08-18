 /* =====================================================
   GODMADE — MAIN JAVASCRIPT
===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ================================================
     PRELOADER
  ================================================ */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('loaded');
    }, 400);
  });

  /* ================================================
     HEADER SCROLL EFFECT
  ================================================ */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    toggleBackToTop();
  });

  /* ================================================
     MOBILE HAMBURGER MENU
  ================================================ */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close mobile menu when a link is clicked
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  /* ================================================
     SMOOTH SCROLLING + ACTIVE NAV LINK
  ================================================ */
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
      }
    });
  });

  function updateActiveNavLink() {
    let currentSection = '';
    const scrollPos = window.scrollY + 150;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinkEls.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink);

  /* ================================================
     SCROLL REVEAL ANIMATIONS
  ================================================ */
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ================================================
     ANIMATED COUNTERS (About Stats)
  ================================================ */
  const counters = document.querySelectorAll('.counter');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(update);
  }

  /* ================================================
     GALLERY FILTERING
  ================================================ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || filter === category) {
          item.classList.remove('hide');
        } else {
          item.classList.add('hide');
        }
      });
    });
  });

  /* ================================================
     LIGHTBOX GALLERY
  ================================================ */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let currentImageIndex = 0;
  let visibleGalleryItems = [];

  function getVisibleGalleryItems() {
    return Array.from(document.querySelectorAll('.gallery-item:not(.hide)'));
  }

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      visibleGalleryItems = getVisibleGalleryItems();
      currentImageIndex = visibleGalleryItems.indexOf(item);
      openLightbox(currentImageIndex);
    });
  });

  function openLightbox(index) {
    if (!visibleGalleryItems[index]) return;
    const item = visibleGalleryItems[index];
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-overlay p');

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = caption ? caption.textContent : '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showNextImage() {
    visibleGalleryItems = getVisibleGalleryItems();
    currentImageIndex = (currentImageIndex + 1) % visibleGalleryItems.length;
    openLightbox(currentImageIndex);
  }

  function showPrevImage() {
    visibleGalleryItems = getVisibleGalleryItems();
    currentImageIndex = (currentImageIndex - 1 + visibleGalleryItems.length) % visibleGalleryItems.length;
    openLightbox(currentImageIndex);
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', showNextImage);
  lightboxPrev.addEventListener('click', showPrevImage);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'ArrowLeft') showPrevImage();
  });

  /* ================================================
     AUTOMATIC MOVING SLIDESHOW
  ================================================ */
  const slidesWrapper = document.getElementById('slidesWrapper');
  const slides = document.querySelectorAll('.slide');
  const slideDotsContainer = document.getElementById('slideDots');
  const slidePrevBtn = document.getElementById('slidePrev');
  const slideNextBtn = document.getElementById('slideNext');

  let currentSlide = 0;
  let slideInterval;
  const SLIDE_DURATION = 4500;

  // Build dots
  slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      goToSlide(index);
      resetSlideInterval();
    });
    slideDotsContainer.appendChild(dot);
  });

  const slideDots = document.querySelectorAll('.slide-dots .dot');

  function goToSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    slidesWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
    slideDots.forEach(d => d.classList.remove('active'));
    slideDots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function startSlideInterval() {
    slideInterval = setInterval(nextSlide, SLIDE_DURATION);
  }

  function resetSlideInterval() {
    clearInterval(slideInterval);
    startSlideInterval();
  }

  slideNextBtn.addEventListener('click', () => {
    nextSlide();
    resetSlideInterval();
  });

  slidePrevBtn.addEventListener('click', () => {
    prevSlide();
    resetSlideInterval();
  });

  startSlideInterval();

  // Pause on hover
  const slideshowContainer = document.querySelector('.slideshow-container');
  slideshowContainer.addEventListener('mouseenter', () => clearInterval(slideInterval));
  slideshowContainer.addEventListener('mouseleave', startSlideInterval);

  /* ================================================
     TESTIMONIALS SLIDER
  ================================================ */
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const testimonialDotsContainer = document.getElementById('testimonialDots');
  let currentTestimonial = 0;
  let testimonialInterval;
  const TESTIMONIAL_DURATION = 6000;

  testimonialCards.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
      goToTestimonial(index);
      resetTestimonialInterval();
    });
    testimonialDotsContainer.appendChild(dot);
  });

  const testimonialDots = document.querySelectorAll('.testimonial-dots .dot');

  function goToTestimonial(index) {
    testimonialCards.forEach(card => card.classList.remove('active'));
    testimonialDots.forEach(dot => dot.classList.remove('active'));

    currentTestimonial = (index + testimonialCards.length) % testimonialCards.length;
    testimonialCards[currentTestimonial].classList.add('active');
    testimonialDots[currentTestimonial].classList.add('active');
  }

  function nextTestimonial() {
    goToTestimonial(currentTestimonial + 1);
  }

  function startTestimonialInterval() {
    testimonialInterval = setInterval(nextTestimonial, TESTIMONIAL_DURATION);
  }

  function resetTestimonialInterval() {
    clearInterval(testimonialInterval);
    startTestimonialInterval();
  }

  startTestimonialInterval();

  /* ================================================
     BACK TO TOP BUTTON
  ================================================ */
  const backToTopBtn = document.getElementById('backToTop');

  function toggleBackToTop() {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  }

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ================================================
     FOOTER CURRENT YEAR
  ================================================ */
  document.getElementById('currentYear').textContent = new Date().getFullYear();

  /* ================================================
     BOOKING FORM VALIDATION + EMAILJS INTEGRATION
  ================================================ */

  /* ---------------------------------------------
     >>> ADD YOUR EMAILJS CREDENTIALS HERE <
     1. Sign up at https://www.emailjs.com
     2. Create a Service, Template, and get your Public Key
     3. Replace the three placeholder values below
  --------------------------------------------- */
  const EMAILJS_SERVICE_ID = "service_a3mzsfu";
  const EMAILJS_TEMPLATE_ID = "template_b9psr17";
  const EMAILJS_PUBLIC_KEY = "LYx2n5rRPA_vBzza5";

  // Initialize EmailJS
  if (window.emailjs) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    console.log("GODMADE: EmailJS library loaded and initialized successfully.");
  } else {
    console.warn("GODMADE: EmailJS library was NOT found on this page. Check that the EmailJS <script> tag is in index.html, placed BEFORE script.js, and that you have an internet connection.");
  }

  const bookingForm = document.getElementById('bookingForm');
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const submitSpinner = document.getElementById('submitSpinner');
  const formSuccess = document.getElementById('formSuccess');
  const formError = document.getElementById('formError');

  // Set minimum date for booking to today
  const eventDateInput = document.getElementById('eventDate');
  if (eventDateInput) {
    const today = new Date().toISOString().split('T')[0];
    eventDateInput.setAttribute('min', today);
  }

  function showFieldError(fieldId, message) {
    const errorEl = document.getElementById(`error-${fieldId}`);
    const fieldEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = message;
    if (fieldEl) fieldEl.closest('.form-group').classList.add('error');
  }

  function clearFieldError(fieldId) {
    const errorEl = document.getElementById(`error-${fieldId}`);
    const fieldEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = '';
    if (fieldEl) fieldEl.closest('.form-group').classList.remove('error');
  }

  function clearAllErrors() {
    ['fullName', 'email', 'phone', 'service', 'eventDate', 'message'].forEach(clearFieldError);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    return /^[\d\s\+\-\(\)]{7,20}$/.test(phone);
  }

  function validateForm(data) {
    let isValid = true;
    clearAllErrors();

    if (!data.fullName || data.fullName.trim().length < 2) {
      showFieldError('fullName', 'Please enter your full name.');
      isValid = false;
    }

    if (!data.email || !isValidEmail(data.email)) {
      showFieldError('email', 'Please enter a valid email address.');
      isValid = false;
    }

    if (!data.phone || !isValidPhone(data.phone)) {
      showFieldError('phone', 'Please enter a valid phone number.');
      isValid = false;
    }

    if (!data.service) {
      showFieldError('service', 'Please select a service.');
      isValid = false;
    }

    if (!data.eventDate) {
      showFieldError('eventDate', 'Please select a preferred date.');
      isValid = false;
    }

    if (!data.message || data.message.trim().length < 10) {
      showFieldError('message', 'Please provide at least a few details (10+ characters).');
      isValid = false;
    }

    return isValid;
  }

  function setSubmitLoading(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtnText.classList.add('hidden');
      submitSpinner.classList.remove('hidden');
    } else {
      submitBtn.disabled = false;
      submitBtnText.classList.remove('hidden');
      submitSpinner.classList.add('hidden');
    }
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();

      formSuccess.classList.add('hidden');
      formError.classList.add('hidden');

      const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        service: document.getElementById('service').value,
        eventDate: document.getElementById('eventDate').value,
        budget: document.getElementById('budget').value,
        message: document.getElementById('message').value
      };

      if (!validateForm(formData)) {
        return;
      }

      setSubmitLoading(true);

      // Check EmailJS is loaded and credentials have been set
      const credentialsSet =
        EMAILJS_SERVICE_ID !== "YOUR_SERVICE_ID" &&
        EMAILJS_TEMPLATE_ID !== "YOUR_TEMPLATE_ID" &&
        EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY";

      if (!window.emailjs || !credentialsSet) {
        // Figure out the REAL reason so the on-page message is actually useful
        let reason = "";
        if (!window.emailjs) {
          reason = "The EmailJS library did not load. Check that the EmailJS <script> tag is in index.html, placed BEFORE script.js, and that you have an internet connection.";
        } else {
          reason = "EmailJS credentials are missing in script.js. Replace EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY with your real values.";
        }

        console.warn("GODMADE: " + reason);

        setTimeout(() => {
          setSubmitLoading(false);
          formError.classList.remove('hidden');
          formError.querySelector('i').nextSibling.textContent = " " + reason;
        }, 600);
        return;
      }

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: formData.fullName,
        from_email: formData.email,
        phone: formData.phone,
        service: formData.service,
        event_date: formData.eventDate,
        budget: formData.budget || 'Not specified',
        message: formData.message
      })
        .then(() => {
          setSubmitLoading(false);
          formSuccess.classList.remove('hidden');
          bookingForm.reset();
          clearAllErrors();
          formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch((err) => {
          console.error('EmailJS Error:', err);
          setSubmitLoading(false);
          formError.classList.remove('hidden');
          formError.querySelector('i').nextSibling.textContent =
            " EmailJS failed to send: " + (err && err.text ? err.text : "Please check your Service ID, Template ID, and Public Key are correct, and that the service is connected in your EmailJS dashboard.");
          formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    // Clear individual field errors as user types/selects
    ['fullName', 'email', 'phone', 'service', 'eventDate', 'message'].forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.addEventListener('input', () => clearFieldError(fieldId));
        field.addEventListener('change', () => clearFieldError(fieldId));
      }
    });
  }

});