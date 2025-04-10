const { AdMob, BannerAdSize, BannerAdPosition, Clipboard } = window.Capacitor?.Plugins || {};
let isAndroid = false;
let clipboardInitialized = false;

// Función para solicitar explícitamente permisos y activar el portapapeles
async function initializeClipboard() {
    if (clipboardInitialized) return;
    
    console.log('Inicializando el sistema de portapapeles...');
    try {
        if (Clipboard) {
            // Simulamos una interacción con el portapapeles que activará permisos en Android
            try {
                console.log('Intentando primera lectura del portapapeles para activar permisos...');
                await Clipboard.read();
                console.log('Primera lectura del portapapeles exitosa');
            } catch (e) {
                console.error('Error en primera lectura:', e);
            }
            clipboardInitialized = true;
        } else {
            console.log('Plugin Clipboard no disponible');
        }
    } catch (err) {
        console.error('Error inicializando clipboard:', err);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // Detectar si es Android
    isAndroid = window.Capacitor?.getPlatform() === 'android';
    console.log('Plataforma detectada:', isAndroid ? 'Android' : 'No Android');
    
    // Crear un overlay transparente para capturar el primer toque
    if (isAndroid) {
        const touchOverlay = document.createElement('div');
        touchOverlay.style.position = 'fixed';
        touchOverlay.style.top = '0';
        touchOverlay.style.left = '0';
        touchOverlay.style.width = '100%';
        touchOverlay.style.height = '100%';
        touchOverlay.style.zIndex = '9999';
        touchOverlay.style.backgroundColor = 'transparent';
        
        touchOverlay.addEventListener('click', async (e) => {
            console.log('Primer toque detectado, activando portapapeles');
            await initializeClipboard();
            document.body.removeChild(touchOverlay);
            setTimeout(checkClipboard, 200);
            e.stopPropagation();
        }, { once: true });
        
        document.body.appendChild(touchOverlay);
    }
    if (AdMob && AdMob.initialize) {
        await AdMob.initialize({
            requestTrackingAuthorization: true,
            initializeForTesting: true
        });

        await AdMob.showBanner({
            adId: 'ca-app-pub-3940256099942544/6300978111',
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: true
        });

        await AdMob.prepareInterstitial({
            adId: 'ca-app-pub-3940256099942544/1033173712',
            isTesting: true
        });
    }

    // Clipboard detection functionality
    const clipboardToast = document.getElementById('clipboardToast');
    const clipboardPreview = document.getElementById('clipboardPreview');
    const acceptClipboard = document.getElementById('acceptClipboard');
    const rejectClipboard = document.getElementById('rejectClipboard');
    
    let rejectedClipboardTexts = JSON.parse(localStorage.getItem('rejectedClipboardTexts') || '[]');
    
    async function checkClipboard() {
        try {
            console.log('Intentando leer el portapapeles...');
            let clipboardText = '';

            if (Clipboard && Clipboard.read) {
                console.log('Usando plugin Clipboard...');
                try {
                    const result = await Clipboard.read();
                    console.log('Resultado del plugin:', result);
                    clipboardText = result.value;
                    console.log('Texto obtenido:', clipboardText);
                } catch (err) {
                    console.error('Error del plugin Clipboard:', err);
                }
            } else if (navigator.clipboard && navigator.clipboard.readText) {
                console.log('Usando navigator.clipboard...');
                clipboardText = await navigator.clipboard.readText();
                console.log('Texto obtenido:', clipboardText);
            } else {
                console.log('Ninguna API de portapapeles disponible');
                return;
            }

            if (!clipboardText || clipboardText.length > 1000) {
                console.log('Texto no válido o demasiado largo, o vacío');
                return;
            }
            if (originalMessage.value === clipboardText) {
                console.log('El texto ya está en el campo de mensaje');
                return;
            }
            const currentResponse = resultText.textContent.trim();
            if (clipboardText.trim() === currentResponse) {
                console.log('El texto es igual a la respuesta actual');
                return;
            }
            if (rejectedClipboardTexts.includes(clipboardText)) {
                console.log('El texto fue rechazado anteriormente');
                return;
            }

            console.log('Mostrando toast con texto del portapapeles');
            const previewText = clipboardText.length > 60 ? clipboardText.substring(0, 57) + '...' : clipboardText;
            clipboardPreview.textContent = `"${previewText}"`;
            clipboardToast.classList.remove('hidden');

            setTimeout(() => {
                if (!clipboardToast.classList.contains('hidden')) {
                    hideClipboardToast();
                }
            }, 10000);
        } catch (error) {
            console.error('Error general en checkClipboard:', error);
        }
    }

    function hideClipboardToast() {
        clipboardToast.classList.add('hiding');
        setTimeout(() => {
            clipboardToast.classList.add('hidden');
            clipboardToast.classList.remove('hiding');
        }, 300);
    }

    acceptClipboard.addEventListener('click', () => {
        hideClipboardToast();
        (
            Clipboard && Clipboard.read
                ? Clipboard.read().then(({ value }) => value)
                : navigator.clipboard.readText()
        ).then(text => {
            originalMessage.value = text;
            const collapsibleTrigger = document.querySelector('.collapsible-trigger');
            const collapsibleContent = collapsibleTrigger.nextElementSibling;
            if (!collapsibleContent.classList.contains('active')) {
                collapsibleTrigger.click();
            }
            if (!relationshipInput.value.trim()) {
                relationshipInput.focus();
            }
        }).catch(err => console.error('Error reading clipboard:', err));
    });

    rejectClipboard.addEventListener('click', () => {
        hideClipboardToast();
        (
            Clipboard && Clipboard.read
                ? Clipboard.read().then(({ value }) => value)
                : navigator.clipboard.readText()
        ).then(text => {
            if (!rejectedClipboardTexts.includes(text)) {
                rejectedClipboardTexts.push(text);
                if (rejectedClipboardTexts.length > 5) rejectedClipboardTexts.shift();
                localStorage.setItem('rejectedClipboardTexts', JSON.stringify(rejectedClipboardTexts));
            }
        }).catch(err => console.error('Error reading clipboard:', err));
    });

    setTimeout(checkClipboard, 1000);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') setTimeout(checkClipboard, 500);
    });
    window.addEventListener('focus', () => setTimeout(checkClipboard, 500));
    
    // Eventos adicionales para detectar interacción en Android 10+
    document.addEventListener('click', () => setTimeout(checkClipboard, 100));
    document.addEventListener('touchstart', () => setTimeout(checkClipboard, 100));
    document.addEventListener('input', () => setTimeout(checkClipboard, 100));

    const tonoInfo = {
        amable: { descripcion: "Cordial, educado y considerado.", ejemplo: "¡Qué gusto saber de ti! Claro, me encantaría." },
        respetuoso_firme: { descripcion: "Dices lo que piensas sin ofender.", ejemplo: "Gracias, pero en esta ocasión no podré acompañarte." },
        neutro_educado: { descripcion: "Sin emociones fuertes, pero con buenos modales.", ejemplo: "No lo sé aún. Gracias por preguntar." },
        amable_limites: { descripcion: "Cortés pero dejando claros tus límites.", ejemplo: "Gracias por pensar en mí, pero no me es posible en esta ocasión." },
        divertido_claro: { descripcion: "Tiene chispa y humor, sin perder el mensaje.", ejemplo: "Jajajaja, qué buena onda… pero paso esta vez, ¡salúdame a la prima!" },
        sarcástico_fino: { descripcion: "Ironía elegante, para quienes dominan el arte del comentario filoso.", ejemplo: "¡Uy, sí! Justo lo que soñé desde la primaria…" },
        bien_mexicano: { descripcion: "Con frases locales, mexicanismos y sabor auténtico.", ejemplo: "¡Ahorita vemos! Ya sabes cómo se arma la fiesta con la prima." },
        tia_buena_vibra: { descripcion: "Positivo, dulce y sin conflictos.", ejemplo: "¡Qué bonito que me invites! Si puedo, con gusto voy." },
        directo_sin_rodeos: { descripcion: "Dices lo que es, sin adornos.", ejemplo: "No me interesa, pero gracias." },
        molesto_estilo: { descripcion: "Te contienes, pero se nota que algo te incomodó.", ejemplo: "Agradezco la invitación, pero preferiría no ir." },
        claro_no_grosero: { descripcion: "Necesitas firmeza sin sonar rudo.", ejemplo: "La verdad prefiero no asistir, pero te deseo que todo salga increíble." },
        super_breve: { descripcion: "Una frase seca pero útil.", ejemplo: "No puedo. Gracias." },
        tierno_vulnerable: { descripcion: "Habla desde el corazón. Ideal para mensajes personales o emocionales.", ejemplo: "Me cuesta decirlo, pero no me siento cómodo asistiendo. Gracias por invitar." },
        romantico_decente: { descripcion: "Ideal para ligar sin quedar mal.", ejemplo: "Me encantaría verte, tú siempre haces especiales esos momentos." },
        poetico_emocional: { descripcion: "Inspirado, como si lo escribieras en una carta.", ejemplo: "Cada momento contigo sería un verso que vale la pena escribir." },
        reflexivo: { descripcion: "Tono pausado, como si lo hubieras pensado mucho.", ejemplo: "A veces necesitamos espacio para estar bien. Hoy prefiero no ir." },
        formal_oficina: { descripcion: "Tono corporativo, como en un email profesional.", ejemplo: "Gracias por la invitación. Por motivos de agenda no podré asistir." },
        politicamente_correcto: { descripcion: "Totalmente neutral, sin tomar posiciones fuertes.", ejemplo: "Agradezco mucho el mensaje. Lo revisaré y te comento más adelante." }
    };

    const userInput = document.getElementById('userInput');
    const micButton = document.getElementById('micButton');
    const toneSelect = document.getElementById('toneSelect');
    const descripcionTono = document.getElementById('descripcion-tono');
    const generateButton = document.getElementById('generateButton');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultContainer = document.getElementById('resultContainer');
    const resultText = document.getElementById('resultText');
    const copyButton = document.getElementById('copyButton');
    const whatsappButton = document.getElementById('whatsappButton');
    const relationshipInput = document.getElementById('relationshipInput');
    const originalMessage = document.getElementById('originalMessage');
    const collapsibleTriggers = document.querySelectorAll('.collapsible-trigger');
    const favoriteStarButton = document.getElementById('favoriteStar');
    const charCounter = document.getElementById('charCounter');
    const temperatureRange = document.getElementById('temperatureRange');
    const temperatureValue = document.getElementById('temperatureValue');
    const exampleIcon = document.getElementById('example-icon');
    const exampleBox = document.getElementById('example-box');

    collapsibleTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.classList.contains('active')) {
                content.classList.remove('active');
                localStorage.setItem('collapsibleOpen_' + this.textContent.trim(), 'false');
            } else {
                content.classList.add('active');
                localStorage.setItem('collapsibleOpen_' + this.textContent.trim(), 'true');
            }
        });
    });

    generateButton.addEventListener('click', generateResponse);
    copyButton.addEventListener('click', copyToClipboard);
    whatsappButton.addEventListener('click', shareToWhatsApp);
    micButton.addEventListener('click', startSpeechRecognition);
    toneSelect.addEventListener('change', updateToneDescription);

    const saveFavoriteButton = document.getElementById('saveFavoriteButton');

    function updateFavoriteButton() {
        const favorites = JSON.parse(localStorage.getItem('favoriteTones') || '[]');
        for (const option of toneSelect.options) {
            option.textContent = option.textContent.replace(/^[✅⬜]\s*/, '');
            if (favorites.includes(option.value)) {
                option.textContent = '✅ ' + option.textContent;
            } else {
                option.textContent = '⬜ ' + option.textContent;
            }
        }
    }

    toneSelect.addEventListener('change', () => {
        updateToneDescription();
        updateFavoriteButton();
        localStorage.setItem('selectedTone', toneSelect.value);
    });

    clearButton.addEventListener('click', () => {
        userInput.value = '';
        relationshipInput.value = '';
        originalMessage.value = '';
        resultText.textContent = 'Respuesta aquí...';
        exampleBox.classList.add('hidden');

        const savedTone = localStorage.getItem('selectedTone');
        toneSelect.value = savedTone || toneSelect.options[0].value;
        localStorage.setItem('selectedTone', toneSelect.value);
        updateToneDescription();
        updateFavoriteButton();

        const savedGender = localStorage.getItem('gender');
        gender = savedGender || 'masculino';
        localStorage.setItem('gender', gender);
        updateGenderUI();

        temperatureRange.value = 7;
        temperatureValue.textContent = '7';
    });

    userInput.addEventListener('input', updateCharCounter);
    updateCharCounter();

    temperatureRange.addEventListener('input', () => {
        temperatureValue.textContent = temperatureRange.value;
    });

    exampleIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        exampleBox.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!exampleBox.contains(e.target) && !exampleIcon.contains(e.target)) {
            exampleBox.classList.add('hidden');
        }
    });

    let gender = localStorage.getItem('gender') || 'masculino';
    const genderIcons = document.querySelectorAll('.gender-icon');

    function updateGenderUI() {
        genderIcons.forEach(icon => {
            if (icon.dataset.gender === gender) {
                icon.classList.add('active');
            } else {
                icon.classList.remove('active');
            }
        });
    }

    genderIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            gender = icon.dataset.gender;
            localStorage.setItem('gender', gender);
            updateGenderUI();
        });
    });

    updateGenderUI();

    function updateToneDescription() {
        const selectedTone = toneSelect.value;
        if (tonoInfo[selectedTone]) {
            descripcionTono.childNodes[0].nodeValue = tonoInfo[selectedTone].descripcion + ' ';
            exampleBox.innerText = tonoInfo[selectedTone].ejemplo ? 'Ejemplo: ' + tonoInfo[selectedTone].ejemplo : '';
            exampleBox.classList.add('hidden');
        }
    }

    updateToneDescription();

    function updateCharCounter() {
        const text = userInput.value;
        const length = text.length;
        const maxLength = 1000;
        charCounter.textContent = `${length}/${maxLength} caracteres`;
        charCounter.classList.remove('warning', 'error');
        if (length > maxLength * 0.8) charCounter.classList.add('warning');
        if (length >= maxLength) charCounter.classList.add('error');
    }

    function copyToClipboard() {
        const textToCopy = resultText.textContent;
        if (textToCopy && textToCopy !== 'Respuesta aquí...') {
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyButton.classList.add('button-pulse');
                const originalText = copyButton.innerHTML;
                copyButton.innerHTML = '<i class="fas fa-check"></i> Copiado';
                setTimeout(() => {
                    copyButton.innerHTML = originalText;
                    copyButton.classList.remove('button-pulse');
                }, 2000);
            }).catch(err => {
                console.error('Error al copiar:', err);
                alert('No se pudo copiar el texto. Por favor, inténtalo de nuevo.');
            });
        }
    }

    function shareToWhatsApp() {
        const textToShare = resultText.textContent;
        if (textToShare && textToShare !== 'Respuesta aquí...') {
            whatsappButton.classList.add('button-pulse');
            setTimeout(() => {
                whatsappButton.classList.remove('button-pulse');
            }, 300);
            window.open(`https://wa.me/?text=${encodeURIComponent(textToShare)}`, '_blank');
        }
    }

    function startSpeechRecognition() {
        if (recognition) {
            try {
                recognition.start();
                micButton.classList.add('active');
                setTimeout(() => micButton.classList.remove('active'), 5000);
            } catch (e) {
                console.error('Speech recognition error:', e);
            }
        }
    }

    function generateResponse() {
        const message = userInput.value.trim();
        if (!message) {
            alert('Por favor escribe un mensaje primero.');
            return;
        }

        const tone = toneSelect.value;
        const relationship = relationshipInput.value.trim();
        const originalMsg = originalMessage.value.trim();

        const promptText = tonoInfo[tone]?.descripcion || "Reescribe el mensaje de forma amable y considerada.";

        const requestData = {
            message: message,
            tone: tone,
            relationship: relationship,
            originalMessage: originalMsg,
            promptText: promptText,
            gender: gender,
            temperature: parseFloat(temperatureRange.value) / 10,
            debug: true,
            timestamp: Date.now()
        };

        loadingIndicator.classList.remove('hidden');
        resultText.textContent = 'Generando...';

        fetch('https://api.quelodiga.com/api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
            signal: AbortSignal.timeout(30000)
        })
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.text();
        })
        .then(text => {
            let fixedText = text.replace(/"success"\s*:\s*true\s*"response"\s*:/g, '"success":true,"response":');
            try {
                return JSON.parse(fixedText);
            } catch (e) {
                console.error('JSON parse error:', e);
                throw new Error('Error al procesar la respuesta del servidor: ' + e.message);
            }
        })
        .then(data => {
            loadingIndicator.classList.add('hidden');
            if (data.success && data.response) {
                let cleanResponse = data.response;
                if (typeof cleanResponse === 'string') {
                    cleanResponse = cleanResponse.trim();
                    if ((cleanResponse.startsWith('"') && cleanResponse.endsWith('"')) || (cleanResponse.startsWith("'") && cleanResponse.endsWith("'"))) {
                        cleanResponse = cleanResponse.substring(1, cleanResponse.length - 1);
                    }
                }
                resultText.textContent = cleanResponse;
                resultContainer.classList.add('result-highlight');
                setTimeout(() => resultContainer.classList.remove('result-highlight'), 500);
                navigator.clipboard.writeText(cleanResponse).catch(() => {});
            } else {
                resultText.textContent = 'Error: ' + (data.error || 'No se pudo generar una respuesta');
            }
        })
        .catch(error => {
            console.error('Fetch Error:', error);
            loadingIndicator.classList.add('hidden');
            let errorMessage = 'Error al conectar con el servidor: ' + error.message;
            if (error.name === 'AbortError') {
                errorMessage = 'La solicitud tardó demasiado tiempo. Por favor intenta de nuevo.';
            } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet o si el servidor está en ejecución.';
            }
            resultText.textContent = errorMessage + '. Por favor intenta de nuevo.';
        });
    }
});
