// Система аутентификации
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUser();
        this.updateNavigation();
        this.setupEventListeners();
    }

    // Загрузка пользователя из localStorage
    loadUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                console.log('User loaded:', this.currentUser);
            }
        } catch (error) {
            console.error('Error loading user:', error);
            this.currentUser = null;
        }
    }

    // Сохранение пользователя в localStorage
    saveUser(user) {
        try {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.updateNavigation();
            console.log('User saved:', user);
        } catch (error) {
            console.error('Error saving user:', error);
        }
    }

    // Регистрация
    register(userData) {
        try {
            // Проверяем, нет ли уже пользователя с таким email
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const existingUser = users.find(user => user.email === userData.email);
            
            if (existingUser) {
                throw new Error('Пользователь с таким email уже существует');
            }

            // Создаем нового пользователя
            const newUser = {
                id: Date.now().toString(),
                username: userData.username,
                email: userData.email,
                password: userData.password,
                createdAt: new Date().toISOString(),
                playtime: 0,
                level: 1,
                achievements: ['first_blood', 'novice'],
                games: ['cyber-realm', 'legend-ancients'],
                displayName: userData.username,
                avatar: 'U'
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Автоматически входим после регистрации
            this.saveUser(newUser);
            
            return newUser;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Вход
    login(email, password) {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                throw new Error('Неверный email или пароль');
            }

            this.saveUser(user);
            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Выход
    logout() {
        try {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.updateNavigation();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Обновление навигации
    updateNavigation() {
        const guestNav = document.querySelector('.nav-auth:not(.auth-user)');
        const userNav = document.querySelector('.nav-auth.auth-user');
        const userName = document.getElementById('user-name');
        const displayUserName = document.getElementById('display-username');
        const displayEmail = document.getElementById('display-email');
        
        console.log('Updating navigation, user:', this.currentUser);
        
        if (this.currentUser && userNav && guestNav) {
            guestNav.style.display = 'none';
            userNav.style.display = 'flex';
            if (userName) {
                userName.textContent = this.currentUser.username;
            }
            if (displayUserName) {
                displayUserName.textContent = this.currentUser.displayName || this.currentUser.username;
            }
            if (displayEmail) {
                displayEmail.textContent = this.currentUser.email;
            }
        } else if (guestNav && userNav) {
            guestNav.style.display = 'flex';
            userNav.style.display = 'none';
        }
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Обработчик выхода
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Защита маршрутов
        this.protectRoutes();
    }

    // Защита маршрутов
    protectRoutes() {
        const protectedPages = ['profile.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage) && !this.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Если пользователь авторизован, перенаправляем с login/register на профиль
        if (this.isAuthenticated() && (currentPage === 'login.html' || currentPage === 'register.html')) {
            window.location.href = 'profile.html';
        }
    }

    // Проверка авторизации
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Получение текущего пользователя
    getCurrentUser() {
        return this.currentUser;
    }
}

// Вспомогательные функции
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
}

function showSuccess(message) {
    // Создаем элемент для уведомления об успехе
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Инициализация системы аутентификации
const auth = new AuthSystem();

// Обработчики форм (глобальные)
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing forms...');
    
    // Регистрация
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        console.log('Register form found');
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Register form submitted');
            
            const formData = new FormData(this);
            const userData = {
                username: formData.get('username').trim(),
                email: formData.get('email').trim(),
                password: formData.get('password')
            };
            
            const confirmPassword = formData.get('confirm-password');
            
            // Валидация
            clearErrors();
            
            let hasErrors = false;
            
            if (userData.username.length < 3) {
                showError('username-error', 'Имя пользователя должно содержать минимум 3 символа');
                hasErrors = true;
            }
            
            if (!isValidEmail(userData.email)) {
                showError('email-error', 'Введите корректный email');
                hasErrors = true;
            }
            
            if (userData.password.length < 6) {
                showError('password-error', 'Пароль должен содержать минимум 6 символов');
                hasErrors = true;
            }
            
            if (userData.password !== confirmPassword) {
                showError('confirm-password-error', 'Пароли не совпадают');
                hasErrors = true;
            }
            
            if (!hasErrors) {
                try {
                    const user = auth.register(userData);
                    console.log('Registration successful:', user);
                    showSuccess('Регистрация успешна! Перенаправляем...');
                    setTimeout(() => {
                        window.location.href = 'profile.html';
                    }, 1000);
                } catch (error) {
                    console.error('Registration failed:', error);
                    showError('email-error', error.message);
                }
            }
        });
    }

    // Вход
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('Login form found');
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            
            const formData = new FormData(this);
            const email = formData.get('email').trim();
            const password = formData.get('password');
            
            clearErrors();
            
            let hasErrors = false;
            
            if (!isValidEmail(email)) {
                showError('login-email-error', 'Введите корректный email');
                hasErrors = true;
            }
            
            if (password.length < 1) {
                showError('login-password-error', 'Введите пароль');
                hasErrors = true;
            }
            
            if (!hasErrors) {
                try {
                    const user = auth.login(email, password);
                    console.log('Login successful:', user);
                    showSuccess('Вход выполнен! Перенаправляем...');
                    setTimeout(() => {
                        window.location.href = 'profile.html';
                    }, 1000);
                } catch (error) {
                    console.error('Login failed:', error);
                    showError('login-password-error', error.message);
                }
            }
        });
    }

    // Инициализация данных профиля
    const currentUser = auth.getCurrentUser();
    if (currentUser && window.location.pathname.includes('profile.html')) {
        initializeProfileData(currentUser);
    }
});

// Инициализация данных профиля
function initializeProfileData(user) {
    console.log('Initializing profile data for:', user);
    
    // Обновляем аватар
    const avatarElement = document.getElementById('user-avatar');
    if (avatarElement) {
        avatarElement.textContent = user.avatar || user.username.charAt(0).toUpperCase();
    }
    
    // Обновляем имя пользователя
    const displayNameElement = document.getElementById('display-username');
    if (displayNameElement) {
        displayNameElement.textContent = user.displayName || user.username;
    }
    
    // Обновляем email
    const emailElement = document.getElementById('display-email');
    if (emailElement) {
        emailElement.textContent = user.email;
    }
    
    // Обновляем дату регистрации
    const memberSinceElement = document.getElementById('member-since');
    if (memberSinceElement && user.createdAt) {
        const date = new Date(user.createdAt);
        memberSinceElement.textContent = date.getFullYear();
    }
    
    // Обновляем статистику
    const playtimeElement = document.getElementById('playtime');
    if (playtimeElement) {
        playtimeElement.textContent = user.playtime ? `${user.playtime} ч` : '24 ч';
    }
    
    const achievementsCountElement = document.getElementById('achievements-count');
    if (achievementsCountElement && user.achievements) {
        achievementsCountElement.textContent = user.achievements.length;
    }
    
    const userLevelElement = document.getElementById('user-level');
    if (userLevelElement) {
        userLevelElement.textContent = user.level || '15';
    }
}

// Анимация для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .success-message {
        position: fixed;
        top: 100px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 4px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    }
`;
document.head.appendChild(style);