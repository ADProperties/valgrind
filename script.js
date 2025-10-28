// --- LÓGICA DO PRELOADER ---
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
    }
});

// Espera que o DOM (a estrutura HTML) esteja pronto
document.addEventListener("DOMContentLoaded", () => {
    
    // FIX: Força o scroll para o topo assim que o site carrega
    window.scrollTo(0, 0);

    // --- INICIALIZAR AOS (ANIMATE ON SCROLL) ---
    try {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50,
        });
    } catch (error) {
        console.error("Erro ao inicializar AOS:", error); 
    }

    // --- INICIALIZAR FANCYBOX (GALERIA LIGHTBOX) ---
    try {
        Fancybox.bind("[data-fancybox]", {
            loop: true,
            Toolbar: {
                display: {
                    left: ["infobar"],
                    middle: ["zoomIn", "zoomOut", "rotateCCW", "rotateCW"],
                    right: ["slideshow", "fullscreen", "thumbs", "close"],
                },
            },
        });
    } catch (error) {
        console.error("Erro ao inicializar Fancybox:", error); 
    }

    // --- CONTROLADOR DO MENU HAMBÚRGUER (MOBILE) ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('nav-visible');
            const icon = navToggle.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('nav-visible')) {
                    navMenu.classList.remove('nav-visible');
                    const icon = navToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    } else {
         console.warn("Menu hambúrguer não encontrado/inicializado."); 
    }

    // --- CONTROLADOR DE MÚSICA AMBIENTE ---
    // REMOVIDA A TENTATIVA DE AUTOPLAY (BLOQUEADA PELOS BROWSERS)
    const musicButton = document.getElementById("music-toggle");
    const musicAudio = document.getElementById("ambient-music");
    
    if (musicButton && musicAudio) {
        const icon = musicButton.querySelector("i");
        
        musicButton.addEventListener("click", () => {
            if (musicAudio.paused) {
                musicAudio.play();
                icon.classList.replace("fa-volume-xmark", "fa-volume-high");
            } else {
                musicAudio.pause();
                icon.classList.replace("fa-volume-high", "fa-volume-xmark");
            }
        });
    } else {
         console.warn("Controlador de música não encontrado/inicializado.");
    }

    // --- CÓDIGO DO NOVO EFEITO DE CANVAS (BRASAS + FUMO) ---
    try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        document.body.appendChild(canvas);

        Object.assign(canvas.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: "3" /* <-- MUDANÇA: de "2" para "3" (para ficar acima da camada preta/gif) */
        });

        let w, h;
        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resize);
        resize();

        function desenharBrilho() {
            const grad = ctx.createRadialGradient(0, h, 0, 0, h, 400); 
            grad.addColorStop(0, "rgba(255,120,0,0.3)");
            grad.addColorStop(0.3, "rgba(255,70,0,0.18)");
            grad.addColorStop(1, "transparent");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
        }

        class Brasa {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * (w * 0.12); 
                this.y = h + Math.random() * 100;   
                this.size = 1 + Math.random() * 4;
                this.speedY = 0.6 + Math.random() * 1.2; 
                this.speedX = 0.2 + Math.random() * 0.5; 
                this.alpha = 0.5 + Math.random() * 0.5;
                this.angle = Math.random() * Math.PI * 2;
                this.color = `rgba(${200 + Math.random()*55}, ${60 + Math.random()*80}, 0, ${this.alpha})`;
                this.life = 200 + Math.random() * 100; 
                this.spark = Math.random() < 0.08; 
            }
            update() {
                this.y -= this.speedY + (this.spark ? 1.5 : 0);
                this.x += this.speedX + Math.sin(this.angle) * 0.3; 
                this.angle += 0.05;
                this.life--;
                if (this.y < -10 || this.life <= 0) this.reset(); 
            }
            draw() {
                ctx.save();
                ctx.beginPath();
                const deform = this.spark ? 0.5 : 0.8 + Math.sin(this.life * 0.1) * 0.3; 
                ctx.ellipse(this.x, this.y, this.size * deform, this.size, 0, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.spark ? "#ffd966" : this.color; 
                ctx.shadowBlur = this.spark ? 25 : 15;
                ctx.fill();
                ctx.restore();
            }
        }

        class Fumo {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * (w * 0.18); 
                this.y = h + Math.random() * 50;   
                this.size = 40 + Math.random() * 60; 
                this.speedY = 0.1 + Math.random() * 0.3; 
                this.alpha = 0.03 + Math.random() * 0.04; 
                this.angle = Math.random() * Math.PI * 2;
                this.life = 400 + Math.random() * 200; 
            }
            update() {
                this.y -= this.speedY;
                this.x += Math.sin(this.angle) * 0.5; 
                this.angle += 0.01;
                this.life--;
                if (this.y < -100 || this.life <= 0) this.reset(); 
            }
            draw() {
                ctx.save();
                const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size); 
                grad.addColorStop(0, `rgba(180,180,180,${this.alpha})`); 
                grad.addColorStop(1, "transparent"); 
                ctx.fillStyle = grad;
                ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2); 
                ctx.restore();
            }
        }

        const brasas = Array.from({ length: 120 }, () => new Brasa()); 
        const fumos = Array.from({ length: 15 }, () => new Fumo());   

        function animate() {
            ctx.clearRect(0, 0, w, h); 
            desenharBrilho();          

            for (const f of fumos) f.update(), f.draw();
            for (const b of brasas) b.update(), b.draw();

            requestAnimationFrame(animate); 
        }

        animate(); 

    } catch(error) {
        console.error("Erro ao inicializar o efeito de canvas:", error);
    }
    
    // --- ================================== ---
    // --- NOVA FUNCIONALIDADE: MODAL DE TATTOO ---
    // --- ================================== ---
    try {
        const modalOverlay = document.getElementById('tattoo-modal-overlay');
        const modal = document.getElementById('tattoo-modal');
        const openBtn = document.getElementById('open-tattoo-modal');
        const closeBtn = document.getElementById('modal-close-btn');

        if (modalOverlay && modal && openBtn && closeBtn) {
            
            const openModal = (e) => {
                e.preventDefault(); // Impede o link '#' de saltar para o topo
                modalOverlay.style.display = 'block';
            };

            const closeModal = () => {
                modalOverlay.style.display = 'none';
            };

            // Abrir o modal
            openBtn.addEventListener('click', openModal);

            // Fechar no botão 'X'
            closeBtn.addEventListener('click', closeModal);

            // Fechar ao clicar fora do modal (no overlay)
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });
        } else {
            console.warn("Elementos do modal de tattoo não foram encontrados.");
        }
    } catch (error) {
        console.error("Erro ao inicializar o modal de tattoo:", error);
    }

}); // Fim do DOMContentLoaded