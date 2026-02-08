// ============================
// CREATOR PAGE JAVASCRIPT WITH IMGUR INTEGRATION
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

    let uploadedImageUrl = ''; // Now stores URL instead of Base64

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
        uploadedImageUrl = '';
        imageUploadInput.value = '';
        imagePreview.style.display = 'none';
        uploadPlaceholder.style.display = 'block';
        uploadPlaceholder.innerHTML = `
            <div class="upload-icon">📁</div>
            <p>Click to upload or drag & drop</p>
            <small>Any size image works! Uploaded to Imgur</small>
        `;
        previewImg.src = '';
    });

    // ============================
    // IMGUR IMAGE UPLOAD
    // ============================
    async function handleImageUpload(file) {
        // Show loading state
        uploadPlaceholder.innerHTML = `
            <div class="upload-icon">⏳</div>
            <p>Uploading to Imgur...</p>
            <small>This may take a few seconds...</small>
        `;
        uploadPlaceholder.style.display = 'block';
        imagePreview.style.display = 'none';

        try {
            // Upload to Imgur
            const imgurUrl = await uploadToImgur(file);
            
            if (imgurUrl) {
                // Store only the URL (tiny!)
                uploadedImageUrl = imgurUrl;
                
                // Show preview
                previewImg.src = imgurUrl;
                uploadPlaceholder.style.display = 'none';
                imagePreview.style.display = 'block';
                
                console.log('✅ Image uploaded successfully:', imgurUrl);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            alert('❌ Image upload failed. Please try again or continue without an image.\n\nMake sure you have an internet connection.');
            
            // Reset upload area
            uploadPlaceholder.innerHTML = `
                <div class="upload-icon">📁</div>
                <p>Click to upload or drag & drop</p>
                <small>Upload failed - try again or skip</small>
            `;
            uploadPlaceholder.style.display = 'block';
            imagePreview.style.display = 'none';
            uploadedImageUrl = '';
            imageUploadInput.value = '';
        }
    }

    // ============================
    // UPLOAD TO IMGUR API
    // ============================
    async function uploadToImgur(file) {
        // Imgur Anonymous API - Free, no registration needed
        const clientId = 'f62515efe59c77d'; // Public anonymous client ID
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    // Get base64 data (remove data:image/...;base64, prefix)
                    const base64Data = e.target.result.split(',')[1];
                    
                    // Upload to Imgur
                    const response = await fetch('https://api.imgur.com/3/image', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Client-ID ${clientId}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            image: base64Data,
                            type: 'base64'
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        // Return the Imgur URL (short!)
                        resolve(data.data.link);
                    } else {
                        reject(new Error('Imgur API error: ' + (data.data?.error || 'Unknown error')));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('File read error'));
            reader.readAsDataURL(file);
        });
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

        // Create data object (now with URL instead of Base64!)
        const data = {
            n: receiverName,
            m: customMessage,
            i: uploadedImageUrl // Just a short URL!
        };

        // Encode data
        const encodedData = encodeData(data);
        
        // Generate link
        const baseURL = window.location.origin + window.location.pathname.replace('index.html', '');
        const valentineLink = `${baseURL}valentine.html?data=${encodedData}`;
        
        // Display result
        generatedLinkInput.value = valentineLink;
        linkResult.style.display = 'block';
        
        console.log('✅ Link generated! Length:', valentineLink.length, 'characters');
        
        // Scroll to result
        linkResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
        uploadedImageUrl = '';
        imagePreview.style.display = 'none';
        uploadPlaceholder.style.display = 'block';
        uploadPlaceholder.innerHTML = `
            <div class="upload-icon">📁</div>
            <p>Click to upload or drag & drop</p>
            <small>Any size image works! Uploaded to Imgur</small>
        `;
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