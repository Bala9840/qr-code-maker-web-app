document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // DOM elements
    const urlInput = document.getElementById('url-input');
    const generateBtn = document.getElementById('generate-btn');
    const qrContainer = document.getElementById('qr-container');
    const sizeSlider = document.getElementById('size');
    const sizeValue = document.getElementById('size-value');
    const colorPicker = document.getElementById('color');
    const bgColorPicker = document.getElementById('bg-color');
    const errorCorrection = document.getElementById('error-correction');
    const downloadPng = document.getElementById('download-png');
    const downloadSvg = document.getElementById('download-svg');
    const downloadJpg = document.getElementById('download-jpg');

    // Current QR code data
    let currentQRCode = null;
    let currentQRCodeUrl = '';

    // Update size value display
    sizeSlider.addEventListener('input', function() {
        sizeValue.textContent = this.value;
    });

    // Generate QR code
    generateBtn.addEventListener('click', generateQRCode);

    // Also generate when pressing Enter in the URL field
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generateQRCode();
        }
    });

    // Download handlers
    downloadPng.addEventListener('click', () => downloadQRCode('png'));
    downloadSvg.addEventListener('click', () => downloadQRCode('svg'));
    downloadJpg.addEventListener('click', () => downloadQRCode('jpg'));

    function generateQRCode() {
        const url = urlInput.value.trim();
        
        if (!url) {
            showError('Please enter a URL');
            return;
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (e) {
            showError('Please enter a valid URL (include http:// or https://)');
            return;
        }

        // Clear any previous error
        clearError();

        // Show loading state
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        // Get options
        const size = parseInt(sizeSlider.value);
        const color = colorPicker.value;
        const bgColor = bgColorPicker.value;
        const errorCorrectionLevel = errorCorrection.value;

        // Clear previous QR code
        qrContainer.innerHTML = '';

        // Generate new QR code
        QRCode.toCanvas(url, {
            width: size,
            color: {
                dark: color,
                light: bgColor
            },
            errorCorrectionLevel: errorCorrectionLevel
        }, function(err, canvas) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code';

            if (err) {
                console.error(err);
                showError('Failed to generate QR code. Please try again.');
                return;
            }

            // Success - display QR code
            currentQRCode = canvas;
            currentQRCodeUrl = url;
            qrContainer.appendChild(canvas);

            // Enable download buttons
            downloadPng.disabled = false;
            downloadSvg.disabled = false;
            downloadJpg.disabled = false;
        });
    }

    function downloadQRCode(format) {
        if (!currentQRCode) return;

        const filename = `qr-code-${new Date().getTime()}.${format}`;

        if (format === 'svg') {
            // Generate SVG for download
            QRCode.toString(currentQRCodeUrl, {
                type: 'svg',
                width: parseInt(sizeSlider.value),
                color: {
                    dark: colorPicker.value,
                    light: bgColorPicker.value
                },
                errorCorrectionLevel: errorCorrection.value
            }, function(err, svg) {
                if (err) {
                    console.error(err);
                    showError('Failed to generate SVG. Please try again.');
                    return;
                }

                const blob = new Blob([svg], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                triggerDownload(url, filename);
                URL.revokeObjectURL(url);
            });
        } else {
            // For PNG/JPG we can use the canvas
            let mimeType, quality;
            
            if (format === 'png') {
                mimeType = 'image/png';
                quality = 1.0;
            } else { // jpg
                mimeType = 'image/jpeg';
                quality = 0.92;
            }

            const url = currentQRCode.toDataURL(mimeType, quality);
            triggerDownload(url, filename);
        }
    }

    function triggerDownload(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function showError(message) {
        // Remove any existing error
        clearError();

        // Create error element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorElement.style.color = 'var(--error-color)';
        errorElement.style.marginTop = '0.5rem';
        errorElement.style.fontSize = '0.9rem';

        // Insert after URL input
        urlInput.insertAdjacentElement('afterend', errorElement);

        // Focus the input field
        urlInput.focus();
    }

    function clearError() {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    }
});