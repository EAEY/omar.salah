 // --- Constants and DOM Elements ---
 // Constants reused from lock implementation
 const LOADER_DURATION = 2500; // Matches CSS
 const NEURAL_STREAM_DENSITY = 0.4; // Adjusted density

 // Core DOM Elements (mixing from both sources as needed)
 const loader = document.getElementById('loader');
 const loaderProgressBar = document.getElementById('loader-progress-bar');
 const navbar = document.getElementById('navbar');
 const menuToggle = document.getElementById('menu-toggle-button');
 const navMenu = document.getElementById('nav-menu');
 const navLinks = navMenu ? navMenu.querySelectorAll('a.nav-link') : [];
 const neuralStreamContainer = document.getElementById('neural-stream');
 const typingElement = document.getElementById('typing-effect'); // For Home typing
 const dynamicTimeElements = document.querySelectorAll('.dynamic-timestamp'); // Corrected class from HTML
 const sections = document.querySelectorAll('section[id]'); // For general observation (your original JS)

 // Elements for locking mechanism
 const sectionWrappers = document.querySelectorAll('.section-wrapper'); // SELECTING WRAPPERS
 const commandInputs = document.querySelectorAll('.command-input');
 const unlockButtons = document.querySelectorAll('.unlock-button');

 // Elements for specific section animations/modals (from your code)
 const skillItems = document.querySelectorAll('.skill-item');
 const timelineItems = document.querySelectorAll('.timeline-item');
 const modalTriggers = document.querySelectorAll('.open-modal'); // Class from your HTML
 const modalCloseButtons = document.querySelectorAll('.modal-close');
 const modals = document.querySelectorAll('.modal');
 const form = document.getElementById('contact-form');
 const formStatus = document.getElementById('form-status');

// --- Utility Functions ---
 // Reusing utilities like debounce, getStyle etc.
 const debounce = (func, wait) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); }; };
 const getRandomChar = () => {
    const syntaxSnippets = [
        // C#
        'public', 'private', 'class', 'namespace', 'void', 'string', 'bool', 'using', 'static', 'new',

        // C++
        '#include', 'cout', 'cin', 'int', 'float', 'return', 'endl',

        // HTML
        '<div>', '<span>', '<h1>', '<a>', '<p>', '<input>', '<form>',

        // CSS
        'color:', 'font-size:', 'display:', 'flex', 'grid', 'margin:', 'padding:', 'border:', ';',

        // JavaScript
         'if', 'else', 'return', 'null', 'true', 'false'
    ];

    return syntaxSnippets[Math.floor(Math.random() * syntaxSnippets.length)];
};
 const getRandomSpeedClass = () => { const r = Math.random(); if (r < 0.2) return 'fast'; if (r < 0.6) return 'medium'; return 'slow'; };
const getStyle = (el, prop) => window.getComputedStyle(el, null).getPropertyValue(prop);
 const updateTimestamps = () => {
     dynamicTimeElements.forEach(el => {
         const format = el.dataset.format || 'ms'; // Default to milliseconds
        if (format === 'ms') el.textContent = Date.now();
         // Add other formats here if needed (e.g., ISO) from previous version
     });
 };

 // --- Loader Logic ---
const initLoader = () => {
    if (!loader || !loaderProgressBar) return;
    console.log("Initializing loader...");
    // Ensure animation starts near beginning
     requestAnimationFrame(() => {
         requestAnimationFrame(() => { // Double RAF for better chance
            loaderProgressBar.style.width = '100%';
        });
     });
    // Hide loader after duration
     setTimeout(() => {
        loader.classList.add('loaded');
         console.log("Loader hidden.");
    }, LOADER_DURATION);
 };

