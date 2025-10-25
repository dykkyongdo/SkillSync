import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/card'

describe('Card Components', () => {
  it('renders Card with default styling', () => {
    render(<Card>Card content</Card>)
    
    const card = screen.getByText('Card content')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('rounded-base', 'flex', 'flex-col', 'shadow-shadow', 'border-2')
  })

  it('renders Card with custom className', () => {
    render(<Card className="custom-card">Custom card</Card>)
    
    const card = screen.getByText('Custom card')
    expect(card).toHaveClass('custom-card')
  })

  it('renders CardHeader with proper structure', () => {
    render(
      <Card>
        <CardHeader>Header content</CardHeader>
      </Card>
    )
    
    const header = screen.getByText('Header content')
    expect(header).toBeInTheDocument()
    expect(header).toHaveClass('@container/card-header', 'grid', 'auto-rows-min')
  })

  it('renders CardTitle with proper styling', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
      </Card>
    )
    
    const title = screen.getByText('Test Title')
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('font-heading', 'leading-none')
  })

  it('renders CardDescription with proper styling', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Test description</CardDescription>
        </CardHeader>
      </Card>
    )
    
    const description = screen.getByText('Test description')
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('text-sm', 'font-base')
  })

  it('renders CardContent with proper styling', () => {
    render(
      <Card>
        <CardContent>Content here</CardContent>
      </Card>
    )
    
    const content = screen.getByText('Content here')
    expect(content).toBeInTheDocument()
    expect(content).toHaveClass('px-6')
  })

  it('renders CardFooter with proper styling', () => {
    render(
      <Card>
        <CardFooter>Footer content</CardFooter>
      </Card>
    )
    
    const footer = screen.getByText('Footer content')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('flex', 'items-center', 'px-6')
  })

  it('renders CardAction with proper styling', () => {
    render(
      <Card>
        <CardHeader>
          <CardAction>Action button</CardAction>
        </CardHeader>
      </Card>
    )
    
    const action = screen.getByText('Action button')
    expect(action).toBeInTheDocument()
    expect(action).toHaveClass('col-start-2', 'row-span-2', 'row-start-1')
  })

  it('renders complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Main content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )
    
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card description')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
    expect(screen.getByText('Main content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })
})
