# 🧠 Gawin AI Orchestrator Backend

A production-ready AI orchestrator backend that intelligently routes queries, manages model selection, ensures safety, and provides comprehensive analytics for mental health and educational AI applications.

## 🌟 Features

### Core Architecture
- **🎯 Intelligent Query Routing**: Meta-model + rule-based routing for optimal model selection
- **🔒 Comprehensive Safety System**: Crisis detection, content moderation, and escalation workflows
- **📊 Real-time Feature Store**: User behavior analytics and contextual features
- **🔍 Vector Database**: Semantic search, RAG, and conversation memory
- **⚡ Event-Driven Architecture**: Scalable, decoupled service communication
- **🤖 MLOps Pipeline**: Automated training, evaluation, and model deployment

### Safety & Compliance
- **Crisis Detection**: Automated detection of suicide ideation, self-harm, and mental health crises
- **Content Moderation**: Multi-layer filtering for inappropriate content
- **Privacy-First**: GDPR/CCPA compliant data handling with user consent management
- **Human Escalation**: Automated escalation workflows for high-risk situations
- **Audit Logging**: Comprehensive logging for regulatory compliance

### Production Features
- **🚀 High Performance**: Optimized for low-latency, high-throughput operations
- **📈 Monitoring**: Prometheus metrics, Grafana dashboards, health checks
- **🔄 Load Balancing**: Nginx reverse proxy with rate limiting
- **📦 Containerized**: Docker deployment with docker-compose orchestration
- **🛡️ Security**: JWT authentication, rate limiting, input validation

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │  Orchestrator   │
│   (Next.js)     │◄──►│  (Express.js)    │◄──►│   (TypeScript)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                         │
                                ▼                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Safety Processor│    │  Feature Store   │    │ Vector Database │
│ (Crisis/Safety) │    │ (User Analytics) │    │  (Embeddings)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Event Bus      │    │   MLOps Pipeline │    │   Model Registry│
│  (Event-driven) │    │  (Training/Eval) │    │  (Versioning)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+
- API keys for AI services (OpenAI, Groq, etc.)

### 1. Environment Setup

```bash
# Clone and navigate to backend
cd gawin/backend

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 2. Development Setup

```bash
# Install dependencies
npm install

# Start development database
docker-compose up postgres redis -d

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### 3. Production Deployment

```bash
# Build and start all services
docker-compose up --build -d

# Check service health
docker-compose ps
curl http://localhost/health
```

## 🔧 Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/gawin_ai
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRY=24h

# AI Services
OPENAI_API_KEY=your-openai-api-key
GROQ_API_KEY=your-groq-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Vector Database
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=us-east1-gcp

# Safety & Moderation
PERSPECTIVE_API_KEY=your-google-perspective-api-key
CRISIS_DETECTION_ENABLED=true
HUMAN_ESCALATION_ENABLED=true
CRISIS_HELPLINE_PHONE=988
```

### Feature Flags

```bash
# Routing & Testing
ENABLE_CANARY_ROUTING=true
ENABLE_SHADOW_TESTING=false
ENABLE_A_B_TESTING=true
ENABLE_FINE_TUNING=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_MAX_REQUESTS_PREMIUM=500

# Model Configuration
DEFAULT_MODEL=gpt-4
FALLBACK_MODEL=gpt-3.5-turbo
MAX_TOKENS=2048
TEMPERATURE=0.7
```

## 📡 API Endpoints

### Core Endpoints

#### Query Processing
```http
POST /api/v1/query
Content-Type: application/json
Authorization: Bearer <token>

{
  "text": "Help me understand calculus derivatives",
  "context": {
    "subject": "mathematics",
    "grade_level": "college"
  },
  "model_preference": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 2048,
  "consent_to_train": true,
  "priority": "normal"
}
```

#### Authentication
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "remember_me": false
}
```