// --- Neural Stream Background ---
 const initNeuralStream = () => {
    if (!neuralStreamContainer || window.innerWidth < 768) { // Avoid on mobile or if element missing
        neuralStreamContainer.innerHTML = ''; // Ensure cleared if disabled
        return;
    }
    console.log("Initializing neural stream...");
     neuralStreamContainer.innerHTML = ''; // Clear previous
    const charSize = 18; // Approx size
    const columns = Math.floor(window.innerWidth / charSize);
    const rows = Math.floor(window.innerHeight / charSize);
     const count = Math.floor(columns * rows * NEURAL_STREAM_DENSITY);

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
         const char = document.createElement('span');
        char.className = `stream-char ${getRandomSpeedClass()}`;
         char.textContent = getRandomChar();
        char.style.left = `${Math.random() * 100}vw`;
         char.style.top = `${Math.random() * -80 - 20}vh`; // Start further above
        char.style.fontSize = `${0.7 + Math.random() * 0.6}rem`; // More size variation
         const delay = Math.random() * 7;
         char.style.animationDelay = `${delay}s, ${delay + Math.random()}s`;
         char.style.color = `rgba(0, 255, 127, ${0.2 + Math.random() * 0.4})`; // Variable opacity green
         char.style.setProperty('--o', 0.3 + Math.random() * 0.4);
         fragment.appendChild(char);
     }
     neuralStreamContainer.appendChild(fragment);
 };
const debouncedNeuralStream = debounce(initNeuralStream, 500);

// --- Navigation Logic ---
 const toggleNavMenu = () => {
    navMenu.classList.toggle('active');
    const icon = menuToggle?.querySelector('i');
    if (icon) { icon.classList.toggle('fa-bars'); icon.classList.toggle('fa-times'); }
     // Your body scroll lock
     document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
 };
 const closeNavMenu = () => {
    if (navMenu?.classList.contains('active')) { toggleNavMenu(); }
 };
 const handleNavScroll = () => {
    if (!navbar) return;
     const scrollY = window.pageYOffset;
     navbar.classList.toggle('scrolled', scrollY > 50);

     // Active link highlighting based on SECTION WRAPPER visibility
     let currentSectionId = 'home'; // Default
     let maxVisibleTop = -Infinity;

     sectionWrappers.forEach(wrapper => {
        const rect = wrapper.getBoundingClientRect();
        // Consider visible if top edge is within a range of the viewport top (adjusted for navbar)
        // A section is 'current' if its top edge is above ~30% viewport height but not entirely scrolled past
         const visibilityThreshold = window.innerHeight * 0.3;
         if (rect.top < visibilityThreshold && rect.bottom > visibilityThreshold) {
             const section = wrapper.querySelector('section[id]');
            if (section && rect.top > maxVisibleTop) { // Find the topmost *visible* section
                 maxVisibleTop = rect.top;
                currentSectionId = section.id;
            }
         }
     });
    // Handle home separately if near top
     if (scrollY < window.innerHeight * 0.5 && currentSectionId !== 'home' && maxVisibleTop === -Infinity) {
        currentSectionId = 'home';
     }

    navLinks.forEach(link => {
        link.classList.remove('active');
         const linkHref = link.getAttribute('href');
         if (linkHref && linkHref === `#${currentSectionId}`) {
             link.classList.add('active');
         }
     });
 };

// --- Home Typing Effect ---
 // Using your lines from previous comment
 const homeTypingLines = [ "Software Engineer", "Full-Stack Developer", "System Architect", "Seeking Challenges...", "Codex Online."];
let homeLineIndex = 0, homeCharIndex = 0, homeIsDeleting = false, homeTypingTimeout;
 const typeEffect = () => {
     if (!typingElement) return;
     clearTimeout(homeTypingTimeout);
     const currentLine = homeTypingLines[homeLineIndex];
     const speed = homeIsDeleting ? 35 : (70 + Math.random() * 30); // Adjust speeds
     let txt = currentLine.substring(0, homeCharIndex);
    typingElement.innerHTML = `${txt}<span class="cursor"></span>`;

    if (!homeIsDeleting && homeCharIndex >= currentLine.length) {
        homeIsDeleting = true;
        homeTypingTimeout = setTimeout(typeEffect, 2200); // Longer pause
    } else if (homeIsDeleting && homeCharIndex < 0) { // Use < 0 for full deletion
        homeIsDeleting = false;
         homeLineIndex = (homeLineIndex + 1) % homeTypingLines.length;
         homeTypingTimeout = setTimeout(typeEffect, 500); // Pause before next
     } else {
         homeIsDeleting ? homeCharIndex-- : homeCharIndex++;
         homeTypingTimeout = setTimeout(typeEffect, speed);
    }
};


// --- Modal Logic (Using .open-modal class) ---
const openModal = (modalId) => {
     const modal = document.getElementById(modalId);
    if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
     else { console.warn(`Modal #${modalId} not found`); }
};
 const closeModal = (modal) => {
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
 };
 const closeAllModals = () => modals.forEach(closeModal);

