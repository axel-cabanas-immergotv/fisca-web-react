/**
 * Utility functions for affiliate management
 * This ensures consistent affiliate ID handling across the application
 */

let currentAffiliateId = null;

/**
 * Set the current affiliate ID (called from context)
 * @param {number} affiliateId - The affiliate ID to set
 */
export const setCurrentAffiliateId = (affiliateId) => {
    currentAffiliateId = affiliateId;
    // Also update localStorage for persistence
    if (affiliateId) {
        localStorage.setItem('currentAffiliateId', affiliateId.toString());
    } else {
        localStorage.removeItem('currentAffiliateId');
    }
};

/**
 * Get the current affiliate ID (used by services)
 * @returns {number|null} The current affiliate ID
 */
export const getCurrentAffiliateId = () => {
    // First try to get from memory (React context)
    if (currentAffiliateId !== null) {
        console.log('🔍 getCurrentAffiliateId: returning from memory:', currentAffiliateId);
        return currentAffiliateId;
    }
    
    // Fallback to localStorage (for initial load)
    const stored = localStorage.getItem('currentAffiliateId');
    console.log('🔍 getCurrentAffiliateId: stored in localStorage:', stored);
    if (stored) {
        const parsed = parseInt(stored);
        if (!isNaN(parsed)) {
            currentAffiliateId = parsed;
            console.log('🔍 getCurrentAffiliateId: parsed and set:', parsed);
            return parsed;
        }
    }
    
    console.log('🔍 getCurrentAffiliateId: returning null');
    return null;
};

/**
 * Clear the current affiliate ID
 */
export const clearCurrentAffiliateId = () => {
    currentAffiliateId = null;
    localStorage.removeItem('currentAffiliateId');
}; 