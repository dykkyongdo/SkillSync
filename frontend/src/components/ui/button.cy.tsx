import { Button } from '@/components/ui/button'

describe('Button Component (Cypress)', () => {
  beforeEach(() => {
    cy.mount(<Button>Test Button</Button>)
  })

  it('renders button with correct text', () => {
    cy.get('button').should('contain', 'Test Button')
  })

  it('applies correct CSS classes', () => {
    cy.get('button')
      .should('have.class', 'inline-flex')
      .should('have.class', 'items-center')
      .should('have.class', 'justify-center')
  })

  it('handles click events', () => {
    const onClick = cy.stub()
    cy.mount(<Button onClick={onClick}>Clickable Button</Button>)
    
    cy.get('button').click()
    cy.then(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(onClick).to.have.been.called
    })
  })

  it('can be disabled', () => {
    cy.mount(<Button disabled>Disabled Button</Button>)
    
    cy.get('button')
      .should('be.disabled')
      .should('have.class', 'disabled:pointer-events-none')
  })

  it('renders different variants', () => {
    cy.mount(
      <div>
        <Button variant="default">Default</Button>
        <Button variant="neutral">Neutral</Button>
        <Button variant="noShadow">No Shadow</Button>
      </div>
    )
    
    cy.get('button').eq(0).should('have.class', 'text-main-foreground')
    cy.get('button').eq(1).should('have.class', 'bg-secondary-background')
    cy.get('button').eq(2).should('have.class', 'text-main-foreground')
  })

  it('renders different sizes', () => {
    cy.mount(
      <div>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">Icon</Button>
      </div>
    )
    
    cy.get('button').eq(0).should('have.class', 'h-9')
    cy.get('button').eq(1).should('have.class', 'h-10')
    cy.get('button').eq(2).should('have.class', 'h-11')
    cy.get('button').eq(3).should('have.class', 'size-10')
  })

  it('renders as child component when asChild is true', () => {
    cy.mount(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    
    cy.get('a')
      .should('contain', 'Link Button')
      .should('have.attr', 'href', '/test')
  })
})
