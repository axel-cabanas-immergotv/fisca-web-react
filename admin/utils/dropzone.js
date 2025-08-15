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
        onSuccess: (result) => console.log('Upload success:', result),
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
             style="border: 2px dashed #ccc; border-radius: 8px; padding: 20px; text-align: center; transition: all 0.3s ease; cursor: pointer; background: #f8f9fa;">
            
            <!-- Upload Area -->
            <div class="dropzone-upload-area" id="${containerId}-upload-area">
                <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: #6c757d; margin-bottom: 10px;"></i>
                <p style="margin: 0; color: #6c757d;">
                    <strong>Drop image here</strong> or <span style="color: #007bff;">click to browse</span>
                </p>
                <small style="color: #999;">Max size: ${Math.round(config.maxFileSize / 1024 / 1024)}MB</small>
            </div>

            <!-- Preview Area -->
            <div class="dropzone-preview" id="${containerId}-preview" style="display: none; margin-top: 15px;">
                <div style="position: relative; display: inline-block;">
                    <img id="${containerId}-preview-img" 
                         style="max-width: ${config.previewWidth}px; max-height: ${config.previewHeight}px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <button type="button" 
                            class="btn btn-sm btn-danger"
                            id="${containerId}-remove-btn"
                            style="position: absolute; top: -8px; right: -8px; border-radius: 50%; width: 24px; height: 24px; padding: 0; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-times" style="font-size: 12px;"></i>
                    </button>
                </div>
                <div style="margin-top: 8px;">
                    <small id="${containerId}-filename" style="color: #6c757d;"></small>
                </div>
            </div>

            <!-- Loading Area -->
            <div class="dropzone-loading" id="${containerId}-loading" style="display: none; margin-top: 15px;">
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
    if (options.initialValue) {
        setPreview(options.initialValue, 'Current image');
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
        previewArea.style.display = 'none';
        loadingArea.style.display = 'block';
    }

    // Hide loading state
    function hideLoading() {
        loadingArea.style.display = 'none';
        uploadArea.style.display = 'block';
    }

    // Set preview image
    function setPreview(url, filename) {
        previewImg.src = url;
        filenameEl.textContent = filename;
        uploadArea.style.display = 'none';
        previewArea.style.display = 'block';
    }

    // Remove current image
    function removeImage() {
        currentFile = null;
        currentUrl = null;
        previewImg.src = '';
        filenameEl.textContent = '';
        previewArea.style.display = 'none';
        uploadArea.style.display = 'block';
        fileInput.value = '';
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