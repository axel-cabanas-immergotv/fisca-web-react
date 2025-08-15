import { useEffect } from 'react';

/**
 * Hook to listen for affiliate changes
 * @param {Function} callback - Function to call when affiliate changes
 * @param {Array} deps - Dependencies for the callback
 */
export const useAffiliateChange = (callback, deps = []) => {
    useEffect(() => {
        const handleAffiliateChange = (event) => {
            callback(event.detail.affiliateId);
        };

        window.addEventListener('affiliateChanged', handleAffiliateChange);

        return () => {
            window.removeEventListener('affiliateChanged', handleAffiliateChange);
        };
    }, deps);
}; 