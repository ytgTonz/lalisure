# Insurance Platform Flowcharts

## 1. User Registration & Onboarding Flow

```mermaid
flowchart TD
    A[User Visits Platform] --> B{Existing User?}
    B -->|Yes| C[Login Page]
    B -->|No| D[Registration Page]
    
    C --> E[Enter Credentials]
    E --> F{Valid Credentials?}
    F -->|No| G[Show Error] --> C
    F -->|Yes| H[Dashboard]
    
    D --> I[Enter Basic Info]
    I --> J[Email Verification]
    J --> K{Email Verified?}
    K -->|No| L[Resend Email] --> J
    K -->|Yes| M[Complete Profile]
    M --> N[Identity Verification]
    N --> O{KYC Passed?}
    O -->|No| P[Request Documents] --> N
    O -->|Yes| Q[Account Activated]
    Q --> H[Dashboard]
    
    H --> R[Welcome Tour]
    R --> S[Ready to Use Platform]
```

## 2. Policy Purchase Journey

```mermaid
flowchart TD
    A[User Logged In] --> B[Browse Policies]
    B --> C[Select Policy Type]
    C --> D[Property Information]
    
    D --> E[Enter Property Details]
    E --> F[What3Words Location]
    F --> G[Property Photos Upload]
    G --> H[Risk Assessment]
    
    H --> I{Risk Acceptable?}
    I -->|No| J[Decline Application]
    I -->|Yes| K[Generate Quote]
    
    K --> L[Premium Calculation]
    L --> M[Display Quote]
    M --> N{User Accepts?}
    N -->|No| O[Modify Coverage] --> L
    N -->|Yes| P[Coverage Selection]
    
    P --> Q[Review Application]
    Q --> R[Payment Information]
    R --> S[Process Payment]
    S --> T{Payment Success?}
    T -->|No| U[Payment Failed] --> R
    T -->|Yes| V[Generate Policy]
    
    V --> W[Send Confirmation]
    W --> X[Policy Active]
    X --> Y[Add to Dashboard]
```

## 3. Claims Processing Workflow

```mermaid
flowchart TD
    A[Claim Initiated] --> B[Select Policy]
    B --> C[Incident Details]
    C --> D[What3Words Location]
    D --> E[Upload Evidence]
    
    E --> F[Photos/Documents]
    F --> G[Incident Description]
    G --> H[Submit Claim]
    H --> I[Auto-Validation]
    
    I --> J{Valid Submission?}
    J -->|No| K[Return for Correction] --> C
    J -->|Yes| L[Assign Claim Number]
    
    L --> M[Initial Review]
    M --> N{Auto-Approve?}
    N -->|Yes| O[Auto-Approval]
    N -->|No| P[Manual Review Queue]
    
    P --> Q[Adjuster Assignment]
    Q --> R[Detailed Investigation]
    R --> S{Site Visit Required?}
    S -->|Yes| T[Schedule Inspection]
    S -->|No| U[Desktop Review]
    
    T --> V[Site Inspection]
    V --> W[Inspection Report]
    W --> X[Adjuster Decision]
    
    U --> X
    O --> Y[Approved]
    X --> Z{Claim Decision}
    
    Z -->|Approve| Y[Approved]
    Z -->|Deny| AA[Denied]
    Z -->|More Info| BB[Request Additional Info] --> R
    
    Y --> CC[Calculate Settlement]
    CC --> DD[Generate Settlement]
    DD --> EE[Payment Processing]
    EE --> FF[Claim Closed - Settled]
    
    AA --> GG[Send Denial Letter]
    GG --> HH[Claim Closed - Denied]
    HH --> II{Appeal Requested?}
    II -->|Yes| JJ[Appeal Process] --> P
    II -->|No| KK[Final Closure]
```

## 4. System Architecture Flow

```mermaid
flowchart TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile App]
    end
    
    subgraph "Edge Layer"
        C[Vercel Edge Network]
        D[CDN/Static Assets]
    end
    
    subgraph "Application Layer"
        E[Next.js App Router]
        F[tRPC API Layer]
        G[Authentication Middleware]
        H[Rate Limiting]
    end
    
    subgraph "Business Logic"
        I[Policy Services]
        J[Claims Services]
        K[User Services]
        L[Payment Services]
        M[Notification Services]
    end
    
    subgraph "Data Layer"
        N[MongoDB Primary]
        O[Redis Cache]
        P[File Storage]
    end
    
    subgraph "External Services"
        Q[Clerk Auth]
        R[What3Words API]
        S[Stripe Payments]
        T[Twilio SMS]
        U[Resend Email]
        V[UploadThing]
    end
    
    A --> C
    B --> C
    C --> E
    C --> D
    E --> F
    F --> G
    G --> H
    H --> I
    H --> J
    H --> K
    H --> L
    H --> M
    
    I --> N
    J --> N
    K --> N
    L --> S
    M --> T
    M --> U
    
    I --> O
    J --> O
    K --> O
    
    I --> P
    J --> P
    J --> V
    
    G --> Q
    I --> R
    J --> R
```

