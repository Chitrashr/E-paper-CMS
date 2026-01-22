document.addEventListener('DOMContentLoaded', () => {
    // --- Shared Logic: Header/Footer & Inactivity ---
    const header = document.querySelector(".header");
    const footer = document.querySelector(".footer");
    const readerControls = document.querySelector(".reader-controls");
    let inactivityTimer;

    function showUI() {
        if (header) header.style.transform = "translateY(0)";
        if (footer) footer.style.transform = "translateY(0)";
        if (readerControls) readerControls.style.transform = "translateY(0)";
        document.body.classList.remove("ui-hidden");
        resetTimer();
    }

    function hideUI() {
        if (header) header.style.transform = "translateY(-100%)";
        if (footer) footer.style.transform = "translateY(100%)";
        // .reader-controls should NOT disappear. specified requirement: smoothly move upward, occupy space left by header.
        // Default top is 65px (from CSS). To move to top:0, we translate Y by -65px.
        if (readerControls) readerControls.style.transform = "translateY(-65px)";
        document.body.classList.add("ui-hidden");
    }

    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(hideUI, 5000);
    }

    // Initialize UI Inactivity Timer if header/footer exist
    if (header || footer) {
        const events = ["mousemove", "scroll", "click", "touchstart", "keydown"];
        events.forEach(event => {
            document.addEventListener(event, showUI, { passive: true });
        });
        resetTimer();
    }

    // --- Shared Logic: Burger Menu ---
    const burger = document.querySelector('.burger');
    const navList = document.querySelector('.nav-list');

    if (burger && navList) {
        burger.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate closing bubbling
            navList.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (navList.classList.contains('active')) {
                if (!navList.contains(e.target) && !burger.contains(e.target)) {
                    navList.classList.remove('active');
                }
            }
        }, true);
    }

    // --- Shared Logic: Calendar Configuration ---
    // Handles both the main page calendar and the reader page 'archive' calendar
    const calendarInputs = document.querySelectorAll('.date-input');

    if (calendarInputs.length > 0) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const sevenDaysAgoDate = new Date();
        sevenDaysAgoDate.setDate(now.getDate() - 30);
        const sevenDaysAgo = sevenDaysAgoDate.toISOString().split('T')[0];

        calendarInputs.forEach(input => {
            input.setAttribute('max', today);
            input.setAttribute('min', sevenDaysAgo);

            input.addEventListener('change', function () {
                if (this.value) {
                    const dateParts = this.value.split('-');
                    // Format DD-MM-YYYY for the URL parameter
                    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                    window.location.href = `reader.html?date=${formattedDate}`;
                }
            });
        });
    }

    // --- Home Page Logic: Livestream Position ---
    const livestream = document.getElementById('livestream');
    // We target the specific home calendar input for the livestream effect
    // We can identify it by ID or context. The ID 'calendar-trigger' is used in both files, 
    // but livestream only exists on index.html.
    const homeCalendarInput = document.getElementById('calendar-trigger');

    if (livestream && homeCalendarInput) {
        const updatePosition = () => {
            if (window.innerWidth > 768) {
                livestream.style.transform = "translateY(360px)";
            }
        };

        const resetPosition = () => {
            livestream.style.transform = "translateY(0)";
        };

        homeCalendarInput.addEventListener('focus', updatePosition);
        homeCalendarInput.addEventListener('click', updatePosition);
        homeCalendarInput.addEventListener('blur', resetPosition);
        // 'change' is also a trigger to reset, as selection is done
        homeCalendarInput.addEventListener('change', resetPosition);
    }

    // --- Reader Page Logic ---
    const mainViewer = document.getElementById('main-viewer');
    if (mainViewer) {
        const urlParams = new URLSearchParams(window.location.search);
        const dateParam = urlParams.get('date') || '20-01-2026'; // Default logic
        let totalPages = 8;
        let currentPage = 1;

        // Elements
        const thumpContainer = document.getElementById('thumbnail-container');
        const controlPagination = document.getElementById('control-pagination');
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const leftArrow = document.getElementById('left-arrow');
        const rightArrow = document.getElementById('right-arrow');
        const pdfBtn = document.querySelector('.btn-pdf');
        const archiveBtn = document.querySelector('.btn-archive');

        const getPDFPath = (page) => `assets/pdfs/${dateParam}.pdf#page=${page}&toolbar=0&navpanes=0&view=FitH`;
        const getSafeImagePath = (page) => `assets/previews/${dateParam}-1.png`;

        async function loadConfig() {
            try {
                const response = await fetch('newspaper-config.json');
                const config = await response.json();
                const paperData = config[dateParam];

                if (paperData) {
                    totalPages = paperData.pageCount;
                    document.title = `E-Paper – ${paperData.title}`;
                } else {
                    document.title = `E-Paper – ${dateParam.replace(/-/g, ' ')}`;
                }
                initReader();
            } catch (error) {
                console.error('Failed to load config:', error);
                document.title = `E-Paper – ${dateParam.replace(/-/g, ' ')}`;
                initReader();
            }
        }

        function initReader() {
            // Thumbnails
            if (thumpContainer) {
                thumpContainer.innerHTML = '';
                for (let i = 1; i <= totalPages; i++) {
                    const thumb = document.createElement('div');
                    thumb.className = `thumb-item ${i === 1 ? 'active' : ''}`;
                    thumb.innerHTML = `
                        <img src="${getSafeImagePath(i)}" alt="Page ${i}">
                        <span>Page ${i}</span>
                    `;
                    thumb.onclick = () => switchPage(i);
                    thumpContainer.appendChild(thumb);
                }
            }

            // Pagination Buttons
            if (controlPagination) {
                // Clear any auto-generated numbered buttons (keeping PREV/NEXT which are usually hardcoded or ensuring we only insert)
                // The structure is PREV [1][2]... NEXT. 
                // We'll remove existing .page-btn that are NOT #prev-btn or #next-btn
                const existingNumberBtns = controlPagination.querySelectorAll('.page-btn:not(#prev-btn):not(#next-btn)');
                existingNumberBtns.forEach(b => b.remove());

                for (let i = 1; i <= totalPages; i++) {
                    const btn = document.createElement('div');
                    btn.className = `page-btn ${i === 1 ? 'active' : ''}`;
                    btn.innerText = i;
                    btn.onclick = () => switchPage(i);
                    if (nextBtn) {
                        controlPagination.insertBefore(btn, nextBtn);
                    } else {
                        controlPagination.appendChild(btn);
                    }
                }
            }
            switchPage(1);
        }

        function switchPage(pageNumber) {
            currentPage = pageNumber;

            // Update Thumbnails Active State
            const thumbs = document.querySelectorAll('.thumb-item');
            thumbs.forEach((t, idx) => {
                t.classList.toggle('active', idx === pageNumber - 1);
            });

            // Update Pagination Buttons Active State
            const numBtns = document.querySelectorAll('.reader-pagination .page-btn:not(.nav-btn)');
            numBtns.forEach(btn => {
                const btnVal = parseInt(btn.innerText);
                btn.classList.toggle('active', btnVal === pageNumber);
            });

            // Iframe Update
            // console.log(`Switching to page: ${pageNumber}`);
            mainViewer.src = 'about:blank';
            setTimeout(() => {
                mainViewer.src = getPDFPath(pageNumber);
            }, 50);

            // Scroll active thumbnail into view
            if (thumbs[pageNumber - 1]) {
                thumbs[pageNumber - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        // Navigation Handlers
        if (prevBtn) prevBtn.onclick = () => { if (currentPage > 1) switchPage(currentPage - 1); };
        if (nextBtn) nextBtn.onclick = () => { if (currentPage < totalPages) switchPage(currentPage + 1); };
        if (leftArrow) leftArrow.onclick = () => { if (currentPage > 1) switchPage(currentPage - 1); };
        if (rightArrow) rightArrow.onclick = () => { if (currentPage < totalPages) switchPage(currentPage + 1); };

        if (pdfBtn) {
            pdfBtn.onclick = () => {
                window.open(`assets/pdfs/${dateParam}.pdf`, '_blank');
            };
        }

        if (archiveBtn) {
            // We expect a hidden input inside
            const dateInput = archiveBtn.querySelector('.date-input');
            if (dateInput) {
                // Ensure clicking the button/icon triggers the picker
                archiveBtn.addEventListener('click', (e) => {
                    // If the user clicked the input itself (which covers the button due to CSS),
                    // we don't need to do anything as it opens native picker.
                    // But if they somehow clicked the icon (z-index might vary), force it.
                    // Our CSS puts input at z-index 10 covering the button, so usually simple click works.
                    // However, for robustness:
                    try {
                        dateInput.showPicker();
                    } catch (err) {
                        // Fallback or ignore if not supported/already open
                    }
                });
            }
        }

        loadConfig();
    }
});
