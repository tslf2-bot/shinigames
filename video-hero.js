// Управление видео в герой-секции
class VideoHero {
    constructor() {
        this.video = document.getElementById('heroVideo');
        this.soundToggle = document.getElementById('soundToggle');
        this.soundIcon = this.soundToggle?.querySelector('.sound-icon');
        this.isMuted = true;
        
        this.init();
    }
    
    init() {
        if (!this.video) return;
        
        this.setupEventListeners();
        this.checkVideoSupport();
        this.setupIntersectionObserver();
    }
    
    // Проверка поддержки видео
    checkVideoSupport() {
        const video = document.createElement('video');
        const canPlayMP4 = !!video.canPlayType('video/mp4');
        const canPlayWebM = !!video.canPlayType('video/webm');
        
        if (!canPlayMP4 && !canPlayWebM) {
            document.querySelector('.hero').classList.add('no-video');
        }
    }
    
    // Настройка обработчиков событий
    setupEventListeners() {
        // Управление звуком
        if (this.soundToggle) {
            this.soundToggle.addEventListener('click', () => {
                this.toggleSound();
            });
        }
        
        // Повторное воспроизведение при ошибке
        this.video.addEventListener('error', () => {
            console.error('Ошибка загрузки видео');
            document.querySelector('.hero').classList.add('no-video');
        });
        
        // Автовоспроизведение при загрузке
        this.video.addEventListener('loadeddata', () => {
            this.playVideo();
        });
        
        // Обработка приостановки видео (например, когда страница не активна)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseVideo();
            } else {
                this.playVideo();
            }
        });
    }
    
    // Наблюдатель за видимостью видео
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.playVideo();
                } else {
                    this.pauseVideo();
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(this.video);
    }
    
    // Воспроизведение видео
    playVideo() {
        if (this.video.paused) {
            this.video.play().catch(error => {
                console.log('Автовоспроизведение заблокировано:', error);
                // Показываем кнопку для ручного запуска
                this.showPlayButton();
            });
        }
    }
    
 
    
   
    
    // Показать кнопку воспроизведения если автовоспроизведение заблокировано
    showPlayButton() {
        const playButton = document.createElement('button');
        playButton.className = 'btn btn-primary play-video-btn';
        playButton.textContent = 'Воспроизвести видео';
        playButton.style.marginTop = '1rem';
        
        playButton.addEventListener('click', () => {
            this.playVideo();
            playButton.remove();
        });
        
        this.video.parentNode.appendChild(playButton);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new VideoHero();
});