## 5. Data Flow for Policy Creation

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Frontend
    participant API as tRPC API
    participant Auth as Auth Service
    participant Risk as Risk Engine
    participant DB as Database
    participant Pay as Payment Service
    participant Email as Email Service
    
    U->>UI: Start Policy Application
    UI->>API: Request Application Form
    API->>Auth: Validate User Session
    Auth-->>API: Session Valid
    API-->>UI: Return Form Schema
    
    U->>UI: Fill Property Details
    UI->>API: Submit Property Info
    API->>Risk: Calculate Risk Score
    Risk-->>API: Risk Assessment
    API->>DB: Save Application Draft
    DB-->>API: Draft Saved
    
    API->>Risk: Generate Premium Quote
    Risk-->>API: Premium Calculation
    API-->>UI: Return Quote
    
    U->>UI: Accept Quote & Payment
    UI->>API: Submit Final Application
    API->>Pay: Process Payment
    Pay-->>API: Payment Confirmed
    
    API->>DB: Create Policy Record
    DB-->>API: Policy Created
    API->>Email: Send Confirmation
    Email-->>API: Email Sent
    API-->>UI: Policy Confirmation
    UI-->>U: Display Success
```

## 6. Claims Status Tracking Flow

```mermaid
stateDiagram-v2
    [*] --> Submitted
    Submitted --> UnderReview: Auto-validation passed
    Submitted --> Rejected: Validation failed
    
    UnderReview --> InvestigationRequired: Manual review needed
    UnderReview --> Approved: Simple claim approved
    UnderReview --> MoreInfoRequired: Missing information
    
    InvestigationRequired --> SiteInspection: Inspection scheduled
    InvestigationRequired --> DesktopReview: No inspection needed
    
    SiteInspection --> InvestigationComplete: Inspection done
    DesktopReview --> InvestigationComplete: Review complete
    
    InvestigationComplete --> Approved: Claim valid
    InvestigationComplete --> Denied: Claim invalid
    InvestigationComplete --> MoreInfoRequired: Need clarification
    
    MoreInfoRequired --> UnderReview: Info provided
    MoreInfoRequired --> Withdrawn: User withdrew claim
    
    Approved --> SettlementCalculated: Amount determined
    SettlementCalculated --> PaymentProcessed: Payment sent
    PaymentProcessed --> Settled: Final state
    
    Denied --> AppealSubmitted: User appeals
    Denied --> Closed: Final denial
    
    AppealSubmitted --> UnderReview: Re-review
    AppealSubmitted --> Closed: Appeal denied
    
    Rejected --> [*]
    Settled --> [*]
    Closed --> [*]
    Withdrawn --> [*]
```

## 7. User Authentication Flow

```mermaid
flowchart TD
    A[User Access Request] --> B{Has Valid Session?}
    B -->|Yes| C[Allow Access]
    B -->|No| D[Redirect to Login]
    
    D --> E[Clerk Login Widget]
    E --> F{Authentication Method}
    F -->|Email/Password| G[Password Login]
    F -->|OAuth| H[Social Login]
    F -->|Magic Link| I[Email Link]
    
    G --> J[Validate Credentials]
    H --> K[OAuth Provider]
    I --> L[Email Verification]
    
    J --> M{Valid?}
    K --> N{OAuth Success?}
    L --> O{Link Valid?}
    
    M -->|No| P[Show Error] --> E
    N -->|No| P
    O -->|No| P
    
    M -->|Yes| Q[Create JWT Token]
    N -->|Yes| Q
    O -->|Yes| Q
    
    Q --> R[Set Session Cookie]
    R --> S[Update User Last Login]
    S --> T[Check User Roles]
    T --> U[Redirect to Dashboard]
    U --> C[Allow Access]
    
    C --> V{Route Requires Special Permission?}
    V -->|No| W[Show Page]
    V -->|Yes| X{User Has Permission?}
    X -->|Yes| W
    X -->|No| Y[Access Denied]
```

## 8. Payment Processing Flow

```mermaid
flowchart TD
    A[User Initiates Payment] --> B[Collect Payment Info]
    B --> C[Validate Card Details]
    C --> D{Valid Card?}
    D -->|No| E[Show Validation Error] --> B
    D -->|Yes| F[Create Stripe Payment Intent]
    
    F --> G[Confirm Payment with Stripe]
    G --> H{Payment Successful?}
    H -->|No| I[Handle Payment Error]
    H -->|Yes| J[Update Policy Status]
    
    I --> K{Retry Possible?}
    K -->|Yes| L[Suggest Retry] --> B
    K -->|No| M[Payment Failed]
    
    J --> N[Generate Invoice]
    N --> O[Send Payment Confirmation]
    O --> P[Update User Dashboard]
    P --> Q[Payment Complete]
    
    M --> R[Log Payment Failure]
    R --> S[Notify Admin if Needed]
```

## How to Use These Flowcharts

1. **View in GitHub/VS Code**: These Mermaid diagrams render automatically in GitHub and VS Code with Mermaid extensions
2. **Export as Images**: Use Mermaid CLI or online tools to export as PNG/SVG
3. **Documentation**: Reference these in technical specifications and user manuals
4. **Development Guide**: Use during implementation to ensure all scenarios are covered
5. **Testing**: Create test cases based on these flows to ensure comprehensive coverage

## Tools for Viewing/Editing

- **VS Code Extension**: Mermaid Markdown Syntax Highlighting
- **Online Editor**: https://mermaid.live/
- **CLI Tool**: `npm install -g @mermaid-js/mermaid-cli`
- **GitHub**: Native rendering in README files