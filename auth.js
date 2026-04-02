
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUser();
        this.updateNavigation();
        this.setupEventListeners();
        console.log('Auth system initialized');
    }

    loadUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData && userData !== 'null') {
                this.currentUser = JSON.parse(userData);
                console.log('User loaded from storage:', this.currentUser);
            }
        } catch (error) {
            console.error('Error loading user:', error);
            this.currentUser = null;
        }
    }

    
    saveUser(user) {
        try {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log('User saved to storage:', user);
            this.updateNavigation();
        } catch (error) {
            console.error('Error saving user:', error);
        }
    }

    register(userData) {
        return new Promise((resolve, reject) => {
            try {
                
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                
                
                const existingUser = users.find(user => user.email === userData.email);
                if (existingUser) {
                    reject(new Error('Пользователь с таким email уже существует'));
                    return;
                }

               
                const newUser = {
                    id: Date.now().toString(),
                    username: userData.username,
                    email: userData.email,
                    password: userData.password, 
                    createdAt: new Date().toLocaleDateString('ru-RU'),
                    displayName: userData.username,
                    avatar: userData.username.charAt(0).toUpperCase()
                };

                
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                
               
                this.saveUser(newUser);
                resolve(newUser);
                
            } catch (error) {
                reject(error);
            }
        });
    }

   
    login(email, password) {
        return new Promise((resolve, reject) => {
            try {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const user = users.find(u => u.email === email && u.password === password);
                
                if (!user) {
                    reject(new Error('Неверный email или пароль'));
                    return;
                }

                this.saveUser(user);
                resolve(user);
                
            } catch (error) {
                reject(error);
            }
        });
    }


    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateNavigation();
        window.location.href = 'index.html';
    }

 
    updateNavigation() {
        const guestNav = document.querySelector('.nav-auth:not(.auth-user)');
        const userNav = document.querySelector('.nav-auth.auth-user');
        
        console.log('Updating navigation. User exists:', !!this.currentUser);
        
        if (this.currentUser) {
           
            if (guestNav) guestNav.style.display = 'none';
            if (userNav) {
                userNav.style.display = 'flex';
                const userNameElement = userNav.querySelector('#user-name');
                if (userNameElement) {
                    userNameElement.textContent = this.currentUser.username;
                }
            }
        } else {
            
            if (guestNav) guestNav.style.display = 'flex';
            if (userNav) userNav.style.display = 'none';
        }
    }

   
    setupEventListeners() {
        
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logout-btn') {
                e.preventDefault();
                this.logout();
            }
        });

        
        this.protectRoutes();
    }

    
    protectRoutes() {
        const currentPage = window.location.pathname.split('/').pop();
        
       
        if (currentPage === 'profile.html' && !this.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        
        if ((currentPage === 'login.html' || currentPage === 'register.html') && this.currentUser) {
            window.location.href = 'profile.html';
            return;
        }
    }

    
    getCurrentUser() {
        return this.currentUser;
    }

    
    isAuthenticated() {
        return this.currentUser !== null;
    }
}


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
    alert(message); 
}


const auth = new AuthSystem();


document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');

    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Register form submitted');

            const formData = new FormData(this);
            const userData = {
                username: formData.get('username').trim(),
                email: formData.get('email').trim(),
                password: formData.get('password')
            };
            
            const confirmPassword = formData.get('confirm-password');

            
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
                    const submitBtn = this.querySelector('button[type="submit"]');
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Регистрация...';

                    await auth.register(userData);
                    showSuccess('Регистрация успешна!');
                    window.location.href = 'profile.html';
                    
                } catch (error) {
                    showError('email-error', error.message);
                    const submitBtn = this.querySelector('button[type="submit"]');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Создать аккаунт';
                }
            }
        });
    }


    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
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

            if (!password) {
                showError('login-password-error', 'Введите пароль');
                hasErrors = true;
            }

            if (!hasErrors) {
                try {
                    const submitBtn = this.querySelector('button[type="submit"]');
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Вход...';

                    await auth.login(email, password);
                    showSuccess('Вход выполнен!');
                    window.location.href = 'profile.html';
                    
                } catch (error) {
                    showError('login-password-error', error.message);
                    const submitBtn = this.querySelector('button[type="submit"]');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Войти';
                }
            }
        });
    }

   
    if (window.location.pathname.includes('profile.html')) {
        initializeProfileData();
    }
});

function initializeProfileData() {
    const currentUser = auth.getCurrentUser();
    console.log('Initializing profile with user:', currentUser);

    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    
    const avatarElement = document.getElementById('user-avatar');
    if (avatarElement) {
        avatarElement.textContent = currentUser.avatar || currentUser.username.charAt(0).toUpperCase();
    }

    const userNameElements = document.querySelectorAll('#display-username, #user-name');
    userNameElements.forEach(element => {
        element.textContent = currentUser.username;
    });

    
    const emailElement = document.getElementById('display-email');
    if (emailElement) {
        emailElement.textContent = currentUser.email;
    }

    
    const memberSinceElement = document.getElementById('member-since');
    if (memberSinceElement) {
        memberSinceElement.textContent = currentUser.createdAt || '2024';
    }

    const welcomeElement = document.querySelector('.user-welcome');
    if (welcomeElement) {
        const userNameSpan = welcomeElement.querySelector('#user-name');
        if (userNameSpan) {
            userNameSpan.textContent = currentUser.username;
        }
    }
}