const firebaseConfig = {
    apiKey: "AIzaSyAzOy1xoUnVjTPZq7J3nQZ_UAwGP3CKosA",
    authDomain: "webtestproject-18b06.firebaseapp.com",
    projectId: "webtestproject-18b06",
    storageBucket: "webtestproject-18b06.appspot.com",
    messagingSenderId: "890810117821",
    appId: "1:890810117821:web:9b1debe88ddb9aade811d4",
    measurementId: "G-TE4288YL8C"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutButton = document.getElementById('logout-button');

auth.onAuthStateChanged(user => {
    if (user) {
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        if (!document.body.dataset.dashboardLoaded) {
            loadDashboard();
            document.body.dataset.dashboardLoaded = true;
        }
    } else {
        loginContainer.style.display = 'flex';
        dashboardContainer.style.display = 'none';
        document.body.dataset.dashboardLoaded = false;
    }
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    loginError.textContent = '';
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
            loginError.textContent = 'Login failed. Check email and password.';
        });
});

logoutButton.addEventListener('click', () => {
    auth.signOut();
});

function loadDashboard() {
    const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/68904e27f7e7a370d1f349bb';
    const JSONBIN_API_KEY = '$2a$10$sOSZ5D6cVDPPwJUTty/w0uvrbNINyCukvfWIeW2bv4BhXiQe8jwym';
    const HOLIDAY_API_URL = 'https://api-harilibur.vercel.app/api';
    let promotions = [];
    let holidays = {}; 
    let currentDate = new Date(); 
    let charts = {};
    const competitors = ['Hartono', 'Electronic City', 'Erablue'];
    const competitorConfig = { 'Hartono': { colorClass: 'hartono', bgColor: '#fdf6f1' }, 'Electronic City': { colorClass: 'electronic-city', bgColor: '#f3f2f7' }, 'Erablue': { colorClass: 'erablue', bgColor: '#f0f0f5' } };
    const promoCategories = [ 'Promo HP & Gadget', 'Promo Laptop & PC', 'Promo TV & Audio', 'Promo Home Appliances', 'Promo Back to School', 'Promo Hari Libur Besar', 'Storewide', 'Other Promotions' ];
    const categoryColors = { 'Promo HP & Gadget': '#D2691E', 'Promo Laptop & PC': '#CD853F', 'Promo TV & Audio': '#A0522D', 'Promo Home Appliances': '#B8860B', 'Promo Back to School': '#DAA520', 'Promo Hari Libur Besar': '#E67E22', 'Storewide': '#7f8c8d', 'Other Promotions': '#F39C12' };
    const categoryIcons = { 'Promo HP & Gadget': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="35" y="15" width="50" height="70" rx="8" fill="#7BB8F2"/><rect x="15" y="25" width="40" height="60" rx="8" fill="#005A9C"/><rect x="20" y="32" width="30" height="46" rx="3" fill="#F5A623"/></svg>`, 'Promo Laptop & PC': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g><path d="M 5 70 L 95 70 L 85 78 L 15 78 Z" fill="#005A9C"/><rect x="18" y="22" width="74" height="48" rx="5" fill="#7BB8F2" transform="skewX(-10)"/><rect x="25" y="28" width="60" height="36" rx="2" fill="#005A9C" transform="skewX(-10)"/></g></svg>`, 'Promo TV & Audio': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="20" width="84" height="50" rx="4" fill="#005A9C"/><rect x="13" y="25" width="74" height="40" fill="#7BB8F2"/><path d="M 45 70 L 55 70 L 65 80 L 35 80 Z" fill="#005A9C"/><rect x="20" y="85" width="60" height="5" rx="2.5" fill="#F5A623"/></svg>`, 'Promo Home Appliances': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g transform="translate(50 35) scale(0.8)"><path d="M 0 -15 L 0 15 M -13 0 L 13 0 M -9 -9 L 9 9 M -9 9 L 9 -9" stroke="#005A9C" stroke-width="4" stroke-linecap="round"/></g><path d="M 25 60 C 25 50, 50 50, 50 75 S 75 90, 75 80 C 75 70, 60 70, 50 85 Z" fill="#7BB8F2" transform="translate(-15 0)"/><g transform="translate(70 70) scale(0.6)"><circle cx="0" cy="0" r="12" fill="none" stroke="#F5A623" stroke-width="4"/><path d="M 0 0 L 10 5" stroke="#F5A623" stroke-width="4" stroke-linecap="round"/><path d="M 0 0 L -10 5" stroke="#F5A623" stroke-width="4" stroke-linecap="round"/><path d="M 0 0 L 0 -12" stroke="#F5A623" stroke-width="4" stroke-linecap="round"/></g></svg>`, 'Promo Back to School': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M 15 80 Q 50 90 85 80 L 85 20 Q 50 10 15 20 Z" fill="#005A9C"/><path d="M 50 22 V 82" stroke="#7BB8F2" stroke-width="4"/><circle cx="50" cy="50" r="12" fill="#F5A623"/><path d="M 50 38 Q 55 35 52 30" stroke="#005A9C" stroke-width="3" fill="none"/></svg>`, 'Promo Hari Libur Besar': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="10" width="6" height="80" rx="3" fill="#005A9C"/><path d="M 21 25 C 40 15, 60 35, 80 25 V 45 C 60 55, 40 35, 21 45 Z" fill="#F5A623"/><path d="M 21 45 C 40 35, 60 55, 80 45 V 65 C 60 75, 40 55, 21 65 Z" fill="#7BB8F2"/></svg>`, 'Storewide': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M85,30H15a5,5,0,0,0-5,5V75a5,5,0,0,0,5,5H85a5,5,0,0,0,5-5V35A5,5,0,0,0,85,30ZM50,65a15,15,0,1,1,15-15A15,15,0,0,1,50,65Z" fill="#005A9C"/><path d="M50,40a10,10,0,1,0,10,10A10,10,0,0,0,50,40Z" fill="#7BB8F2"/><circle cx="80" cy="40" r="5" fill="#F5A623"/></svg>`, 'Other Promotions': `<svg width="64" height="64" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="40" width="60" height="45" rx="5" fill="#005A9C"/><rect x="15" y="25" width="70" height="15" rx="5" fill="#7BB8F2"/><rect x="45" y="25" width="10" height="60" fill="#F5A623"/><path d="M 45 25 C 35 15, 25 15, 25 25" stroke="#F5A623" stroke-width="8" fill="none"/><path d="M 55 25 C 65 15, 75 15, 75 25" stroke="#F5A623" stroke-width="8" fill="none"/></svg>` };
    const categoryKeywords = {
        'Promo TV & Audio': ['tv', 'uhd', 'qled', 'oled', 'audio', 'speaker', 'soundbar', 'headphone', 'earphone'],
        'Promo HP & Gadget': ['hp', 'galaxy', 'smartphone', 'gadget', 'smart watch', 'tablet'],
        'Promo Home Appliances': ['ac', 'air conditioner', 'kulkas', 'refrigerator', 'mesin cuci', 'washing machine', 'kitchen', 'dapur', 'appliance', 'cooker', 'vacuum', 'blender', 'microwave', 'rice cooker', 'kompor gas'],
        'Promo Laptop & PC': ['laptop', 'pc', 'komputer', 'notebook', 'desktop', 'monitor'],
        'Promo Back to School': ['back to school'],
        'Promo Hari Libur Besar': ['pahlawan', '17 agustus', 'merdeka', 'kemerdekaan', 'independen', 'lebaran', 'idul fitri', 'natal', 'christmas', 'tahun baru', 'new year', 'imlek', 'ramadan'],
        'Storewide': ['gratis ongkir', 'free shipping', 'click & collect', 'special price', 'special offer', 'buy 1 get 1']
    };
    const getPromoCategory = (promo) => {
        const text = (promo.title + ' ' + (promo.details || '')).toLowerCase();
        const categoryOrder = ['Promo TV & Audio', 'Promo HP & Gadget', 'Promo Home Appliances', 'Promo Laptop & PC', 'Promo Back to School', 'Promo Hari Libur Besar', 'Storewide'];
        for (const category of categoryOrder) {
            for (const keyword of categoryKeywords[category]) {
                if (new RegExp(`\\b${keyword.replace(/ /g, '\\s')}\\b`, 'i').test(text)) { return category; }
            }
        }
        return 'Other Promotions'; 
    };
    const getCategoryIcon = (category) => categoryIcons[category] || categoryIcons['Other Promotions'];
    const calculatePromotionSpan = (startDate, endDate) => {
        const d = (dateString) => new Date(dateString + 'T00:00:00Z');
        const start = d(startDate);
        const end = d(endDate);
        if (isNaN(start) || isNaN(end)) return {startDay: -1, duration: 0};
        const monthStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
        const monthEnd = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0, 23, 59, 59));
        let s = start < monthStart ? monthStart : start;
        let e = end > monthEnd ? monthEnd : end;
        if (s > e) return {startDay: -1, duration: 0};
        return { startDay: s.getUTCDate(), duration: e.getUTCDate() - s.getUTCDate() + 1 };
    };
    async function loadHolidays(year) {
        if (holidays[year]) return holidays[year];
        try {
            const response = await fetch(`${HOLIDAY_API_URL}?year=${year}`);
            if (response.ok) {
                const data = await response.json();
                const holidayMap = {};
                data.filter(h => h.is_national_holiday).forEach(h => { holidayMap[h.holiday_date] = h.holiday_name; });
                holidays[year] = holidayMap;
                return holidayMap;
            }
        } catch (error) { console.error("Failed to load holiday data:", error); }
        return {};
    }
    async function loadPromotions() {
        let serverPromos = [], scrapedPromos = [];
        try {
            const response = await fetch(`${JSONBIN_URL}/latest`, { headers: { 'X-Master-Key': JSONBIN_API_KEY } });
            if (response.ok) { serverPromos = (await response.json()).record || []; } 
            else { showNotification('⚠️ Could not load manual data.', 'bg-yellow-500'); }
        } catch (error) { console.error("JSONBIN Load Error:", error); showNotification('❌ Network error loading manual data.', 'bg-red-500'); }
        try {
            const response = await fetch('promotions.json');
            if(response.ok) { 
                scrapedPromos = await response.json(); 
                scrapedPromos.forEach(p => {
                    if (!p.startDate || p.startDate === "") {
                        const today = new Date();
                        p.startDate = today.toISOString().split('T')[0];
                        const futureDate = new Date();
                        futureDate.setDate(today.getDate() + 14);
                        p.endDate = futureDate.toISOString().split('T')[0];
                    }
                });
            }
        } catch (error) { console.error("Local promotions.json Load Error:", error); }
        const combinedPromos = [...serverPromos, ...scrapedPromos];
        const uniquePromos = [];
        const seenTitles = new Set();
        combinedPromos.forEach(p => {
            if (p && typeof p.title === 'string') {
                const normalizedTitle = p.title.toLowerCase().trim();
                if (!seenTitles.has(normalizedTitle)) {
                    seenTitles.add(normalizedTitle);
                    uniquePromos.push(p);
                }
            }
        });
        promotions = uniquePromos.map((p, index) => {
            const category = p.category || getPromoCategory(p);
            return { ...p, tempId: index, category: category, iconHTML: getCategoryIcon(category) };
        });
        await rerenderAll();
    }
    const saveData = async (updatedPromotions) => {
         const dataToSave = updatedPromos.map(({ tempId, iconHTML, ...rest }) => rest);
         try {
             const response = await fetch(JSONBIN_URL, {
                 method: 'PUT',
                 headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY },
                 body: JSON.stringify(dataToSave)
             });
             return response.ok;
         } catch (error) { console.error("Save Data Error:", error); return false; }
    };
    const handleAddPromoForm = async (event) => {
        event.preventDefault();
        const form = event.target;
        const newPromo = { competitor: form.competitor.value, title: form.title.value, startDate: form.startDate.value, endDate: form.endDate.value, details: form.details.value, url: form.promoUrl.value, category: form.promoType.value };
        const updatedPromotions = [...promotions, newPromo];
        const success = await saveData(updatedPromotions);
        if (success) { showNotification('✅ New promotion added!', 'bg-green-500'); form.reset(); document.getElementById('addPromoModal').classList.add('hidden'); await loadPromotions(); } else { showNotification('❌ Failed to add promotion.', 'bg-red-500'); }
    };
    const handleEditPromoForm = async (event) => {
        event.preventDefault();
        const form = event.target;
        const promoId = parseInt(form.editPromoId.value);
        const updatedPromotions = promotions.map(p => p.tempId === promoId ? { tempId: p.tempId, competitor: document.getElementById('editCompetitor').value, title: document.getElementById('editTitle').value, url: document.getElementById('editPromoUrl').value, startDate: document.getElementById('editStartDate').value, endDate: document.getElementById('editEndDate').value, details: document.getElementById('editDetails').value, category: document.getElementById('editPromoType').value } : p);
        const success = await saveData(updatedPromotions);
        if (success) { showNotification('✏️ Promotion updated.', 'bg-green-500'); document.getElementById('editPromoModal').classList.add('hidden'); await loadPromotions(); } else { showNotification('❌ Failed to update.', 'bg-red-500'); }
    };
    const deletePromotion = async (promoId) => {
        const updatedPromotions = promotions.filter(p => p.tempId !== promoId);
        const success = await saveData(updatedPromotions);
        if (success) { showNotification('🗑️ Promotion deleted.', 'bg-blue-500'); document.getElementById('deleteConfirmModal').classList.add('hidden'); document.getElementById('promoModal').classList.add('hidden'); await loadPromotions(); } else { showNotification('❌ Failed to delete.', 'bg-red-500'); }
    };
    const createTimeline = async () => {
        const wrapper = document.getElementById('timeline-wrapper');
        if (!wrapper) return;
        wrapper.innerHTML = '';
        const year = currentDate.getUTCFullYear();
        const monthName = currentDate.toLocaleString('default', { month: 'long', timeZone: 'UTC' });
        document.getElementById('timeline-title').textContent = `${monthName} ${year} - Detailed Promotions by Competitor`;
        const currentYearHolidays = await loadHolidays(year);
        const daysInMonth = new Date(Date.UTC(year, currentDate.getUTCMonth() + 1, 0)).getUTCDate();
        const headerRow = document.createElement('div');
        headerRow.className = 'timeline-full-row timeline-header-row';
        const headerLabel = document.createElement('div');
        headerLabel.className = 'timeline-sticky-label';
        headerLabel.textContent = `${monthName.toUpperCase()} ${year}`;
        headerRow.appendChild(headerLabel);
        const headerCells = document.createElement('div');
        headerCells.className = 'timeline-cells-container';
        headerCells.style.gridTemplateColumns = `repeat(${daysInMonth}, minmax(30px, 1fr))`;
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            const dateInLoop = new Date(Date.UTC(year, currentDate.getUTCMonth(), day));
            const month = (dateInLoop.getUTCMonth() + 1).toString().padStart(2, '0');
            const dayStr = dateInLoop.getUTCDate().toString().padStart(2, '0');
            const dateString = `${year}-${month}-${dayStr}`;
            let specialClass = 'timeline-header-day';
            if (dateInLoop.getUTCDay() === 0 || dateInLoop.getUTCDay() === 6) specialClass += ' weekend';
            if (currentYearHolidays[dateString]) {
                specialClass += ' holiday';
                dayCell.title = currentYearHolidays[dateString];
            }
            if (day === today.getDate() && currentDate.getMonth() === today.getMonth() && year === today.getFullYear()) specialClass += ' today';
            dayCell.className = specialClass;
            dayCell.textContent = day;
            headerCells.appendChild(dayCell);
        }
        headerRow.appendChild(headerCells);
        wrapper.appendChild(headerRow);
        const renderGridRow = (parent) => {
            const cellsContainer = document.createElement('div');
            cellsContainer.className = 'timeline-cells-container';
            cellsContainer.style.gridTemplateColumns = `repeat(${daysInMonth}, minmax(30px, 1fr))`;
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.className = 'timeline-day-cell';
                if (day === today.getDate() && currentDate.getMonth() === today.getMonth() && year === today.getFullYear()) {
                    dayCell.classList.add('today-highlight');
                }
                cellsContainer.appendChild(dayCell);
            }
            parent.appendChild(cellsContainer);
        };
        competitors.forEach(compName => {
            const competitorPromos = promotions.filter(p => p.competitor === compName);
            const config = competitorConfig[compName];
            const competitorHeaderRow = document.createElement('div');
            competitorHeaderRow.className = 'timeline-full-row timeline-competitor-header';
            const competitorLabel = document.createElement('div');
            competitorLabel.className = 'timeline-sticky-label';
            competitorLabel.textContent = compName;
            competitorHeaderRow.appendChild(competitorLabel);
            renderGridRow(competitorHeaderRow);
            wrapper.appendChild(competitorHeaderRow);
            if (competitorPromos.length === 0) return;
            const groupedByCategory = {};
            competitorPromos.forEach(p => {
                if (!groupedByCategory[p.category]) groupedByCategory[p.category] = [];
                groupedByCategory[p.category].push(p);
            });
            promoCategories.forEach(catName => {
                const promosForCategory = groupedByCategory[catName] || [];
                if (promosForCategory.length === 0) return;
                const categoryGroup = document.createElement('div');
                categoryGroup.className = 'category-group';
                const categoryHeaderRow = document.createElement('div');
                categoryHeaderRow.className = 'timeline-full-row timeline-category-label';
                categoryHeaderRow.innerHTML = `<div class="timeline-sticky-label"><span class="icon mr-2"><i class="fa-solid fa-chevron-down"></i></span>${catName} (${promosForCategory.length})</div>`;
                renderGridRow(categoryHeaderRow);
                categoryGroup.appendChild(categoryHeaderRow);
                wrapper.appendChild(categoryGroup);
                promosForCategory.forEach((promo) => {
                    const span = calculatePromotionSpan(promo.startDate, promo.endDate);
                    if (span.duration > 0) {
                        const promoRow = document.createElement('div');
                        promoRow.className = 'timeline-full-row timeline-promo-row';
                        promoRow.appendChild(document.createElement('div')).className = 'timeline-sticky-label';
                        const promoCells = document.createElement('div');
                        promoCells.className = 'timeline-cells-container';
                        promoCells.style.gridTemplateColumns = `repeat(${daysInMonth}, minmax(30px, 1fr))`;
                        for (let day = 1; day <= daysInMonth; day++) {
                            const dayCell = document.createElement('div');
                            dayCell.className = 'timeline-day-cell';
                            if (day === today.getDate() && currentDate.getMonth() === today.getMonth() && year === today.getFullYear()) {
                                dayCell.classList.add('today-highlight');
                            }
                            promoCells.appendChild(dayCell);
                        }
                        const bar = document.createElement('div');
                        bar.className = `timeline-bar ${config.colorClass}`;
                        bar.dataset.promoId = promo.tempId;
                        bar.onclick = () => showPromoDetailsModal(promo.tempId);
                        const startPercent = ((span.startDay - 1) / daysInMonth) * 100;
                        const widthPercent = (span.duration / daysInMonth) * 100;
                        bar.style.left = `${startPercent}%`;
                        bar.style.width = `${widthPercent}%`;
                        bar.textContent = promo.title;
                        promoCells.appendChild(bar);
                        promoRow.appendChild(promoCells);
                        categoryGroup.appendChild(promoRow);
                    }
                });
                categoryHeaderRow.addEventListener('click', () => { categoryGroup.classList.toggle('collapsed'); });
            });
        });
    };
    const generateCustomLegend = (chart, containerId) => {
        const legendContainer = document.getElementById(containerId);
        if (!legendContainer) return;
        legendContainer.innerHTML = '';
        const labels = chart.data.labels;
        const colors = chart.data.datasets[0].backgroundColor;
        const data = chart.data.datasets[0].data;
        labels.forEach((label, index) => {
            if (data[index] > 0) {
                const item = document.createElement('div');
                item.className = 'flex items-center text-xs';
                item.innerHTML = `<span class="w-3 h-3 rounded-sm mr-2" style="background-color: ${colors[index]}"></span><span>${label}</span>`;
                legendContainer.appendChild(item);
            }
        });
    };
    const renderDashboard = (activePromos) => {
        const dashboardContent = document.getElementById('dashboard-content');
        if (!dashboardContent) return;
        dashboardContent.innerHTML = `
            <div class="paper-card p-6 flex flex-col md:col-span-3">
                <h3 class="text-lg font-semibold mb-4">Active Promotions per Competitor</h3>
                <div class="relative flex-1" style="min-height: 250px;"><canvas id="bar-chart"></canvas></div>
            </div>
            <div class="paper-card p-6 flex flex-col">
                <h3 class="text-lg font-semibold mb-4 text-center">Promotion Types: Hartono</h3>
                <div class="relative w-40 h-40 md:w-48 md:h-48 mx-auto flex-shrink-0"><canvas id="pie-chart-hartono"></canvas></div>
                <div id="legend-hartono" class="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2"></div>
            </div>
            <div class="paper-card p-6 flex flex-col">
                <h3 class="text-lg font-semibold mb-4 text-center">Promotion Types: Electronic City</h3>
                <div class="relative w-40 h-40 md:w-48 md:h-48 mx-auto flex-shrink-0"><canvas id="pie-chart-electronic-city"></canvas></div>
                <div id="legend-electronic-city" class="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2"></div>
            </div>
            <div class="paper-card p-6 flex flex-col">
                 <h3 class="text-lg font-semibold mb-4 text-center">Promotion Types: Erablue</h3>
                 <div class="relative w-40 h-40 md:w-48 md:h-48 mx-auto flex-shrink-0"><canvas id="pie-chart-erablue"></canvas></div>
                 <div id="legend-erablue" class="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2"></div>
            </div>
        `;
        Object.values(charts).forEach(chart => { if(chart) chart.destroy(); });
        charts = {};
        const barCtx = document.getElementById('bar-chart');
        if (barCtx) {
            charts.bar = new Chart(barCtx.getContext('2d'), { type: 'bar', data: { labels: competitors, datasets: [{ label: '# of Active Promotions', data: competitors.map(c => activePromos.filter(p => p.competitor === c).length), backgroundColor: ['#D2691E', '#CD853F', '#8B4513'], borderRadius: 4 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#6B4E3D', titleColor: '#FFFBF7', bodyColor: '#FFFBF7' } }, scales: { x: { grid: { color: 'rgba(107, 78, 61, 0.1)' }, ticks: { color: '#A67C5A' } }, y: { grid: { display: false }, ticks: { color: '#A67C5A' } } } } });
        }
        competitors.forEach(c => {
            const pieCtx = document.getElementById(`pie-chart-${c.toLowerCase().replace(/ /g, '-')}`);
            if (!pieCtx) return;
            const competitorPromos = activePromos.filter(p => p.competitor === c);
            const categoryCounts = promoCategories.map(cat => competitorPromos.filter(p => p.category === cat).length);
            charts[`pie_${c}`] = new Chart(pieCtx.getContext('2d'), { type: 'doughnut', data: { labels: promoCategories, datasets: [{ data: categoryCounts, backgroundColor: promoCategories.map(cat => categoryColors[cat]), borderColor: 'var(--color-surface)', borderWidth: 2 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { display: false }, tooltip: { backgroundColor: '#6B4E3D', titleColor: '#FFFBF7', bodyColor: '#FFFBF7' } } } });
            generateCustomLegend(charts[`pie_${c}`], `legend-${c.toLowerCase().replace(/ /g, '-')}`);
        });
    };
    const renderPromotionCards = (activePromos) => {
        const container = document.getElementById('promo-cards-container');
        if (!container) return;
        container.innerHTML = '';
        competitors.forEach(compName => {
            const compPromotions = activePromos.filter(p => p.competitor === compName);
            if (compPromotions.length === 0) return;
            const card = document.createElement('div');
            card.className = 'paper-card';
            const config = competitorConfig[compName] || {};
            card.innerHTML = `<div class="promo-card-header" style="background-color: var(--color-comp-${competitors.indexOf(compName)+1}); border-radius: 16px 16px 0 0; margin: -24px -24px 0 -24px; padding: 1rem 24px;">${compName} Promotions</div><div class="promo-card-content mt-4"></div>`;
            const contentDiv = card.querySelector('.promo-card-content');
            compPromotions.forEach((promo) => {
                const promoItem = document.createElement('div');
                promoItem.className = 'promo-item';
                promoItem.innerHTML = `<a href="${promo.url || '#'}" target="_blank" rel="noopener noreferrer"><div class="promo-item-icon-container">${promo.iconHTML}</div></a><div class="promo-item-details"><div class="promo-item-title">${promo.title}</div><div class="promo-item-category">${promo.category}</div><p class="promo-item-description">${promo.details || ''}</p></div>`;
                contentDiv.appendChild(promoItem);
            });
            container.appendChild(card);
        });
    };
    const updateLastUpdatedText = () => {
        const el = document.getElementById('last-updated-text');
        if (el) el.textContent = `Last updated: ${new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
    };
    const showNotification = (message, colorClass = 'bg-green-500') => {
        const notification = document.getElementById('notification');
        if(!notification) return;
        const notificationText = notification.querySelector('span');
        notificationText.textContent = message;
        notification.className = `text-white px-4 py-2 rounded-lg shadow-lg notification ${colorClass}`;
        notification.style.transform = 'translateX(0)';
        setTimeout(() => { notification.style.transform = 'translateX(110%)'; }, 3000);
    };
    const rerenderAll = async () => {
        const activePromosThisMonth = promotions.filter(p => {
            if (!p.startDate || !p.endDate) return false;
            const promoStart = new Date(p.startDate + 'T00:00:00Z');
            const promoEnd = new Date(p.endDate + 'T00:00:00Z');
            const monthStart = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1));
            const monthEnd = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0, 23, 59, 59));
            return promoStart <= monthEnd && promoEnd >= monthStart;
        });
        await createTimeline();
        renderDashboard(activePromosThisMonth);
        renderPromotionCards(activePromosThisMonth); 
        updateLastUpdatedText();
    };
    const populatePromoTypeDropdowns = () => {
         const selects = [document.getElementById('promoType'), document.getElementById('editPromoType'), document.getElementById('editCompetitor'), document.getElementById('competitor')]; 
         selects.forEach(select => { 
            if (!select) return; 
            select.innerHTML = ''; 
            const items = (select.id === 'competitor' || select.id === 'editCompetitor') ? competitors : promoCategories;
            items.forEach(item => { 
                const option = document.createElement('option'); 
                option.value = item; 
                option.textContent = item; 
                select.appendChild(option); 
            }); 
        });
    };
    const showPromoDetailsModal = (promoId) => {
        const promo = promotions.find(p=>p.tempId === promoId);
        if(!promo) return;
        document.getElementById('modal-content').textContent = `[${promo.category}] ${promo.title}\n\nDetails: ${promo.details}\nDuration: ${promo.startDate} to ${promo.endDate}`;
        document.getElementById('promoModal').classList.remove('hidden');
    };
    const showDeleteConfirmModal = (promoId) => {
         const confirmModal = document.getElementById('deleteConfirmModal'); 
         document.getElementById('confirmDeleteBtn').dataset.promoId = promoId; 
         confirmModal.classList.remove('hidden');
    };
    const showEditPromoModal = (promoId) => {
        const promo = promotions.find(p => p.tempId === promoId);
        if (!promo) return;
        document.getElementById('editPromoId').value = promo.tempId;
        document.getElementById('editCompetitor').value = promo.competitor;
        document.getElementById('editPromoType').value = promo.category;
        document.getElementById('editTitle').value = promo.title;
        document.getElementById('editPromoUrl').value = promo.url || '';
        document.getElementById('editStartDate').value = promo.startDate;
        document.getElementById('editEndDate').value = promo.endDate;
        document.getElementById('editDetails').value = promo.details;
        document.getElementById('editPromoModal').classList.remove('hidden');
    };
    
    document.getElementById('openAddPromoModalBtn').addEventListener('click', () => document.getElementById('addPromoModal').classList.remove('hidden'));
    document.getElementById('addPromoForm').addEventListener('submit', handleAddPromoForm);
    document.getElementById('editPromoForm').addEventListener('submit', handleEditPromoForm);
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => document.getElementById('deleteConfirmModal').classList.add('hidden'));
    document.getElementById('confirmDeleteBtn').addEventListener('click', (e) => deletePromotion(parseInt(e.currentTarget.dataset.promoId)));
    document.getElementById('prev-month-btn').addEventListener('click', () => { currentDate.setUTCMonth(currentDate.getUTCMonth() - 1, 1); rerenderAll(); });
    document.getElementById('next-month-btn').addEventListener('click', () => { currentDate.setUTCMonth(currentDate.getUTCMonth() + 1, 1); rerenderAll(); });

    populatePromoTypeDropdowns();
    loadPromotions();
}
    </script>
</body>
</html>
