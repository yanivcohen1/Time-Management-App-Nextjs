/// <reference types="cypress" />

describe('My Next App', () => {
  it('should load the home page', () => {
    cy.visit('/');
    cy.contains('Welcome to FocusFlow');
  });

  it('should navigate to the todo page', () => {
    cy.visit('/');
    cy.contains('Todo').click();
    cy.url().should('include', '/todo');
    cy.contains('FocusFlow'); // Assuming the todo page has this text
  });

  it('should navigate to the login page', () => {
    cy.visit('/');
    cy.contains('Log in').click();
    cy.url().should('include', '/login');
    cy.get('#username').should('be.visible'); // Check for the username input
    cy.get('span.rt-r-size-2').click();
    cy.get('#username').click();
    cy.get('#username').type('admin');
    cy.get('#password').click();
    cy.get('#password').type('admin123');
    cy.get('button.rt-reset').click();
    cy.get('a[href="/admin/1"] span').should('be.visible');
  });
});