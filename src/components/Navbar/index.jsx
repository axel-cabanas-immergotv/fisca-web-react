import React from 'react';
import { useAffiliate } from '../../contexts/AffiliateContext';
import logo from '../../assets/logo.svg';
import './navbar.css';

const Navbar = ({ 
    user, 
    onLogout, 
    onToggleMobileSidebar,
    showMobileToggle = true 
}) => {
    const { 
        currentAffiliate, 
        userAffiliates, 
        switchAffiliate, 
        getCurrentAffiliateName,
        isAffiliateSelected 
    } = useAffiliate();

    const handleAffiliateChange = async (affiliateId) => {
        const success = await switchAffiliate(affiliateId);
        if (success) {
            // Instead of reloading the page, trigger a context refresh
            // The context will handle updating the UI
            console.log('Affiliate switched successfully');
        } else {
            console.error('Failed to switch affiliate');
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
            <div className="container-fluid">
                {showMobileToggle && (
                    <button 
                        className="btn btn-link d-lg-none text-white me-2"
                        onClick={onToggleMobileSidebar}
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                )}
                
                <span className="navbar-brand mb-0">
                    <img src={logo} alt="Logo" className="logo-img" />
                    Immergo Producer
                </span>
                
                <div className="navbar-nav ms-auto">
                    {/* Affiliate Selector */}
                    {userAffiliates.length > 0 && (
                        <div className="nav-item dropdown me-3">
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                <i className="fas fa-globe me-1"></i>
                                {getCurrentAffiliateName()}
                            </a>
                            <ul className="dropdown-menu dropdown-menu-end">
                                {userAffiliates.map(affiliate => (
                                    <li key={affiliate.id}>
                                        <button 
                                            className={`dropdown-item ${currentAffiliate?.id === affiliate.id ? 'active' : ''}`}
                                            onClick={() => handleAffiliateChange(affiliate.id)}
                                        >
                                            <i className="fas fa-building me-2"></i>
                                            {affiliate.name}
                                            {currentAffiliate?.id === affiliate.id && (
                                                <i className="fas fa-check ms-2"></i>
                                            )}
                                        </button>
                                    </li>
                                ))}
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <a className="dropdown-item" href="/admin/affiliates">
                                        <i className="fas fa-cog me-2"></i>
                                        Manage Affiliates
                                    </a>
                                </li>
                            </ul>
                        </div>
                    )}

                    {/* Visit Site Link */}
                    <a className="nav-link me-3" href="/" target="_blank">
                        <i className="fas fa-external-link-alt me-1"></i>
                        Visit Site
                    </a>

                    {/* User Dropdown */}
                    <div className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                            <i className="fas fa-user-circle me-1"></i>
                            {user?.name || user?.email}
                        </a>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                                <a className="dropdown-item" href="#">
                                    <i className="fas fa-user me-2"></i>
                                    Profile
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="#">
                                    <i className="fas fa-cog me-2"></i>
                                    Settings
                                </a>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button className="dropdown-item" onClick={onLogout}>
                                    <i className="fas fa-sign-out-alt me-2"></i>
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 