document.addEventListener('DOMContentLoaded', function() {
    // Clipboard detection functionality
    const clipboardToast = document.getElementById('clipboardToast');
    const clipboardPreview = document.getElementById('clipboardPreview');
    const acceptClipboard = document.getElementById('acceptClipboard');
    const rejectClipboard = document.getElementById('rejectClipboard');
    
    // Store rejected clipboard texts (max 5)
    let rejectedClipboardTexts = JSON.parse(localStorage.getItem('rejectedClipboardTexts') || '[]');
    
    // Function to check clipboard content
    async function checkClipboard() {
        try {
            // Check if clipboard API is available
            if (!navigator.clipboard || !navigator.clipboard.readText) {
                console.log('Clipboard API not available');
                return;
            }
            
            // Read clipboard content
            const clipboardText = await navigator.clipboard.readText();
            
            // Skip if empty or too long (>1000 chars)
            if (!clipboardText || clipboardText.length > 1000) {
                return;
            }
            
            // Skip if it's already in the original message field
            if (originalMessage.value === clipboardText) {
                return;
            }
            
            // Skip if it's in the rejected list
            if (rejectedClipboardTexts.includes(clipboardText)) {
                return;
            }
            
            // Show toast with preview
            const previewText = clipboardText.length > 60 
                ? clipboardText.substring(0, 57) + '...' 
                : clipboardText;
            
            clipboardPreview.textContent = `"${previewText}"`;
            clipboardToast.classList.remove('hidden');
            
            // Set timeout to hide toast after 10 seconds
            setTimeout(() => {
                if (!clipboardToast.classList.contains('hidden')) {
                    hideClipboardToast();
                }
            }, 10000);
        } catch (error) {
            console.error('Error reading clipboard:', error);
        }
    }
    
    // Function to hide clipboard toast
    function hideClipboardToast() {
        console.log('Hiding toast notification');
        // Add hiding class for animation
        clipboardToast.classList.add('hiding');
        
        // After animation completes, hide the toast
        setTimeout(() => {
            console.log('Animation complete, adding hidden class');
            clipboardToast.classList.add('hidden');
            clipboardToast.classList.remove('hiding');
            console.log('Toast hidden state:', clipboardToast.classList.contains('hidden'));
        }, 300);
    }
    
    // Accept clipboard content
    acceptClipboard.addEventListener('click', () => {
        console.log('Accept button clicked');
        hideClipboardToast();
        
        navigator.clipboard.readText()
            .then(text => {
                console.log('Clipboard text read:', text);
                originalMessage.value = text;
                
                // Open the collapsible if it's closed
                const collapsibleTrigger = document.querySelector('.collapsible-trigger');
                const collapsibleContent = collapsibleTrigger.nextElementSibling;
                
                if (!collapsibleContent.classList.contains('active')) {
                    collapsibleTrigger.click();
                }
                
                // Focus on relationship input if empty
                if (!relationshipInput.value.trim()) {
                    relationshipInput.focus();
                }
            })
            .catch(err => {
                console.error('Error reading clipboard:', err);
            });
    });
    
    // Reject clipboard content
    rejectClipboard.addEventListener('click', () => {
        console.log('Reject button clicked');
        hideClipboardToast();
        
        navigator.clipboard.readText()
            .then(text => {
                console.log('Clipboard text read for rejection:', text);
                // Add to rejected list
                if (!rejectedClipboardTexts.includes(text)) {
                    rejectedClipboardTexts.push(text);
                    
                    // Keep only the last 5 rejected texts
                    if (rejectedClipboardTexts.length > 5) {
                        rejectedClipboardTexts.shift();
                    }
                    
                    // Save to localStorage
                    localStorage.setItem('rejectedClipboardTexts', JSON.stringify(rejectedClipboardTexts));
                    console.log('Updated rejected list:', rejectedClipboardTexts);
                }
            })
            .catch(err => {
                console.error('Error reading clipboard for rejection:', err);
            });
    });
    
    // Check clipboard when page loads
    setTimeout(checkClipboard, 1000);
    
    // Check clipboard when page gets focus
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            setTimeout(checkClipboard, 500);
        }
    });
    
    window.addEventListener('focus', () => {
        setTimeout(checkClipboard, 500);
    });
    // Tone information mapping
    const tonoInfo = {
        amable: {
            descripcion: "Cordial, educado y considerado.",
            prompt: "Reescribe el mensaje de forma amable, cordial y educada.",
            ejemplo: "¡Qué gusto saber de ti! Claro, me encantaría."
        },
        respetuoso_firme: {
            descripcion: "Dices lo que piensas sin ofender.",
            prompt: "Reescribe el mensaje de forma respetuosa pero firme.",
            ejemplo: "Gracias, pero en esta ocasión no podré acompañarte."
        },
        neutro_educado: {
            descripcion: "Sin emociones fuertes, pero con buenos modales.",
            prompt: "Reescribe el mensaje de forma neutra pero educada.",
            ejemplo: "No lo sé aún. Gracias por preguntar."
        },
        amable_limites: {
            descripcion: "Cortés pero dejando claros tus límites.",
            prompt: "Reescribe el mensaje de forma amable pero dejando claros los límites.",
            ejemplo: "Gracias por pensar en mí, pero no me es posible en esta ocasión."
        },
        divertido_claro: {
            descripcion: "Tiene chispa y humor, sin perder el mensaje.",
            prompt: "Reescribe el mensaje con humor y claridad.",
            ejemplo: "Jajajaja, qué buena onda… pero paso esta vez, ¡salúdame a la prima!"
        },
        sarcástico_fino: {
            descripcion: "Ironía elegante, para quienes dominan el arte del comentario filoso.",
            prompt: "Reescribe el mensaje con sarcasmo elegante y fino.",
            ejemplo: "¡Uy, sí! Justo lo que soñé desde la primaria…"
        },
        bien_mexicano: {
            descripcion: "Con frases locales, mexicanismos y sabor auténtico.",
            prompt: "Reescribe el mensaje con frases mexicanas y sabor auténtico.",
            ejemplo: "¡Ahorita vemos! Ya sabes cómo se arma la fiesta con la prima."
        },
        tia_buena_vibra: {
            descripcion: "Positivo, dulce y sin conflictos.",
            prompt: "Reescribe el mensaje con un tono positivo, dulce y sin conflictos.",
            ejemplo: "¡Qué bonito que me invites! Si puedo, con gusto voy."
        },
        directo_sin_rodeos: {
            descripcion: "Dices lo que es, sin adornos.",
            prompt: "Reescribe el mensaje de forma directa, sin rodeos ni adornos.",
            ejemplo: "No me interesa, pero gracias."
        },
        molesto_estilo: {
            descripcion: "Te contienes, pero se nota que algo te incomodó.",
            prompt: "Reescribe el mensaje mostrando molestia pero con estilo.",
            ejemplo: "Agradezco la invitación, pero preferiría no ir."
        },
        claro_no_grosero: {
            descripcion: "Necesitas firmeza sin sonar rudo.",
            prompt: "Reescribe el mensaje de forma clara y firme, sin parecer grosero.",
            ejemplo: "La verdad prefiero no asistir, pero te deseo que todo salga increíble."
        },
        super_breve: {
            descripcion: "Una frase seca pero útil.",
            prompt: "Reescribe el mensaje de forma muy breve y directa.",
            ejemplo: "No puedo. Gracias."
        },
        tierno_vulnerable: {
            descripcion: "Habla desde el corazón. Ideal para mensajes personales o emocionales.",
            prompt: "Reescribe el mensaje con un tono tierno, emocional y sincero.",
            ejemplo: "Me cuesta decirlo, pero no me siento cómodo asistiendo. Gracias por invitar."
        },
        romantico_decente: {
            descripcion: "Ideal para ligar sin quedar mal.",
            prompt: "Reescribe el mensaje con un tono romántico pero decente.",
            ejemplo: "Me encantaría verte, tú siempre haces especiales esos momentos."
        },
        poetico_emocional: {
            descripcion: "Inspirado, como si lo escribieras en una carta.",
            prompt: "Reescribe el mensaje con un tono poético y emocional.",
            ejemplo: "Cada momento contigo sería un verso que vale la pena escribir."
        },
        reflexivo: {
            descripcion: "Tono pausado, como si lo hubieras pensado mucho.",
            prompt: "Reescribe el mensaje con un tono reflexivo y pausado.",
            ejemplo: "A veces necesitamos espacio para estar bien. Hoy prefiero no ir."
        },
        formal_oficina: {
            descripcion: "Tono corporativo, como en un email profesional.",
            prompt: "Reescribe el mensaje con un tono formal y profesional, como un correo corporativo.",
            ejemplo: "Gracias por la invitación. Por motivos de agenda no podré asistir."
        },
        politicamente_correcto: {
            descripcion: "Totalmente neutral, sin tomar posiciones fuertes.",
            prompt: "Reescribe el mensaje de forma políticamente correcta y neutral.",
            ejemplo: "Agradezco mucho el mensaje. Lo revisaré y te comento más adelante."
        }
    };

    // DOM Elements
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

    // Event Listeners
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

    // Favorite star helper functions
    function getFavorites() {
        try {
            return JSON.parse(localStorage.getItem('favoriteTones') || '[]');
        } catch (e) {
            console.error("Error parsing favorites from localStorage:", e);
            return [];
        }
    }

    function saveFavorites(favorites) {
        try {
            localStorage.setItem('favoriteTones', JSON.stringify(favorites));
        } catch (e) {
            console.error("Error saving favorites to localStorage:", e);
        }
    }

    const clearButton = document.getElementById('clearButton');
    clearButton.addEventListener('click', () => {
        userInput.value = '';
        relationshipInput.value = '';
        originalMessage.value = '';
        resultText.textContent = 'Respuesta aquí...';
        exampleBox.classList.add('hidden');

        // Reset tono a última selección guardada o "amable"
        const savedTone = localStorage.getItem('selectedTone');
        toneSelect.value = savedTone || toneSelect.options[0].value;
        localStorage.setItem('selectedTone', toneSelect.value);
        updateToneDescription();
        updateFavoriteButton();

        // Reset género al favorito o masculino
        const savedGender = localStorage.getItem('gender');
        gender = savedGender || 'masculino';
        localStorage.setItem('gender', gender);
        updateGenderUI();

        // Reset temperatura
        temperatureRange.value = 7;
        temperatureValue.textContent = '7';
    });
    
    // Initialize character counter for input
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

    // Gender toggle logic
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
    
    // Update tone description based on selected tone
    function updateToneDescription() {
        const selectedTone = toneSelect.value;
        if (tonoInfo[selectedTone]) {
            descripcionTono.childNodes[0].nodeValue = tonoInfo[selectedTone].descripcion + ' ';
            exampleBox.innerText = tonoInfo[selectedTone].ejemplo ? 'Ejemplo: ' + tonoInfo[selectedTone].ejemplo : '';
            exampleBox.classList.add('hidden');
        }
    }
    
    // Initialize tone description
    updateToneDescription();
    
    // Collapsible functionality
    function toggleCollapsible() {
        this.classList.toggle('active');
        const content = this.nextElementSibling;
        if (content.classList.contains('active')) {
            content.classList.remove('active');
            localStorage.setItem('collapsibleOpen', 'false');
        } else {
            content.classList.add('active');
            localStorage.setItem('collapsibleOpen', 'true');
        }
    }
    
    // Initialize favorite star functionality
    if (favoriteStarButton) {
        const starIcon = favoriteStarButton.querySelector('i');
        if (starIcon) {
            // Initial state
            const favorites = getFavorites();
            const currentTone = toneSelect.value;
            starIcon.className = favorites.includes(currentTone) ? 'fas fa-star' : 'far fa-star';
            
            // Click handler
            favoriteStarButton.addEventListener('click', function() {
                const selectedTone = toneSelect.value;
                let favorites = getFavorites();
                const isFavorite = favorites.includes(selectedTone);
                
                if (isFavorite) {
                    favorites = favorites.filter(t => t !== selectedTone);
                    starIcon.className = 'far fa-star';
                } else {
                    favorites.push(selectedTone);
                    starIcon.className = 'fas fa-star';
                }
                
                saveFavorites(favorites);
                updateFavoriteButton();
                
                // Visual feedback
                this.classList.add('button-pulse');
                setTimeout(() => this.classList.remove('button-pulse'), 300);
            });
            
            // Update star when tone changes
            toneSelect.addEventListener('change', () => {
                const favorites = getFavorites();
                starIcon.className = favorites.includes(toneSelect.value) ? 'fas fa-star' : 'far fa-star';
            });
        }
    }

    // Initialize favorites toggle
    const favoritesToggle = document.getElementById('favoritesToggle');
    
    function updateToneSelectVisibility() {
        const showOnlyFavorites = favoritesToggle.checked;
        const favorites = getFavorites();
        let hasVisibleOptions = false;

        // Go through each option and hide/show based on favorites
        Array.from(toneSelect.options).forEach(option => {
            const isFavorite = favorites.includes(option.value);
            option.style.display = showOnlyFavorites && !isFavorite ? 'none' : '';
            if (option.style.display !== 'none') {
                hasVisibleOptions = true;
            }
        });

        // If no options are visible in favorites mode, show a message
        if (showOnlyFavorites && !hasVisibleOptions) {
            if (!document.getElementById('no-favorites-message')) {
                const message = document.createElement('option');
                message.id = 'no-favorites-message';
                message.disabled = true;
                message.textContent = '⭐ Marca algunos tonos como favoritos';
                toneSelect.appendChild(message);
            }
        } else {
            const message = document.getElementById('no-favorites-message');
            if (message) {
                message.remove();
            }
        }

        // Save toggle state
        localStorage.setItem('showOnlyFavorites', showOnlyFavorites);
    }

    // Add event listener for favorites toggle
    favoritesToggle.addEventListener('change', updateToneSelectVisibility);

    // Load saved preferences from localStorage
    loadSavedPreferences();
    
    // Load saved preferences
    function loadSavedPreferences() {
        // Load tone preference
        const savedTone = localStorage.getItem('selectedTone');
        if (savedTone) {
            toneSelect.value = savedTone;
        }

        // Load favorites toggle state
        const showOnlyFavorites = localStorage.getItem('showOnlyFavorites') === 'true';
        favoritesToggle.checked = showOnlyFavorites;
        updateToneSelectVisibility();
        
        // Load relationship
        const savedRelationship = localStorage.getItem('relationship');
        if (savedRelationship) {
            relationshipInput.value = savedRelationship;
        }
        
        // Load original message
        const savedOriginalMessage = localStorage.getItem('originalMessage');
        if (savedOriginalMessage) {
            originalMessage.value = savedOriginalMessage;
        }
        
        // Check if collapsible sections should be open
        collapsibleTriggers.forEach(trigger => {
            const content = trigger.nextElementSibling;
            const storageKey = 'collapsibleOpen_' + trigger.textContent.trim();
            if (localStorage.getItem(storageKey) === 'true') {
                trigger.classList.add('active');
                if (content) content.classList.add('active'); // Check if content exists
            }
        });

        // Initial update for favorite star and dropdown on page load
        updateFavoriteButton();
    }
    
    // Save preferences to localStorage
    function savePreferences() {
        localStorage.setItem('selectedTone', toneSelect.value);
        localStorage.setItem('relationship', relationshipInput.value);
        localStorage.setItem('originalMessage', originalMessage.value);
    }
    
    // Update character counter for input
    function updateCharCounter() {
        const text = userInput.value;
        const length = text.length;
        const maxLength = 1000;
        
        charCounter.textContent = `${length}/${maxLength} caracteres`;
        
        // Add warning classes based on length
        charCounter.classList.remove('warning', 'error');
        if (length > maxLength * 0.8) {
            charCounter.classList.add('warning');
        }
        if (length >= maxLength) {
            charCounter.classList.add('error');
        }
    }
    
    // Speech Recognition Setup
    let recognition = null;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'es-MX';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            updateCharCounter(); // Update character counter after speech recognition
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            alert('Error al reconocer voz. Intenta de nuevo.');
        };
    } else {
        micButton.style.display = 'none';
    }
    
    // Functions
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
        
        // Get the prompt for the selected tone
        const promptText = tonoInfo[tone] ? tonoInfo[tone].prompt : "Reescribe el mensaje de forma amable y considerada.";
        
        // Save preferences
        savePreferences();
        
        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        resultText.textContent = 'Generando...';
        
        // Prepare data for the request
        const requestData = {
            message: message,
            tone: tone,
            relationship: relationship,
            originalMessage: originalMsg,
            promptText: promptText, // Add the prompt text to the request
            gender: gender, // Include gender selection
            temperature: parseFloat(temperatureRange.value) / 10, // Scale 0-10 to 0-1
            debug: true, // Enable debug mode to log API interactions
            timestamp: Date.now() // Add timestamp to prevent caching
        };
        
        // Log the request data for debugging
        console.log('Sending request to api.php with data:', requestData);
        
        // Send request to the backend with more detailed error handling
        fetch('https://api.quelodiga.com/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData),
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(30000) // 30 second timeout
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            // Get the response as text first
            return response.text();
        })
        .then(text => {
            // Log the raw response for debugging
            console.log('Raw API response:', text);
            
            // Fix malformed JSON if needed
            // The issue is that sometimes the JSON has missing commas between properties
            let fixedText = text;
            
            // Replace "success":true"response": with "success":true,"response":
            fixedText = fixedText.replace(/"success"\s*:\s*true\s*"response"\s*:/g, '"success":true,"response":');
            
            console.log('Fixed JSON:', fixedText);
            
            // Parse the fixed JSON
            try {
                return JSON.parse(fixedText);
            } catch (e) {
                console.error('JSON parse error:', e);
                throw new Error('Error al procesar la respuesta del servidor: ' + e.message);
            }
        })
        .then(data => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            
                // Display the result
                if (data.success && data.response) {
                    // Clean up the response - remove surrounding quotes if present
                    let cleanResponse = data.response;
                    if (typeof cleanResponse === 'string') {
                        cleanResponse = cleanResponse.trim();
                        // Remove surrounding quotes if present
                        if ((cleanResponse.startsWith('"') && cleanResponse.endsWith('"')) || 
                            (cleanResponse.startsWith("'") && cleanResponse.endsWith("'"))) {
                            cleanResponse = cleanResponse.substring(1, cleanResponse.length - 1);
                        }
                    }
                    
                    resultText.textContent = cleanResponse;
                    
                    // Add animation for the result container
                    resultContainer.classList.add('result-highlight');
                    setTimeout(() => {
                        resultContainer.classList.remove('result-highlight');
                    }, 500);

                    // Copiar automáticamente al portapapeles y mostrar toast
                    navigator.clipboard.writeText(cleanResponse).then(() => {
                        const copyToast = document.getElementById('copyToast');
                        if (copyToast) {
                            console.log('Mostrando toast de copia');
                            copyToast.classList.remove('hidden');
                            copyToast.classList.add('show');
                            setTimeout(() => {
                                copyToast.classList.remove('show');
                                copyToast.classList.add('hidden');
                            }, 2000);
                        } else {
                            console.log('No se encontró el toast de copia');
                        }
                    }).catch(err => {
                        console.error('Error copiando al portapapeles:', err);
                    });
            } else {
                resultText.textContent = 'Error: ' + (data.error || 'No se pudo generar una respuesta');
            }
        })
        .catch(error => {
            console.error('Fetch Error:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            
            loadingIndicator.classList.add('hidden');
            
            // Mostrar información detallada del error para depuración
            let errorMessage = 'Error al conectar con el servidor: ' + error.message;
            
            // Añadir información adicional si está disponible
            if (error.response) {
                errorMessage += ' - Respuesta: ' + JSON.stringify(error.response);
            }
            
            // Check for specific error types
            if (error.name === 'AbortError') {
                errorMessage = 'La solicitud tardó demasiado tiempo. Por favor intenta de nuevo.';
            } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet o si el servidor está en ejecución.';
            }
            
            resultText.textContent = errorMessage + '. Por favor intenta de nuevo.';
        });
    }
    
    
    function copyToClipboard() {
        const textToCopy = resultText.textContent;
        if (textToCopy && textToCopy !== 'Respuesta aquí...') {
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    // Visual feedback with animation
                    copyButton.classList.add('button-pulse');
                    const originalText = copyButton.innerHTML;
                    copyButton.innerHTML = '<i class="fas fa-check"></i> Copiado';
                    setTimeout(() => {
                        copyButton.innerHTML = originalText;
                        copyButton.classList.remove('button-pulse');
                    }, 2000);
                })
                .catch(err => {
                    console.error('Error al copiar:', err);
                    alert('No se pudo copiar el texto. Por favor, inténtalo de nuevo.');
                });
        }
    }
    
    // WhatsApp share function
    function shareToWhatsApp() {
        const textToShare = resultText.textContent;
        if (textToShare && textToShare !== 'Respuesta aquí...') {
            // Add animation for feedback
            whatsappButton.classList.add('button-pulse');
            setTimeout(() => {
                whatsappButton.classList.remove('button-pulse');
            }, 300);
            
            // Open WhatsApp with the text
            window.open(`https://wa.me/?text=${encodeURIComponent(textToShare)}`, '_blank');
        }
    }
    
    function shareMessage() {
        const textToShare = resultText.textContent;
        if (textToShare && textToShare !== 'Respuesta aquí...') {
            if (navigator.share) {
                navigator.share({
                    title: 'Mensaje de QueLoDiga.com',
                    text: textToShare
                })
                .catch(err => {
                    console.error('Error al compartir:', err);
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                const shareOptions = document.createElement('div');
                shareOptions.className = 'share-options';
                shareOptions.innerHTML = `
                    <div class="share-overlay">
                        <div class="share-modal">
                            <h4>Compartir mensaje</h4>
                            <button id="whatsappShare" class="share-option whatsapp">
                                <i class="fab fa-whatsapp"></i> WhatsApp
                            </button>
                            <button id="smsShare" class="share-option sms">
                                <i class="fas fa-sms"></i> SMS
                            </button>
                            <button id="messengerShare" class="share-option messenger">
                                <i class="fab fa-facebook-messenger"></i> Messenger
                            </button>
                            <button id="closeShareModal" class="share-option close">
                                <i class="fas fa-times"></i> Cerrar
                            </button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(shareOptions);
                
                document.getElementById('whatsappShare').addEventListener('click', () => {
                    window.open(`https://wa.me/?text=${encodeURIComponent(textToShare)}`, '_blank');
                    document.body.removeChild(shareOptions);
                });
                
                document.getElementById('smsShare').addEventListener('click', () => {
                    // SMS sharing - works on mobile devices
                    window.open(`sms:?body=${encodeURIComponent(textToShare)}`, '_blank');
                    document.body.removeChild(shareOptions);
                });
                
                document.getElementById('messengerShare').addEventListener('click', () => {
                    // Facebook Messenger sharing
                    window.open(`https://www.facebook.com/dialog/send?app_id=936619743392459&link=${encodeURIComponent(window.location.href)}&redirect_uri=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(textToShare)}`, '_blank');
                    document.body.removeChild(shareOptions);
                });
                
                document.getElementById('closeShareModal').addEventListener('click', () => {
                    document.body.removeChild(shareOptions);
                });
            }
        }
    }
    
    // Share button
    document.querySelector('.share-button').addEventListener('click', function(e) {
        e.preventDefault();
        const shareText = 'No te rompas la cabeza para escribir tus mensajes. Esta app reescribe tu intención como se lo pidas. ¡Pruébala! 👉 QueLoDiga.com';
        
        // Try to use the Web Share API if available (works great on mobile)
        if (navigator.share) {
            navigator.share({
                title: 'QueLoDiga.com',
                text: shareText,
                url: window.location.href
            }).catch(err => {
                // Fallback to WhatsApp if Web Share API fails or is cancelled
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
            });
        } else {
            // Fallback to WhatsApp on desktop
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }
    });
});

// Add styles for share modal
const shareStyles = document.createElement('style');
shareStyles.textContent = `
.share-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.share-modal {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    width: 80%;
    max-width: 300px;
}

.share-modal h4 {
    margin-top: 0;
    margin-bottom: 15px;
    text-align: center;
}

.share-option {
    display: block;
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: none;
    border-radius: 5px;
    text-align: left;
    cursor: pointer;
    font-size: 1rem;
}

.share-option.whatsapp {
    background-color: #25d366;
    color: white;
}

.share-option.sms {
    background-color: #5BC236;
    color: white;
}

.share-option.messenger {
    background-color: #0078FF;
    color: white;
}

.share-option.close {
    background-color: #f1f1f1;
    color: #333;
}

.share-option i {
    margin-right: 10px;
}
`;
document.head.appendChild(shareStyles);