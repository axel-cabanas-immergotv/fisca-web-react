require('dotenv').config();

const { 
  User, 
  Role, 
  Permission, 
  Category, 
  Page, 
  Module,
  Affiliate 
} = require('../models');

const defaultPermissions = [
  // Users
  { name: 'users.create', display_name: 'Create Users', entity: 'users', action: 'create' },
  { name: 'users.read', display_name: 'Read Users', entity: 'users', action: 'read' },
  { name: 'users.update', display_name: 'Update Users', entity: 'users', action: 'update' },
  { name: 'users.delete', display_name: 'Delete Users', entity: 'users', action: 'delete' },
  
  // Stories
  { name: 'stories.create', display_name: 'Create Stories', entity: 'stories', action: 'create' },
  { name: 'stories.read', display_name: 'Read Stories', entity: 'stories', action: 'read' },
  { name: 'stories.update', display_name: 'Update Stories', entity: 'stories', action: 'update' },
  { name: 'stories.delete', display_name: 'Delete Stories', entity: 'stories', action: 'delete' },
  { name: 'stories.update_own', display_name: 'Update Own Stories', entity: 'stories', action: 'update_own' },
  { name: 'stories.delete_own', display_name: 'Delete Own Stories', entity: 'stories', action: 'delete_own' },
  { name: 'stories.publish', display_name: 'Publish Stories', entity: 'stories', action: 'publish' },
  
  // Pages
  { name: 'pages.create', display_name: 'Create Pages', entity: 'pages', action: 'create' },
  { name: 'pages.read', display_name: 'Read Pages', entity: 'pages', action: 'read' },
  { name: 'pages.update', display_name: 'Update Pages', entity: 'pages', action: 'update' },
  { name: 'pages.delete', display_name: 'Delete Pages', entity: 'pages', action: 'delete' },
  { name: 'pages.update_own', display_name: 'Update Own Pages', entity: 'pages', action: 'update_own' },
  { name: 'pages.delete_own', display_name: 'Delete Own Pages', entity: 'pages', action: 'delete_own' },
  
  // Categories
  { name: 'categories.create', display_name: 'Create Categories', entity: 'categories', action: 'create' },
  { name: 'categories.read', display_name: 'Read Categories', entity: 'categories', action: 'read' },
  { name: 'categories.update', display_name: 'Update Categories', entity: 'categories', action: 'update' },
  { name: 'categories.delete', display_name: 'Delete Categories', entity: 'categories', action: 'delete' },
  
  // Modules
  { name: 'modules.create', display_name: 'Create Modules', entity: 'modules', action: 'create' },
  { name: 'modules.read', display_name: 'Read Modules', entity: 'modules', action: 'read' },
  { name: 'modules.update', display_name: 'Update Modules', entity: 'modules', action: 'update' },
  { name: 'modules.delete', display_name: 'Delete Modules', entity: 'modules', action: 'delete' },
  
  // Roles
  { name: 'roles.create', display_name: 'Create Roles', entity: 'roles', action: 'create' },
  { name: 'roles.read', display_name: 'Read Roles', entity: 'roles', action: 'read' },
  { name: 'roles.update', display_name: 'Update Roles', entity: 'roles', action: 'update' },
  { name: 'roles.delete', display_name: 'Delete Roles', entity: 'roles', action: 'delete' },
  
  // Permissions
  { name: 'permissions.read', display_name: 'Read Permissions', entity: 'permissions', action: 'read' },
  
  // Menus
  { name: 'menus.create', display_name: 'Create Menus', entity: 'menus', action: 'create' },
  { name: 'menus.read', display_name: 'Read Menus', entity: 'menus', action: 'read' },
  { name: 'menus.update', display_name: 'Update Menus', entity: 'menus', action: 'update' },
  { name: 'menus.delete', display_name: 'Delete Menus', entity: 'menus', action: 'delete' },

  // Affiliates
  { name: 'affiliates.create', display_name: 'Create Affiliates', entity: 'affiliates', action: 'create' },
  { name: 'affiliates.read', display_name: 'Read Affiliates', entity: 'affiliates', action: 'read' },
  { name: 'affiliates.update', display_name: 'Update Affiliates', entity: 'affiliates', action: 'update' },
  { name: 'affiliates.delete', display_name: 'Delete Affiliates', entity: 'affiliates', action: 'delete' }
];

