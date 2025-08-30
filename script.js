document.addEventListener('DOMContentLoaded', () => {
    
    const state = {
        loggedIn: false,
        subscriptions: [],
        smsExpenses: [],
        categories: [],
        theme: 'light',
        notifications: [],
        editingRowId: null,
        editedData: null,
        currentDate: new Date(),
    };

    
    const dummyCategories = [ { id: 'cat1', name: 'Entertainment', color: '#FFDAB9' }, { id: 'cat2', name: 'Work & Productivity', color: '#F5F5DC' }, { id: 'cat3', name: 'Utilities', color: '#E6E6FA' }, { id: 'cat4', name: 'Finance & Banking', color: '#D3D3D3' }, { id: 'cat5', name: 'Health & Wellness', color: '#C0C0C0' }, ];
    let dummySubscriptions = [
        { id: '1', name: 'Netflix Premium', category: 'Entertainment', price: 19.99, currency: 'USD', frequency: 'monthly', nextDueDate: '2025-09-10' }, 
        { id: '2', name: 'Spotify Family', category: 'Entertainment', price: 15.99, currency: 'USD', frequency: 'monthly', nextDueDate: '2025-09-15' }, 
        { id: '3', name: 'AWS Server', category: 'Work & Productivity', price: 75.00, currency: 'USD', frequency: 'monthly', nextDueDate: '2025-09-01' }, 
        { id: '4', name: 'Jio Fiber', category: 'Utilities', price: 999, currency: 'INR', frequency: 'monthly', nextDueDate: '2025-09-20' }, 
        { id: '5', name: 'Car Loan EMI', category: 'Finance & Banking', price: 250.00, currency: 'USD', frequency: 'monthly', nextDueDate: '2025-09-05', roi: 4.5 }, 
    ];
    const dummySmsExpenses = [ { id: 1, merchant: "Zomato", amount: 550.00, date: "2025-08-28", category: "Normal" } ];

    const api = {
        getSubscriptions: async () => { await new Promise(res => setTimeout(res, 200)); return [...dummySubscriptions]; },
        updateSubscription: async (sub) => { dummySubscriptions = dummySubscriptions.map(s => s.id === sub.id ? sub : s); return sub; },
        getSmsExpenses: async () => { await new Promise(res => setTimeout(res, 200)); return [...dummySmsExpenses]; }
    };

    // --- HELPERS ---
    const formatCurrency = (amount, currency) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    
    // --- ROUTING ---
    function navigate(hash) {
        window.location.hash = hash;
    }

    function handleRouteChange() {
        const hash = window.location.hash;
        const appContainer = document.getElementById('app-container');
        const homePage = document.getElementById('home-page');
        const loginPage = document.getElementById('login-page');

        // Hide all top-level containers
        appContainer.classList.remove('active');
        homePage.classList.remove('active');
        loginPage.classList.remove('active');

        if (state.loggedIn) {
            appContainer.classList.add('active');
            const appHash = hash || '#dashboard';
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = '';
            let pageContent = '';

            switch(appHash) {
                case '#manage': pageContent = getManagePageHTML(); break;
                case '#reports': pageContent = getReportsPageHTML(); break;
                case '#sms-feed': pageContent = getSmsFeedPageHTML(); break;
                default: pageContent = getDashboardPageHTML(); break;
            }
            mainContent.innerHTML = pageContent;
            
            if (appHash === '#dashboard' || appHash === '') renderDashboardContent();
            if (appHash === '#manage') renderManageTable();
            if (appHash === '#reports') renderReportsCharts();
            if (appHash === '#sms-feed') renderSmsFeedTable();

            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.toggle('bg-orange-500', link.getAttribute('href') === appHash);
                link.classList.toggle('dark:bg-gray-700', link.getAttribute('href') === appHash);
                link.classList.toggle('font-semibold', link.getAttribute('href') === appHash);
            });

        } else {
            if (hash === '#login') {
                loginPage.classList.add('active');
            } else {
                homePage.classList.add('active');
            }
        }
    }

    // --- PAGE HTML TEMPLATES ---
    const getDashboardPageHTML = () => `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-text dark:text-off-white font-display">Dashboard</h1>
        </div>
        <div id="dashboard-stats" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"></div>
        <div id="calendar-view-container"></div>
    `;
    const getManagePageHTML = () => `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-text dark:text-off-white font-display">Manage Subscriptions</h1>
        </div>
        <div class="bg-off-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-divider dark:divide-gray-700">
                <thead class="bg-beige dark:bg-gray-700">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Frequency</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody id="manage-table-body" class="bg-off-white dark:bg-gray-800 divide-y divide-gray-divider dark:divide-gray-700"></tbody>
            </table>
        </div>
    `;
    const getReportsPageHTML = () => `
        <h1 class="text-3xl font-bold mb-6 text-gray-text dark:text-off-white font-display">Financial Reports</h1>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-off-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-bold mb-4 text-gray-text dark:text-off-white font-display">Monthly Expenditure</h2>
                <canvas id="bar-chart"></canvas>
            </div>
            <div class="bg-off-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-bold mb-4 text-gray-text dark:text-off-white font-display">Spending by Category (USD)</h2>
                <canvas id="pie-chart"></canvas>
            </div>
        </div>
    `;
    const getSmsFeedPageHTML = () => `
        <h1 class="text-3xl font-bold mb-6 text-gray-text dark:text-off-white font-display">Automated SMS Expense Feed</h1>
        <div class="bg-off-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
             <table class="min-w-full divide-y divide-gray-divider dark:divide-gray-700">
                <thead class="bg-beige dark:bg-gray-700">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Merchant</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                </thead>
                <tbody id="sms-table-body" class="bg-off-white dark:bg-gray-800 divide-y divide-gray-divider dark:divide-gray-700"></tbody>
            </table>
        </div>
    `;
    
    // --- RENDER FUNCTIONS ---
    function renderDashboardContent() {
        const statsContainer = document.getElementById('dashboard-stats');
        const totalMonthlyUSD = state.subscriptions.filter(s => s.frequency === 'monthly' && s.currency === 'USD').reduce((a, s) => a + s.price, 0);
        const totalMonthlyINR = state.subscriptions.filter(s => s.frequency === 'monthly' && s.currency === 'INR').reduce((a, s) => a + s.price, 0);
        
        statsContainer.innerHTML = `
            <div class="bg-off-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-transform hover:-translate-y-1"><h4 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Monthly Cost (USD)</h4><p class="text-2xl font-bold mt-1 text-gray-text dark:text-off-white">${formatCurrency(totalMonthlyUSD, 'USD')}</p></div>
            <div class="bg-off-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-transform hover:-translate-y-1"><h4 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Monthly Cost (INR)</h4><p class="text-2xl font-bold mt-1 text-gray-text dark:text-off-white">${formatCurrency(totalMonthlyINR, 'INR')}</p></div>
            <div class="bg-off-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-transform hover:-translate-y-1"><h4 class="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Subscriptions</h4><p class="text-2xl font-bold mt-1 text-gray-text dark:text-off-white">${state.subscriptions.length}</p></div>
        `;
        renderCalendar();
    }

    function renderManageTable() {
        const tableBody = document.getElementById('manage-table-body');
        if(!tableBody) return;
        tableBody.innerHTML = state.subscriptions.map(sub => {
            if (state.editingRowId === sub.id) {
                return `
                     <tr id="row-${sub.id}">
                        <td class="p-2"><input type="text" name="name" value="${state.editedData.name}" class="w-full bg-off-white dark:bg-gray-700 p-2 border border-orange-500 rounded-md" /></td>
                        <td class="p-2">
                            <select name="category" class="w-full bg-off-white dark:bg-gray-700 p-2 border border-orange-500 rounded-md">
                                ${dummyCategories.map(c => `<option ${c.name === state.editedData.category ? 'selected' : ''}>${c.name}</option>`).join('')}
                            </select>
                        </td>
                        <td class="p-2"><input type="number" name="price" value="${state.editedData.price}" class="w-24 bg-off-white dark:bg-gray-700 p-2 border border-orange-500 rounded-md" /></td>
                        <td class="p-2">
                            <select name="frequency" class="w-full bg-off-white dark:bg-gray-700 p-2 border border-orange-500 rounded-md">
                                <option value="monthly" ${state.editedData.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                                <option value="quarterly" ${state.editedData.frequency === 'quarterly' ? 'selected' : ''}>Quarterly</option>
                                <option value="annually" ${state.editedData.frequency === 'annually' ? 'selected' : ''}>Annually</option>
                            </select>
                        </td>
                        <td class="p-2"><input type="date" name="nextDueDate" value="${state.editedData.nextDueDate}" class="w-full bg-off-white dark:bg-gray-700 p-2 border border-orange-500 rounded-md" /></td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div class="flex space-x-4">
                                <button data-action="save" data-id="${sub.id}" class="text-green-600 hover:text-green-800">Save</button>
                                <button data-action="cancel" class="text-red-500 hover:text-red-700">Cancel</button>
                            </div>
                        </td>
                    </tr>
                `;
            }
            return `
                <tr id="row-${sub.id}">
                    <td class="px-6 py-4 whitespace-nowrap text-gray-text dark:text-gray-300">${sub.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-text dark:text-gray-300">${sub.category}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-text dark:text-gray-300">${formatCurrency(sub.price, sub.currency)}</td>
                    <td class="px-6 py-4 whitespace-nowrap capitalize text-gray-text dark:text-gray-300">${sub.frequency}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-text dark:text-gray-300">${sub.nextDueDate}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div class="flex space-x-4">
                            <button class="text-gray-500 hover:text-orange-500" data-action="edit" data-id="${sub.id}"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderSmsFeedTable() {
        const tableBody = document.getElementById('sms-table-body');
        if(!tableBody) return;
        const getCategoryStyle = (category) => {
            switch (category) {
                case 'Subscription': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
                case 'Autopay': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
                default: return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
            }
        };
        tableBody.innerHTML = state.smsExpenses.map(exp => `
             <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${exp.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-text dark:text-off-white">${exp.merchant}</td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryStyle(exp.category)}">${exp.category}</span></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600 dark:text-red-400">${formatCurrency(exp.amount, 'INR')}</td>
            </tr>
        `).join('');
    }
    
    let barChartInstance, pieChartInstance;
    function renderReportsCharts() {
        const monthlyData = {};
        state.subscriptions.forEach(sub => {
            const month = new Date(sub.nextDueDate).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!monthlyData[month]) monthlyData[month] = { name: month, USD: 0, INR: 0 };
            if (sub.currency === 'USD') monthlyData[month].USD += sub.price;
            if (sub.currency === 'INR') monthlyData[month].INR += sub.price;
        });

        const categoryData = {};
        state.subscriptions.forEach(sub => {
            if (!categoryData[sub.category]) categoryData[sub.category] = 0;
            const priceInUSD = sub.currency === 'INR' ? sub.price / 83 : sub.price;
            categoryData[sub.category] += priceInUSD;
        });

        const barCtx = document.getElementById('bar-chart')?.getContext('2d');
        if(barChartInstance) barChartInstance.destroy();
        if(barCtx) barChartInstance = new Chart(barCtx, { type: 'bar', data: { labels: Object.keys(monthlyData), datasets: [{ label: 'USD Spending', data: Object.values(monthlyData).map(d => d.USD), backgroundColor: 'rgba(255, 218, 185, 0.7)', }, { label: 'INR Spending', data: Object.values(monthlyData).map(d => d.INR), backgroundColor: 'rgba(245, 245, 220, 0.7)', }] } });

        const pieCtx = document.getElementById('pie-chart')?.getContext('2d');
        if(pieChartInstance) pieChartInstance.destroy();
        if(pieCtx) pieChartInstance = new Chart(pieCtx, { type: 'pie', data: { labels: Object.keys(categoryData), datasets: [{ label: 'Spending by Category (USD)', data: Object.values(categoryData), backgroundColor: ['#FFDAB9', '#F5F5DC', '#ADC4CE', '#DBAEAB', '#D3D3D3'], }] } });
    }

    function renderCalendar() {
        const container = document.getElementById('calendar-view-container');
        if (!container) return;

        const { currentDate, subscriptions } = state;
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const startDay = startOfMonth.getDay();

        const subsByDate = {};
        subscriptions.forEach(sub => {
            const subDate = new Date(sub.nextDueDate);
            if (subDate.getUTCMonth() === currentDate.getMonth() && subDate.getUTCFullYear() === currentDate.getFullYear()) {
                const day = subDate.getUTCDate();
                if (!subsByDate[day]) subsByDate[day] = [];
                subsByDate[day].push(sub);
            }
        });

        let calendarHTML = `
            <div class="bg-off-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div class="flex justify-between items-center mb-4">
                    <button id="prev-month" class="p-2 rounded-full hover:bg-beige dark:hover:bg-gray-700">&lt;</button>
                    <h2 class="text-xl font-bold text-gray-text dark:text-off-white">${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                    <button id="next-month" class="p-2 rounded-full hover:bg-beige dark:hover:bg-gray-700">&gt;</button>
                </div>
                <div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => `<div>${day}</div>`).join('')}</div>
                <div class="grid grid-cols-7 gap-1 mt-2">
        `;
        
        for (let i = 0; i < startDay; i++) {
            calendarHTML += `<div class="h-24 border border-gray-divider dark:border-gray-700 rounded-md"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            calendarHTML += `
                <div class="h-24 border border-gray-divider dark:border-gray-700 rounded-md p-1 overflow-y-auto">
                    <span class="font-semibold text-gray-text dark:text-gray-300">${day}</span>
                    <div class="space-y-1 mt-1">
                        ${subsByDate[day] ? subsByDate[day].map(sub => `<button data-action="edit-calendar" data-id="${sub.id}" class="w-full text-left text-xs bg-beige dark:bg-gray-700 text-gray-text dark:text-gray-200 p-1 rounded hover:bg-orange-500 dark:hover:bg-gray-600">${sub.name}</button>`).join('') : ''}
                    </div>
                </div>
            `;
        }
        
        calendarHTML += `</div></div>`;
        container.innerHTML = calendarHTML;

        document.getElementById('prev-month').addEventListener('click', () => {
            state.currentDate.setMonth(state.currentDate.getMonth() - 1);
            renderCalendar();
        });
        document.getElementById('next-month').addEventListener('click', () => {
            state.currentDate.setMonth(state.currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    function addNotification(message, type = 'info') {
        state.notifications.push({ id: Date.now(), message, type });
        renderNotifications();
    }

    function renderNotifications() {
        const list = document.getElementById('notification-list');
        const dot = document.getElementById('notification-dot');
        if (state.notifications.length > 0) {
            dot.classList.remove('hidden');
            list.innerHTML = state.notifications.map(n => `<div class="p-4 text-sm text-gray-text dark:text-gray-300">${n.message}</div>`).join('');
        } else {
            dot.classList.add('hidden');
            list.innerHTML = `<div class="p-4 text-sm text-gray-500">No new notifications</div>`;
        }
    }
    
    // --- EVENT LISTENERS ---
    window.addEventListener('hashchange', handleRouteChange);
    
    document.getElementById('theme-toggle').addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark');
        document.getElementById('theme-icon-moon').classList.toggle('hidden');
        document.getElementById('theme-icon-sun').classList.toggle('hidden');
    });
    
    document.getElementById('notification-button').addEventListener('click', () => {
        document.getElementById('notification-dropdown').classList.toggle('hidden');
    });
    
    document.getElementById('get-started-btn').addEventListener('click', () => navigate('#login'));
    document.getElementById('google-signin-btn').addEventListener('click', () => {
        state.loggedIn = true;
        navigate('#dashboard');
    });
    document.getElementById('logout-button').addEventListener('click', () => {
        state.loggedIn = false;
        navigate('#home');
    });
    document.getElementById('email-signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        state.loggedIn = true;
        navigate('#dashboard');
    });


    document.getElementById('main-content').addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;

        const action = button.dataset.action;
        const id = button.dataset.id;
        
        if (action === 'edit' || action === 'edit-calendar') {
            state.editingRowId = id;
            state.editedData = { ...state.subscriptions.find(s => s.id === id) };
            renderManageTable();
            if(action === 'edit-calendar') navigate('#manage');
        } else if (action === 'cancel') {
            state.editingRowId = null;
            state.editedData = null;
            renderManageTable();
        } else if (action === 'save') {
            const row = document.getElementById(`row-${id}`);
            const updatedSub = {
                id: id,
                name: row.querySelector('input[name="name"]').value,
                category: row.querySelector('select[name="category"]').value,
                price: parseFloat(row.querySelector('input[name="price"]').value),
                frequency: row.querySelector('select[name="frequency"]').value,
                nextDueDate: row.querySelector('input[name="nextDueDate"]').value,
                currency: state.editedData.currency,
            };
            api.updateSubscription(updatedSub).then(() => {
                state.editingRowId = null;
                state.editedData = null;
                initializeApp();
            });
        }
    });

    // --- INITIALIZATION ---
    async function initializeApp() {
        state.subscriptions = await api.getSubscriptions();
        state.smsExpenses = await api.getSmsExpenses();
        
        handleRouteChange();
        
        setTimeout(() => {
            addNotification("Reminder: You have 3 bills due this week!");
        }, 1500);
    }

    initializeApp();
});

