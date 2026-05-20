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
  function initMenuCarousel(outerId, trackId, prevBtnId, nextBtnId, slideClass, isMobile) {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    const originalSlides = Array.from(document.querySelectorAll(slideClass));
    
    if (track && prevBtn && nextBtn && originalSlides.length > 0) {
      // Dynamic cloning: Clone the first 3 slides (or 1 on mobile) and append to the end for seamless infinite scrolling
      const visibleCount = isMobile ? 1 : 3;
      for (let i = 0; i < visibleCount; i++) {
        const clone = originalSlides[i].cloneNode(true);
        clone.classList.add('menu-slide-clone');
        clone.id = `${trackId}-clone-${i + 1}`;
        track.appendChild(clone);
      }
      
      let currentIndex = 0;
      let autoPlayInterval = null;
      let isTransitioning = false;
      
      const getSlideWidthAndGap = () => {
        const slideWidth = originalSlides[0].getBoundingClientRect().width;
        const gap = parseFloat(window.getComputedStyle(track).gap) || (isMobile ? 0 : 32);
        return { slideWidth, gap };
      };
      
      const updateCarousel = (animate = true) => {
        const { slideWidth, gap } = getSlideWidthAndGap();
        const amountToMove = currentIndex * (slideWidth + gap);
        
        if (animate) {
          track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        } else {
          track.style.transition = 'none';
        }
        
        track.style.transform = `translateX(-${amountToMove}px)`;
        
        // Infinite carousel always allows navigation, keep controls enabled
        prevBtn.classList.remove('disabled');
        nextBtn.classList.remove('disabled');
      };
      
      const nextSlide = () => {
        if (isTransitioning) return;
        isTransitioning = true;
        
        currentIndex++;
        updateCarousel(true);
        
        // When reaching the cloned slide (index equals original size)
        if (currentIndex === originalSlides.length) {
          setTimeout(() => {
            track.style.transition = 'none';
            currentIndex = 0;
            updateCarousel(false);
            // Trigger reflow to apply jump immediately
            track.offsetHeight;
            isTransitioning = false;
          }, 600); // Match CSS transition time
        } else {
          setTimeout(() => {
            isTransitioning = false;
          }, 600);
        }
      };
      
      const prevSlide = () => {
        if (isTransitioning) return;
        isTransitioning = true;
        
        if (currentIndex === 0) {
          // Instant transitionless jump to the end clone
          track.style.transition = 'none';
          currentIndex = originalSlides.length;
          updateCarousel(false);
          // Force reflow
          track.offsetHeight;
          
          // Slide smoothly to the last original slide
          setTimeout(() => {
            currentIndex--;
            updateCarousel(true);
            setTimeout(() => {
              isTransitioning = false;
            }, 600);
          }, 20);
        } else {
          currentIndex--;
          updateCarousel(true);
          setTimeout(() => {
            isTransitioning = false;
          }, 600);
        }
      };
      
      // Auto Play Controls (3000ms loop interval)
      const startAutoPlay = () => {
        stopAutoPlay();
        autoPlayInterval = setInterval(nextSlide, 3000);
      };
      
      const stopAutoPlay = () => {
        if (autoPlayInterval) {
          clearInterval(autoPlayInterval);
          autoPlayInterval = null;
        }
      };
      
      // Navigation Events
      nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoPlay(); // Reset timer
      });
      
      prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoPlay(); // Reset timer
      });
      
      // Pause auto play on hover to let the user inspect details
      const outerWrap = document.getElementById(outerId);
      if (outerWrap) {
        outerWrap.addEventListener('mouseenter', stopAutoPlay);
        outerWrap.addEventListener('mouseleave', startAutoPlay);
      }
      
      // Mobile Touch Swipes
      let startX = 0;
      let endX = 0;
      
      track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        stopAutoPlay();
      }, { passive: true });
      
      track.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;
        if (Math.abs(diffX) > 50) {
          if (diffX > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }
        startAutoPlay();
      }, { passive: true });
      
      // Recalculate on screen resize
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          updateCarousel(false);
        }, 100);
      });
      
      // Initial run
      startAutoPlay();
      updateCarousel(false);
    }
  }

  // Initialize both carousel tracks independently
  initMenuCarousel('menu-slider-outer-pc', 'menu-slider-track-pc', 'menu-prev-btn-pc', 'menu-next-btn-pc', '.menu-slide-pc', false);
  initMenuCarousel('menu-slider-outer-mobile', 'menu-slider-track-mobile', 'menu-prev-btn-mobile', 'menu-next-btn-mobile', '.menu-slide-mobile', true);

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
     5.5 Premium Brand Detail Modal & Tab Switching & Store Search Binding
     ========================================================================== */
  const BRAND_DATA = {
    pasta: {
      title: "PASTA<span>HERE</span>",
      badge: "FLAGSHIP",
      intro: [
        {
          title: "배달에 최적화된 파스타 레시피 개발",
          desc: "파스타 전문 브랜드로서 배달 과정에서 면의 식감과 소스의 풍미를 유지할 수 있는 레시피를 개발했습니다."
        },
        {
          title: "합리적인 가격과 대중적인 메뉴 구성",
          desc: "합리적인 가격대로 누구나 부담 없이 즐길 수 있으며, 한국인이 선호하는 대중적인 파스타 메뉴로 구성되어 있습니다."
        }
      ],
      branches: [
        { name: "파스타히어 별내 직영점", address: "경기도 남양주시 별내5로5번길 47" },
        { name: "파스타히어 강북본점", address: "서울특별시 강북구 도봉로76길 65" },
        { name: "파스타히어 노원본점", address: "서울특별시 노원구 한글비석로24나길 12" },
        { name: "파스타히어 구리다산점", address: "경기도 남양주시 미금로56번길 30" },
        { name: "파스타히어 목천점", address: "충청남도 천안시 동남구 목천읍 충절로 874 천안목천 협성엠파이어 아파트" },
        { name: "파스타히어 풍세점", address: "충청남도 천안시 동남구 풍세면 풍세산단로 18-9" },
        { name: "파스타히어 의정부점", address: "경기도 의정부시 시민로53번길 11 승원하이츠빌라" },
        { name: "파스타히어 진접오남점", address: "경기도 남양주시 오남읍 양지로290번길 33" },
        { name: "파스타히어 인천주안점", address: "인천광역시 미추홀구 석바위로 135" },
        { name: "파스타히어 양주점", address: "경기도 양주시 옥정동로5다길 12" },
        { name: "파스타히어 일산장항점", address: "경기도 고양시 일산동구 백마로 195 엠시티타워&엠시티오피스텔" },
        { name: "파스타히어 평내호평점", address: "경기도 남양주시 경춘로1283번길 10-1" },
        { name: "파스타히어 포천본점", address: "경기도 포천시 정자동1길 79-16" },
        { name: "파스타히어 청라연희점", address: "인천광역시 서구 승학로 299" },
        { name: "파스타히어 월계공릉점", address: "서울특별시 노원구 월계로 370 희성프라자 2층" },
        { name: "파스타히어 장안점", address: "서울특별시 동대문구 한천로18길 9" },
        { name: "파스타히어 상봉점", address: "서울특별시 중랑구 봉우재로49길 9 솔렌시아3" },
        { name: "파스타히어 화도마석점", address: "경기도 남양주시 화도읍 마석중앙로 93" }
      ]
    },
    deopbap: {
      title: "JEONGDAM<span>DEOPBAP</span>",
      badge: "PREMIUM RICE",
      intro: [
        {
          title: "정담덮밥의 핵심 콘셉트와 브랜드 소개",
          desc: "배달 및 오프라인 매장 운영의 차별화된 장점을 기술합니다. 신선한 햅쌀 위에 정성을 다해 고기를 올리는 시그니처 덮밥 브랜드입니다."
        }
      ],
      branches: [
        { name: "정담덮밥 강남점", address: "서울특별시 강남구 역삼로 123" },
        { name: "정담덮밥 홍대점", address: "서울특별시 마포구 와우산로 456" }
      ]
    },
    omuzip: {
      title: "OMU<span>ZIP</span>",
      badge: "DRESS OMELET",
      intro: [
        {
          title: "오므집의 핵심 콘셉트와 브랜드 소개",
          desc: "배달 및 오프라인 매장 운영의 차별화된 장점을 기술합니다. 예술적인 회오리 물결 달걀 지단과 수제 데미글라스 소스가 결합된 브랜드입니다."
        }
      ],
      branches: [
        { name: "오므집 강남점", address: "서울특별시 강남구 역삼로 123" },
        { name: "오므집 홍대점", address: "서울특별시 마포구 와우산로 456" }
      ]
    },
    kimchi: {
      title: "BUYEO<span>KIMCHI</span>",
      badge: "KOREAN STEW",
      intro: [
        {
          title: "부여김치찜의 핵심 콘셉트와 브랜드 소개",
          desc: "배달 및 오프라인 매장 운영의 차별화된 장점을 기술합니다. 국산 묵은지와 돼지고기를 가마솥 기법으로 깊고 부드럽게 끓여낸 한식 전문 브랜드입니다."
        }
      ],
      branches: [
        { name: "부여김치찜 강남점", address: "서울특별시 강남구 역삼로 123" },
        { name: "부여김치찜 홍대점", address: "서울특별시 마포구 와우산로 456" }
      ]
    }
  };

  const brandModal = document.getElementById('brand-detail-modal');
  const brandModalClose = document.getElementById('brand-modal-close');
  const brandIntroBtns = document.querySelectorAll('.brand-btn-intro');
  const brandTabBtns = document.querySelectorAll('.brand-tab-btn');
  const brandTabPanels = document.querySelectorAll('.brand-tab-panel');

  if (brandModal && brandModalClose && brandIntroBtns.length > 0) {
    
    // Open Modal and populate data
    brandIntroBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const brandKey = btn.getAttribute('data-brand');
        const data = BRAND_DATA[brandKey];
        if (!data) return;

        // Inject headers
        document.getElementById('modal-brand-badge').textContent = data.badge;
        document.getElementById('modal-brand-title').innerHTML = data.title;

        // Render brand introduction content
        const introPanel = document.getElementById('panel-intro');
        let introHtml = '<div class="brand-intro-list">';
        data.intro.forEach(item => {
          introHtml += `
            <div class="brand-intro-item">
              <h4 class="brand-intro-item-title">${item.title}</h4>
              <p class="brand-intro-item-desc">${item.desc}</p>
            </div>
          `;
        });
        introHtml += '</div>';
        introPanel.innerHTML = introHtml;

        // Render branches list
        const branchesListWrap = document.getElementById('branches-list-wrap');
        let branchesHtml = '<div class="branches-list">';
        data.branches.forEach(branch => {
          // Extract clean road address, filtering out any accidental brand prefixes or delimiters for Naver Map compatibility
          let pureAddress = branch.address;
          if (pureAddress.includes('|')) {
            pureAddress = pureAddress.split('|')[1].trim();
          } else if (pureAddress.includes('점')) {
            pureAddress = pureAddress.split('점')[1].trim();
          } else {
            pureAddress = pureAddress.trim();
          }
          
          const searchUrl = `https://map.naver.com/v5/search/${encodeURIComponent(pureAddress)}`;
          branchesHtml += `
            <a href="${searchUrl}" target="_blank" class="branch-item-link">
              <div class="branch-item-info">
                <span class="branch-item-name">${branch.name}</span>
                <span class="branch-item-address">${branch.address}</span>
              </div>
              <div class="branch-item-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            </a>
          `;
        });
        branchesHtml += '</div>';
        branchesListWrap.innerHTML = branchesHtml;

        // Reset default active tab (Always 'intro' first)
        brandTabBtns.forEach(tBtn => {
          if (tBtn.getAttribute('data-tab') === 'intro') {
            tBtn.classList.add('active');
          } else {
            tBtn.classList.remove('active');
          }
        });

        brandTabPanels.forEach(panel => {
          if (panel.getAttribute('id') === 'panel-intro') {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });

        // Show Modal
        brandModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Scroll lock
      });
    });

    // Close Modal helper
    const closeBrandModal = () => {
      brandModal.classList.remove('active');
      document.body.style.overflow = ''; // Scroll unlock
    };

    brandModalClose.addEventListener('click', closeBrandModal);
    
    // Close on click outside (overlay)
    brandModal.addEventListener('click', (e) => {
      if (e.target === brandModal) {
        closeBrandModal();
      }
    });

    // Close on ESC keypress
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && brandModal.classList.contains('active')) {
        closeBrandModal();
      }
    });

    // Tab Switching interaction
    brandTabBtns.forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        const tabTarget = tabBtn.getAttribute('data-tab');

        // Toggle active tab buttons
        brandTabBtns.forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');

        // Toggle active panels
        brandTabPanels.forEach(panel => {
          const panelId = panel.getAttribute('id');
          if (panelId === `panel-${tabTarget}`) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });
      });
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
