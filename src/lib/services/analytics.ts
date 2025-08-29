import posthog from 'posthog-js';

// Client-side analytics
export class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized = false;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;

    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

    if (!apiKey) {
      console.warn('PostHog API key not found. Analytics will be disabled.');
      return;
    }

    posthog.init(apiKey, {
      api_host: apiHost,
      capture_pageview: false, // We'll handle this manually
      capture_pageleave: true,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug(true);
        }
      },
    });

    this.initialized = true;
  }

  // Page tracking
  capturePageView(path?: string) {
    if (!this.initialized) return;
    posthog.capture('$pageview', {
      $current_url: path || window.location.href,
    });
  }

  // User identification
  identify(userId: string, properties?: Record<string, any>) {
    if (!this.initialized) return;
    posthog.identify(userId, properties);
  }

  // Event tracking
  capture(eventName: string, properties?: Record<string, any>) {
    if (!this.initialized) return;
    posthog.capture(eventName, properties);
  }

  // Insurance-specific events
  policyEvents = {
    viewed: (policyId: string, policyType: string) => {
      this.capture('policy_viewed', {
        policy_id: policyId,
        policy_type: policyType,
      });
    },

    created: (policyId: string, policyType: string, premium: number, coverage: number) => {
      this.capture('policy_created', {
        policy_id: policyId,
        policy_type: policyType,
        premium_amount: premium,
        coverage_amount: coverage,
      });
    },

    updated: (policyId: string, changes: string[]) => {
      this.capture('policy_updated', {
        policy_id: policyId,
        changes: changes,
      });
    },

    renewed: (policyId: string, newPremium: number) => {
      this.capture('policy_renewed', {
        policy_id: policyId,
        new_premium: newPremium,
      });
    },
  };

  claimEvents = {
    submitted: (claimId: string, claimType: string, estimatedAmount?: number) => {
      this.capture('claim_submitted', {
        claim_id: claimId,
        claim_type: claimType,
        estimated_amount: estimatedAmount,
      });
    },

    statusChanged: (claimId: string, oldStatus: string, newStatus: string) => {
      this.capture('claim_status_changed', {
        claim_id: claimId,
        old_status: oldStatus,
        new_status: newStatus,
      });
    },

    documentUploaded: (claimId: string, documentType: string, fileSize: number) => {
      this.capture('claim_document_uploaded', {
        claim_id: claimId,
        document_type: documentType,
        file_size: fileSize,
      });
    },
  };

  paymentEvents = {
    initiated: (amount: number, paymentMethod: string) => {
      this.capture('payment_initiated', {
        amount: amount,
        payment_method: paymentMethod,
      });
    },

    completed: (amount: number, paymentMethod: string, policyId?: string) => {
      this.capture('payment_completed', {
        amount: amount,
        payment_method: paymentMethod,
        policy_id: policyId,
      });
    },

    failed: (amount: number, paymentMethod: string, errorCode?: string) => {
      this.capture('payment_failed', {
        amount: amount,
        payment_method: paymentMethod,
        error_code: errorCode,
      });
    },
  };

  userEvents = {
    signUp: (method: string) => {
      this.capture('user_signed_up', {
        signup_method: method,
      });
    },

    signIn: (method: string) => {
      this.capture('user_signed_in', {
        signin_method: method,
      });
    },

    profileUpdated: (updatedFields: string[]) => {
      this.capture('profile_updated', {
        updated_fields: updatedFields,
      });
    },

    notificationPreferencesChanged: (preferences: Record<string, boolean>) => {
      this.capture('notification_preferences_changed', preferences);
    },
  };

  // Feature usage tracking
  featureEvents = {
    used: (featureName: string, context?: Record<string, any>) => {
      this.capture('feature_used', {
        feature_name: featureName,
        ...context,
      });
    },

    premiumCalculatorUsed: (inputData: Record<string, any>, calculatedPremium: number) => {
      this.capture('premium_calculator_used', {
        ...inputData,
        calculated_premium: calculatedPremium,
      });
    },

    searchPerformed: (searchTerm: string, searchType: string, resultsCount: number) => {
      this.capture('search_performed', {
        search_term: searchTerm,
        search_type: searchType,
        results_count: resultsCount,
      });
    },
  };

  // Error tracking
  errorEvents = {
    occurred: (errorType: string, errorMessage: string, context?: Record<string, any>) => {
      this.capture('error_occurred', {
        error_type: errorType,
        error_message: errorMessage,
        ...context,
      });
    },

    apiError: (endpoint: string, statusCode: number, errorMessage: string) => {
      this.capture('api_error', {
        endpoint: endpoint,
        status_code: statusCode,
        error_message: errorMessage,
      });
    },
  };

  // User feedback
  feedbackEvents = {
    submitted: (rating: number, feedback: string, context: string) => {
      this.capture('feedback_submitted', {
        rating: rating,
        feedback_text: feedback,
        context: context,
      });
    },

    npsResponse: (score: number, comment?: string) => {
      this.capture('nps_response', {
        nps_score: score,
        comment: comment,
      });
    },
  };

  // Performance tracking
  performanceEvents = {
    pageLoadTime: (pageName: string, loadTime: number) => {
      this.capture('page_load_time', {
        page_name: pageName,
        load_time_ms: loadTime,
      });
    },

    formSubmissionTime: (formName: string, submissionTime: number) => {
      this.capture('form_submission_time', {
        form_name: formName,
        submission_time_ms: submissionTime,
      });
    },
  };

  // A/B testing support
  getFeatureFlag(flagName: string): boolean | string | undefined {
    if (!this.initialized) return undefined;
    return posthog.getFeatureFlag(flagName);
  }

  isFeatureEnabled(flagName: string): boolean {
    if (!this.initialized) return false;
    return posthog.isFeatureEnabled(flagName);
  }

  // User properties
  setUserProperty(property: string, value: any) {
    if (!this.initialized) return;
    posthog.setPersonProperties({ [property]: value });
  }

  setUserProperties(properties: Record<string, any>) {
    if (!this.initialized) return;
    posthog.setPersonProperties(properties);
  }

  // Group analytics (for companies, teams, etc.)
  group(groupType: string, groupKey: string, properties?: Record<string, any>) {
    if (!this.initialized) return;
    posthog.group(groupType, groupKey, properties);
  }

  // Reset user (on logout)
  reset() {
    if (!this.initialized) return;
    posthog.reset();
  }

  // Opt out/in
  optOut() {
    if (!this.initialized) return;
    posthog.opt_out_capturing();
  }

  optIn() {
    if (!this.initialized) return;
    posthog.opt_in_capturing();
  }

  hasOptedOut(): boolean {
    if (!this.initialized) return false;
    return posthog.has_opted_out_capturing();
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();