// Google Analytics 4 Integration with Custom Analytics API
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export interface AnalyticsEvent {
  event_name: string
  event_data?: Record<string, any>
  user_id?: string
  session_id?: string
  page_url?: string
  page_title?: string
}

export class GoogleAnalytics {
  private clientId: string
  private measurementId: string
  private apiEndpoint: string
  private sessionId: string

  constructor(clientId: string, measurementId: string) {
    this.clientId = clientId
    this.measurementId = measurementId
    this.apiEndpoint = '/api/analytics/track'
    this.sessionId = this.generateSessionId()
    
    this.initializeGA4()
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeGA4(): void {
    // Load Google Analytics 4
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`
    document.head.appendChild(script)

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }

    window.gtag('js', new Date())
    window.gtag('config', this.measurementId, {
      send_page_view: false, // We'll handle page views manually
      custom_map: {
        custom_client_id: this.clientId,
        custom_session_id: this.sessionId
      }
    })

    // Set up automatic page view tracking
    this.trackPageView()
    
    // Track page changes for SPA
    let currentPath = window.location.pathname
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname
        this.trackPageView()
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  public async trackEvent(eventData: AnalyticsEvent): Promise<void> {
    const enrichedData = {
      client_id: this.clientId,
      session_id: this.sessionId,
      page_url: window.location.href,
      page_title: document.title,
      user_agent: navigator.userAgent,
      ip_address: await this.getClientIP(),
      timestamp: new Date().toISOString(),
      ...eventData
    }

    // Send to Google Analytics 4
    window.gtag('event', eventData.event_name, {
      ...eventData.event_data,
      custom_client_id: this.clientId,
      custom_session_id: this.sessionId
    })

    // Send to our custom analytics API
    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(enrichedData)
      })
    } catch (error) {
      console.error('Failed to send analytics event:', error)
    }
  }

  public trackPageView(pagePath?: string): void {
    const path = pagePath || window.location.pathname
    const title = document.title

    this.trackEvent({
      event_name: 'page_view',
      event_data: {
        page_path: path,
        page_title: title,
        page_location: window.location.href
      }
    })
  }

  public trackClick(elementId: string, elementText?: string): void {
    this.trackEvent({
      event_name: 'click',
      event_data: {
        element_id: elementId,
        element_text: elementText,
        click_timestamp: new Date().toISOString()
      }
    })
  }

  public trackFormSubmit(formId: string, formData?: Record<string, any>): void {
    this.trackEvent({
      event_name: 'form_submit',
      event_data: {
        form_id: formId,
        form_data: formData,
        submit_timestamp: new Date().toISOString()
      }
    })
  }

  public trackConversion(conversionName: string, value?: number, currency?: string): void {
    this.trackEvent({
      event_name: 'conversion',
      event_data: {
        conversion_name: conversionName,
        value: value,
        currency: currency || 'USD',
        conversion_timestamp: new Date().toISOString()
      }
    })
  }

  public trackUserEngagement(engagementType: string, duration?: number): void {
    this.trackEvent({
      event_name: 'user_engagement',
      event_data: {
        engagement_type: engagementType,
        duration_seconds: duration,
        engagement_timestamp: new Date().toISOString()
      }
    })
  }

  public trackSearch(searchTerm: string, searchResults?: number): void {
    this.trackEvent({
      event_name: 'search',
      event_data: {
        search_term: searchTerm,
        search_results: searchResults,
        search_timestamp: new Date().toISOString()
      }
    })
  }

  public trackVehicleView(vehicleId: string, vehicleData?: Record<string, any>): void {
    this.trackEvent({
      event_name: 'vehicle_view',
      event_data: {
        vehicle_id: vehicleId,
        vehicle_data: vehicleData,
        view_timestamp: new Date().toISOString()
      }
    })
  }

  public trackLeadGeneration(leadType: string, leadData?: Record<string, any>): void {
    this.trackEvent({
      event_name: 'lead_generation',
      event_data: {
        lead_type: leadType,
        lead_data: leadData,
        lead_timestamp: new Date().toISOString()
      }
    })
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      return 'unknown'
    }
  }

  public setUserId(userId: string): void {
    window.gtag('config', this.measurementId, {
      user_id: userId
    })
  }

  public setUserProperties(properties: Record<string, any>): void {
    window.gtag('config', this.measurementId, {
      custom_map: {
        ...properties,
        custom_client_id: this.clientId,
        custom_session_id: this.sessionId
      }
    })
  }
}

// Export a singleton instance
let analyticsInstance: GoogleAnalytics | null = null

export function initializeAnalytics(clientId: string, measurementId: string): GoogleAnalytics {
  if (typeof window !== 'undefined' && !analyticsInstance) {
    analyticsInstance = new GoogleAnalytics(clientId, measurementId)
  }
  return analyticsInstance!
}

export function getAnalytics(): GoogleAnalytics | null {
  return analyticsInstance
}

// Convenience functions for common tracking
export function trackPageView(pagePath?: string): void {
  analyticsInstance?.trackPageView(pagePath)
}

export function trackClick(elementId: string, elementText?: string): void {
  analyticsInstance?.trackClick(elementId, elementText)
}

export function trackConversion(conversionName: string, value?: number, currency?: string): void {
  analyticsInstance?.trackConversion(conversionName, value, currency)
}

export function trackVehicleView(vehicleId: string, vehicleData?: Record<string, any>): void {
  analyticsInstance?.trackVehicleView(vehicleId, vehicleData)
}

export function trackLeadGeneration(leadType: string, leadData?: Record<string, any>): void {
  analyticsInstance?.trackLeadGeneration(leadType, leadData)
} 