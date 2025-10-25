import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navbar from '@/components/Navbar'

// Mock Next.js modules
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>
  }
})

jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) {
    return <img src={src} alt={alt} {...props} />
  }
})

// Mock the context hooks
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/contexts/InvitationCountContext', () => ({
  useInvitationCount: jest.fn(),
}))

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
}))

// Import the mocked hooks
import { useAuth } from '@/contexts/AuthContext'
import { useInvitationCount } from '@/contexts/InvitationCountContext'
import { useTheme } from '@/contexts/ThemeContext'

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseInvitationCount = useInvitationCount as jest.MockedFunction<typeof useInvitationCount>
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>

describe('Navbar Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    
    // Set up default mock implementations
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      logout: jest.fn(),
    })
    
    mockUseInvitationCount.mockReturnValue({
      count: 0,
    })
    
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: jest.fn(),
    })
  })

  it('renders SkillSync logo and title', () => {
    render(<Navbar />)
    
    expect(screen.getByText('SkillSync')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /skillsync/i })).toBeInTheDocument()
  })

  it('shows login and register links when not authenticated', () => {
    render(<Navbar />)
    
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
  })

  it('shows dashboard, groups, and notifications links when authenticated', () => {
    // Mock authenticated state
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      logout: jest.fn(),
    })

    render(<Navbar />)
    
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /groups/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /notifications/i })).toBeInTheDocument()
  })

  it('shows logout button when authenticated', () => {
    const mockLogout = jest.fn()
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    })

    render(<Navbar />)
    
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    expect(logoutButton).toBeInTheDocument()
  })

  it('calls logout function when logout button is clicked', async () => {
    const mockLogout = jest.fn()
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      logout: mockLogout,
    })

    render(<Navbar />)
    
    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await userEvent.click(logoutButton)
    
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('shows invitation badge when there are invitations', () => {
    // Mock authenticated state
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      logout: jest.fn(),
    })
    
    mockUseInvitationCount.mockReturnValue({
      count: 5,
    })

    render(<Navbar />)
    
    // The badge should show the invitation count on notifications link
    const notificationsLink = screen.getByRole('link', { name: /notifications/i })
    expect(notificationsLink).toBeInTheDocument()
    
    // Check if the badge is present (it should be a child of the notifications link)
    const badge = notificationsLink.querySelector('span')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('5')
  })

  it('shows 9+ when invitation count is greater than 9', () => {
    // Mock authenticated state
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      logout: jest.fn(),
    })
    
    mockUseInvitationCount.mockReturnValue({
      count: 15,
    })

    render(<Navbar />)
    
    // The badge should show 9+ on notifications link
    const notificationsLink = screen.getByRole('link', { name: /notifications/i })
    expect(notificationsLink).toBeInTheDocument()
    
    // Check if the badge is present
    const badge = notificationsLink.querySelector('span')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('9+')
  })

  it('renders GitHub and LinkedIn links', () => {
    render(<Navbar />)
    
    // Use getAllByRole to get all links and then filter
    const links = screen.getAllByRole('link')
    const githubLink = links.find(link => 
      link.getAttribute('href') === 'https://github.com/dykkyongdo/SkillSync'
    )
    const linkedinLink = links.find(link => 
      link.getAttribute('href') === 'https://www.linkedin.com/in/dyk-kyong-do-46a0a4265/'
    )
    
    expect(githubLink).toBeInTheDocument()
    expect(linkedinLink).toBeInTheDocument()
  })

  it('renders theme toggle button', () => {
    render(<Navbar />)
    
    const themeButton = screen.getByRole('button', { name: /toggle theme/i })
    expect(themeButton).toBeInTheDocument()
  })
})
