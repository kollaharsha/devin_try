# AWS ECS CDK Framework

A flexible AWS CDK framework for deploying ECS Fargate services using YAML-based configuration with multi-environment and multi-region support.

<!-- Dummy change for testing PR workflow -->

## Features

- **Multi-Environment Support**: dev, qa, uat, prod environments
- **Multi-Region Support**: us-east-1 (primary) and us-east-2 (secondary) for uat/prod
- **Flexible Service Configuration**: Support for various ECS service parameters
- **YAML-Based Configuration**: Easy-to-manage service definitions
- **Extensible CDK APIs**: Framework can be extended using standard CDK constructs
- **Advanced Deployment Options**: Blue/Green, Canary deployments
- **Security Features**: mTLS on ALB support
- **Sidecar Container Support**: Additional containers alongside main service

## Architecture

### Directory Structure

```
├── lib/                          # CDK constructs and stacks
│   ├── constructs/              # Reusable CDK constructs
│   │   ├── ecs-service.ts       # Main ECS service construct
│   │   ├── load-balancer.ts     # ALB construct with mTLS support
│   │   ├── networking.ts        # VPC and networking setup
│   │   └── scaling.ts           # Auto-scaling configurations
│   ├── stacks/                  # CDK stacks
│   │   ├── base-stack.ts        # Base infrastructure stack
│   │   └── service-stack.ts     # ECS service stack
│   └── utils/                   # Utility functions
│       ├── config-loader.ts     # YAML configuration loader
│       └── environment.ts       # Environment-specific logic
├── config/                      # YAML configuration files
│   ├── services/               # Service configurations
│   │   ├── api-service.yaml    # Example API service config
│   │   └── worker-service.yaml # Example worker service config
│   └── environments/           # Environment-specific configs
│       ├── dev.yaml
│       ├── qa.yaml
│       ├── uat.yaml
│       └── prod.yaml
├── bin/                        # CDK app entry points
│   └── app.ts                  # Main CDK app
├── package.json                # Dependencies and scripts
├── cdk.json                    # CDK configuration
└── tsconfig.json              # TypeScript configuration
```

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your services in `config/services/`

3. Deploy to an environment:
   ```bash
   npm run deploy:dev
   npm run deploy:qa
   npm run deploy:uat
   npm run deploy:prod
   ```

## Configuration

### Service Configuration Schema

Each service is defined in a YAML file with the following structure:

```yaml
name: "my-api-service"
domainName: "api.example.com"
contextPath: "/api/v1"
protocol: "HTTP"  # HTTP, gRPC
port: 8080
containerImage: "my-account.dkr.ecr.us-east-1.amazonaws.com/my-api:latest"
taskSize:
  cpu: 512
  memory: 1024
scaling:
  minCapacity: 2
  maxCapacity: 10
  targetCpuUtilization: 70
  targetMemoryUtilization: 80
environmentVariables:
  NODE_ENV: "production"
  DATABASE_URL: "postgresql://..."
healthCheck:
  path: "/health"
  interval: 30
  timeout: 5
  retries: 3
security:
  mTLS: true
deployment:
  type: "blue-green"  # rolling, blue-green, canary
  canaryPercentage: 10  # for canary deployments
sidecarContainers:
  - name: "logging-agent"
    image: "fluent/fluent-bit:latest"
    essential: false
```

## Environment Configuration

Environment-specific settings are defined in `config/environments/`:

- **dev/qa**: Single region (us-east-1)
- **uat/prod**: Multi-region (us-east-1 primary, us-east-2 secondary)

## Extending the Framework

The framework is built with extensibility in mind. You can:

1. Add custom CDK constructs in `lib/constructs/`
2. Extend service configurations with new parameters
3. Create custom deployment strategies
4. Add new environment types

## Deployment Types

- **Rolling**: Standard ECS rolling deployment
- **Blue/Green**: Zero-downtime deployment with traffic switching
- **Canary**: Gradual traffic shifting with monitoring

## Security Features

- mTLS support on Application Load Balancer
- VPC isolation
- Security groups with least privilege access
- IAM roles with minimal required permissions
