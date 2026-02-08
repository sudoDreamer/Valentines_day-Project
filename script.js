// ============================
// CREATOR PAGE JAVASCRIPT
// ============================

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const form = document.getElementById('valentineForm');
    const receiverNameInput = document.getElementById('receiverName');
    const customMessageInput = document.getElementById('customMessage');
    const imageUploadInput = document.getElementById('imageUpload');
    const uploadArea = document.getElementById('uploadArea');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImageBtn = document.getElementById('removeImage');
    const charCount = document.getElementById('charCount');
    const generateBtn = document.getElementById('generateBtn');
    const linkResult = document.getElementById('linkResult');
    const generatedLinkInput = document.getElementById('generatedLink');
    const copyBtn = document.getElementById('copyBtn');
    const createNewBtn = document.getElementById('createNewBtn');

    let uploadedImageBase64 = '';

    // ============================
    // CHARACTER COUNTER
    // ============================
    customMessageInput.addEventListener('input', () => {
        const count = customMessageInput.value.length;
        charCount.textContent = count;
        
        if (count > 450) {
            charCount.style.color = '#f5576c';
        } else {
            charCount.style.color = '#999';
        }
    });

    // ============================
    // IMAGE UPLOAD HANDLING
    // ============================
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        if (!imagePreview.style.display || imagePreview.style.display === 'none') {
            imageUploadInput.click();
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#f5576c';
        uploadArea.style.background = 'rgba(245, 87, 108, 0.1)';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e0e0e0';
        uploadArea.style.background = '';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e0e0e0';
        uploadArea.style.background = '';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    });

    // File input change
    imageUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });

    // Remove image
    removeImageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        uploadedImageBase64 = '';
        imageUploadInput.value = '';
        imagePreview.style.display = 'none';
        uploadPlaceholder.style.display = 'block';
        previewImg.src = '';
    });

    // ============================
    // IMAGE TO BASE64 CONVERSION
    // ============================
    function handleImageUpload(file) {
        // Check file size (recommend under 500KB)
        if (file.size > 500 * 1024) {
            alert('⚠️ Image is large! For best results, please use an image under 500KB.');
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Compress image if needed
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Resize if too large
                const maxDimension = 800;
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height / width) * maxDimension;
                        width = maxDimension;
                    } else {
                        width = (width / height) * maxDimension;
                        height = maxDimension;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 with compression
                uploadedImageBase64 = canvas.toDataURL('image/jpeg', 0.8);
                
                // Show preview
                previewImg.src = uploadedImageBase64;
                uploadPlaceholder.style.display = 'none';
                imagePreview.style.display = 'block';
            };
            
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }

    // ============================
    // FORM SUBMISSION
    // ============================
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const receiverName = receiverNameInput.value.trim();
        const customMessage = customMessageInput.value.trim();
        
        if (!receiverName || !customMessage) {
            alert('Please fill in all required fields!');
            return;
        }

        // Create data object
        const data = {
            n: receiverName,
            m: customMessage,
            i: uploadedImageBase64
        };

        // Encode data
        const encodedData = encodeData(data);
        
        // Generate link
        const baseURL = window.location.origin + window.location.pathname.replace('index.html', '');
        const valentineLink = `${baseURL}valentine.html?data=${encodedData}`;
        
        // Display result
        generatedLinkInput.value = valentineLink;
        linkResult.style.display = 'block';
        
        // Scroll to result
        linkResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // ============================
    // GENERATE BUTTON
    // ============================
    generateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
    });

    // ============================
    // DATA ENCODING
    // ============================
    function encodeData(data) {
        try {
            // Convert to JSON
            const jsonString = JSON.stringify(data);
            
            // Convert to Base64
            const base64 = btoa(unescape(encodeURIComponent(jsonString)));
            
            // URL encode
            return encodeURIComponent(base64);
        } catch (error) {
            console.error('Encoding error:', error);
            alert('Error creating link. Please try again.');
            return '';
        }
    }

    // ============================
    // COPY TO CLIPBOARD
    // ============================
    copyBtn.addEventListener('click', async () => {
        const link = generatedLinkInput.value;
        
        try {
            await navigator.clipboard.writeText(link);
            
            // Change button text
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied!';
            copyBtn.classList.add('copied');
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (error) {
            // Fallback for older browsers
            generatedLinkInput.select();
            document.execCommand('copy');
            
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied!';
            copyBtn.classList.add('copied');
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.classList.remove('copied');
            }, 2000);
        }
    });

    // ============================
    // CREATE NEW LINK
    // ============================
    createNewBtn.addEventListener('click', () => {
        // Reset form
        form.reset();
        uploadedImageBase64 = '';
        imagePreview.style.display = 'none';
        uploadPlaceholder.style.display = 'block';
        previewImg.src = '';
        charCount.textContent = '0';
        
        // Hide result
        linkResult.style.display = 'none';
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ============================
    // CREATE FLOATING HEARTS
    // ============================
    function createFloatingHearts() {
        const container = document.querySelector('.floating-hearts');
        if (!container) return;
        
        for (let i = 0; i < 15; i++) {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = '❤️';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDelay = Math.random() * 5 + 's';
            heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
            container.appendChild(heart);
        }
    }

    createFloatingHearts();
});