document.addEventListener('DOMContentLoaded', () => {
    //Header/Footer & Inactivity
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

    // Burger Menu
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

    // Calendar Configuration
    const calendarInputs = document.querySelectorAll('.date-input');

    if (calendarInputs.length > 0) {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        const minDateObj = new Date();
        minDateObj.setDate(now.getDate() - 29);
        const minDate = minDateObj.toISOString().split('T')[0];

        calendarInputs.forEach(input => {
            input.setAttribute('max', today);
            input.setAttribute('min', minDate);

            input.addEventListener('change', function () {
                if (this.value) {
                    const dateParts = this.value.split('-');
                    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                    window.location.href = `reader.html?date=${formattedDate}`;
                }
            });
        });
    }

    //Live Date & Init Pagination
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
                e.stopPropagation();
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

    // Init Homepage Calendar
    const homepageCalendar = document.getElementById('homepage-calendar');
    if (homepageCalendar) {
        initCalendar(homepageCalendar);
        initPagination();
    }

    function initPagination() {
        const epaperSection = document.querySelector('.epaper-section');
        const originalTopRow = document.querySelector('.top-row');
        const originalGrid = document.querySelector('.epaper-grid');
        const todayContainer = document.getElementById('today-paper-container');

        if (!epaperSection || !originalTopRow || !originalGrid) return;

        let currentDate = new Date();

        const totalCardsWanted = 30;
        const generatedCards = [];

        // Helper to generate card HTML
        const generateCardHTML = (dateObj, isToday = false) => {
            const d = String(dateObj.getDate()).padStart(2, '0');
            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
            const y = dateObj.getFullYear();
            const dateStr = `${d}-${m}-${y}`;
            const displayDate = `${d} ${dateObj.toLocaleString('default', { month: 'short' })} ${y}`;

            // ID for the very first card if needed (originally 'today-paper')
            const idAttr = isToday ? 'id="today-paper"' : '';

            return `
                <a href="reader.html?date=${dateStr}" class="paper-link">
                    <div class="paper-card" ${idAttr}>
                        <img src="assets/previews/${dateStr}-1.png" alt="${d} ${m} ${y} Newspaper" onerror="this.onerror=null;this.src='assets/previews/10-01-2026-1.png'">
                        <div class="paper-info">
                            <h4>Eeloka</h4>
                            <p>${displayDate}</p>
                            <span>Daily Edition</span>
                        </div>
                    </div>
                </a>
            `;
        };

        // Generate 30 cards
        for (let i = 0; i < totalCardsWanted; i++) {

            if (i > 0) {
                currentDate.setDate(currentDate.getDate() - 1);
            }
            generatedCards.push(generateCardHTML(new Date(currentDate), i === 0));
        }

        if (todayContainer && generatedCards.length > 0) {
            todayContainer.innerHTML = generatedCards[0];
        }

        const cardsForPage1Grid = generatedCards.slice(1, 9);
        if (originalGrid) {
            originalGrid.innerHTML = '';
            cardsForPage1Grid.forEach(html => {
                const temp = document.createElement('div');
                temp.innerHTML = html.trim();
                originalGrid.appendChild(temp.firstChild);
            });
        }

        const cardsForPage2 = generatedCards.slice(9, 20);
        const cardsForPage3 = generatedCards.slice(20, 30);

        // Helper to create page container
        const createPage = (pageId, cards) => {
            const pageDiv = document.createElement('div');
            pageDiv.id = pageId;
            pageDiv.className = 'epaper-grid generated-page';
            pageDiv.style.display = 'none';

            // First 3 cards
            cards.slice(0, 3).forEach(html => {
                const temp = document.createElement('div');
                temp.innerHTML = html.trim();
                pageDiv.appendChild(temp.firstChild);
            });

            // Calendar Wrapper 
            const calWrapper = document.createElement('div');
            calWrapper.className = 'top-card-wrapper calendar-wrapper';
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

        const page2 = createPage('page-2', cardsForPage2);
        const page3 = createPage('page-3', cardsForPage3);

        epaperSection.appendChild(page2);
        epaperSection.appendChild(page3);

        // 4. Wiring Navigation
        const pagesContainer = document.querySelector('.pages');
        if (!pagesContainer) return;

        const btnFirst = pagesContainer.querySelector('.first');
        const btnLast = pagesContainer.querySelector('.last');
        const btn1 = pagesContainer.querySelector('.page:nth-child(2)');
        const btn2 = pagesContainer.querySelector('.page:nth-child(3)');
        const btn3 = pagesContainer.querySelector('.page:nth-child(4)');
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
                originalTopRow.style.display = 'grid';
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

            // Mobile Optimization: Scroll to top on page switch
            if (window.innerWidth <= 480) {
                window.scrollTo(0, 0);
            }
        }

        // Attach Listeners
        if (btn1) btn1.onclick = () => switchPage('1');
        if (btn2) btn2.onclick = () => switchPage('2');
        if (btn3) btn3.onclick = () => switchPage('3');
        if (btnFirst) btnFirst.onclick = () => switchPage('1');
        if (btnLast) btnLast.onclick = () => switchPage('3');

        switchPage('1');
    }

    // --- Reader Page Logic ---
    const pdfContainer = document.getElementById('pdf-container');
    const pdfCanvas = document.getElementById('pdf-render');

    if (pdfCanvas) {
        // --- Initialization & Configuration ---
        const urlParams = new URLSearchParams(window.location.search);
        const dateParam = urlParams.get('date') || '20-01-2026';
        let pdfDoc = null;
        let pageNum = 1;
        let pageRendering = false;
        let pageNumPending = null;
        const ctx = pdfCanvas.getContext('2d');

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
        const getPDFUrl = () => `assets/pdfs/${dateParam}.pdf`;
        const getSafeImagePath = (page) => `assets/previews/${dateParam}-1.png`;

        async function loadConfig() {
            try {
                const response = await fetch('newspaper-config.json');
                const config = await response.json();
                const paperData = config[dateParam];

                if (paperData) {
                    document.title = `E-Paper – ${paperData.title}`;
                } else {
                    document.title = `E-Paper – ${dateParam.replace(/-/g, ' ')}`;
                }
            } catch (error) {
                console.error('Failed to load config:', error);
                document.title = `E-Paper – ${dateParam.replace(/-/g, ' ')}`;
            }
            initReader();
        }

        async function initReader() {
            try {
                const url = getPDFUrl();
                const loadingTask = pdfjsLib.getDocument(url);
                pdfDoc = await loadingTask.promise;

                // 1. Generate Thumbnails (pdfDoc.numPages gives exact count)
                if (thumbContainer) {
                    thumbContainer.innerHTML = '';
                    for (let i = 1; i <= pdfDoc.numPages; i++) {
                        const thumb = document.createElement('div');
                        thumb.className = `thumb-item ${i === 1 ? 'active' : ''}`;
                        thumb.innerHTML = `
                            <img src="${getSafeImagePath(i)}" alt="Page ${i}">
                            <span>Page ${i}</span>
                        `;
                        thumb.onclick = () => queueRenderPage(i);
                        thumbContainer.appendChild(thumb);
                    }
                }

                // 2. Generate Pagination Buttons
                if (controlPagination) {
                    const existingNumberBtns = controlPagination.querySelectorAll('.page-btn:not(#prev-btn):not(#next-btn)');
                    existingNumberBtns.forEach(b => b.remove());

                    for (let i = 1; i <= pdfDoc.numPages; i++) {
                        const btn = document.createElement('div');
                        btn.className = `page-btn ${i === 1 ? 'active' : ''}`;
                        btn.innerText = i;
                        btn.onclick = () => queueRenderPage(i);
                        if (nextBtn) {
                            controlPagination.insertBefore(btn, nextBtn);
                        } else {
                            controlPagination.appendChild(btn);
                        }
                    }
                }

                // Initial Render
                renderPage(pageNum);

            } catch (error) {
                console.error('Error loading PDF:', error);
                if (pdfContainer) pdfContainer.innerHTML = `<p style="text-align:center; padding:20px;">Error loading PDF: ${error.message}</p>`;
            }
        }

        function renderPage(num) {
            pageRendering = true;

            // Fetch page
            pdfDoc.getPage(num).then(function (page) {
                const containerWidth = pdfContainer.clientWidth || 800;
                const unscaledViewport = page.getViewport({ scale: 1 });

                // Subtract some padding/margin roughly
                const scale = (containerWidth - 20) / unscaledViewport.width;
                const viewport = page.getViewport({ scale: scale });

                pdfCanvas.height = viewport.height;
                pdfCanvas.width = viewport.width;

                // Render
                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                const renderTask = page.render(renderContext);

                // Wait for render to finish
                renderTask.promise.then(function () {
                    pageRendering = false;
                    if (pageNumPending !== null) {
                        renderPage(pageNumPending);
                        pageNumPending = null;
                    }
                });
            });

            // Update UI State
            pageNum = num;
            updateUIState(num);

            // Scroll to top of PDF container
            if (pdfContainer) pdfContainer.scrollTop = 0;
        }

        function queueRenderPage(num) {
            if (pageRendering) {
                pageNumPending = num;
            } else {
                renderPage(num);
            }
        }

        function updateUIState(pageNumber) {
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

            // Scroll active thumbnail into view
            if (thumbs[pageNumber - 1]) {
                thumbs[pageNumber - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        // --- Event Listeners ---
        const onPrev = () => { if (pageNum <= 1) return; queueRenderPage(pageNum - 1); };
        const onNext = () => { if (pageNum >= pdfDoc.numPages) return; queueRenderPage(pageNum + 1); };

        if (prevBtn) prevBtn.onclick = onPrev;
        if (nextBtn) nextBtn.onclick = onNext;
        if (leftArrow) leftArrow.onclick = onPrev;
        if (rightArrow) rightArrow.onclick = onNext;

        if (pdfBtn) {
            pdfBtn.onclick = () => {
                window.open(getPDFUrl(), '_blank');
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