#### User Profile
```http
GET /api/v1/user/profile
Authorization: Bearer <token>

PUT /api/v1/user/profile
Content-Type: application/json
Authorization: Bearer <token>

{
  "consentFlags": {
    "dataCollection": true,
    "modelTraining": true,
    "analytics": true,
    "mentalHealthFeatures": true
  },
  "preferences": {
    "responseStyle": "detailed",
    "language": "en"
  }
}
```

#### Mental Health Support
```http
POST /api/v1/mental-health/assess
Content-Type: application/json
Authorization: Bearer <token>

{
  "text": "I'm feeling really overwhelmed with school",
  "sessionId": "sess_123"
}
```

### Monitoring Endpoints

```http
GET /health              # Basic health check
GET /health/detailed     # Comprehensive health status
GET /health/ready        # Kubernetes readiness probe
GET /health/live         # Kubernetes liveness probe
GET /metrics             # Prometheus metrics
```

## 🛠️ Development

### Project Structure

```
backend/
├── src/
│   ├── api/           # API Gateway and routing
│   ├── orchestrator/  # AI routing and decision logic
│   ├── safety/        # Safety processors and moderation
│   ├── features/      # Feature store and user analytics
│   ├── vector/        # Vector database and embeddings
│   ├── events/        # Event bus and messaging
│   ├── mlops/         # Training pipeline and MLOps
│   └── utils/         # Shared utilities and helpers
├── monitoring/        # Prometheus and Grafana configs
├── nginx/             # Reverse proxy configuration
├── logs/              # Application logs
└── docker-compose.yml # Multi-service deployment
```

### Development Commands

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm run start            # Start production server

# Testing
npm test                 # Run test suite
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # ESLint checking
npm run lint:fix         # Auto-fix linting issues
npm run type-check       # TypeScript type checking

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data
npm run db:reset         # Reset database (development only)

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Run containerized application
```

### Adding New Models

1. **Register Model in Orchestrator:**
```typescript
// src/orchestrator/OrchestratorService.ts
private modelConfigs = {
  'your-new-model': {
    id: 'your-new-model',
    provider: 'openai',
    model: 'gpt-4-turbo',
    maxTokens: 4096,
    costTier: 'high',
    estimatedLatency: 3000,
    strengths: ['reasoning', 'analysis'],
    safetyLevel: 'high'
  }
};
```

2. **Add Routing Rules:**
```typescript
private routingRules = [
  {
    condition: (ctx) => ctx.query.includes('advanced analysis'),
    action: 'your-new-model',
    priority: 8,
    reasoning: 'Advanced analysis detected'
  }
];
```

3. **Update Model Registry:**
```sql
INSERT INTO model_registry (model_id, name, description, base_model, status)
VALUES ('your-new-model', 'Advanced Analysis Model', 'Specialized for complex analysis tasks', 'gpt-4-turbo', 'production');
```

## 🔒 Security & Safety

### Safety Architecture

The system implements multiple layers of safety:

1. **Input Validation**: Schema validation and sanitization
2. **Crisis Detection**: Real-time analysis for mental health emergencies
3. **Content Moderation**: Multi-stage filtering pipeline
4. **Output Safety**: Response validation and safety scoring
5. **Human Escalation**: Automated escalation for high-risk cases

### Crisis Response Flow

```mermaid
graph TD
    A[User Query] --> B[Safety Preprocessing]
    B --> C{Crisis Detected?}
    C -->|Yes| D[Severity Assessment]
    D --> E{Imminent Risk?}
    E -->|Yes| F[Emergency Response]
    E -->|No| G[Support Resources]
    C -->|No| H[Normal Processing]
    F --> I[Human Escalation]
    G --> J[Continue with Safety]
    H --> K[Standard Response]
