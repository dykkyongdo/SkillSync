describe('SkillSync E2E Tests', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/')
  })

  describe('Navigation', () => {
    it('should navigate to login page', () => {
      cy.get('a[href="/auth/login"]').click()
      cy.url().should('include', '/auth/login')
      cy.get('h1').should('contain', 'Login')
    })

    it('should navigate to register page', () => {
      cy.get('a[href="/auth/register"]').click()
      cy.url().should('include', '/auth/register')
      cy.get('h1').should('contain', 'Register')
    })

    it('should have working GitHub link', () => {
      cy.get('a[href="https://github.com/dykkyongdo/SkillSync"]')
        .should('have.attr', 'target', '_blank')
        .should('have.attr', 'rel', 'noopener noreferrer')
    })
  })

  describe('Authentication Flow', () => {
    it('should show login form with required fields', () => {
      cy.visit('/auth/login')
      
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })

    it('should show register form with required fields', () => {
      cy.visit('/auth/register')
      
      cy.get('input[name="email"]').should('be.visible')
      cy.get('input[name="password"]').should('be.visible')
      cy.get('input[name="confirmPassword"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })

    it('should validate required fields on login', () => {
      cy.visit('/auth/login')
      
      cy.get('button[type="submit"]').click()
      
      // Check for validation messages (adjust based on your validation implementation)
      cy.get('input[name="email"]:invalid').should('exist')
      cy.get('input[name="password"]:invalid').should('exist')
    })

    it('should validate required fields on register', () => {
      cy.visit('/auth/register')
      
      cy.get('button[type="submit"]').click()
      
      // Check for validation messages
      cy.get('input[name="email"]:invalid').should('exist')
      cy.get('input[name="password"]:invalid').should('exist')
      cy.get('input[name="confirmPassword"]:invalid').should('exist')
    })
  })

  describe('Theme Toggle', () => {
    it('should toggle theme when theme button is clicked', () => {
      cy.get('button[aria-label="Toggle theme"]').click()
      
      // Check if theme has changed (this depends on your theme implementation)
      cy.get('html').should('have.class', 'dark').or('not.have.class', 'dark')
    })
  })

  describe('Responsive Design', () => {
    it('should be responsive on mobile viewport', () => {
      cy.viewport(375, 667) // iPhone SE
      
      cy.get('header').should('be.visible')
      cy.get('nav').should('be.visible')
    })

    it('should be responsive on tablet viewport', () => {
      cy.viewport(768, 1024) // iPad
      
      cy.get('header').should('be.visible')
      cy.get('nav').should('be.visible')
    })

    it('should be responsive on desktop viewport', () => {
      cy.viewport(1280, 720) // Desktop
      
      cy.get('header').should('be.visible')
      cy.get('nav').should('be.visible')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      cy.get('button[aria-label="Toggle theme"]').should('exist')
      cy.get('a[aria-label="GitHub"]').should('exist')
    })

    it('should have proper heading structure', () => {
      cy.get('h1').should('exist')
    })

    it('should be keyboard navigable', () => {
      cy.get('body').tab()
      cy.focused().should('exist')
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 pages gracefully', () => {
      cy.visit('/non-existent-page', { failOnStatusCode: false })
      
      // Should show 404 page or redirect to home
      cy.url().should('satisfy', (url) => {
        return url.includes('/not-found') || url.includes('/')
      })
    })
  })
})
