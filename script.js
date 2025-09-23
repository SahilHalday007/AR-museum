import { penguinInfo } from './data.js';

// Application State
let appState = {
    arSceneLoaded: false,
    soundEnabled: true,
    currentInfo: 'general'
};

// DOM Elements
let loadingScreen, instructions, infoBtn, resetBtn, rotateBtn;
let infoPanel, closeBtn, infoContent, infoText, navBtns;

// Penguin sound
let penguinSound = null;
let isSoundPlaying = false;

// Initialize Application
function initApp() {
    console.log('Initializing AR Penguin Experience...');

    // Initialize penguin sound
    initializePenguinSound();

    // Initialize DOM elements
    initDOMElements();

    // Hide loading screen after delay
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            showInstructions();
        }
    }, 100);

    // Setup event listeners
    setupEventListeners();

    // Setup AR scene events
    setupAREvents();
}

function initializePenguinSound() {
    penguinSound = new Audio();
    penguinSound.src = 'assets/african_penguin_sound.mp3';
    penguinSound.preload = 'auto';
    penguinSound.volume = 0.7;
    
    penguinSound.addEventListener('canplaythrough', () => {
        console.log('Penguin sound loaded and ready');
    });
    
    penguinSound.addEventListener('error', (e) => {
        console.error('Error loading penguin sound:', e);
    });
    
    penguinSound.addEventListener('ended', () => {
        isSoundPlaying = false;
        console.log('Penguin sound finished playing');
    });
}

function initDOMElements() {
    loadingScreen = document.getElementById('loadingScreen');
    instructions = document.getElementById('instructions');
    infoBtn = document.getElementById('infoBtn');
    resetBtn = document.getElementById('resetBtn');
    rotateBtn = document.getElementById('rotateBtn');
    infoPanel = document.getElementById('infoPanel');
    closeBtn = document.getElementById('closeBtn');
    infoContent = document.getElementById('infoContent');
    infoText = document.getElementById('infoText');
    navBtns = document.querySelectorAll('.nav-btn');
}

function showInstructions() {
    if (instructions) {
        setTimeout(() => {
            instructions.style.display = 'none';
        }, 5000);
    }
}

function setupEventListeners() {
    // Info button
    if (infoBtn) {
        infoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Info button clicked');
            showInfoPanel(appState.currentInfo);
            playClickSound();
        });
    }

    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Reset button clicked');
            resetARView();
            playClickSound();
        });
    }

    // Rotate button (for 90-degree rotation)
    if (rotateBtn) {
        rotateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Rotate button clicked');
            rotatePenguin90();
            playClickSound();
        });
    }

    // Close info panel
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Close button clicked');
            hideInfoPanel();
        });
    }

    // Click outside to close panel
    if (infoPanel) {
        infoPanel.addEventListener('click', (e) => {
            if (e.target === infoPanel) {
                console.log('Clicked outside panel');
                hideInfoPanel();
            }
        });
    }

    // Info navigation buttons
    if (navBtns && navBtns.length > 0) {
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const infoType = btn.dataset.info;
                console.log('Nav button clicked:', infoType);
                showInfoPanel(infoType);
                playClickSound();

                // Update active state
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }
}

function setupAREvents() {
    const checkScene = () => {
        const scene = document.querySelector('a-scene');
        
        if (!scene) {
            console.log('Scene not ready, retrying...');
            setTimeout(checkScene, 100);
            return;
        }

        console.log('Setting up AR scene events');

        scene.addEventListener('loaded', () => {
            console.log('AR Scene loaded successfully');
            appState.arSceneLoaded = true;
            setupARInteractions();
            setupGestureEventListeners();
        });

        scene.addEventListener('arjs-video-loaded', () => {
            console.log('AR camera initialized');
        });

        scene.addEventListener('renderstart', () => {
            console.log('AR Scene render started');
            if (!appState.arSceneLoaded) {
                appState.arSceneLoaded = true;
                setupARInteractions();
                setupGestureEventListeners();
            }
        });
    };

    checkScene();
}

function setupGestureEventListeners() {
    const penguin = document.getElementById('penguin');

    console.log('Setting up gesture event listeners');

    // Listen for gesture events from the gesture-handler component
    penguin.addEventListener('grab-start', () => {
        console.log('Gesture started - grab');
    });

    penguin.addEventListener('grab-end', () => {
        console.log('Gesture ended - grab');
    });

    penguin.addEventListener('pinchstarted', () => {
        console.log('Gesture started - pinch');
    });

    penguin.addEventListener('pinchended', () => {
        console.log('Gesture ended - pinch');
    });

    penguin.addEventListener('rotatestarted', () => {
        console.log('Gesture started - rotate');
    });

    penguin.addEventListener('rotateended', () => {
        console.log('Gesture ended - rotate');
    });
}

