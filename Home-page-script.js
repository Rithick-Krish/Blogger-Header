  <script>
    let currentSlide = 0;
    let slideCount = document.querySelectorAll(".slide").length;
    let intervalId = null;

    const sliderNav = document.querySelector(".slider-nav");
    const dots = [];
    document.querySelectorAll(".slide").forEach((_, index) => {
      const dot = document.createElement("div");
      dot.classList.add("nav-dot");
      if (index === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goToSlide(index));
      sliderNav.appendChild(dot);
      dots.push(dot);
    });

    function updateDots() {
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentSlide);
      });
    }

    function goToSlide(index) {
      currentSlide = (index + slideCount) % slideCount;
      document.querySelector(".slider").style.transform = `translateX(-${currentSlide * 100}%)`;
      resetAnimation(document.querySelectorAll(".slide")[currentSlide]);
      updateDots();
    }

    function resetAnimation(slide) {
      const textContent = slide.querySelector(".text-content");
      const button = slide.querySelector(".slide-button");
      if (textContent) {
        textContent.style.animation = 'none';
        textContent.offsetHeight;
        textContent.style.animation = null;
      }
      if (button) {
        button.style.animation = 'none';
        button.offsetHeight;
        button.style.animation = null;
      }
    }

    function startAutoAdvance() {
      if (!intervalId) {
        intervalId = setInterval(() => goToSlide(currentSlide + 1), 5000);
      }
    }

    function stopAutoAdvance() {
      clearInterval(intervalId);
      intervalId = null;
    }

    document.querySelector(".slider-container").addEventListener("mouseenter", stopAutoAdvance);
    document.querySelector(".slider-container").addEventListener("mouseleave", startAutoAdvance);

    document.querySelector(".prev").addEventListener("click", () => {
      stopAutoAdvance();
      goToSlide(currentSlide - 1);
      startAutoAdvance();
    });

    document.querySelector(".next").addEventListener("click", () => {
      stopAutoAdvance();
      goToSlide(currentSlide + 1);
      startAutoAdvance();
    });

    startAutoAdvance();

    let currentPage = 1;
    const postsPerPage = 12;
    const container = document.getElementById("latest-posts");

    async function loadPosts(page) {
      container.innerHTML = "<p style='text-align:center;'>Loading...</p>";

      let startIndex = (page - 1) * postsPerPage;
      let url = `https://rithickkrish.blogspot.com/feeds/posts/default?alt=json&start-index=${startIndex + 1}&max-results=${postsPerPage}`;
      
      try {
        let res = await fetch(url);
        let data = await res.json();

        if (!data.feed.entry) {
          container.innerHTML = "<p style='text-align:center;'>No more posts.</p>";
          document.getElementById("nextBtn").disabled = true;
          return;
        }

        container.innerHTML = "";
        let posts = data.feed.entry;

        posts.forEach(post => {
          let title = post.title.$t;
          let link = post.link.find(l => l.rel === "alternate").href;
          let thumb = "https://via.placeholder.com/400x600?text=No+Image";
          if ("media$thumbnail" in post) {
            thumb = post.media$thumbnail.url.replace("/s72-c/", "/s600/");
          }

          container.innerHTML += `
            <div class="episode-card">
              <a href="${link}" class="episode-link">
                <img src="${thumb}" alt="${title}">
                <h3>${title}</h3>
              </a>
            </div>
          `;
        });

        document.getElementById("prevBtn").disabled = page === 1;
        document.getElementById("nextBtn").disabled = posts.length < postsPerPage;

      } catch (error) {
        container.innerHTML = "<p style='text-align:center;color:red;'>Error loading posts.</p>";
      }
    }

    function changePage(direction) {
      currentPage += direction;
      loadPosts(currentPage);
    }

    loadPosts(currentPage);

    // UPDATED POPULAR POSTS FUNCTION
    async function loadPopularPosts() {
      const popularContainer = document.getElementById("popular-posts");
      popularContainer.innerHTML = "<p style='text-align:center;'>Loading Popular Anime...</p>";

      // First, get all posts to find Legendary ones
      let allUrl = `https://rithickkrish.blogspot.com/feeds/posts/default?alt=json&max-results=100`;
      
      try {
        let res = await fetch(allUrl);
        let data = await res.json();
        
        if (!data.feed.entry) {
          popularContainer.innerHTML = "<p style='text-align:center;'>No popular posts found.</p>";
          return;
        }

        let allPosts = data.feed.entry;
        let popularPosts = [];

        // Filter posts that have "Legendary" label (but don't show badge)
        allPosts.forEach(post => {
          if (post.category && post.category.some(cat => cat.term.toLowerCase() === 'legendary')) {
            let title = post.title.$t;
            let link = post.link.find(l => l.rel === "alternate").href;
            let thumb = "https://via.placeholder.com/65x95?text=Popular";
            if ("media$thumbnail" in post) {
              thumb = post.media$thumbnail.url.replace("/s72-c/", "/s400/");
            }
            popularPosts.push({
              title: title,
              link: link,
              thumb: thumb
            });
          }
        });

        // If no legendary posts found, show top 8 regular posts as fallback
        if (popularPosts.length === 0) {
          allPosts.slice(0, 8).forEach(post => {
            let title = post.title.$t;
            let link = post.link.find(l => l.rel === "alternate").href;
            let thumb = "https://via.placeholder.com/65x95?text=Featured";
            if ("media$thumbnail" in post) {
              thumb = post.media$thumbnail.url.replace("/s72-c/", "/s400/");
            }
            popularPosts.push({
              title: title,
              link: link,
              thumb: thumb
            });
          });
        }

        // Limit to 8 posts max
        popularPosts = popularPosts.slice(0, 8);

        // Display posts
        if (popularPosts.length === 0) {
          popularContainer.innerHTML = "<p style='text-align:center;'>No posts available.</p>";
          return;
        }

        popularContainer.innerHTML = "";
        popularPosts.forEach((post, index) => {
          popularContainer.innerHTML += `
            <a href="${post.link}" class="popular-link">
              <div class="popular-card">
                <img src="${post.thumb}" alt="${post.title}" class="popular-thumb" loading="lazy">
                <div class="popular-content">
                  <h3>${post.title}</h3>
                  <div class="popular-meta">
                    <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>Popular</span>
                  </div>
                </div>
              </div>
            </a>
          `;
        });

      } catch (error) {
        popularContainer.innerHTML = "<p style='text-align:center;color:red;'>Error loading popular posts.</p>";
        console.error('Error loading popular posts:', error);
      }
    }

    // Load popular posts when page loads
    window.addEventListener('load', function() {
      loadPopularPosts();
    });

    // Hamburger menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
        navMenu.classList.remove('active');
      }
    });

    // Search form script
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM loaded, initializing search form script');
      var form = document.getElementById('customSearchForm');
      var input = document.getElementById('searchQuery');
      if (form && input) {
        console.log('Form and input found');
        form.onsubmit = function(e) {
          e.preventDefault();
          console.log('Form submission intercepted');
          var query = input.value.trim();
          console.log('Query value:', query);
          if (query) {
            var redirectUrl = 'https://rithickkrish.blogspot.com/p/search.html?q=' + encodeURIComponent(query);
            console.log('Redirecting to:', redirectUrl);
            window.location.href = redirectUrl;
          } else {
            console.log('No valid query entered');
          }
          return false;
        };
      } else {
        console.error('Form or input not found in DOM');
      }
    });
  </script>
