<script>
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM loaded - initializing script');
        
        // Slider functionality
        let currentSlide = 0;
        let slideCount = document.querySelectorAll(".slide").length;
        let intervalId = null;

        const sliderNav = document.querySelector(".slider-nav");
        const sliderContainer = document.querySelector(".slider-container");
        const prevArrow = document.querySelector(".prev");
        const nextArrow = document.querySelector(".next");

        // Check if slider elements exist
        if (sliderNav && sliderContainer) {
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

            // Event listeners with null checks
            if (sliderContainer) {
                sliderContainer.addEventListener("mouseenter", stopAutoAdvance);
                sliderContainer.addEventListener("mouseleave", startAutoAdvance);
            }
            if (prevArrow) {
                prevArrow.addEventListener("click", () => {
                    stopAutoAdvance();
                    goToSlide(currentSlide - 1);
                    startAutoAdvance();
                });
            }
            if (nextArrow) {
                nextArrow.addEventListener("click", () => {
                    stopAutoAdvance();
                    goToSlide(currentSlide + 1);
                    startAutoAdvance();
                });
            }

            startAutoAdvance();
            console.log('Slider initialized');
        } else {
            console.warn('Slider elements not found');
        }

        // Latest Posts functionality
        let currentPage = 1;
        const postsPerPage = 12;
        const latestContainer = document.getElementById("latest-posts");
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");

        if (latestContainer) {
            async function loadPosts(page) {
                latestContainer.innerHTML = "<p style='text-align:center;'>Loading...</p>";

                let startIndex = (page - 1) * postsPerPage;
                let url = `https://rithickkrish.blogspot.com/feeds/posts/default?alt=json&start-index=${startIndex + 1}&max-results=${postsPerPage}`;
                
                try {
                    let res = await fetch(url);
                    let data = await res.json();

                    if (!data.feed.entry) {
                        latestContainer.innerHTML = "<p style='text-align:center;'>No more posts.</p>";
                        if (nextBtn) nextBtn.disabled = true;
                        return;
                    }

                    latestContainer.innerHTML = "";
                    let posts = data.feed.entry;

                    posts.forEach(post => {
                        let title = post.title.$t;
                        let link = post.link.find(l => l.rel === "alternate").href;
                        let thumb = "https://via.placeholder.com/400x600?text=No+Image";
                        if ("media$thumbnail" in post) {
                            thumb = post.media$thumbnail.url.replace("/s72-c/", "/s600/");
                        }

                        latestContainer.innerHTML += `
                            <div class="episode-card">
                                <a href="${link}" class="episode-link">
                                    <img src="${thumb}" alt="${title}" loading="lazy">
                                    <h3>${title}</h3>
                                </a>
                            </div>
                        `;
                    });

                    if (prevBtn) prevBtn.disabled = page === 1;
                    if (nextBtn) nextBtn.disabled = posts.length < postsPerPage;

                } catch (error) {
                    latestContainer.innerHTML = "<p style='text-align:center;color:red;'>Error loading posts.</p>";
                    console.error('Latest posts error:', error);
                }
            }

            function changePage(direction) {
                currentPage += direction;
                loadPosts(currentPage);
            }

            // Initial load
            loadPosts(currentPage);
            console.log('Latest posts initialized');

            // Button event listeners with null checks
            if (prevBtn) prevBtn.addEventListener('click', () => changePage(-1));
            if (nextBtn) nextBtn.addEventListener('click', () => changePage(1));
        }

        // Popular Posts functionality
        const popularContainer = document.getElementById("popular-posts");
        if (popularContainer) {
            async function loadPopularPosts() {
                popularContainer.innerHTML = "<p style='text-align:center;'>Loading Popular Anime...</p>";

                let allUrl = `https://rithickkrish.blogspot.com/feeds/posts/default?alt=json&max-results=100`;
                
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000);

                    let res = await fetch(allUrl, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (!res.ok) throw new Error(`HTTP ${res.status}`);

                    let data = await res.json();
                    
                    if (!data.feed.entry) {
                        popularContainer.innerHTML = "<p style='text-align:center;color:#aaa;'>No popular posts found.</p>";
                        return;
                    }

                    let allPosts = data.feed.entry;
                    let popularPosts = [];

                    allPosts.forEach(post => {
                        if (post.category && post.category.some(cat => cat.term.toLowerCase() === 'legendary')) {
                            let title = post.title.$t;
                            let link = post.link.find(l => l.rel === "alternate").href;
                            let thumb = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjUiIGhlaWdodD0iOTUiIHZpZXdCb3g9IjAgMCA2NSA5NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY1IiBoZWlnaHQ9Ijk1IiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qb3B1bGFyPC90ZXh0Pgo8L3N2Zz4=";
                            if ("media$thumbnail" in post) {
                                thumb = post.media$thumbnail.url.replace("/s72-c/", "/s400/");
                            }
                            popularPosts.push({ title, link, thumb });
                        }
                    });

                    if (popularPosts.length === 0) {
                        allPosts.slice(0, 8).forEach(post => {
                            let title = post.title.$t;
                            let link = post.link.find(l => l.rel === "alternate").href;
                            let thumb = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjUiIGhlaWdodD0iOTUiIHZpZXdCb3g9IjAgMCA2NSA5NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY1IiBoZWlnaHQ9Ijk1IiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5GZWF0dXJlZDwvdGV4dD4KPC9zdmc+";
                            if ("media$thumbnail" in post) {
                                thumb = post.media$thumbnail.url.replace("/s72-c/", "/s400/");
                            }
                            popularPosts.push({ title, link, thumb });
                        });
                    }

                    popularPosts = popularPosts.slice(0, 8);

                    if (popularPosts.length === 0) {
                        popularContainer.innerHTML = "<p style='text-align:center;color:#aaa;'>No posts available.</p>";
                        return;
                    }

                    popularContainer.innerHTML = "";
                    popularPosts.forEach((post) => {
                        popularContainer.innerHTML += `
                            <a href="${post.link}" class="popular-link">
                                <div class="popular-card">
                                    <img src="${post.thumb}" alt="${post.title}" class="popular-thumb" loading="lazy" 
                                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjUiIGhlaWdodD0iOTUiIHZpZXdCb3g9IjAgMCA2NSA5NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY1IiBoZWlnaHQ9Ijk1IiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FZWF0dXJlZDwvdGV4dD4KPC9zdmc+';">
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

                    console.log('Popular posts loaded:', popularPosts.length);

                } catch (error) {
                    console.error('Popular posts error:', error);
                    popularContainer.innerHTML = `
                        <p style='text-align:center;color:#aaa;padding:20px;'>
                            Failed to load popular posts.<br>
                            <button onclick="loadPopularPosts()" style="background:#E6E6FA;color:#4B0082;border:none;padding:8px 16px;border-radius:20px;margin-top:10px;cursor:pointer;font-weight:bold;">Retry</button>
                        </p>
                    `;
                }
            }

            // Load popular posts
            loadPopularPosts();
            console.log('Popular posts function initialized');
        } else {
            console.warn('Popular posts container not found');
        }

        // Hamburger menu toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });

            document.addEventListener('click', (event) => {
                if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                    navMenu.classList.remove('active');
                }
            });
            console.log('Hamburger menu initialized');
        }

        // Search form script
        const form = document.getElementById('customSearchForm');
        const input = document.getElementById('searchQuery');
        if (form && input) {
            console.log('Search form found');
            form.onsubmit = function(e) {
                e.preventDefault();
                console.log('Search form submitted');
                var query = input.value.trim();
                if (query) {
                    var redirectUrl = 'https://rithickkrish.blogspot.com/p/search.html?q=' + encodeURIComponent(query);
                    window.location.href = redirectUrl;
                }
                return false;
            };
        } else {
            console.error('Search form elements not found');
        }
    });

    console.log('Script loaded successfully');
</script>
