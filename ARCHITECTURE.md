# AWS ECS CDK Framework Architecture

This document explains the architecture of the AWS ECS CDK Framework to help new engineers understand the codebase structure, design patterns, and how to extend the framework.

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Core Components](#core-components)
4. [Data Flow](#data-flow)
5. [Configuration System](#configuration-system)
6. [Deployment Architecture](#deployment-architecture)
7. [Extensibility](#extensibility)
8. [Best Practices](#best-practices)

## Overview

The AWS ECS CDK Framework is a TypeScript-based infrastructure-as-code solution that enables declarative deployment of containerized applications to AWS ECS Fargate. The framework uses YAML configuration files to define services and environments, making it easy for developers to deploy applications without deep AWS knowledge.

### Key Design Principles

- **Configuration-Driven**: All service definitions are externalized to YAML files
- **Environment-Aware**: Different configurations for dev, qa, uat, and prod environments
- **Multi-Region Support**: Automatic multi-region deployment for production environments
- **Extensible**: Built with CDK constructs that can be easily extended
- **Type-Safe**: Full TypeScript support with comprehensive interfaces

## Directory Structure

```
├── bin/                          # CDK application entry points
│   └── app.ts                   # Main CDK app that orchestrates stack creation
├── lib/                         # Core framework code
│   ├── constructs/             # Reusable CDK constructs
│   │   ├── ecs-service.ts      # Main ECS service construct
│   │   ├── load-balancer.ts    # Application Load Balancer construct
│   │   └── scaling.ts          # Auto-scaling construct
│   ├── stacks/                 # CDK stacks
│   │   ├── base-stack.ts       # Infrastructure foundation (VPC, ECS cluster)
│   │   └── service-stack.ts    # ECS services deployment
│   └── utils/                  # Utility functions and helpers
│       ├── config-loader.ts    # YAML configuration parsing
│       └── environment.ts      # Environment-specific logic
├── config/                     # Configuration files
│   ├── environments/          # Environment-specific settings
│   │   ├── dev.yaml
│   │   ├── qa.yaml
│   │   ├── uat.yaml
│   │   └── prod.yaml
│   └── services/              # Service definitions
│       ├── api-service.yaml
│       ├── worker-service.yaml
│       ├── grpc-service.yaml
│       └── multi-service.yaml
├── package.json               # Dependencies and scripts
├── cdk.json                   # CDK configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # User documentation
```

## Core Components

### 1. CDK Application (`bin/app.ts`)

The main entry point that:
- Reads the environment context from CDK command line
- Loads environment-specific configuration
- Creates base infrastructure and service stacks
- Handles multi-region deployment for uat/prod environments

```typescript
const environment = app.node.tryGetContext('environment') || 'dev';
const envConfig = loadEnvironmentConfig(environment);
```

### 2. Base Stack (`lib/stacks/base-stack.ts`)

Creates foundational AWS infrastructure:
- **VPC**: Multi-AZ setup with public, private, and isolated subnets
- **ECS Cluster**: Fargate-enabled cluster with container insights
- **CloudWatch Log Groups**: Centralized logging with environment-specific retention

**Key Features:**
- Environment-specific NAT gateway configuration (1 for dev/qa, 3 for prod)
- Automatic availability zone selection
- Cost-optimized subnet allocation

### 3. Service Stack (`lib/stacks/service-stack.ts`)

Orchestrates the deployment of all ECS services:
- Loads service configurations from YAML files
- Creates ECS service constructs for each service
- Manages service interdependencies
- Exports important values for cross-stack references

### 4. ECS Service Construct (`lib/constructs/ecs-service.ts`)

The core construct that creates a complete ECS service:

**Components Created:**
- **Task Definition**: Container specifications, resource allocation
- **ECS Service**: Service configuration, desired count, deployment settings
- **Security Groups**: Network access controls
- **IAM Roles**: Task execution and task roles with minimal permissions
- **Load Balancer**: Optional ALB for internet-facing services
- **Auto Scaling**: CPU and memory-based scaling policies

**Key Methods:**
- `addCustomConstruct()`: Extend service with additional CDK constructs
- `addContainer()`: Add additional containers to the task definition
- `getService()`: Access the underlying ECS service for customization

### 5. Load Balancer Construct (`lib/constructs/load-balancer.ts`)

Creates and configures Application Load Balancers:

**Features:**
- **Protocol Support**: HTTP and gRPC with protocol-specific optimizations
- **SSL/TLS**: Automatic certificate management and HTTPS redirection
- **mTLS Support**: Mutual TLS authentication for enhanced security
- **Path-Based Routing**: Context path routing for microservices
- **Health Checks**: Configurable health check parameters
- **DNS Integration**: Route53 record creation for custom domains

### 6. Scaling Construct (`lib/constructs/scaling.ts`)

Implements auto-scaling policies:
- **Target Tracking**: CPU and memory utilization-based scaling
- **Configurable Cooldowns**: Separate scale-in and scale-out cooldowns
- **Custom Metrics**: Extensible for custom CloudWatch metrics
- **Step Scaling**: Support for step scaling policies

## Data Flow

### 1. Configuration Loading

```
YAML Files → config-loader.ts → Validated ServiceConfig Objects
```

1. **File Discovery**: Scans `config/services/` directory for YAML files
2. **Parsing**: Uses `yaml` library to parse configuration files
3. **Validation**: Validates required fields and data types
4. **Normalization**: Applies defaults and normalizes configuration

### 2. Stack Creation

```
CDK App → Environment Config → Base Stack → Service Stack → ECS Services
```

1. **Environment Resolution**: Determines target environment from CDK context
2. **Base Infrastructure**: Creates VPC, ECS cluster, and shared resources
3. **Service Deployment**: Iterates through service configurations
4. **Resource Creation**: Creates ECS services, load balancers, and scaling policies

### 3. Multi-Region Deployment

```
Primary Region Stack → Secondary Region Stack (for uat/prod)
```

For uat and prod environments:
1. Creates identical infrastructure in both regions
2. Uses region-specific resource naming
3. Maintains separate CloudFormation stacks per region

## Configuration System

### Environment Configuration

Environment files define region-specific and environment-specific settings:

```yaml
name: prod
primaryRegion: us-east-1
secondaryRegion: us-east-2
multiRegion: true
vpcCidr: "10.3.0.0/16"
certificateArn: "arn:aws:acm:..."
hostedZoneId: "Z1D633PJN98FT9"
domainName: "example.com"
```

### Service Configuration

Service files define application-specific settings:

```yaml
name: "api-service"
domainName: "api.example.com"
protocol: "HTTP"
port: 8080
containerImage: "my-account.dkr.ecr.us-east-1.amazonaws.com/api:latest"
taskSize:
  cpu: 512
  memory: 1024
scaling:
  minCapacity: 2
  maxCapacity: 10
healthCheck:
  path: "/health"
  interval: 30
deployment:
  type: "blue-green"
```

### Configuration Validation

The framework includes comprehensive validation:
- **Required Fields**: Ensures all mandatory configuration is present
- **Type Checking**: Validates data types and formats
- **Enum Validation**: Checks protocol, deployment type values
- **Dependency Validation**: Ensures related configurations are consistent

## Deployment Architecture

### Single Region (dev/qa)

```
Internet → ALB → ECS Service (us-east-1)
```

### Multi-Region (uat/prod)

```
Internet → Route53 → ALB (us-east-1) → ECS Service
                  → ALB (us-east-2) → ECS Service
```

### Deployment Types

1. **Rolling Deployment**: Default ECS rolling update
2. **Blue/Green Deployment**: Complete environment switch
3. **Canary Deployment**: Gradual traffic shifting

## Extensibility

### Adding New Service Types

1. **Extend ServiceConfig Interface**: Add new configuration options
2. **Update Validation**: Add validation rules for new fields
3. **Modify ECS Service Construct**: Implement new functionality
4. **Update Documentation**: Document new configuration options

### Custom Constructs

```typescript
const service = new EcsServiceConstruct(this, 'MyService', props);
const monitoring = new CustomMonitoringConstruct(this, 'Monitoring', {
  service: service.getService(),
});
service.addCustomConstruct(monitoring);
```

### Environment-Specific Customization

```typescript
export function getEnvironmentSpecificConfig(env: string): any {
  switch (env) {
    case 'prod':
      return { enableDetailedMonitoring: true };
    default:
      return { enableDetailedMonitoring: false };
  }
}
```

## Best Practices

### 1. Configuration Management

- **Separate Concerns**: Keep environment and service configurations separate
- **Use Defaults**: Provide sensible defaults for optional configurations
- **Validate Early**: Validate configurations at load time, not deployment time

### 2. Resource Naming

- **Consistent Naming**: Use environment prefixes for all resources
- **Avoid Conflicts**: Include unique identifiers to prevent naming conflicts
- **Descriptive Names**: Use descriptive names that indicate purpose

### 3. Security

- **Least Privilege**: Grant minimal required permissions to IAM roles
- **Network Isolation**: Use security groups to restrict network access
- **Secrets Management**: Use AWS Secrets Manager for sensitive data

### 4. Cost Optimization

- **Right-Sizing**: Use appropriate task sizes for workloads
- **Spot Instances**: Use Fargate Spot for non-critical workloads
- **Auto Scaling**: Implement proper scaling policies to avoid over-provisioning

### 5. Monitoring and Observability

- **Structured Logging**: Use structured logging with consistent formats
- **Health Checks**: Implement comprehensive health checks
- **Metrics**: Export custom metrics for business logic monitoring

## Common Patterns

### 1. Service Discovery

Services can discover each other using:
- **DNS**: Service discovery via Route53 private hosted zones
- **Service Mesh**: Integration with AWS App Mesh for advanced routing
- **Environment Variables**: Pass service endpoints via environment variables

### 2. Database Integration

```yaml
environmentVariables:
  DATABASE_URL: "postgresql://user:pass@rds-endpoint:5432/db"
```

### 3. Sidecar Patterns

```yaml
sidecarContainers:
  - name: "log-router"
    image: "fluent/fluent-bit:latest"
    essential: false
  - name: "metrics-exporter"
    image: "prom/node-exporter:latest"
    essential: false
```

This architecture provides a solid foundation for deploying containerized applications to AWS ECS while maintaining flexibility, security, and operational excellence.