```

### Privacy Compliance

- **Data Minimization**: Only collect necessary data
- **Consent Management**: Granular consent controls
- **Right to Deletion**: User data anonymization
- **Audit Trails**: Comprehensive logging for compliance
- **Encryption**: End-to-end encryption for sensitive data

## 📊 Monitoring & Analytics

### Metrics Dashboard

Access Grafana dashboard at `http://localhost:3000` (admin/admin123)

Key metrics include:
- **Request Volume**: Queries per second, success rates
- **Response Times**: P50, P95, P99 latencies
- **Model Performance**: Usage, satisfaction, costs
- **Safety Events**: Crisis detections, escalations
- **System Health**: CPU, memory, database performance

### Custom Metrics

The system exposes Prometheus metrics:

```
# Request metrics
gawin_requests_total{method, endpoint, status}
gawin_request_duration_seconds{method, endpoint}

# AI metrics
gawin_ai_queries_total{model, success}
gawin_ai_processing_time_seconds{model}
gawin_ai_tokens_used_total{model}

# Safety metrics
gawin_safety_violations_total{type, severity}
gawin_crisis_detections_total{type, action}

# Business metrics
gawin_user_satisfaction_score{model}
gawin_model_costs_total{model}
```

## 🚀 Production Deployment

### Docker Deployment

```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale specific services
docker-compose up --scale api=3 -d

# Update specific service
docker-compose up --build api -d
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gawin-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gawin-api
  template:
    metadata:
      labels:
        app: gawin-api
    spec:
      containers:
      - name: api
        image: gawin/ai-orchestrator:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3001
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3001
```

### Load Balancing

Configure Nginx for production:

```nginx
upstream gawin_api {
    least_conn;
    server api-1:3001 weight=1 max_fails=3 fail_timeout=30s;
    server api-2:3001 weight=1 max_fails=3 fail_timeout=30s;
    server api-3:3001 weight=1 max_fails=3 fail_timeout=30s;
}
```

## 🧪 Testing

### Testing Strategy

```bash
# Unit tests
npm test src/orchestrator/

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Load testing
npm run test:load

# Safety testing
npm run test:safety
```

### Safety Testing

Automated safety tests validate:
- Crisis detection accuracy
- Content moderation effectiveness
- Escalation workflows
- Response safety scoring

## 📈 Performance Optimization

### Caching Strategy

- **Redis**: Session data, rate limiting, temporary storage
- **Vector Cache**: Embedding caching for similarity searches
- **Response Cache**: Cached responses for common queries
- **CDN**: Static assets and API responses

### Database Optimization

- **Connection Pooling**: Optimized database connections
- **Query Optimization**: Indexed queries and query analysis
- **Partitioning**: Time-based partitioning for analytics
- **Archiving**: Automated data archiving policies

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and add tests
4. Run quality checks: `npm run lint && npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Create Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Write comprehensive tests
- Document public APIs
- Use meaningful commit messages

## 📞 Support

### Crisis Resources

**🇺🇸 United States:**
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741

**🇵🇭 Philippines:**
- Hopeline Philippines: 1553
- In Touch Crisis Line: (02) 8893-7603

**Emergency:** Always call local emergency services (911, 112, etc.)

### Technical Support

- 📧 Email: support@gawin.ai
- 📄 Documentation: [docs.gawin.ai](https://docs.gawin.ai)
- 🐛 Issues: [GitHub Issues](https://github.com/gawin/orchestrator/issues)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Mental health professionals who provided safety guidance
- Open source community for foundational tools
- AI safety researchers for best practices
- Educational experts for pedagogical insights

---

**⚠️ Important Safety Notice**

This system is designed to detect and respond to mental health crises, but it is not a replacement for professional mental health care. Users experiencing mental health emergencies should contact emergency services or mental health professionals immediately.

**For Mental Health Emergencies:**
- 🇺🇸 Call 988 (Suicide & Crisis Lifeline)
- 🇵🇭 Call 1553 (Hopeline Philippines)
- 🌍 Contact local emergency services

This AI system is a tool to support education and well-being, not to replace human care and professional judgment.