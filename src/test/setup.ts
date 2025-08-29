import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: vi.fn(() => null),
}))

// Mock Next.js Link component  
vi.mock('next/link', () => ({
  default: vi.fn(({ children }) => children),
}))

// Mock Clerk authentication
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useAuth: () => ({
    userId: 'test-user-id',
    isLoaded: true,
    isSignedIn: true,
  }),
  ClerkProvider: vi.fn(({ children }) => children),
  SignInButton: vi.fn(),
  SignOutButton: vi.fn(),
  UserButton: vi.fn(),
}))

// Mock tRPC
vi.mock('@/trpc/react', () => ({
  api: {
    user: {
      getProfile: {
        useQuery: () => ({
          data: {
            id: 'test-user-id',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
          },
          isLoading: false,
          error: null,
        }),
      },
    },
    policy: {
      getAll: {
        useQuery: () => ({
          data: [],
          isLoading: false,
          error: null,
        }),
      },
    },
    claim: {
      getAll: {
        useInfiniteQuery: () => ({
          data: { pages: [{ claims: [], hasMore: false }] },
          isLoading: false,
          error: null,
          fetchNextPage: vi.fn(),
          hasNextPage: false,
          isFetchingNextPage: false,
        }),
      },
    },
    notification: {
      getUnreadCount: {
        useQuery: () => ({
          data: 0,
          isLoading: false,
          error: null,
        }),
      },
      getNotifications: {
        useQuery: () => ({
          data: { notifications: [], total: 0, hasMore: false },
          isLoading: false,
          error: null,
          refetch: vi.fn(),
        }),
      },
      markAsRead: {
        useMutation: () => ({
          mutate: vi.fn(),
          isLoading: false,
        }),
      },
      delete: {
        useMutation: () => ({
          mutate: vi.fn(),
          isLoading: false,
        }),
      },
    },
    payment: {
      getPaymentStats: {
        useQuery: () => ({
          data: {
            totalPaid: 0,
            pendingPayments: 0,
            thisYearPayments: 0,
          },
          isLoading: false,
          error: null,
        }),
      },
      getUpcomingPayments: {
        useQuery: () => ({
          data: [],
          isLoading: false,
          error: null,
        }),
      },
      getPaymentHistory: {
        useQuery: () => ({
          data: { payments: [], total: 0, hasMore: false },
          isLoading: false,
          error: null,
        }),
      },
      getPaymentMethods: {
        useQuery: () => ({
          data: [],
          isLoading: false,
          error: null,
        }),
      },
    },
  },
  TRPCReactProvider: vi.fn(({ children }) => children),
}))

// Mock PostHog
vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock'
process.env.DATABASE_URL = 'mongodb://localhost:27017/test'
process.env.PAYSTACK_SECRET_KEY = 'sk_test_mock_secret_key'
process.env.PAYSTACK_WEBHOOK_SECRET = 'webhook_secret_123'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})