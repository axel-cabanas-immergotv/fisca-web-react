import { getCurrentAffiliateId } from '../utils/affiliateUtils';

/**
 * Categories Service - API Layer
 * Handles all CRUD operations for Categories entity
 * Follows standardized service interface
 */
class CategoriesService {
    constructor() {
        this.baseUrl = '/api/admin/categories';
    }

    // ============================================================================
    // REQUIRED METHODS (STANDARD INTERFACE)
    // ============================================================================

    /**
     * Helper method to make API requests with proper error handling
     * @param {string} endpoint - API endpoint 
     * @param {object} options - Request options
     * @returns {Promise<object>} API response
     */
    async makeRequest(endpoint, options = {}) {
        try {
            const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
            
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include' // Include cookies for JWT
            };

            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Categories API Error:', error);
            throw error;
        }
    }

    /**
     * Get categories list with pagination and filtering
     * @param {object} params - Query parameters
     * @returns {Promise<object>} Categories list with pagination
     */
    async get(params = {}) {
        const queryParams = new URLSearchParams();
        
        // Standard pagination params
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);
        
        // Categories-specific filters
        if (params.status) queryParams.append('status', params.status);
        if (params.parent_id) queryParams.append('parent_id', params.parent_id);
        if (params.has_children !== undefined) queryParams.append('has_children', params.has_children);

        // Add affiliate_id from current context
        const affiliateId = getCurrentAffiliateId();
        if (affiliateId) {
            queryParams.append('affiliate_id', affiliateId);
        }

        const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return await this.makeRequest(endpoint);
    }

    /**
     * Get single category by ID
     * @param {number} id - Category ID
     * @returns {Promise<object>} Category data
     */
    async getById(id) {
        const affiliateId = getCurrentAffiliateId();
        const queryParams = affiliateId ? `?affiliate_id=${affiliateId}` : '';
        return await this.makeRequest(`/${id}${queryParams}`);
    }

    /**
     * Create new category
     * @param {object} data - Category data
     * @returns {Promise<object>} Created category
     */
    async create(data) {
        // Auto-generate slug if not provided
        if (!data.slug && data.name) {
            data.slug = this.generateSlug(data.name);
        }

        // Add affiliate_id to category data
        const affiliateId = getCurrentAffiliateId();
        if (affiliateId) {
            data.affiliate_id = parseInt(affiliateId);
        }

        return await this.makeRequest('', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Update existing category
     * @param {number} id - Category ID
     * @param {object} data - Updated category data
     * @returns {Promise<object>} Updated category
     */
    async update(id, data) {
        // Add affiliate_id to category data
        const affiliateId = getCurrentAffiliateId();
        if (affiliateId) {
            data.affiliate_id = parseInt(affiliateId);
        }
        // Auto-generate slug if not provided
        if (!data.slug && data.name) {
            data.slug = this.generateSlug(data.name);
        }

        return await this.makeRequest(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * Delete category
     * @param {number} id - Category ID
     * @returns {Promise<object>} Delete confirmation
     */
    async delete(id) {
        const affiliateId = getCurrentAffiliateId();
        const queryParams = affiliateId ? `?affiliate_id=${affiliateId}` : '';
        return await this.makeRequest(`/${id}${queryParams}`, {
            method: 'DELETE'
        });
    }

    // ============================================================================
    // UTILITY METHODS (CATEGORY-SPECIFIC)
    // ============================================================================

    /**
     * Generate URL-friendly slug from title
     * @param {string} title - Category name
     * @returns {string} Generated slug
     */
    generateSlug(title) {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }

    /**
     * Validate category data before submission
     * @param {object} data - Category data to validate
     * @returns {object} Validation errors (empty if valid)
     */
    validateCategoryData(data) {
        const errors = {};

        // Required fields
        if (!data.name || data.name.trim() === '') {
            errors.name = 'Category name is required';
        }

        // Validate status
        if (data.status && !['active', 'inactive'].includes(data.status)) {
            errors.status = 'Status must be either active or inactive';
        }

        // Validate color format
        if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
            errors.color = 'Color must be a valid hex color code';
        }

        // Validate parent_id (can't be self)
        if (data.id && data.parent_id && data.id === data.parent_id) {
            errors.parent_id = 'Category cannot be its own parent';
        }

        return errors;
    }

    /**
     * Get default category data for new category creation
     * @returns {object} Default category object
     */
    getDefaultCategoryData() {
        return {
            name: '',
            slug: '',
            description: '',
            parent_id: null,
            color: '#007cba',
            icon: '',
            status: 'active'
        };
    }

    /**
     * Format category for display in table/lists
     * @param {object} category - Raw category data
     * @returns {object} Formatted category
     */
    formatCategoryForDisplay(category) {
        return {
            ...category,
            formatted_name: category.parent_name ? 
                `${category.parent_name} → ${category.name}` : 
                category.name,
            status_badge: category.status === 'active' ? 
                { text: 'Active', class: 'bg-success' } : 
                { text: 'Inactive', class: 'bg-secondary' }
        };
    }

    /**
     * Get categories formatted for parent selection dropdown
     * @param {number} excludeId - Category ID to exclude (prevent self-parent)
     * @returns {Promise<array>} Categories for parent selection
     */
    async getParentOptions(excludeId = null) {
        try {
            const response = await this.get({ status: 'active' });
            if (response.success) {
                return response.data
                    .filter(category => category.id !== excludeId)
                    .map(category => ({
                        value: category.id,
                        label: category.parent_name ? 
                            `${category.parent_name} → ${category.name}` : 
                            category.name
                    }));
            }
            return [];
        } catch (error) {
            console.error('Error loading parent options:', error);
            return [];
        }
    }

    /**
     * Check if category has children (for delete prevention)
     * @param {number} id - Category ID
     * @returns {Promise<boolean>} True if has children
     */
    async hasChildren(id) {
        try {
            const response = await this.get({ parent_id: id, limit: 1 });
            return response.success && response.data.length > 0;
        } catch (error) {
            console.error('Error checking category children:', error);
            return false;
        }
    }
}

export default new CategoriesService(); 