const defaultRoles = [
  {
    name: 'admin',
    display_name: 'Administrator',
    description: 'Full access to all features',
    is_system: true
  },
  {
    name: 'editor',
    display_name: 'Editor',
    description: 'Can create and edit content',
    is_system: true
  },
  {
    name: 'author',
    display_name: 'Author',
    description: 'Can create and edit own content',
    is_system: true
  },
  {
    name: 'viewer',
    display_name: 'Viewer',
    description: 'Read-only access',
    is_system: true
  }
];

const defaultCategories = [
  // Original categories
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Technology related articles',
    color: '#007cba',
    icon: 'fas fa-laptop'
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Business and entrepreneurship',
    color: '#28a745',
    icon: 'fas fa-briefcase'
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Lifestyle and personal development',
    color: '#e91e63',
    icon: 'fas fa-heart'
  },
  {
    name: 'Travel',
    slug: 'travel',
    description: 'Travel guides and experiences',
    color: '#ff9800',
    icon: 'fas fa-plane'
  },
  // Additional categories for pagination testing
  {
    name: 'Food & Cooking',
    slug: 'food-cooking',
    description: 'Recipes and culinary experiences',
    color: '#fd7e14',
    icon: 'fas fa-utensils'
  },
  {
    name: 'Health & Fitness',
    slug: 'health-fitness',
    description: 'Health tips and fitness guides',
    color: '#20c997',
    icon: 'fas fa-heartbeat'
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Sports news and analysis',
    color: '#17a2b8',
    icon: 'fas fa-trophy'
  },
  {
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Movies, music, and entertainment',
    color: '#6f42c1',
    icon: 'fas fa-film'
  },
  {
    name: 'Education',
    slug: 'education',
    description: 'Learning and educational content',
    color: '#007bff',
    icon: 'fas fa-graduation-cap'
  },
  {
    name: 'Science',
    slug: 'science',
    description: 'Scientific discoveries and research',
    color: '#6c757d',
    icon: 'fas fa-flask'
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    description: 'Style trends and fashion tips',
    color: '#e83e8c',
    icon: 'fas fa-tshirt'
  },
  {
    name: 'Photography',
    slug: 'photography',
    description: 'Photography tips and showcases',
    color: '#343a40',
    icon: 'fas fa-camera'
  },
  {
    name: 'Gaming',
    slug: 'gaming',
    description: 'Video games and gaming culture',
    color: '#fd7e14',
    icon: 'fas fa-gamepad'
  },
  {
    name: 'Music',
    slug: 'music',
    description: 'Music reviews and artist profiles',
    color: '#dc3545',
    icon: 'fas fa-music'
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Book reviews and literary content',
    color: '#795548',
    icon: 'fas fa-book'
  },
  {
    name: 'Art',
    slug: 'art',
    description: 'Art exhibitions and creative works',
    color: '#9c27b0',
    icon: 'fas fa-palette'
  },
  {
    name: 'History',
    slug: 'history',
    description: 'Historical events and analysis',
    color: '#8bc34a',
    icon: 'fas fa-landmark'
  },
  {
    name: 'Politics',
    slug: 'politics',
    description: 'Political news and commentary',
    color: '#607d8b',
    icon: 'fas fa-vote-yea'
  },
  {
    name: 'Environment',
    slug: 'environment',
    description: 'Environmental issues and sustainability',
    color: '#4caf50',
    icon: 'fas fa-leaf'
  },
  {
    name: 'Finance',
    slug: 'finance',
    description: 'Financial advice and market analysis',
    color: '#ff5722',
    icon: 'fas fa-chart-line'
  },
  {
    name: 'Real Estate',
    slug: 'real-estate',
    description: 'Property market and housing trends',
    color: '#795548',
    icon: 'fas fa-home'
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    description: 'Car reviews and automotive news',
    color: '#263238',
    icon: 'fas fa-car'
  },
  {
    name: 'Parenting',
    slug: 'parenting',
    description: 'Parenting tips and family advice',
    color: '#ffb74d',
    icon: 'fas fa-baby'
  },
  {
    name: 'Pets',
    slug: 'pets',
    description: 'Pet care and animal stories',
    color: '#8d6e63',
    icon: 'fas fa-paw'
  },
  {
    name: 'DIY & Crafts',
    slug: 'diy-crafts',
    description: 'Do-it-yourself projects and crafts',
    color: '#ff9800',
    icon: 'fas fa-hammer'
  },
  {
    name: 'Gardening',
    slug: 'gardening',
    description: 'Gardening tips and plant care',
    color: '#689f38',
    icon: 'fas fa-seedling'
  },
  {
    name: 'Mental Health',
    slug: 'mental-health',
    description: 'Mental wellness and self-care',
    color: '#ab47bc',
    icon: 'fas fa-brain'
  },
  {
    name: 'Technology Reviews',
    slug: 'tech-reviews',
    description: 'Product reviews and tech analysis',
    color: '#2196f3',
    icon: 'fas fa-star'
  },
  {
    name: 'Startups',
    slug: 'startups',
    description: 'Startup stories and entrepreneurship',
    color: '#e91e63',
    icon: 'fas fa-rocket'
  },
  {
    name: 'Marketing',
    slug: 'marketing',
    description: 'Marketing strategies and tips',
    color: '#ff5722',
    icon: 'fas fa-bullhorn'
  },
  {
    name: 'Design',
    slug: 'design',
    description: 'Design trends and inspiration',
    color: '#9c27b0',
    icon: 'fas fa-paint-brush'
  },
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Web development tutorials and tips',
    color: '#4caf50',
    icon: 'fas fa-code'
  },
  {
    name: 'Mobile Apps',
    slug: 'mobile-apps',
    description: 'Mobile app reviews and development',
    color: '#03a9f4',
    icon: 'fas fa-mobile-alt'
  },
  {
    name: 'AI & Machine Learning',
    slug: 'ai-machine-learning',
    description: 'Artificial intelligence and ML topics',
    color: '#673ab7',
    icon: 'fas fa-robot'
  },
  {
    name: 'Cryptocurrency',
    slug: 'cryptocurrency',
    description: 'Crypto news and blockchain technology',
    color: '#ffc107',
    icon: 'fas fa-coins'
  },
  {
    name: 'Social Media',
    slug: 'social-media',
    description: 'Social media trends and strategies',
    color: '#2196f3',
    icon: 'fas fa-share-alt'
  },
  {
    name: 'Productivity',
    slug: 'productivity',
    description: 'Productivity tips and tools',
    color: '#4caf50',
    icon: 'fas fa-clock'
  },
  {
    name: 'Career',
    slug: 'career',
    description: 'Career advice and professional development',
    color: '#607d8b',
    icon: 'fas fa-user-tie'
  },
  {
    name: 'Relationships',
    slug: 'relationships',
    description: 'Relationship advice and dating tips',
    color: '#e91e63',
    icon: 'fas fa-heart'
  },
  {
    name: 'Personal Finance',
    slug: 'personal-finance',
    description: 'Personal money management tips',
    color: '#4caf50',
    icon: 'fas fa-piggy-bank'
  },
  {
    name: 'Leadership',
    slug: 'leadership',
    description: 'Leadership skills and management',
    color: '#ff5722',
    icon: 'fas fa-users'
  },
  {
    name: 'Innovation',
    slug: 'innovation',
    description: 'Innovation trends and breakthrough ideas',
    color: '#9c27b0',
    icon: 'fas fa-lightbulb'
  },
  {
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Security tips and cyber threats',
    color: '#f44336',
    icon: 'fas fa-shield-alt'
  },
  {
    name: 'Data Science',
    slug: 'data-science',
    description: 'Data analysis and statistics',
    color: '#2196f3',
    icon: 'fas fa-chart-bar'
  },
  {
    name: 'Cloud Computing',
    slug: 'cloud-computing',
    description: 'Cloud services and infrastructure',
    color: '#00bcd4',
    icon: 'fas fa-cloud'
  },
  {
    name: 'Internet of Things',
    slug: 'iot',
    description: 'IoT devices and smart technology',
    color: '#795548',
    icon: 'fas fa-wifi'
  },
  {
    name: 'Virtual Reality',
    slug: 'virtual-reality',
    description: 'VR technology and experiences',
    color: '#9c27b0',
    icon: 'fas fa-vr-cardboard'
  },
  {
    name: 'Augmented Reality',
    slug: 'augmented-reality',
    description: 'AR applications and technology',
    color: '#ff9800',
    icon: 'fas fa-eye'
  },
  {
    name: 'Biotech',
    slug: 'biotech',
    description: 'Biotechnology and medical advances',
    color: '#4caf50',
    icon: 'fas fa-dna'
  },
  {
    name: 'Space',
    slug: 'space',
    description: 'Space exploration and astronomy',
    color: '#3f51b5',
    icon: 'fas fa-space-shuttle'
  },
  {
    name: 'Climate Change',
    slug: 'climate-change',
    description: 'Climate science and environmental impact',
    color: '#2e7d32',
    icon: 'fas fa-globe-americas'
  },
  {
    name: 'Renewable Energy',
    slug: 'renewable-energy',
    description: 'Clean energy and sustainability',
    color: '#8bc34a',
    icon: 'fas fa-solar-panel'
  },
  {
    name: 'Urban Planning',
    slug: 'urban-planning',
    description: 'City development and architecture',
    color: '#607d8b',
    icon: 'fas fa-city'
  },
  {
    name: 'Agriculture',
    slug: 'agriculture',
    description: 'Farming and agricultural technology',
    color: '#8bc34a',
    icon: 'fas fa-tractor'
  },
  {
    name: 'Medicine',
    slug: 'medicine',
    description: 'Medical research and healthcare',
    color: '#f44336',
    icon: 'fas fa-stethoscope'
  },
  {
    name: 'Psychology',
    slug: 'psychology',
    description: 'Psychology insights and mental health',
    color: '#9c27b0',
    icon: 'fas fa-brain'
  },
  {
    name: 'Philosophy',
    slug: 'philosophy',
    description: 'Philosophical thoughts and discussions',
    color: '#795548',
    icon: 'fas fa-thinking-face'
  },
  {
    name: 'Languages',
    slug: 'languages',
    description: 'Language learning and linguistics',
    color: '#ff9800',
    icon: 'fas fa-language'
  },
  {
    name: 'Culture',
    slug: 'culture',
    description: 'Cultural insights and traditions',
    color: '#e91e63',
    icon: 'fas fa-globe'
  },
  {
    name: 'Religion',
    slug: 'religion',
    description: 'Religious topics and spirituality',
    color: '#ffc107',
    icon: 'fas fa-pray'
  },
  {
    name: 'Adventure',
    slug: 'adventure',
    description: 'Adventure stories and extreme sports',
    color: '#ff5722',
    icon: 'fas fa-mountain'
  },
  {
    name: 'Minimalism',
    slug: 'minimalism',
    description: 'Minimalist lifestyle and design',
    color: '#9e9e9e',
    icon: 'fas fa-cube'
  },
  {
    name: 'Sustainability',
    slug: 'sustainability',
    description: 'Sustainable living and eco-friendly tips',
    color: '#4caf50',
    icon: 'fas fa-recycle'
  },
  {
    name: 'Meditation',
    slug: 'meditation',
    description: 'Meditation practices and mindfulness',
    color: '#9c27b0',
    icon: 'fas fa-om'
  },
  {
    name: 'Yoga',
    slug: 'yoga',
    description: 'Yoga practices and wellness',
    color: '#8bc34a',
    icon: 'fas fa-child'
  },
  {
    name: 'Nutrition',
    slug: 'nutrition',
    description: 'Nutritional advice and healthy eating',
    color: '#4caf50',
    icon: 'fas fa-apple-alt'
  },
  {
    name: 'Weight Loss',
    slug: 'weight-loss',
    description: 'Weight management and diet tips',
    color: '#ff5722',
    icon: 'fas fa-weight'
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    description: 'Beauty tips and skincare advice',
    color: '#e91e63',
    icon: 'fas fa-spa'
  },
  {
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Interior design and decoration ideas',
    color: '#795548',
    icon: 'fas fa-couch'
  },
  {
    name: 'Cleaning',
    slug: 'cleaning',
    description: 'Cleaning tips and organization',
    color: '#00bcd4',
    icon: 'fas fa-spray-can'
  },
  {
    name: 'Budgeting',
    slug: 'budgeting',
    description: 'Budget planning and money saving',
    color: '#4caf50',
    icon: 'fas fa-calculator'
  },
  {
    name: 'Investing',
    slug: 'investing',
    description: 'Investment strategies and tips',
    color: '#2196f3',
    icon: 'fas fa-chart-line'
  },
  {
    name: 'Retirement',
    slug: 'retirement',
    description: 'Retirement planning and advice',
    color: '#607d8b',
    icon: 'fas fa-user-clock'
  },
  {
    name: 'Insurance',
    slug: 'insurance',
    description: 'Insurance guides and advice',
    color: '#ff5722',
    icon: 'fas fa-shield-alt'
  },
  {
    name: 'Small Business',
    slug: 'small-business',
    description: 'Small business tips and strategies',
    color: '#ff9800',
    icon: 'fas fa-store'
  },
  {
    name: 'Freelancing',
    slug: 'freelancing',
    description: 'Freelance work and gig economy',
    color: '#9c27b0',
    icon: 'fas fa-laptop-code'
  },
  {
    name: 'Remote Work',
    slug: 'remote-work',
    description: 'Remote work tips and tools',
    color: '#2196f3',
    icon: 'fas fa-home'
  },
  {
    name: 'Time Management',
    slug: 'time-management',
    description: 'Time management and efficiency',
    color: '#ff5722',
    icon: 'fas fa-stopwatch'
  },
  {
    name: 'Goal Setting',
    slug: 'goal-setting',
    description: 'Goal achievement and planning',
    color: '#4caf50',
    icon: 'fas fa-target'
  },
  {
    name: 'Motivation',
    slug: 'motivation',
    description: 'Motivational content and inspiration',
    color: '#ff9800',
    icon: 'fas fa-fire'
  },
  {
    name: 'Communication',
    slug: 'communication',
    description: 'Communication skills and tips',
    color: '#2196f3',
    icon: 'fas fa-comments'
  },
  {
    name: 'Public Speaking',
    slug: 'public-speaking',
    description: 'Public speaking and presentation skills',
    color: '#f44336',
    icon: 'fas fa-microphone'
  },
  {
    name: 'Writing',
    slug: 'writing',
    description: 'Writing tips and techniques',
    color: '#795548',
    icon: 'fas fa-pen'
  },
  {
    name: 'Content Creation',
    slug: 'content-creation',
    description: 'Content creation and storytelling',
    color: '#9c27b0',
    icon: 'fas fa-video'
  },
  {
    name: 'SEO',
    slug: 'seo',
    description: 'Search engine optimization tips',
    color: '#4caf50',
    icon: 'fas fa-search'
  },
  {
    name: 'E-commerce',
    slug: 'ecommerce',
    description: 'Online selling and e-commerce',
    color: '#ff5722',
    icon: 'fas fa-shopping-cart'
  },
  {
    name: 'Customer Service',
    slug: 'customer-service',
    description: 'Customer service excellence',
    color: '#2196f3',
    icon: 'fas fa-headset'
  },
  {
    name: 'Quality Assurance',
    slug: 'quality-assurance',
    description: 'QA processes and testing',
    color: '#607d8b',
    icon: 'fas fa-check-circle'
  },
  {
    name: 'Project Management',
    slug: 'project-management',
    description: 'Project management methodologies',
    color: '#ff9800',
    icon: 'fas fa-tasks'
  },
  {
    name: 'Team Building',
    slug: 'team-building',
    description: 'Team collaboration and building',
    color: '#4caf50',
    icon: 'fas fa-users'
  },
  {
    name: 'Conflict Resolution',
    slug: 'conflict-resolution',
    description: 'Conflict management and resolution',
    color: '#f44336',
    icon: 'fas fa-handshake'
  },
  {
    name: 'Negotiation',
    slug: 'negotiation',
    description: 'Negotiation skills and tactics',
    color: '#607d8b',
    icon: 'fas fa-balance-scale'
  },
  {
    name: 'Decision Making',
    slug: 'decision-making',
    description: 'Decision making processes',
    color: '#9c27b0',
    icon: 'fas fa-crossroads'
  },
  {
    name: 'Problem Solving',
    slug: 'problem-solving',
    description: 'Problem solving techniques',
    color: '#ff5722',
    icon: 'fas fa-puzzle-piece'
  },
  {
    name: 'Critical Thinking',
    slug: 'critical-thinking',
    description: 'Critical thinking and analysis',
    color: '#3f51b5',
    icon: 'fas fa-brain'
  },
  {
    name: 'Research',
    slug: 'research',
    description: 'Research methods and techniques',
    color: '#2196f3',
    icon: 'fas fa-search-plus'
  },
  {
    name: 'Statistics',
    slug: 'statistics',
    description: 'Statistical analysis and data',
    color: '#607d8b',
    icon: 'fas fa-chart-pie'
  },
  {
    name: 'Analytics',
    slug: 'analytics',
    description: 'Data analytics and insights',
    color: '#4caf50',
    icon: 'fas fa-analytics'
  },
  {
    name: 'User Experience',
    slug: 'user-experience',
    description: 'UX design and user research',
    color: '#9c27b0',
    icon: 'fas fa-user-friends'
  },
  {
    name: 'User Interface',
    slug: 'user-interface',
    description: 'UI design and interaction',
    color: '#2196f3',
    icon: 'fas fa-desktop'
  },
  {
    name: 'Accessibility',
    slug: 'accessibility',
    description: 'Digital accessibility and inclusion',
    color: '#4caf50',
    icon: 'fas fa-universal-access'
  },
  {
    name: 'Open Source',
    slug: 'open-source',
    description: 'Open source projects and collaboration',
    color: '#ff5722',
    icon: 'fas fa-code-branch'
  },
  {
    name: 'DevOps',
    slug: 'devops',
    description: 'Development and operations practices',
    color: '#607d8b',
    icon: 'fas fa-cogs'
  },
  {
    name: 'Automation',
    slug: 'automation',
    description: 'Process automation and efficiency',
    color: '#ff9800',
    icon: 'fas fa-robot'
  },
  {
    name: 'Testing',
    slug: 'testing',
    description: 'Software testing and QA',
    color: '#2196f3',
    icon: 'fas fa-bug'
  },
  {
    name: 'Documentation',
    slug: 'documentation',
    description: 'Technical writing and documentation',
    color: '#795548',
    icon: 'fas fa-file-alt'
  }
];

