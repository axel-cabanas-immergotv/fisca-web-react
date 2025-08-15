/**
 * Simple Dropzone Component for Admin
 * Ultra-lightweight, vanilla JS dropzone with Alpine.js integration
 */



/**
 * Create a simple dropzone for file uploads
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Configuration options
 * @returns {Object} Dropzone interface
 */
function createSimpleDropzone(containerId, options = {}) {
    
    const defaultOptions = {
        accept: 'image/*',
        maxFiles: 1,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        onSuccess: (result) => {},
        onError: (error) => console.error('Upload error:', error),
        uploadUrl: '/api/upload/image',
        folder: 'images/stories',
        showPreview: true,
        previewWidth: 200,
        previewHeight: 200
    };

    const config = { ...defaultOptions, ...options };
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`Dropzone container not found: ${containerId}`);
        return null;
    }

    // Create dropzone HTML structure
    const dropzoneHTML = `
        <div class="simple-dropzone" 
             id="${containerId}-dropzone"
             style="border: 2px dashed #ccc; border-radius: 8px; padding: 20px; text-align: center; transition: all 0.3s ease; cursor: pointer; background: #f8f9fa; min-height: 120px; display: flex; align-items: center; justify-content: center;">
            
            <!-- Upload Area - Full width when no image -->
            <div class="dropzone-upload-area" id="${containerId}-upload-area" style="width: 100%;">
                <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: #6c757d; margin-bottom: 10px;"></i>
                <p style="margin: 0; color: #6c757d;">
                    <strong>Drop image here</strong> or <span style="color: #007bff;">click to browse</span>
                </p>
                <small style="color: #999;">Max size: ${Math.round(config.maxFileSize / 1024 / 1024)}MB</small>
            </div>

            <!-- Preview Area - Only image and remove button when image exists -->
            <div class="dropzone-preview" id="${containerId}-preview" style="display: none; width: 100%; text-align: center; visibility: hidden; height: 0; overflow: hidden;">
                <div style="position: relative; display: inline-block;">
                    <img id="${containerId}-preview-img" 
                         style="max-width: ${config.previewWidth}px; max-height: ${config.previewHeight}px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: none;">
                    <button type="button" 
                            class="btn btn-sm btn-danger"
                            id="${containerId}-remove-btn"
                            style="position: absolute; top: -8px; right: -8px; border-radius: 50%; width: 24px; height: 24px; padding: 0; display: none; align-items: center; justify-content: center; z-index: 10;">
                        <i class="fas fa-times" style="font-size: 12px;"></i>
                    </button>
                </div>
                <div style="margin-top: 8px;">
                    <small id="${containerId}-filename" style="color: #6c757d;"></small>
                </div>
            </div>

            <!-- Loading Area -->
            <div class="dropzone-loading" id="${containerId}-loading" style="display: none; width: 100%; text-align: center;">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p style="margin: 8px 0 0 0; color: #6c757d;">Uploading...</p>
            </div>
        </div>
        
        <input type="file" 
               id="${containerId}-file-input" 
               accept="${config.accept}" 
               style="display: none;">
    `;

    container.innerHTML = dropzoneHTML;

    // Get elements
    const dropzone = document.getElementById(`${containerId}-dropzone`);
    const fileInput = document.getElementById(`${containerId}-file-input`);
    const uploadArea = document.getElementById(`${containerId}-upload-area`);
    const previewArea = document.getElementById(`${containerId}-preview`);
    const previewImg = document.getElementById(`${containerId}-preview-img`);
    const loadingArea = document.getElementById(`${containerId}-loading`);
    const removeBtn = document.getElementById(`${containerId}-remove-btn`);
    const filenameEl = document.getElementById(`${containerId}-filename`);

    let currentFile = null;
    let currentUrl = null;

    // Set initial value if provided
    if (options.initialValue && options.initialValue.trim() !== '') {
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
            setPreview(options.initialValue, 'Current image');
        }, 100);
    } else {
        // Show upload area by default when no initial value
        uploadArea.style.display = 'block';
        if (previewArea) {
            previewArea.style.display = 'none';
            previewArea.style.visibility = 'hidden';
            previewArea.style.height = '0';
            previewArea.style.overflow = 'hidden';
            previewArea.classList.remove('show');
        }
    }

    // Drag and drop handlers
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#007bff';
        dropzone.style.backgroundColor = '#e3f2fd';
    });

    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#ccc';
        dropzone.style.backgroundColor = '#f8f9fa';
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#ccc';
        dropzone.style.backgroundColor = '#f8f9fa';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Click to select file
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Remove image
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeImage();
    });

    // Handle file selection
    function handleFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            config.onError('Please select an image file');
            return;
        }

        // Validate file size
        if (file.size > config.maxFileSize) {
            config.onError(`File too large. Maximum size is ${Math.round(config.maxFileSize / 1024 / 1024)}MB`);
            return;
        }

        currentFile = file;
        uploadFile(file);
    }

    // Upload file to server
    async function uploadFile(file) {
        showLoading();

        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('folder', config.folder);

            const response = await fetch(config.uploadUrl, {
                method: 'POST',
                body: formData,
                credentials: 'include' // Include cookies for JWT authentication
            });

            const result = await response.json();

            hideLoading();

            if (result.success) {
                currentUrl = result.data.url;
                setPreview(result.data.url, file.name);
                config.onSuccess(result.data);
            } else {
                config.onError(result.message || 'Upload failed');
                removeImage();
            }
        } catch (error) {
            hideLoading();
            config.onError('Network error: ' + error.message);
            removeImage();
        }
    }

    // Show loading state
    function showLoading() {
        uploadArea.style.display = 'none';
        if (previewImg) {
            previewImg.style.display = 'none';
            previewImg.classList.remove('show');
        }
        loadingArea.style.display = 'block';
    }

    // Hide loading state
    function hideLoading() {
        loadingArea.style.display = 'none';
        // Don't automatically show upload area - let setPreview handle it
    }

    // Set preview image
    function setPreview(url, filename) {
        
        if (previewImg) {
            // Ensure URL has proper protocol
            let imageUrl = url;
            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                imageUrl = 'https://' + url;
            }
            
            // Add timestamp to prevent browser cache issues
            const timestamp = new Date().getTime();
            const separator = imageUrl.includes('?') ? '&' : '?';
            imageUrl = `${imageUrl}${separator}t=${timestamp}`;
            
            // Force image to be visible
            previewImg.src = imageUrl;
            previewImg.style.display = 'block !important';
            previewImg.style.visibility = 'visible !important';
            previewImg.style.opacity = '1 !important';
            previewImg.classList.add('show');
            
            // Force inline styles to override CSS
            previewImg.setAttribute('style', `
                max-width: 100% !important;
                max-height: 120px !important;
                border-radius: 6px !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
                object-fit: cover !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                width: auto !important;
                height: auto !important;
            `);
            

            
            // Add load event listener
            previewImg.onload = () => {
                // Force image to be visible after load
                previewImg.style.display = 'block !important';
                previewImg.style.visibility = 'visible !important';
                previewImg.style.opacity = '1 !important';
            };
            
            previewImg.onerror = () => {
                console.error('Image failed to load:', imageUrl);
                // Try without https if it fails
                if (imageUrl.startsWith('https://')) {
                    const httpUrl = imageUrl.replace('https://', 'http://');
                    previewImg.src = httpUrl;
                }
            };
        } else {
            console.error('Preview img element not found');
        }
        
        if (filenameEl) {
            filenameEl.textContent = filename;
        }
        
        // Hide upload area and show preview area
        uploadArea.style.display = 'none';
        if (previewArea) {
            // Show preview area with image
            previewArea.style.display = 'block';
            previewArea.style.visibility = 'visible';
            previewArea.style.height = 'auto';
            previewArea.style.overflow = 'visible';
            previewArea.classList.add('show');
        } else {
            console.error('Preview area element not found');
        }
        
        // Show the remove button when image is loaded
        const removeBtn = document.getElementById(`${containerId}-remove-btn`);
        if (removeBtn) {
            removeBtn.style.display = 'flex';
            removeBtn.classList.add('show');
        }
        

    }

    // Remove current image
    function removeImage() {
        currentFile = null;
        currentUrl = null;
        
        if (previewImg) {
            previewImg.src = '';
            previewImg.style.display = 'none';
            previewImg.classList.remove('show');
        }
        
        if (filenameEl) {
            filenameEl.textContent = '';
        }
        
        uploadArea.style.display = 'block';
        if (previewArea) {
            previewArea.style.display = 'none';
            previewArea.style.visibility = 'hidden';
            previewArea.style.height = '0';
            previewArea.style.overflow = 'hidden';
            previewArea.classList.remove('show');
        }
        fileInput.value = '';
        
        // Hide the remove button when no image
        const removeBtn = document.getElementById(`${containerId}-remove-btn`);
        if (removeBtn) {
            removeBtn.style.display = 'none';
            removeBtn.classList.remove('show');
        }
        
        config.onSuccess(null); // Notify that image was removed
    }

    // Public interface
    return {
        getValue: () => currentUrl,
        setValue: (url, filename = 'Current image') => {
            if (url) {
                currentUrl = url;
                setPreview(url, filename);
            } else {
                removeImage();
            }
        },
        clear: removeImage,
        getFile: () => currentFile
    };
}

// Make available globally
if (typeof window !== 'undefined') {
    window.createSimpleDropzone = createSimpleDropzone;
} 