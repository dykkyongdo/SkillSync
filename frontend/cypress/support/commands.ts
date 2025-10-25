// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('include', '/auth/login')
})

Cypress.Commands.add('createFlashcardSet', (name: string, description: string) => {
  cy.visit('/sets')
  cy.get('[data-testid="create-set-button"]').click()
  cy.get('input[name="name"]').type(name)
  cy.get('textarea[name="description"]').type(description)
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/sets/')
})