async function initializeDefaultData() {
  try {
    console.log('🚀 Initializing default data...');
    console.log('ℹ️  This script is idempotent - it can be run multiple times safely');

    // Create permissions
    console.log('📋 Creating/checking permissions...');
    let newPermissionsCount = 0;
    for (const permissionData of defaultPermissions) {
      const [permission, created] = await Permission.findOrCreate({
        where: { name: permissionData.name },
        defaults: { ...permissionData, is_system: true }
      });
      if (created) newPermissionsCount++;
    }
    console.log(`✅ Permissions processed: ${newPermissionsCount} new, ${defaultPermissions.length - newPermissionsCount} existing`);

    // Create roles
    console.log('👥 Creating/checking roles...');
    const roles = {};
    let newRolesCount = 0;
    for (const roleData of defaultRoles) {
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });
      roles[roleData.name] = role;
      if (created) newRolesCount++;
    }
    console.log(`✅ Roles processed: ${newRolesCount} new, ${defaultRoles.length - newRolesCount} existing`);

    // Assign permissions to roles 
    const allPermissions = await Permission.findAll();
    
    // Always ensure admin has ALL permissions
    console.log('Ensuring admin role has all permissions...');
    await roles.admin.setPermissions(allPermissions);
    console.log(`✅ Admin role updated with ${allPermissions.length} permissions`);
    
    // Check if editor role has permissions assigned
    const editorPermissionsCount = await roles.editor.countPermissions();
    if (editorPermissionsCount === 0) {
      console.log('Assigning permissions to editor role...');
      const editorPermissions = allPermissions.filter(p => 
        ['stories', 'pages', 'categories', 'modules', 'menus', 'affiliates'].includes(p.entity) &&
        !['delete'].includes(p.action)
      );
      await roles.editor.setPermissions(editorPermissions);
    }
    
    // Check if author role has permissions assigned
    const authorPermissionsCount = await roles.author.countPermissions();
    if (authorPermissionsCount === 0) {
      console.log('Assigning permissions to author role...');
      const authorPermissions = allPermissions.filter(p => 
        ['stories', 'pages'].includes(p.entity) &&
        ['create', 'read', 'update_own', 'delete_own'].includes(p.action)
      );
      await roles.author.setPermissions(authorPermissions);
    }
    
    // Check if viewer role has permissions assigned
    const viewerPermissionsCount = await roles.viewer.countPermissions();
    if (viewerPermissionsCount === 0) {
      console.log('Assigning permissions to viewer role...');
      const viewerPermissions = allPermissions.filter(p => 
        p.action === 'read'
      );
      await roles.viewer.setPermissions(viewerPermissions);
    }

    // Create admin user
    console.log('👤 Creating/checking admin user...');
    const [adminUser, adminCreated] = await User.findOrCreate({
      where: { email: 'admin@admin.com' },
      defaults: {
        email: 'admin@admin.com',
        password: '123456',
        first_name: 'Admin',
        last_name: 'User',
        role_id: roles.admin.id,
        status: 'active'
      }
    });
    if (adminCreated) {
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create default categories
    console.log('🏷️  Creating/checking categories...');
    let newCategoriesCount = 0;
    for (const categoryData of defaultCategories) {
      const [category, created] = await Category.findOrCreate({
        where: { slug: categoryData.slug },
        defaults: categoryData
      });
      if (created) newCategoriesCount++;
    }
    console.log(`✅ Categories processed: ${newCategoriesCount} new, ${defaultCategories.length - newCategoriesCount} existing`);

    // Create system pages
    console.log('📄 Creating/checking system pages...');
    const [homePage, homeCreated] = await Page.findOrCreate({
      where: { slug: 'home' },
      defaults: {
        title: 'Home',
        slug: 'home',
        content: JSON.stringify({
          time: Date.now(),
          blocks: [
            {
              type: 'header',
              data: {
                text: 'Welcome to Web Editor CMS',
                level: 1
              }
            },
            {
              type: 'paragraph',
              data: {
                text: 'This is your homepage. You can edit this content using the admin panel.'
              }
            },
            {
              type: 'storiesCarousel',
              data: {
                title: 'Latest Stories',
                limit: 6
              }
            }
          ]
        }),
        status: 'published',
        published_at: new Date(),
        author_id: adminUser.id,
        is_system: true,
        show_in_menu: true
      }
    });

    // Create stories listing page
    const [storiesPage, storiesCreated] = await Page.findOrCreate({
      where: { slug: 'stories' },
      defaults: {
        title: 'Stories',
        slug: 'stories',
        content: JSON.stringify({
          time: Date.now(),
          blocks: [
            {
              type: 'header',
              data: {
                text: 'All Stories',
                level: 1
              }
            },
            {
              type: 'paragraph',
              data: {
                text: 'Discover all our published stories and articles.'
              }
            },
            {
              type: 'storiesCarousel',
              data: {
                title: 'All Stories',
                limit: 12
              }
            }
          ]
        }),
        status: 'published',
        published_at: new Date(),
        author_id: adminUser.id,
        is_system: true,
        show_in_menu: true
      }
    });

    // Create story template page (for individual story display)
    const [storyPage, storyTemplateCreated] = await Page.findOrCreate({
      where: { slug: 'story-template' },
      defaults: {
        title: 'Story Template',
        slug: 'story-template',
        content: JSON.stringify({
          time: Date.now(),
          blocks: [
            {
              type: 'header',
              data: {
                text: 'Story Title',
                level: 1
              }
            },
            {
              type: 'paragraph',
              data: {
                text: 'Story content will be displayed here.'
              }
            }
          ]
        }),
        status: 'published',
        published_at: new Date(),
        author_id: adminUser.id,
        is_system: true,
        show_in_menu: false
      }
    });

    const pagesCreated = [homeCreated, storiesCreated, storyTemplateCreated].filter(Boolean).length;
    console.log(`✅ System pages processed: ${pagesCreated} new, ${3 - pagesCreated} existing`);

    // Create default modules
    console.log('🧩 Creating/checking system modules...');
    const [headerModule, headerCreated] = await Module.findOrCreate({
      where: { name: 'header' },
      defaults: {
        name: 'header',
        display_name: 'Header',
        description: 'Main site header',
        content: JSON.stringify({
          time: Date.now(),
          blocks: [
            {
              type: 'menu',
              data: {
                items: [
                  { title: 'Home', url: '/' },
                  { title: 'Stories', url: '/stories' }
                ]
              }
            }
          ]
        }),
        type: 'header',
        status: 'active',
        is_system: true,
        author_id: adminUser.id,
        sort_order: 0
      }
    });

    const [footerModule, footerCreated] = await Module.findOrCreate({
      where: { name: 'footer' },
      defaults: {
        name: 'footer',
        display_name: 'Footer',
        description: 'Main site footer',
        content: JSON.stringify({
          time: Date.now(),
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: '© 2024 Web Editor CMS. All rights reserved.'
              }
            }
          ]
        }),
        type: 'footer',
        status: 'active',
        is_system: true,
        author_id: adminUser.id,
        sort_order: 0
      }
    });

    const modulesCreated = [headerCreated, footerCreated].filter(Boolean).length;
    console.log(`✅ System modules processed: ${modulesCreated} new, ${2 - modulesCreated} existing`);

    // Create default affiliate
    console.log('🏢 Creating/checking default affiliate...');
    const [defaultAffiliate, affiliateCreated] = await Affiliate.findOrCreate({
      where: { slug: 'main' },
      defaults: {
        name: 'Main Site',
        slug: 'main',
        description: 'Default main affiliate for the website',
        status: 'active',
        sort_order: 0,
        primary_color: '#007cba',
        secondary_color: '#28a745',
        settings: JSON.stringify({
          site_title: 'Web Editor CMS',
          site_description: 'A powerful content management system',
          footer_text: '© 2024 Web Editor CMS. All rights reserved.'
        })
      }
    });

    if (affiliateCreated) {
      console.log('✅ Default affiliate created');
    } else {
      console.log('✅ Default affiliate already exists');
    }

    console.log('🎉 Default data initialized successfully!');
    console.log('🔑 Admin credentials: admin@admin.com / 123456');
    console.log('💡 You can run this script multiple times safely - it won\'t create duplicates');
    
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
}

module.exports = initializeDefaultData;

// Execute the function if this file is run directly
if (require.main === module) {
  initializeDefaultData();
} 