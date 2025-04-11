/**
 * clipboard-manager.js
 * 
 * Módulo único para gestionar el portapapeles en web y apps nativas (Android/iOS con Capacitor).
 * 
 * - En web: revisa el portapapeles al cargar y al volver visible.
 * - En app nativa: revisa el portapapeles solo en clic/focus del textarea.
 * - Muestra un toast si hay texto relevante.
 * - No interfiere con la UI ni con otros scripts.
 * - Totalmente comentado para fácil mantenimiento.
 */

(function() {
    console.log('[clipboard-manager] Inicializando módulo');

    // Detectar si estamos en app nativa Capacitor (Android o iOS)
    const isNativeApp = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform();

    // Obtener referencias a elementos del DOM
    const originalMessage = document.getElementById('originalMessage');
    const clipboardToast = document.getElementById('clipboardToast');
    const clipboardPreview = document.getElementById('clipboardPreview');

    /**
     * Oculta el toast del portapapeles con animación
     */
    function hideClipboardToast() {
        clipboardToast.classList.add('hiding');
        setTimeout(() => {
            clipboardToast.classList.add('hidden');
            clipboardToast.classList.remove('hiding');
        }, 300);
    }

    /**
     * Revisa el contenido del portapapeles y muestra el toast si es relevante
     */
    async function checkClipboard() {
        try {
            let clipboardText = '';

            if (isNativeApp) {
                // En app nativa, usar plugin Capacitor
                const result = await Capacitor.Plugins.Clipboard.read();
                clipboardText = result.value || '';
                console.log('[clipboard-manager] Capacitor clipboard:', clipboardText);
            } else {
                // En web, usar API estándar
                try {
                    clipboardText = await navigator.clipboard.readText();
                    console.log('[clipboard-manager] Web clipboard:', clipboardText);
                } catch (error) {
                    console.error('[clipboard-manager] Error leyendo clipboard web:', error);
                    return;
                }
            }

            // Ignorar si está vacío o es muy largo
            if (!clipboardText || clipboardText.length > 1000) return;

            // Ignorar si coincide con el contenido actual del textarea
            if (originalMessage.value === clipboardText) return;

            // Ignorar si ya fue rechazado antes
            const rejected = JSON.parse(localStorage.getItem('rejectedClipboardTexts') || '[]');
            if (rejected.includes(clipboardText)) return;

            // Mostrar preview en el toast
            const previewText = clipboardText.length > 60 ? clipboardText.substring(0, 57) + '...' : clipboardText;
            clipboardPreview.textContent = `"${previewText}"`;
            clipboardToast.classList.remove('hidden');

            // Ocultar el toast automáticamente después de 10 segundos
            setTimeout(() => {
                if (!clipboardToast.classList.contains('hidden')) {
                    hideClipboardToast();
                }
            }, 10000);
        } catch (error) {
            console.error('[clipboard-manager] Error leyendo portapapeles:', error);
        }
    }

    // --- Inicialización según plataforma ---

    if (isNativeApp) {
        console.log('[clipboard-manager] Modo APP NATIVA: solo en focus/click');

        // Revisar clipboard solo cuando el usuario interactúa con el textarea
        originalMessage.addEventListener('focus', checkClipboard);
        originalMessage.addEventListener('click', checkClipboard);

    } else {
        console.log('[clipboard-manager] Modo WEB: al cargar y al volver visible');

        // Revisar clipboard al cargar la página
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(checkClipboard, 500);
        });

        // Revisar clipboard cuando la pestaña vuelve a ser visible
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                setTimeout(checkClipboard, 500);
            }
        });

        // Revisar clipboard cuando la ventana recupera el foco
        window.addEventListener('focus', () => {
            setTimeout(checkClipboard, 500);
        });
    }

    console.log('[clipboard-manager] Módulo inicializado');
})();