// --- Intersection Observer for WRAPPERS and specific internal elements ---
const observerOptions = { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }; // Trigger a bit before fully in view
const intersectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        const target = entry.target;

         if (entry.isIntersecting) {
            // General visibility for wrappers (for fade-in)
            if (target.classList.contains('section-wrapper')) {
                 target.classList.add('visible');
             }

             // Trigger internal animations *only* if the PARENT WRAPPER is UNLOCKED
             const parentWrapper = target.closest('.section-wrapper');
            const sectionIsUnlocked = parentWrapper ? parentWrapper.classList.contains('unlocked') : true; // Assume unlocked if no wrapper (e.g., home)

            if (sectionIsUnlocked) {
                 // Specific animations for elements *inside* unlocked sections
                 // --- Skills Animation (Based on your HTML/CSS using --level) ---
                 if (target.matches('.skill-item') && !target.hasAttribute('data-skill-animated')) {
                    const gaugeFill = target.querySelector('.skill-gauge-fill');
                    const level = target.dataset.skillLevel; // Get level from data attribute (0-100)
                    if (gaugeFill && level && !isNaN(level)) {
                         console.log(`Animating skill: ${target.querySelector('.skill-name').textContent} to ${level}`);
                        setTimeout(() => { // Delay slightly
                            gaugeFill.style.setProperty('--level', parseFloat(level) / 100); // Set CSS variable 0-1
                         }, 150);
                         target.setAttribute('data-skill-animated', 'true'); // Prevent re-animation
                     }
                 }
                 // --- Timeline Animation (Adding .visible class) ---
                 if (target.matches('.timeline-item') && !target.classList.contains('visible')) {
                     target.classList.add('visible');
                    console.log("Timeline item visible:", target.querySelector('h3')?.textContent.trim());
                    // observer.unobserve(target); // Optional: stop observing after reveal
                }
                // --- Add other element-specific animations here ---
            }
         } else {
            // Handle elements leaving the viewport (Optional: reset animations)
            if (target.classList.contains('section-wrapper')) {
                 target.classList.remove('visible');
            }
            if (target.matches('.timeline-item')) {
                // target.classList.remove('visible'); // Reset timeline visibility
            }
             if (target.matches('.skill-item') && target.hasAttribute('data-skill-animated')) {
                 // const gaugeFill = target.querySelector('.skill-gauge-fill');
                // if (gaugeFill) gaugeFill.style.setProperty('--level', 0); // Reset gauge
                // target.removeAttribute('data-skill-animated'); // Allow re-animation
             }
        }
    });
}, observerOptions);


 // --- Core Unlocking Logic (Reused from previous successful version) ---
 function executeCommandCheck(inputElement) {
    const wrapper = inputElement.closest('.section-wrapper');
    if (!wrapper || wrapper.classList.contains('unlocked')) return;

    const requiredCommand = wrapper.getAttribute('data-command');
    const enteredCommand = inputElement.value.trim();
     const errorMsgElement = wrapper.querySelector('.command-error-message');
    const section = wrapper.querySelector('section');
    const associatedButton = wrapper.querySelector('.unlock-button');

    inputElement.classList.remove('error');
     if (errorMsgElement) { errorMsgElement.classList.remove('show'); errorMsgElement.textContent = ''; }

     if (requiredCommand && enteredCommand.toLowerCase() === requiredCommand.toLowerCase()) {
         console.log(`[ACCESS GRANTED] Section Wrapper: ${wrapper.id}`);
         wrapper.classList.add('unlocked');

         inputElement.disabled = true; inputElement.style.opacity = '0.5';
        if (associatedButton) { associatedButton.disabled = true; associatedButton.style.opacity = '0.5'; associatedButton.style.cursor = 'default'; }
         inputElement.blur();

        // Wait for CSS unlock transition then trigger observer check manually for content anims
         const transitionSpeed = getStyle(document.documentElement, '--transition-speed') || '0.3s';
         const transitionDuration = (parseFloat(transitionSpeed) * 1.5 * 1000) * 0.9; // Delay

        setTimeout(() => {
             console.log(`Post-unlock check for animations in ${wrapper.id}`);
             // Manually trigger animation checks for elements INSIDE the now-unlocked section
             if (section) {
                const skillsToAnimate = section.querySelectorAll('.skill-item:not([data-skill-animated])');
                 skillsToAnimate.forEach(item => {
                    // Check if it's currently intersecting before triggering animation
                    const rect = item.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const gaugeFill = item.querySelector('.skill-gauge-fill');
                        const level = item.dataset.skillLevel;
                        if (gaugeFill && level && !isNaN(level)) {
                            gaugeFill.style.setProperty('--level', parseFloat(level) / 100);
                             item.setAttribute('data-skill-animated', 'true');
                        }
                    }
                 });
                const timelineItemsToAnimate = section.querySelectorAll('.timeline-item:not(.visible)');
                 timelineItemsToAnimate.forEach((item, index) => {
                     const rect = item.getBoundingClientRect();
                     if (rect.top < window.innerHeight && rect.bottom > 0) {
                        setTimeout(() => item.classList.add('visible'), index * 100); // Stagger slightly
                     }
                 });
             }
         }, transitionDuration);

     } else {
         console.warn(`[ACCESS DENIED] Wrapper: ${wrapper.id}. Req: "${requiredCommand}", Got: "${enteredCommand}"`);
         inputElement.classList.add('error');
        if (errorMsgElement) {
            const displayCmd = enteredCommand.length > 30 ? enteredCommand.substring(0, 27) + '...' : enteredCommand;
             errorMsgElement.textContent = enteredCommand ? `<!> Command Denied: ${displayCmd}` : '<!> Input Required.';
             errorMsgElement.classList.add('show');
             setTimeout(() => { errorMsgElement.classList.remove('show'); errorMsgElement.textContent = ''; }, 3500);
        }
        inputElement.select();
         setTimeout(() => inputElement.classList.remove('error'), 450);
     }
}

