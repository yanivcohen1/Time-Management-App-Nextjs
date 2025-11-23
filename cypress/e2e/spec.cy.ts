/// <reference types="cypress" />

describe('My Next App', () => {
  it('should load the home page', () => {
    cy.visit('/');
    cy.contains('Welcome to FocusFlow');
  });
});