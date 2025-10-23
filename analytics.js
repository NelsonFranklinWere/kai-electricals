/**
 * Kai Electricals - Advanced Analytics & User Engagement System
 * Comprehensive click tracking, exit intent detection, and scroll analytics
 */

class KaiAnalytics {
    constructor() {
        this.trackingData = {
            clicks: [],
            scrollEvents: [],
            timeOnPage: 0,
            exitIntentTriggered: false,
            userEngagement: {
                highEngagement: false,
                productViews: 0,
                whatsappClicks: 0,
                formInteractions: 0
            }
        };
        
        this.startTime = Date.now();
        this.scrollThresholds = [25, 50, 75, 90, 100];
        this.engagedScrollThreshold = 75;
        this.exitIntentDelay = 2000; // 2 seconds delay before showing exit intent
        this.analyticsDelay = 3000; // 3 seconds delay for Google Analytics
        
        this.init();
    }

    init() {
        this.setupClickTracking();
        this.setupScrollTracking();
        this.setupExitIntentDetection();
        this.setupEngagementTracking();
        this.setupGoogleAnalytics();
        this.startTimeTracking();
        this.setupScrollProgressIndicator();
        this.setupEngagementIndicators();
        this.setupClickVisualFeedback();
    }

    // Comprehensive Click Tracking
    setupClickTracking() {
        document.addEventListener('click', (event) => {
            const target = event.target;
            const clickData = this.analyzeClick(target, event);
            
            // Store click data
            this.trackingData.clicks.push(clickData);
            
            // Enhanced Google Analytics tracking
            this.trackEnhancedClick(clickData);
            
            // Track specific engagement metrics
            this.trackEngagementMetrics(clickData);
            
            console.log('Click tracked:', clickData);
        });
    }

    analyzeClick(target, event) {
        const clickData = {
            timestamp: Date.now(),
            element: target.tagName.toLowerCase(),
            className: target.className,
            id: target.id,
            text: target.textContent?.trim().substring(0, 50) || '',
            href: target.href || '',
            position: {
                x: event.clientX,
                y: event.clientY
            },
            scrollPosition: window.scrollY,
            viewportHeight: window.innerHeight,
            timeOnPage: Date.now() - this.startTime
        };

        // Determine click type and category
        clickData.type = this.determineClickType(target);
        clickData.category = this.determineClickCategory(target);
        clickData.importance = this.determineClickImportance(clickData);

        return clickData;
    }

    determineClickType(target) {
        if (target.tagName === 'A') return 'link';
        if (target.tagName === 'BUTTON') return 'button';
        if (target.classList.contains('product-card')) return 'product';
        if (target.classList.contains('whatsapp-btn') || target.href?.includes('wa.me')) return 'whatsapp';
        if (target.type === 'submit') return 'form_submit';
        if (target.type === 'input') return 'form_input';
        return 'other';
    }

    determineClickCategory(target) {
        if (target.href?.includes('wa.me')) return 'whatsapp';
        if (target.href?.includes('collection.html')) return 'navigation';
        if (target.classList.contains('product-card')) return 'product_view';
        if (target.classList.contains('btn-whatsapp')) return 'order_intent';
        if (target.classList.contains('nav-links')) return 'navigation';
        if (target.tagName === 'FORM') return 'form_interaction';
        return 'general';
    }

    determineClickImportance(clickData) {
        if (clickData.category === 'whatsapp' || clickData.category === 'order_intent') return 'high';
        if (clickData.category === 'product_view') return 'medium';
        if (clickData.category === 'navigation') return 'low';
        return 'low';
    }

