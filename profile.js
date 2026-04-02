// Управление вкладками в профиле
const initProfileTabs = () => {
    const tabButtons = document.querySelectorAll('.profile-nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab') + '-tab';
            
            // Убираем активный класс у всех кнопок и контента
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Добавляем активный класс текущей кнопке и контенту
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Инициализация данных настроек
const initSettingsData = () => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;

    const settingsUsername = document.getElementById('settings-username');
    const settingsEmail = document.getElementById('settings-email');
    const settingsCreated = document.getElementById('settings-created');

    if (settingsUsername) settingsUsername.textContent = currentUser.username;
    if (settingsEmail) settingsEmail.textContent = currentUser.email;
    if (settingsCreated) settingsCreated.textContent = currentUser.createdAt || '2024';
}

// Инициализация при загрузке страницы профиля
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('profile.html')) {
        initProfileTabs();
        initSettingsData();
        
        // Проверяем авторизацию
        if (!auth.isAuthenticated()) {
            window.location.href = 'login.html';
        }
    }
});