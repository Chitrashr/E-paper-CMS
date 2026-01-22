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
        if (readerControls) readerControls.style.transform = "translateY(-65px)";
        document.body.classList.add("ui-hidden");
    }

    function resetTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(hideUI, 5000);
    }

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
            e.stopPropagation();
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
                    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                    window.location.href = `reader.html?date=${formattedDate}`;
                }
            });
        });
    }

    // --- Home Page Logic: Live Date & Init Pagination ---
    const liveDateEl = document.getElementById('live-date');
    if (liveDateEl) {
        const now = new Date();
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        liveDateEl.innerText = now.toLocaleDateString('en-GB', options);
    }

    // Reusable Calendar Logic
    function initCalendar(container) {
        if (!container) return;

        const today = new Date();
        const minActiveDate = new Date(today);
        minActiveDate.setDate(today.getDate() - 29);
        minActiveDate.setHours(0, 0, 0, 0);

        const maxActiveDate = new Date(today);
        maxActiveDate.setHours(23, 59, 59, 999);

        let currentViewDate = new Date(today);

        function render(date) {
            container.innerHTML = '';

            const year = date.getFullYear();
            const month = date.getMonth();

            // Header
            const header = document.createElement('div');
            header.className = 'cal-header';

            const prevBtn = document.createElement('button');
            prevBtn.className = 'cal-nav-btn';
            prevBtn.innerText = '<';
            prevBtn.onclick = (e) => {
                e.stopPropagation(); // prevent card click
                date.setMonth(date.getMonth() - 1);
                render(date);
            };

            const selectsDiv = document.createElement('div');
            selectsDiv.className = 'cal-selects';

            const monthSelect = document.createElement('select');
            monthSelect.className = 'cal-dropdown';
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            monthNames.forEach((m, i) => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.innerText = m;
                if (i === month) opt.selected = true;
                monthSelect.appendChild(opt);
            });
            monthSelect.onchange = (e) => {
                date.setMonth(parseInt(e.target.value));
                render(date);
            };
            monthSelect.onclick = (e) => e.stopPropagation();

            const yearSelect = document.createElement('select');
            yearSelect.className = 'cal-dropdown';
            for (let y = 2024; y <= 2027; y++) {
                const opt = document.createElement('option');
                opt.value = y;
                opt.innerText = y;
                if (y === year) opt.selected = true;
                yearSelect.appendChild(opt);
            }
            yearSelect.onchange = (e) => {
                date.setFullYear(parseInt(e.target.value));
                render(date);
            };
            yearSelect.onclick = (e) => e.stopPropagation();

            selectsDiv.appendChild(monthSelect);
            selectsDiv.appendChild(yearSelect);

            const nextBtn = document.createElement('button');
            nextBtn.className = 'cal-nav-btn';
            nextBtn.innerText = '>';
            nextBtn.onclick = (e) => {
                e.stopPropagation();
                date.setMonth(date.getMonth() + 1);
                render(date);
            };

            header.appendChild(prevBtn);
            header.appendChild(selectsDiv);
            header.appendChild(nextBtn);
            container.appendChild(header);

            // Grid
            const grid = document.createElement('div');
            grid.className = 'cal-grid';

            const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
            days.forEach(d => {
                const el = document.createElement('div');
                el.className = 'cal-day-name';
                el.innerText = d;
                grid.appendChild(el);
            });

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let i = 0; i < firstDay; i++) {
                const el = document.createElement('div');
                el.className = 'cal-date empty';
                grid.appendChild(el);
            }

            for (let i = 1; i <= daysInMonth; i++) {
                const el = document.createElement('div');
                const cellDate = new Date(year, month, i);
                cellDate.setHours(12, 0, 0, 0);

                el.className = 'cal-date';
                el.innerText = i;

                const isActive = cellDate >= minActiveDate && cellDate <= maxActiveDate;
                const isToday = cellDate.getDate() === today.getDate() &&
                    cellDate.getMonth() === today.getMonth() &&
                    cellDate.getFullYear() === today.getFullYear();

                if (isActive) {
                    el.classList.add('active');
                    if (isToday) el.classList.add('today');

                    el.onclick = (e) => {
                        e.stopPropagation();
                        const dStr = String(i).padStart(2, '0');
                        const mStr = String(month + 1).padStart(2, '0');
                        const yStr = year;
                        window.location.href = `reader.html?date=${dStr}-${mStr}-${yStr}`;
                    };
                } else {
                    el.classList.add('disabled');
                }

                grid.appendChild(el);
            }
            container.appendChild(grid);
        }
        render(currentViewDate);
    }

    // Init Homepage Calendar (Page 1)
    const homepageCalendar = document.getElementById('homepage-calendar');
    if (homepageCalendar) {
        initCalendar(homepageCalendar);
        initPagination();
    }

    function initPagination() {
        const epaperSection = document.querySelector('.epaper-section');
        const originalTopRow = document.querySelector('.top-row'); // Part of Page 1
        // Original grid contains Page 1 cards
        const originalGrid = document.querySelector('.epaper-grid');

        if (!epaperSection || !originalTopRow || !originalGrid) return;

        // 1. Gather existing dates to continue sequence
        // We find dates from links like reader.html?date=DD-MM-YYYY
        // Page 1 cards:
        const existingCards = document.querySelectorAll('.paper-link');
        let lastDateString = "";

        // Find the oldest date on Page 1 to start decrementing from
        existingCards.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes('date=')) {
                const d = href.split('date=')[1];
                lastDateString = d;
                // We assume they are ordered descending, so the last one in DOM involves the oldest date
            }
        });

        // Parse last date (DD-MM-YYYY)
        let parts = lastDateString.split('-'); // [DD, MM, YYYY]
        let currentDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // YYYY-MM-DD

        // 2. Calculate needed cards
        // User wants Total 30 cards. 
        // Page 1 has: 1 (top) + 7 (grid) = 8 cards (based on file read). 
        // Note: User prompt said 9 cards on Page 1. Let's trust DOM check:
        // Top row has 1 card. Grid has 7 cards. Total 8.
        // If user insists on 9, maybe I missed one? 
        // Let's count properly:
        // .top-card-wrapper .paper-link -> 1
        // .epaper-grid .paper-link -> 7
        // Total = 8. 
        // If requirements say "Page 1 -> 9 paper cards (already present)", and I only see 8, 
        // I will assume the requirement implies the layout allows for 9 or I should treat the existing set as "Page 1 set".
        // However, strict rule: "DO NOT change the FIRST landing page layout at all."
        // So I cannot add a card to Page 1 to make it 9. I must respect the existing DOM.
        // So I will start generating for Page 2.

        // Total needed: 30.
        // Existing: 8.
        // To generate: 22.

        const totalCardsWanted = 30;
        const existingCount = existingCards.length; // 8
        const needed = totalCardsWanted - existingCount; // 22

        const generatedCards = [];

        for (let i = 0; i < needed; i++) {
            currentDate.setDate(currentDate.getDate() - 1);

            // Format back to DD-MM-YYYY
            const d = String(currentDate.getDate()).padStart(2, '0');
            const m = String(currentDate.getMonth() + 1).padStart(2, '0');
            const y = currentDate.getFullYear();
            const dateStr = `${d}-${m}-${y}`;
            const displayDate = `${d} ${currentDate.toLocaleString('default', { month: 'short' })} ${y}`; // e.g. 09 Jan 2026

            // Generate Card HTML
            // Note: Using a placeholder image or cycling existing ones would be safer than missing assets.
            // I'll cycle 10-01-2026-1.png or similar if assets don't exist, but prompt implies functional logic.
            // I will construct the path dynamically like others: assets/previews/${dateStr}-1.png

            // Generate Card HTML
            // Note: Added this.onerror=null to prevent infinite loop if fallback fails
            const cardHtml = `
                <a href="reader.html?date=${dateStr}" class="paper-link">
                    <div class="paper-card">
                        <img src="assets/previews/${dateStr}-1.png" alt="${d} ${m} ${y} Newspaper" onerror="this.onerror=null;this.src='assets/previews/10-01-2026-1.png'">
                        <div class="paper-info">
                            <h4>Eeloka</h4>
                            <p>${displayDate}</p>
                            <span>Daily Edition</span>
                        </div>
                    </div>
                </a>
            `;
            generatedCards.push(cardHtml);
        }

        // 3. Create Page Containers
        // Page 2: cards 9 to ? (Logic: fit cards naturally)
        // Page 3: remaining
        // Requirement: "Cards must appear in rows of 4"
        // Requirement: "The first row must contain the calendar at the end" (for Page 2 and 3)
        // So for Page 2:
        // Row 1: Card, Card, Card, Calendar
        // Row 2+: Cards...

        // Let's distribute generated cards.
        // Page 1 is done.

        // Paging Logic: 
        // We have `needed` (22) cards to distribute.
        // Let's split them roughly equally or fill Page 2 full then Page 3?
        // "Page 2 → remaining papers (fit cards naturally)"
        // "Page 3 → remaining papers"
        // Let's put 11 on Page 2 and 11 on Page 3? 
        // Page 2 Layout:
        // Row 1: 3 cards + Calendar
        // Row 2: 4 cards
        // Row 3: 4 cards
        // Total capacity for 3 rows = 11 cards. Perfect.

        // Page 3 Layout:
        // Row 1: 3 cards + Calendar
        // Row 2: 4 cards
        // Row 3: 4 cards
        // Total capacity = 11 cards. Perfect.
        // Total 22 generated cards fit exactly into 2 pages of 11 cards each with the calendar layout.

        const createPage = (pageId, cards) => {
            const pageDiv = document.createElement('div');
            pageDiv.id = pageId;
            pageDiv.className = 'epaper-grid generated-page';
            pageDiv.style.display = 'none'; // hidden by default

            // Insert content
            // Row 1 logic: 3 cards, then Calendar wrapper
            // Then remaining cards.

            // First 3 cards
            cards.slice(0, 3).forEach(html => {
                const temp = document.createElement('div');
                temp.innerHTML = html.trim();
                pageDiv.appendChild(temp.firstChild);
            });

            // Calendar Wrapper (Clone structure)
            const calWrapper = document.createElement('div');
            // We reuse .top-card-wrapper style for consistency or .paper-card style?
            // Page 1 calendar is inside .top-card-wrapper.
            // Requirement: "matches reference image", "Layout must match the reference image", "Cards must appear in rows of 4"
            // If I look at Page 1, the calendar is in .top-row (which is flex/grid).
            // Here we are inside .epaper-grid (grid 4 cols).
            // So we can just make a div that spans 1 cell.
            // Styles:
            // .top-card-wrapper has background white, shadow, radius.
            // .calendar-wrapper has padding 15px.
            calWrapper.className = 'top-card-wrapper calendar-wrapper';
            // We need to initialize calendar in it.
            initCalendar(calWrapper);
            pageDiv.appendChild(calWrapper);

            // Remaining cards
            cards.slice(3).forEach(html => {
                const temp = document.createElement('div');
                temp.innerHTML = html.trim();
                pageDiv.appendChild(temp.firstChild);
            });

            return pageDiv;
        };

        const cardsForPage2 = generatedCards.slice(0, 11);
        const cardsForPage3 = generatedCards.slice(11); // remaining

        const page2 = createPage('page-2', cardsForPage2);
        const page3 = createPage('page-3', cardsForPage3);

        epaperSection.appendChild(page2);
        epaperSection.appendChild(page3);

        // 4. Wiring Navigation
        const pagesContainer = document.querySelector('.pages');
        if (!pagesContainer) return;

        const btnFirst = pagesContainer.querySelector('.first');
        const btnLast = pagesContainer.querySelector('.last');
        const btn1 = pagesContainer.querySelector('.page:nth-child(2)'); // "1"
        const btn2 = pagesContainer.querySelector('.page:nth-child(3)'); // "2"
        const btn3 = pagesContainer.querySelector('.page:nth-child(4)'); // "3"
        // Note: HTML has <div class="page">4</div> as well. 
        // Prompt says "Three numeric buttons -> Page 1, Page 2, Page 3". 
        // Existing HTML has 1, 2, 3, 4. I should hide or remove "4" if it exists, or ignore it.
        // I will hide the 4th button if it exists.
        const btn4 = pagesContainer.querySelector('.page:nth-child(5)');
        if (btn4) btn4.style.display = 'none';

        const allNumBtns = [btn1, btn2, btn3];

        function switchPage(pageStr) { // '1', '2', '3'
            // Reset active styles
            allNumBtns.forEach(b => {
                if (b) b.classList.remove('active');
            });

            if (pageStr === '1') {
                if (btn1) btn1.classList.add('active');
                originalTopRow.style.display = 'grid'; // Restore
                originalGrid.style.display = 'grid';
                page2.style.display = 'none';
                page3.style.display = 'none';
            } else if (pageStr === '2') {
                if (btn2) btn2.classList.add('active');
                originalTopRow.style.display = 'none';
                originalGrid.style.display = 'none';
                page2.style.display = 'grid';
                page3.style.display = 'none';
            } else if (pageStr === '3') {
                if (btn3) btn3.classList.add('active');
                originalTopRow.style.display = 'none';
                originalGrid.style.display = 'none';
                page2.style.display = 'none';
                page3.style.display = 'grid';
            }
        }

        // Attach Listeners
        if (btn1) btn1.onclick = () => switchPage('1');
        if (btn2) btn2.onclick = () => switchPage('2');
        if (btn3) btn3.onclick = () => switchPage('3');
        if (btnFirst) btnFirst.onclick = () => switchPage('1');
        if (btnLast) btnLast.onclick = () => switchPage('3');

        // Initial State
        // Ensure Page 1 active (HTML has "2" active by default for some reason in snippet, let's fix that)
        switchPage('1');
    }

    // --- Reader Page Logic ---
    const mainViewer = document.getElementById('main-viewer');

    if (mainViewer) {
        // --- Initialization & Configuration ---
        const urlParams = new URLSearchParams(window.location.search);
        const dateParam = urlParams.get('date') || '20-01-2026';
        let totalPages = 8;
        let currentPage = 1;

        // --- DOM Elements ---
        const thumbContainer = document.getElementById('thumbnail-container');
        const controlPagination = document.getElementById('control-pagination');
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const leftArrow = document.getElementById('left-arrow');
        const rightArrow = document.getElementById('right-arrow');
        const pdfBtn = document.querySelector('.btn-pdf');
        const archiveBtn = document.querySelector('.btn-archive');

        // --- Helper Functions ---
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
            // 1. Generate Thumbnails
            if (thumbContainer) {
                thumbContainer.innerHTML = '';
                for (let i = 1; i <= totalPages; i++) {
                    const thumb = document.createElement('div');
                    thumb.className = `thumb-item ${i === 1 ? 'active' : ''}`;
                    thumb.innerHTML = `
                        <img src="${getSafeImagePath(i)}" alt="Page ${i}">
                        <span>Page ${i}</span>
                    `;
                    thumb.onclick = () => switchPage(i);
                    thumbContainer.appendChild(thumb);
                }
            }

            // 2. Generate Pagination Buttons
            if (controlPagination) {
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

            // Update Iframe Source
            mainViewer.src = 'about:blank';
            setTimeout(() => {
                mainViewer.src = getPDFPath(pageNumber);
            }, 50);

            // Scroll active thumbnail into view
            if (thumbs[pageNumber - 1]) {
                thumbs[pageNumber - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        // --- Event Listeners ---
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
            const dateInput = archiveBtn.querySelector('.date-input');
            if (dateInput) {
                archiveBtn.addEventListener('click', (e) => {
                    try {
                        dateInput.showPicker();
                    } catch (err) { }
                });
            }
        }

        // --- Start ---
        loadConfig();
    }
});
