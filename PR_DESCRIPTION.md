# Add comprehensive AWS CDK framework for ECS Fargate services with YAML configuration

## Overview

This PR introduces a complete AWS CDK framework that enables deployment of ECS Fargate services using YAML-based configuration files. The framework supports multi-environment deployments with flexible service configurations and extensible CDK APIs.

## Key Features

### 🏗️ **Multi-Environment Support**
- **Dev/QA**: Single region deployment (us-east-1)
- **UAT/Prod**: Multi-region deployment (us-east-1 primary, us-east-2 secondary)
- Environment-specific configurations with automatic region selection

### 📋 **Flexible Service Configuration**
- **Protocols**: HTTP and gRPC support
- **Scaling**: Auto-scaling with CPU/memory utilization targets
- **Health Checks**: Configurable health check endpoints and parameters
- **Security**: mTLS support on Application Load Balancer
- **Deployment Types**: Blue-green, canary, and rolling deployments
- **Sidecar Containers**: Support for logging agents, metrics collectors, etc.

### 🔧 **Extensible Architecture**
- Modular CDK constructs for easy extension
- Plugin-style architecture for custom functionality
- Well-defined interfaces for adding new features

## Architecture

The framework consists of several key components:

### Core Stacks
- **BaseStack**: VPC, ECS Cluster, and foundational infrastructure
- **ServiceStack**: Individual ECS services with load balancers and scaling

### CDK Constructs
- **EcsServiceConstruct**: Main service definition with task definitions
- **LoadBalancerConstruct**: ALB configuration with protocol support
- **ScalingConstruct**: Auto-scaling policies and target tracking

### Configuration System
- **Environment Configs**: Environment-specific settings (VPC CIDR, regions, etc.)
- **Service Configs**: Service-specific configurations (image, scaling, health checks, etc.)
- **YAML Validation**: Type-safe configuration loading with validation

## Sample Configurations

### API Service (HTTP with Blue-Green Deployment)
```yaml
name: "api-service"
domainName: "api.example.com"
contextPath: "/api/v1"
protocol: "HTTP"
port: 8080
deployment:
  type: "blue-green"
  terminationWaitTime: 300
```

### gRPC Service (with mTLS and Canary Deployment)
```yaml
name: "grpc-service"
protocol: "gRPC"
port: 9090
security:
  mTLS: true
deployment:
  type: "canary"
  canaryPercentage: 20
```

### Worker Service (Background Processing)
```yaml
name: "worker-service"
protocol: "HTTP"
port: 3000
deployment:
  type: "rolling"
sidecarContainers:
  - name: "metrics-collector"
    image: "prom/node-exporter:latest"
```

## Usage

### Quick Start
```bash
# Install dependencies
npm install

# Deploy to development
npm run deploy:dev

# Deploy to production (multi-region)
npm run deploy:prod

# Synthesize CloudFormation templates
npm run synth
```

### Adding New Services
1. Create a YAML configuration file in `config/services/`
2. Define service parameters (image, scaling, health checks, etc.)
3. Deploy using `cdk deploy --context environment=<env>`

### Extending the Framework
```typescript
// Add custom constructs
const customConstruct = new MyCustomConstruct(this, 'Custom', {
  // configuration
});

// Extend service functionality
serviceConstruct.addCustomConstruct(customConstruct);
```

## File Structure

```
├── bin/
│   └── app.ts                 # CDK app entry point
├── lib/
│   ├── constructs/           # Reusable CDK constructs
│   │   ├── ecs-service.ts    # ECS service definition
│   │   ├── load-balancer.ts  # ALB configuration
│   │   └── scaling.ts        # Auto-scaling policies
│   ├── stacks/              # CDK stacks
│   │   ├── base-stack.ts    # Base infrastructure
│   │   └── service-stack.ts # Service deployments
│   └── utils/               # Utility functions
│       ├── config-loader.ts # YAML configuration loading
│       └── environment.ts   # Environment management
├── config/
│   ├── environments/        # Environment configurations
│   │   ├── dev.yaml
│   │   ├── qa.yaml
│   │   ├── uat.yaml
│   │   └── prod.yaml
│   └── services/           # Service configurations
│       ├── api-service.yaml
│       ├── grpc-service.yaml
│       ├── worker-service.yaml
│       └── multi-service.yaml
├── ARCHITECTURE.md          # Detailed architecture documentation
└── README.md               # Project overview and usage
```

## Testing

The framework has been tested with:
- ✅ TypeScript compilation
- ✅ CDK synthesis for dev environment
- ✅ CDK synthesis for prod environment (multi-region)
- ✅ All service configuration examples
- ✅ Multi-region deployment validation

## Implementation Details

### Multi-Region Support
- Automatic region detection based on environment
- Cross-region resource sharing and dependencies
- Region-specific naming conventions

### Security Features
- VPC isolation with public/private/isolated subnets
- Security groups with least privilege access
- IAM roles with minimal required permissions
- mTLS support for secure service communication

### Deployment Strategies
- **Rolling**: Gradual replacement of instances
- **Blue-Green**: Complete environment switch
- **Canary**: Percentage-based traffic splitting

### Monitoring and Logging
- CloudWatch log groups with environment-specific retention
- Container insights for production environments
- Structured logging with log aggregation support

## Future Enhancements

- [ ] Integration with AWS Secrets Manager
- [ ] Support for custom domain certificates
- [ ] Database integration patterns
- [ ] CI/CD pipeline templates
- [ ] Cost optimization recommendations

---

**Link to Devin run**: https://app.devin.ai/sessions/18a11f94ab76471fa12e749de8288131

**Requested by**: @kollaharsha

This framework provides a solid foundation for deploying ECS Fargate services at scale while maintaining flexibility and extensibility for future requirements.
