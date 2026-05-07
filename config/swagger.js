const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Centralised OpenAPI 3 definition for the Alumni Influencers API.
 *
 * How to document a new endpoint:
 *   1. Add a JSDoc block above the route handler in `routes/*.js`:
 *
 *        /**
 *         * @swagger
 *         * /api/some/path:
 *         *   get:
 *         *     summary: One-line summary
 *         *     tags: [SomeTag]
 *         *     security: [{ bearerAuth: [] }]
 *         *     responses:
 *         *       200:
 *         *         description: OK
 *         *         content:
 *         *           application/json:
 *         *             schema:
 *         *               $ref: '#/components/schemas/SomeReusableSchema'
 *         *       401: { $ref: '#/components/responses/Unauthorized' }
 *         *       500: { $ref: '#/components/responses/ServerError' }
 *         *(/
 *
 *   2. Reuse the schemas/responses defined here via `$ref` instead of
 *      redeclaring them inline. Add new ones to `components.schemas` /
 *      `components.responses` below if you need them in more than one place.
 *
 * Anything you put in `components` becomes available to every route file.
 */

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Alumni Influencers API',
      version: '1.0.0',
      description:
        'REST API for the Alumni Influencers platform — auth, alumni profiles, monthly featured-alumnus bidding, admin token management, and aggregate analytics.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Authentication', description: 'Register, verify, login, logout, password reset' },
      { name: 'Profile', description: 'Alumni profile CRUD, search, and image upload' },
      { name: 'Bidding', description: 'Monthly bidding for the Alumnus-of-the-Day slot' },
      { name: 'Public API', description: 'Read-only endpoints intended for API-token consumers' },
      { name: 'Analytics', description: 'Aggregate analytics over alumni profiles' },
      { name: 'Admin', description: 'Token management and operational endpoints' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT issued by `POST /api/auth/login`. Send as `Authorization: Bearer <token>`.',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'API token created by an admin via `POST /api/admin/tokens`. Send as `Authorization: Bearer <token>`.',
        },
      },

      // ---------- Reusable response envelopes ----------
      responses: {
        Unauthorized: {
          description: 'Missing, invalid, or revoked credentials',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/Error' } },
          },
        },
        Forbidden: {
          description: 'Authenticated but lacking the required role or permission',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/Error' } },
          },
        },
        NotFound: {
          description: 'Resource does not exist',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/Error' } },
          },
        },
        ValidationError: {
          description: 'Request body or params failed validation',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } },
          },
        },
        ServerError: {
          description: 'Unexpected server error',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/Error' } },
          },
        },
      },

      // ---------- Reusable schemas ----------
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Something went wrong' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Validation error' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Invalid email format' },
                  value: {},
                },
              },
            },
          },
        },

        // Auth
        AuthLoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'JWT bearer token' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string', format: 'email' },
                role: { type: 'string', enum: ['alumni', 'admin'] },
              },
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: { type: 'string', example: 'Jane' },
            lastName: { type: 'string', example: 'Doe' },
            email: {
              type: 'string',
              format: 'email',
              description: 'Must end in @my.westminster.ac.uk',
              example: 'jane.doe@my.westminster.ac.uk',
            },
            password: { type: 'string', minLength: 8, example: 'correcthorsebatterystaple' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },

        // Profile sub-documents
        Degree: {
          type: 'object',
          required: ['title', 'university', 'completionDate'],
          properties: {
            title: { type: 'string' },
            university: { type: 'string' },
            completionDate: { type: 'string', format: 'date' },
            url: { type: 'string', format: 'uri' },
          },
        },
        Credential: {
          type: 'object',
          description: 'Shared shape for certifications, licences, and courses',
          required: ['title', 'completionDate'],
          properties: {
            title: { type: 'string' },
            issuingBody: { type: 'string' },
            provider: { type: 'string' },
            completionDate: { type: 'string', format: 'date' },
            url: { type: 'string', format: 'uri' },
          },
        },
        EmploymentEntry: {
          type: 'object',
          required: ['position', 'company', 'startDate'],
          properties: {
            position: { type: 'string' },
            company: { type: 'string' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date', nullable: true },
            description: { type: 'string' },
          },
        },
        SponsorshipOffer: {
          type: 'object',
          required: ['sponsorName', 'amount'],
          properties: {
            sponsorName: { type: 'string' },
            amount: { type: 'number', minimum: 0 },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string', description: 'User _id' },
            personalInfo: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                biography: { type: 'string', maxLength: 500 },
              },
            },
            linkedInUrl: { type: 'string', format: 'uri' },
            profileImage: { type: 'string', description: 'Filename returned by upload-image' },
            degrees: { type: 'array', items: { $ref: '#/components/schemas/Degree' } },
            certifications: { type: 'array', items: { $ref: '#/components/schemas/Credential' } },
            licences: { type: 'array', items: { $ref: '#/components/schemas/Credential' } },
            courses: { type: 'array', items: { $ref: '#/components/schemas/Credential' } },
            employmentHistory: { type: 'array', items: { $ref: '#/components/schemas/EmploymentEntry' } },
            sponsorshipOffers: { type: 'array', items: { $ref: '#/components/schemas/SponsorshipOffer' } },
            eventParticipationMonth: { type: 'string', nullable: true, description: 'YYYY-MM' },
            monthlyWins: { type: 'integer', minimum: 0 },
            lastWinMonth: { type: 'string', nullable: true, description: 'YYYY-MM' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ProfileUpsertRequest: {
          type: 'object',
          required: ['personalInfo'],
          properties: {
            personalInfo: {
              type: 'object',
              required: ['firstName', 'lastName'],
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                biography: { type: 'string', maxLength: 500 },
              },
            },
            linkedInUrl: { type: 'string', format: 'uri' },
            degrees: { type: 'array', items: { $ref: '#/components/schemas/Degree' } },
            certifications: { type: 'array', items: { $ref: '#/components/schemas/Credential' } },
            licences: { type: 'array', items: { $ref: '#/components/schemas/Credential' } },
            courses: { type: 'array', items: { $ref: '#/components/schemas/Credential' } },
            employmentHistory: { type: 'array', items: { $ref: '#/components/schemas/EmploymentEntry' } },
            sponsorshipOffers: { type: 'array', items: { $ref: '#/components/schemas/SponsorshipOffer' } },
            eventParticipationThisMonth: {
              type: 'boolean',
              description: 'When true, marks the user as event-participating for the current month (raises win cap to 4)',
            },
          },
        },
        ProfileSearchResult: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              personalInfo: { $ref: '#/components/schemas/Profile/properties/personalInfo' },
              employmentHistory: { type: 'array', items: { $ref: '#/components/schemas/EmploymentEntry' } },
            },
          },
        },

        // Bidding
        Bid: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['active', 'won', 'lost'] },
            month: { type: 'string', description: 'YYYY-MM' },
          },
        },
        BidStatus: {
          type: 'object',
          properties: {
            currentBid: { type: 'number' },
            isWinning: { type: 'boolean' },
            monthlyWins: { type: 'integer' },
            allowedWins: { type: 'integer' },
            remainingSlots: { type: 'integer' },
            canBid: { type: 'boolean' },
            sponsorshipBudget: { type: 'number' },
            sponsorshipOffers: { type: 'array', items: { $ref: '#/components/schemas/SponsorshipOffer' } },
          },
        },
        PlaceBidRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: { type: 'number', minimum: 0.01 },
          },
        },
        WinnerSummary: {
          type: 'object',
          description: 'Public-facing winner snapshot returned by today/tomorrow endpoints',
          properties: {
            winner: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                biography: { type: 'string' },
                linkedInUrl: { type: 'string', format: 'uri' },
                profileImage: { type: 'string' },
                degrees: { type: 'array', items: { $ref: '#/components/schemas/Degree' } },
                certifications: { type: 'array', items: { $ref: '#/components/schemas/Credential' } },
                licences: { type: 'array', items: { $ref: '#/components/schemas/Credential' } },
                courses: { type: 'array', items: { $ref: '#/components/schemas/Credential' } },
                employmentHistory: { type: 'array', items: { $ref: '#/components/schemas/EmploymentEntry' } },
              },
            },
            bidAmount: { type: 'number' },
          },
        },

        // Admin / tokens
        TokenPermission: {
          type: 'string',
          enum: ['read', 'write', 'admin', 'read:alumni', 'read:analytics', 'read:alumni_of_day'],
        },
        ApiToken: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            permissions: { type: 'array', items: { $ref: '#/components/schemas/TokenPermission' } },
            isActive: { type: 'boolean' },
            createdBy: { type: 'object', properties: { email: { type: 'string', format: 'email' } } },
            createdAt: { type: 'string', format: 'date-time' },
            lastUsed: { type: 'string', format: 'date-time' },
            usageCount: { type: 'integer' },
          },
        },
        ApiTokenCreateResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', description: 'Plaintext token — store immediately, it is not shown again' },
            name: { type: 'string' },
            permissions: { type: 'array', items: { $ref: '#/components/schemas/TokenPermission' } },
          },
        },
        UsageStat: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Token _id' },
            name: { type: 'string' },
            count: { type: 'integer' },
            lastUsed: { type: 'string', format: 'date-time' },
          },
        },

        // Analytics — every endpoint returns { success, data: [...] }
        AnalyticsEnvelope: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: {} },
          },
        },
        NameCount: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            count: { type: 'integer' },
          },
        },
        MonthCount: {
          type: 'object',
          properties: {
            month: { type: 'string', description: 'YYYY-MM' },
            count: { type: 'integer' },
          },
        },
        CareerPathRow: {
          type: 'object',
          properties: {
            degree: { type: 'string' },
            role: { type: 'string' },
            count: { type: 'integer' },
          },
        },
      },
    },
  },
  // swagger-jsdoc scans these globs for @swagger JSDoc blocks
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: false,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
};

module.exports = { swaggerSpec, swaggerUiOptions };