// --- Event Listeners for Locking Mechanism ---
 const handleCommandInputKeydown = (event) => { if (event.key === 'Enter') { event.preventDefault(); executeCommandCheck(event.target); } };
const handleUnlockButtonClick = (event) => {
     const button = event.target.closest('.unlock-button');
    const input = button?.closest('.section-lock-overlay')?.querySelector('.command-input');
     if (input) { executeCommandCheck(input); }
};

// --- Force Unlock Function (Targets wrapper) ---
const forceUnlockAndScroll = (sectionId) => {
     const wrapperId = `${sectionId}-wrapper`;
    const wrapper = document.getElementById(wrapperId);
     if (!wrapper) { console.error(`Cannot force unlock: Wrapper #${wrapperId} not found.`); return; }

     const navbarHeight = navbar ? navbar.offsetHeight : 65;
     const elementPosition = wrapper.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20;
     window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

    if (wrapper.classList.contains('unlocked')) return; // Already unlocked

    setTimeout(() => {
        const input = wrapper.querySelector('.command-input');
         const errorMsgElement = wrapper.querySelector('.command-error-message');
        const associatedButton = wrapper.querySelector('.unlock-button');
        const section = wrapper.querySelector('section'); // Get section for internal anims

         wrapper.classList.add('unlocked');
        if (input) { input.value = wrapper.getAttribute('data-command') || ''; input.disabled = true; input.style.opacity = '0.5'; input.classList.remove('error'); }
         if (associatedButton) { associatedButton.disabled = true; associatedButton.style.opacity = '0.5'; associatedButton.style.cursor = 'default'; }
         if (errorMsgElement) errorMsgElement.classList.remove('show');
         console.log(`[FORCED UNLOCK] Section Wrapper: ${wrapper.id}`);

         // Trigger internal animations (similar logic to manual unlock)
         const transitionSpeed = getStyle(document.documentElement, '--transition-speed') || '0.3s';
         const transitionDuration = (parseFloat(transitionSpeed) * 1.5 * 1000) * 0.9;
         setTimeout(() => {
             console.log(`Post-force-unlock check for animations in ${wrapper.id}`);
            if (section) {
                // Manually trigger animations inside
                section.querySelectorAll('.skill-item:not([data-skill-animated])').forEach(item => { /* ... animate skill ... */ const gaugeFill = item.querySelector('.skill-gauge-fill'); const level=item.dataset.skillLevel; if(gaugeFill && level && !isNaN(level)){ gaugeFill.style.setProperty('--level', parseFloat(level)/100); item.setAttribute('data-skill-animated', 'true');} });
                 section.querySelectorAll('.timeline-item:not(.visible)').forEach((item, index) => setTimeout(() => item.classList.add('visible'), index * 100));
             }
         }, transitionDuration);

    }, 600); // Delay after scroll start
 };


 // --- Contact Form Submission ---