    // Scroll-based Analytics
    setupScrollTracking() {
        let scrollTimeout;
        let lastScrollPosition = 0;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(() => {
                const currentScroll = window.scrollY;
                const scrollPercentage = Math.round((currentScroll / (document.body.scrollHeight - window.innerHeight)) * 100);
                
                // Track scroll milestones
                this.scrollThresholds.forEach(threshold => {
                    if (scrollPercentage >= threshold && !this.trackingData.scrollEvents.includes(threshold)) {
                        this.trackingData.scrollEvents.push(threshold);
                        this.trackScrollEvent(threshold, currentScroll);
                    }
                });

                // Track scroll direction and speed
                const scrollDirection = currentScroll > lastScrollPosition ? 'down' : 'up';
                const scrollSpeed = Math.abs(currentScroll - lastScrollPosition);
                
                this.trackScrollBehavior(scrollPercentage, scrollDirection, scrollSpeed);
                
                lastScrollPosition = currentScroll;
            }, 150);
        });
    }

    trackScrollEvent(threshold, position) {
        const scrollData = {
            timestamp: Date.now(),
            threshold: threshold,
            position: position,
            timeOnPage: Date.now() - this.startTime
        };

        // Enhanced Google Analytics scroll tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'scroll', {
                'event_category': 'engagement',
                'event_label': `${threshold}%`,
                'value': threshold
            });
        }

        console.log(`Scroll milestone reached: ${threshold}%`);
    }

    trackScrollBehavior(percentage, direction, speed) {
        // Track high engagement scrolling
        if (percentage >= this.engagedScrollThreshold && !this.trackingData.userEngagement.highEngagement) {
            this.trackingData.userEngagement.highEngagement = true;
            this.trackHighEngagement();
        }
    }

    // Exit Intent Detection with User Confirmation
    setupExitIntentDetection() {
        let exitIntentTriggered = false;
        let mouseLeaveTimeout;

        document.addEventListener('mouseleave', (event) => {
            if (event.clientY <= 0 && !exitIntentTriggered) {
                exitIntentTriggered = true;
                
                // Delay before showing exit intent to allow analytics to process
                mouseLeaveTimeout = setTimeout(() => {
                    this.handleExitIntent();
                }, this.exitIntentDelay);
            }
        });

        document.addEventListener('mouseenter', () => {
            if (mouseLeaveTimeout) {
                clearTimeout(mouseLeaveTimeout);
                exitIntentTriggered = false;
            }
        });

        // Also detect when user tries to close tab/window
        window.addEventListener('beforeunload', (event) => {
            if (!this.trackingData.exitIntentTriggered) {
                this.handleExitIntent();
                return this.getExitIntentMessage();
            }
        });
    }

    handleExitIntent() {
        this.trackingData.exitIntentTriggered = true;
        
        // Track exit intent in analytics
        this.trackExitIntent();
        
        // Show user confirmation dialog
        this.showExitIntentDialog();
    }

    trackExitIntent() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exit_intent', {
                'event_category': 'engagement',
                'event_label': 'user_attempting_to_leave',
                'value': this.trackingData.timeOnPage
            });
        }

        console.log('Exit intent detected and tracked');
    }

    showExitIntentDialog() {
        const dialog = this.createExitIntentDialog();
        document.body.appendChild(dialog);
        
        // Animate in
        setTimeout(() => {
            dialog.classList.add('show');
        }, 100);
    }

    createExitIntentDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'exit-intent-dialog';
        dialog.innerHTML = `
            <div class="exit-dialog-content">
                <div class="exit-dialog-header">
                    <h3>Wait! Don't go yet! ✨</h3>
                    <button class="exit-dialog-close">&times;</button>
                </div>
                <div class="exit-dialog-body">
                    <p>Did you find what you were looking for?</p>
                    <p>We have amazing lighting solutions that might interest you:</p>
                    <ul>
                        <li>✨ Premium decorative lights</li>
                        <li>🏠 Home & event lighting</li>
                        <li>🚚 Fast delivery across Kenya</li>
                        <li>💬 Easy WhatsApp ordering</li>
                    </ul>
                </div>
                <div class="exit-dialog-actions">
                    <button class="btn btn-secondary" id="stay-on-site">Yes, I found what I need</button>
                    <button class="btn btn-primary" id="continue-browsing">Continue browsing</button>
                    <a href="https://wa.me/254724275560?text=Hi%20Kai%20Electricals!%20I%20need%20help%20finding%20the%20right%20lights." 
                       class="btn btn-whatsapp" target="_blank">
                        <i class="fab fa-whatsapp"></i> Get Help via WhatsApp
                    </a>
                </div>
            </div>
        `;

        // Add event listeners
        dialog.querySelector('.exit-dialog-close').addEventListener('click', () => this.closeExitDialog(dialog));
        dialog.querySelector('#stay-on-site').addEventListener('click', () => this.closeExitDialog(dialog));
        dialog.querySelector('#continue-browsing').addEventListener('click', () => this.closeExitDialog(dialog));
        dialog.querySelector('.btn-whatsapp').addEventListener('click', () => this.trackWhatsAppClick('exit_intent'));

        return dialog;
    }

    closeExitDialog(dialog) {
        dialog.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(dialog);
        }, 300);
    }

    getExitIntentMessage() {
        return "Are you sure you want to leave? We have amazing lighting solutions waiting for you!";
    }

    // Engagement Tracking
    setupEngagementTracking() {
        // Track product views
        document.addEventListener('click', (event) => {
            if (event.target.closest('.product-card')) {
                this.trackingData.userEngagement.productViews++;
                this.trackProductView(event.target.closest('.product-card'));
            }
        });

        // Track WhatsApp clicks
        document.addEventListener('click', (event) => {
            if (event.target.closest('.btn-whatsapp') || event.target.href?.includes('wa.me')) {
                this.trackingData.userEngagement.whatsappClicks++;
                this.trackWhatsAppClick('direct_click');
            }
        });

        // Track form interactions
        document.addEventListener('click', (event) => {
            if (event.target.closest('form') || event.target.type === 'submit') {
                this.trackingData.userEngagement.formInteractions++;
                this.trackFormInteraction();
            }
        });
    }

    trackHighEngagement() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'high_engagement', {
                'event_category': 'engagement',
                'event_label': 'user_scrolled_75_percent',
                'value': this.trackingData.timeOnPage
            });
        }
    }

    trackProductView(productCard) {
        const productName = productCard.querySelector('h3')?.textContent || 'Unknown Product';
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'view_item', {
                'event_category': 'ecommerce',
                'event_label': productName,
                'value': 1
            });
        }
    }

    trackWhatsAppClick(source) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'whatsapp_click', {
                'event_category': 'conversion',
                'event_label': source,
                'value': 1
            });
        }
    }

    trackFormInteraction() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_interaction', {
                'event_category': 'engagement',
                'event_label': 'user_interacted_with_form',
                'value': 1
            });
        }
    }

    // Enhanced Google Analytics Integration
    setupGoogleAnalytics() {
        // Wait for Google Analytics to load
        const checkGA = setInterval(() => {
            if (typeof gtag !== 'undefined') {
                clearInterval(checkGA);
                this.initializeGATracking();
            }
        }, 100);

        // Fallback if GA doesn't load within 10 seconds
        setTimeout(() => {
            if (typeof gtag === 'undefined') {
                console.log('Google Analytics not detected, using fallback tracking');
                this.setupFallbackTracking();
            }
        }, 10000);
    }

    initializeGATracking() {
        // Enhanced ecommerce tracking
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                'custom_map': {
                    'custom_parameter_1': 'user_engagement_level',
                    'custom_parameter_2': 'scroll_depth',
                    'custom_parameter_3': 'time_on_page'
                }
            });
        }
    }

    setupFallbackTracking() {
        // Store tracking data locally for later analysis
        localStorage.setItem('kai_analytics_data', JSON.stringify(this.trackingData));
    }

    // Time Tracking
    startTimeTracking() {
        setInterval(() => {
            this.trackingData.timeOnPage = Date.now() - this.startTime;
            
            // Track time milestones
            const timeMilestones = [30000, 60000, 120000, 300000]; // 30s, 1m, 2m, 5m
            timeMilestones.forEach(milestone => {
                if (this.trackingData.timeOnPage >= milestone && 
                    !this.trackingData.timeMilestones?.includes(milestone)) {
                    this.trackTimeMilestone(milestone);
                }
            });
        }, 1000);
    }

    trackTimeMilestone(milestone) {
        if (!this.trackingData.timeMilestones) {
            this.trackingData.timeMilestones = [];
        }
        this.trackingData.timeMilestones.push(milestone);

        if (typeof gtag !== 'undefined') {
            gtag('event', 'time_milestone', {
                'event_category': 'engagement',
                'event_label': `${milestone / 1000}s`,
                'value': milestone / 1000
            });
        }
    }

    // Enhanced Click Tracking for Google Analytics
    trackEnhancedClick(clickData) {
        if (typeof gtag !== 'undefined') {
            // Delay to ensure GA has time to process
            setTimeout(() => {
                gtag('event', 'click', {
                    'event_category': clickData.category,
                    'event_label': clickData.type,
                    'value': clickData.importance === 'high' ? 3 : clickData.importance === 'medium' ? 2 : 1,
                    'custom_parameter_1': clickData.element,
                    'custom_parameter_2': clickData.text,
                    'custom_parameter_3': clickData.timeOnPage
                });
            }, this.analyticsDelay);
        }
    }

    // Scroll Progress Indicator
    setupScrollProgressIndicator() {
        const progressBar = document.querySelector('.scroll-progress-bar');
        if (!progressBar) return;

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            progressBar.style.width = Math.min(scrollPercent, 100) + '%';
        });
    }

    // Engagement Indicators
    setupEngagementIndicators() {
        const indicator = document.getElementById('engagement-indicator');
        if (!indicator) return;

        let engagementTimeout;

        // Show engagement indicator when user scrolls significantly
        window.addEventListener('scroll', () => {
            const scrollPercentage = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            if (scrollPercentage >= 25 && !this.trackingData.engagementShown) {
                this.trackingData.engagementShown = true;
                this.showEngagementIndicator();
            }
        });

        // Show indicator on product views
        document.addEventListener('click', (event) => {
            if (event.target.closest('.product-card')) {
                this.showEngagementIndicator();
            }
        });
    }

    showEngagementIndicator() {
        const indicator = document.getElementById('engagement-indicator');
        if (!indicator) return;

        indicator.classList.add('show');
        
        // Hide after 4 seconds
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 4000);
    }

    // Enhanced Click Visual Feedback
    setupClickVisualFeedback() {
        document.addEventListener('click', (event) => {
            this.createClickIndicator(event.clientX, event.clientY);
        });
    }

    createClickIndicator(x, y) {
        const indicator = document.createElement('div');
        indicator.className = 'click-indicator';
        indicator.style.left = x + 'px';
        indicator.style.top = y + 'px';
        
        document.body.appendChild(indicator);
        
        // Remove after animation
        setTimeout(() => {
            if (document.body.contains(indicator)) {
                document.body.removeChild(indicator);
            }
        }, 600);
    }

    // Get comprehensive analytics data
    getAnalyticsData() {
        return {
            ...this.trackingData,
            sessionDuration: Date.now() - this.startTime,
            engagementScore: this.calculateEngagementScore(),
            recommendations: this.generateRecommendations()
        };
    }

    calculateEngagementScore() {
        let score = 0;
        score += this.trackingData.clicks.length * 2;
        score += this.trackingData.scrollEvents.length * 5;
        score += this.trackingData.userEngagement.productViews * 10;
        score += this.trackingData.userEngagement.whatsappClicks * 20;
        score += this.trackingData.userEngagement.formInteractions * 15;
        
        if (this.trackingData.userEngagement.highEngagement) score += 50;
        
        return Math.min(score, 100);
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.trackingData.userEngagement.whatsappClicks === 0) {
            recommendations.push('Consider adding more prominent WhatsApp contact options');
        }
        
        if (this.trackingData.scrollEvents.length < 2) {
            recommendations.push('Users may not be engaging with content - consider improving page layout');
        }
        
        if (this.trackingData.userEngagement.productViews === 0) {
            recommendations.push('Users may not be finding products easily - consider improving product visibility');
        }
        
        return recommendations;
    }
}

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kaiAnalytics = new KaiAnalytics();
    
    // Expose analytics data globally for debugging
    window.getAnalyticsData = () => window.kaiAnalytics.getAnalyticsData();
    
    console.log('Kai Analytics initialized successfully');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KaiAnalytics;
}
