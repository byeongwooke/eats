import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================================================
     1. Sticky Header & Shrink Scroll Effect
     ========================================================================== */
  const header = document.getElementById('main-header');
  
  const handleHeaderScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  // Call once immediately in case the page loaded mid-scroll
  handleHeaderScroll();

  /* ==========================================================================
     2. Mobile Drawer Navigation Slide-In
     ========================================================================== */
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navList = document.getElementById('nav-items-container');
  const navLinks = document.querySelectorAll('.nav-link, .nav-cta');
  
  const toggleMobileMenu = () => {
    const isActive = mobileMenuToggle.classList.toggle('active');
    navList.classList.toggle('active');
    
    // Prevent background scrolling when mobile menu is active
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  
  // Close menu when clicking any link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuToggle.classList.remove('active');
      navList.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  /* ==========================================================================
     3. Intersection Observer for Elegant Scroll Reveals (Kakao Mobility Style)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right');
  
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Unobserve to keep performance fast and prevent repeats once displayed
        observer.unobserve(entry.target);
      }
    });
  };
  
  const revealObserver = new IntersectionObserver(revealCallback, {
    root: null, // viewport
    threshold: 0.1, // trigger early when 10% is visible
    rootMargin: '0px 0px -40px 0px' // offset bottom slightly for anticipation
  });
  
  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  /* ==========================================================================
     4. Responsive Signature Menu Carousel/Slider (Pixel-Perfect calculations)
     ========================================================================== */
  const track = document.getElementById('menu-slider-track');
  const prevBtn = document.getElementById('menu-prev-btn');
  const nextBtn = document.getElementById('menu-next-btn');
  const slides = Array.from(document.querySelectorAll('.menu-slide'));
  
  if (track && prevBtn && nextBtn && slides.length > 0) {
    let currentIndex = 0;
    
    const getVisibleSlidesCount = () => {
      const width = window.innerWidth;
      if (width > 1100) return 3; // Desktop
      if (width > 768) return 2;  // Tablet
      return 1;                   // Mobile
    };
    
    const updateCarousel = () => {
      const visibleCount = getVisibleSlidesCount();
      const maxIndex = Math.max(0, slides.length - visibleCount);
      
      // Keep index within boundaries
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
      
      // Calculate translate percentage or pixels
      const slideStyle = window.getComputedStyle(slides[0]);
      const slideWidth = slides[0].getBoundingClientRect().width;
      const gap = parseFloat(window.getComputedStyle(track).gap) || 32; // Default gap is 2rem (32px)
      
      const amountToMove = currentIndex * (slideWidth + gap);
      track.style.transform = `translateX(-${amountToMove}px)`;
      
      // Update button visual states
      if (currentIndex === 0) {
        prevBtn.classList.add('disabled');
      } else {
        prevBtn.classList.remove('disabled');
      }
      
      if (currentIndex >= maxIndex) {
        nextBtn.classList.add('disabled');
      } else {
        nextBtn.classList.remove('disabled');
      }
    };
    
    nextBtn.addEventListener('click', () => {
      const visibleCount = getVisibleSlidesCount();
      const maxIndex = slides.length - visibleCount;
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
      }
    });
    
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });
    
    // Listen to resize and recalculate layout
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateCarousel();
      }, 100);
    });
    
    // Initial run
    updateCarousel();
  }

  /* ==========================================================================
     5. Franchise Inquiry Form Validation & Success Modal Popup
     ========================================================================== */
  const form = document.getElementById('franchise-application-form');
  const successModal = document.getElementById('inquiry-success-modal');
  const modalCloseBtn = document.getElementById('modal-close-button');
  
  if (form && successModal && modalCloseBtn) {
    
    const handleFormSubmit = (e) => {
      e.preventDefault();
      
      // Perform final fields verification
      const name = document.getElementById('input-name').value.trim();
      const contact = document.getElementById('input-contact').value.trim();
      const region = document.getElementById('input-region').value.trim();
      const cost = document.getElementById('input-cost').value;
      const content = document.getElementById('input-content').value.trim();
      const agreement = document.getElementById('input-agreement').checked;
      
      if (!name || !contact || !region || !cost || !content || !agreement) {
        alert('모든 필수 항목을 기입해 주시고 개인정보 제공에 동의해 주세요.');
        return;
      }
      
      // Greet submission (Simulate backend sending)
      console.log('Sending Inquiry:', { name, contact, region, cost, content });
      
      // Show success modal popup
      successModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock background scroll
      
      // Reset form fields
      form.reset();
    };
    
    const closeSuccessModal = () => {
      successModal.classList.remove('active');
      document.body.style.overflow = ''; // Unlock background scroll
    };
    
    form.addEventListener('submit', handleFormSubmit);
    modalCloseBtn.addEventListener('click', closeSuccessModal);
    
    // Close modal when clicking outside content (overlay)
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        closeSuccessModal();
      }
    });
  }

  /* ==========================================================================
     6. Smooth Scroll Navigation Spy (Highlight active nav link)
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  
  const handleScrollSpy = () => {
    const scrollY = window.scrollY;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120; // Offset for sticky header
      const sectionId = current.getAttribute('id');
      
      const navItem = document.querySelector(`.nav-link[href*="${sectionId}"]`);
      if (navItem) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navItem.style.color = 'var(--clr-primary)';
        } else {
          navItem.style.color = '';
        }
      }
    });
  };
  
  window.addEventListener('scroll', handleScrollSpy, { passive: true });
  handleScrollSpy();
  
  /* ==========================================================================
     7. Infographic Roadmap Stepper Animation (Hover effects and progressive scroll)
     ========================================================================== */
  const roadmapSteps = document.querySelectorAll('.roadmap-step');
  
  roadmapSteps.forEach((step, index) => {
    step.addEventListener('mouseenter', () => {
      // Deactivate all steps
      roadmapSteps.forEach(s => s.classList.remove('active'));
      // Activate hovered step
      step.classList.add('active');
    });
  });
});