const handleFormSubmit = async (event) => {
     event.preventDefault();
    if (!form || !formStatus) return;
     const formData = new FormData(form);
    formStatus.textContent = '[STATUS] Establishing Secure Link... Transmitting Data...';
     formStatus.className = ''; formStatus.style.display = 'block';
    try {
        const response = await fetch(form.action, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } });
         if (response.ok) {
            formStatus.textContent = '[SUCCESS] Transmission Complete. Uplink Closed.';
             formStatus.classList.add('success'); form.reset();
        } else {
             const data = await response.json().catch(() => ({})); // Handle non-JSON responses
            formStatus.textContent = `[ERROR] Transmission Failed (${response.status}). Check Payload/Network.`;
             if (data.errors) { formStatus.textContent = `[ERROR] ${data.errors.map(e => e.message).join(', ')}`; }
             formStatus.classList.add('error');
         }
     } catch (error) {
        console.error("Form submission error:", error);
        formStatus.textContent = '[FATAL ERROR] Comms Interface Down.';
        formStatus.classList.add('error');
    } finally {
        // setTimeout(() => { formStatus.style.display = 'none'; }, 9000); // Keep status longer?
     }
};


 // --- Event Listeners & Initializers ---
document.addEventListener('DOMContentLoaded', () => {
     initLoader();
    initNeuralStream();
    if (typingElement) typeEffect();
     handleNavScroll(); // Initial state
     updateTimestamps(); setInterval(updateTimestamps, 60000);

     // --- Observer Setup ---
     // Observe WRAPPERS for fade-in/lock state
     sectionWrappers.forEach(el => intersectionObserver.observe(el));
     // Observe specific internal elements for their animations AFTER unlock
     skillItems.forEach(el => intersectionObserver.observe(el));
     timelineItems.forEach(el => intersectionObserver.observe(el));
    // Add observers for other animated elements if needed

     // --- Navigation ---
    menuToggle?.addEventListener('click', toggleNavMenu);
     navLinks.forEach(link => {
         link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href')?.substring(1);
            if (!targetId) return;
             closeNavMenu(); // Close menu on link click
             const targetWrapper = document.getElementById(`${targetId}-wrapper`);

             // If it's a locked section wrapper, handle smooth scroll + focus
             if (targetWrapper && targetWrapper.classList.contains('section-wrapper') && !targetWrapper.classList.contains('unlocked')) {
                 e.preventDefault(); // Prevent default jump
                 const navbarHeight = navbar ? navbar.offsetHeight : 65;
                const elementPosition = targetWrapper.getBoundingClientRect().top;
                 const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20; // Adjust scroll offset
                 window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                 setTimeout(() => targetWrapper.querySelector('.command-input')?.focus({ preventScroll: true }), 650); // Focus after scroll
             } else {
                 // Allow default behavior (smooth scroll via HTML/CSS) for #home or unlocked sections
            }
         });
     });
     window.addEventListener('scroll', debounce(handleNavScroll, 50)); // Debounced scroll updates

    // --- Modals ---
     modalTriggers.forEach(trigger => trigger.addEventListener('click', () => {
        const modalId = trigger.dataset.modalId; // Use dataset
         if(modalId) openModal(modalId);
    }));
    modalCloseButtons.forEach(button => button.addEventListener('click', () => closeModal(button.closest('.modal'))));
    modals.forEach(modal => modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(modal); }));
     document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeAllModals(); });

    // --- Locking Mechanism Listeners ---
     commandInputs.forEach(input => input.addEventListener('keydown', handleCommandInputKeydown));
     unlockButtons.forEach(button => button.addEventListener('click', handleUnlockButtonClick));

     // --- Contact Form ---
    if (form) form.addEventListener('submit', handleFormSubmit);

    // --- Resize Handler ---
     window.addEventListener('resize', debouncedNeuralStream);

    console.log('Codex Neuro-Link v3.0 [Combined Interface Ready]');
});