function setupARInteractions() {
    const penguinElement = document.getElementById('penguin');
    
    if (penguinElement) {
        console.log('Setting up penguin click interaction');

        // Make penguin clickable
        penguinElement.classList.add('clickable');
        
        // Define the event handlers first
        let clickCooldown = false;

        const handlePenguinClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            if (clickCooldown) {
                console.log('Click cooldown active, ignoring click');
                return;
            }
            
            clickCooldown = true;
            console.log('Penguin clicked! Playing penguin sound...');

            playPenguinSound();

            // Bounce animation for feedback
            penguinElement.setAttribute('animation__click', {
                property: 'scale',
                to: '5.2 5.2 5.2',
                from: '5 5 5',
                dur: 200,
                dir: 'alternate',
                loop: 1,
                easing: 'easeOutQuad'
            });

            setTimeout(() => {
                clickCooldown = false;
                penguinElement.removeAttribute('animation__click');
            }, 1000);
        };

        const handlePenguinHoverEnter = () => {
            penguinElement.setAttribute('animation__hover', {
                property: 'scale',
                to: '5.1 5.1 5.1',
                dur: 150,
                easing: 'easeOutQuad'
            });
        };

        const handlePenguinHoverLeave = () => {
            penguinElement.setAttribute('animation__hover', {
                property: 'scale',
                to: '5 5 5',
                dur: 150,
                easing: 'easeOutQuad'
            });
        };

        // Remove any existing event listeners to prevent duplicates
        penguinElement.removeEventListener('click', handlePenguinClick);
        penguinElement.removeEventListener('mouseenter', handlePenguinHoverEnter);
        penguinElement.removeEventListener('mouseleave', handlePenguinHoverLeave);

        // Add event listeners
        penguinElement.addEventListener('click', handlePenguinClick, { once: false, passive: false });
        penguinElement.addEventListener('mouseenter', handlePenguinHoverEnter, { passive: true });
        penguinElement.addEventListener('mouseleave', handlePenguinHoverLeave, { passive: true });

        // Store references for cleanup
        penguinElement._clickHandler = handlePenguinClick;
        penguinElement._hoverEnterHandler = handlePenguinHoverEnter;
        penguinElement._hoverLeaveHandler = handlePenguinHoverLeave;

    } else {
        console.warn('Penguin element not found for click interaction');
        setTimeout(setupARInteractions, 500);
    }
}

function playPenguinSound() {
    if (!appState.soundEnabled || !penguinSound) {
        console.log('Sound disabled or penguin sound not available');
        return;
    }

    if (isSoundPlaying) {
        console.log('Sound already playing, ignoring request');
        return;
    }

    try {
        isSoundPlaying = true;
        
        // Stop and reset the sound
        penguinSound.pause();
        penguinSound.currentTime = 0;
        
        console.log('Playing African penguin sound...');
        
        // Play the sound
        const playPromise = penguinSound.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Penguin sound started playing successfully');
            }).catch((error) => {
                console.error('Penguin sound play failed:', error);
                isSoundPlaying = false;
                playClickSound();
            });
        }
    } catch (error) {
        console.error('Error playing penguin sound:', error);
        isSoundPlaying = false;
        playClickSound();
    }
}

function playClickSound() {
    if (!appState.soundEnabled) return;

    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);

    } catch (error) {
        console.log('Audio context error:', error);
    }
}

function showInfoPanel(infoType) {
    console.log('Showing info panel:', infoType);
    
    if (!infoPanel) {
        console.error('Info panel element not found');
        return;
    }

    const info = penguinInfo[infoType] || penguinInfo.general;
    
    if (!info) {
        console.error('Info data not found for type:', infoType);
        return;
    }

    if (infoContent) {
        const titleEl = infoContent.querySelector('h3');
        if (titleEl) {
            titleEl.textContent = info.title;
        }
    }

    if (infoText) {
        infoText.innerHTML = info.content;
    }

    infoPanel.classList.add('active');
    appState.currentInfo = infoType;

    if (navBtns) {
        navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.info === infoType);
        });
    }
}

function hideInfoPanel() {
    console.log('Hiding info panel');
    if (infoPanel) {
        infoPanel.classList.remove('active');
    }
}

function resetARView() {
    console.log('Resetting AR view');
    
    const penguinWrapper = document.getElementById('penguin-wrapper');
    const penguinElement = document.getElementById('penguin');
    
    if (penguinWrapper && penguinElement) {
        console.log('Resetting penguin position, rotation and scale');
        
        // Reset wrapper rotation and penguin properties
        penguinWrapper.setAttribute('rotation', '0 0 0');
        penguinWrapper.setAttribute('scale', '1 1 1');
        penguinElement.setAttribute('rotation', '-90 0 0');
        penguinElement.setAttribute('scale', '5 5 5');
        
        // Remove any ongoing animations
        penguinWrapper.removeAttribute('animation');
        penguinElement.removeAttribute('animation__click');
    }
}

function rotatePenguin90() {
    console.log('Rotating penguin 90 degrees');
    
    const penguinWrapper = document.getElementById('penguin-wrapper');
    
    if (penguinWrapper) {
        let currentRotation = penguinWrapper.getAttribute('rotation');
        let currentY = currentRotation.y || 0;
        
        // Calculate new rotation (add 90 degrees)
        const newY = currentY + 90;
        console.log(`Rotating from ${currentY}° to ${newY}°`);

        // Smooth rotation animation
        penguinWrapper.setAttribute('animation__rotate', {
            property: 'rotation',
            to: `0 ${newY} 0`,
            dur: 300,
            easing: 'easeInOutQuad'
        });

        setTimeout(() => {
            penguinWrapper.setAttribute('rotation', `0 ${newY} 0`);
            penguinWrapper.removeAttribute('animation__rotate');
        }, 300);
    } else {
        console.warn('Penguin wrapper not found for rotation');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Handle visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('App hidden - pausing AR');
        if (penguinSound) {
            penguinSound.pause();
            isSoundPlaying = false;
        }
    } else {
        console.log('App visible - resuming AR');
    }
});

// Error handling
window.addEventListener('error', (error) => {
    console.error('Application error:', error);
});

// Handle device orientation
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (appState.arSceneLoaded) {
            console.log('Orientation changed, resetting AR view');
            resetARView();
        }
    }, 500);
});