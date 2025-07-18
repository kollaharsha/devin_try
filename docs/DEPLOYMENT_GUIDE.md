# Deployment Guide

This guide explains how to deploy services to specific environments and regions using the AWS CDK ECS Framework.

## Environment-Specific Deployment

### Deploy to All Environments
```bash
# Deploy to dev (single region: us-east-1)
cdk deploy --context environment=dev

# Deploy to qa (single region: us-east-1)  
cdk deploy --context environment=qa

# Deploy to uat (multi-region: us-east-1 + us-east-2)
cdk deploy --context environment=uat

# Deploy to prod (multi-region: us-east-1 + us-east-2)
cdk deploy --context environment=prod
```

## Region-Specific Deployment

For multi-region environments (uat/prod), you can deploy to specific regions to avoid impacting other regions:

### Deploy to Primary Region Only
```bash
# Deploy only to primary region (us-east-1)
cdk deploy --context environment=prod --context region=primary

# This creates only these stacks:
# - EcsFramework-Base-prod
# - EcsFramework-Services-prod
```

### Deploy to Secondary Region Only
```bash
# Deploy only to secondary region (us-east-2) 
cdk deploy --context environment=prod --context region=secondary

# This creates only these stacks:
# - EcsFramework-Base-prod-secondary
# - EcsFramework-Services-prod-secondary
```

### Deploy to Both Regions (Default)
```bash
# Deploy to both regions (default behavior)
cdk deploy --context environment=prod

# This creates all stacks:
# - EcsFramework-Base-prod
# - EcsFramework-Services-prod  
# - EcsFramework-Base-prod-secondary
# - EcsFramework-Services-prod-secondary
```

## Service-Level Environment Filtering

Services can be configured to deploy only to specific environments using the `environments` field:

```yaml
# Deploy to all environments
name: api-service
environments: ["dev", "qa", "uat", "prod"]

# Deploy only to dev
name: dev-only-service
environments: ["dev"]

# Skip dev environment
name: production-service
environments: ["qa", "uat", "prod"]
```

## Common Deployment Scenarios

### 1. Testing Changes in Secondary Region First
```bash
# 1. Deploy changes to secondary region only
cdk deploy --context environment=prod --context region=secondary

# 2. Test and validate in us-east-2
# 3. If successful, deploy to primary region
cdk deploy --context environment=prod --context region=primary
```

### 2. Rolling Deployment Across Regions
```bash
# 1. Deploy to secondary region first
cdk deploy --context environment=prod --context region=secondary

# 2. Monitor and validate
# 3. Deploy to primary region
cdk deploy --context environment=prod --context region=primary
```

### 3. Emergency Rollback
```bash
# Rollback secondary region only
cdk deploy --context environment=prod --context region=secondary

# Or rollback primary region only  
cdk deploy --context environment=prod --context region=primary
```

### 4. Development Workflow
```bash
# 1. Test in dev environment
cdk deploy --context environment=dev

# 2. Promote to qa
cdk deploy --context environment=qa

# 3. Deploy to uat secondary region first
cdk deploy --context environment=uat --context region=secondary

# 4. Deploy to uat primary region
cdk deploy --context environment=uat --context region=primary

# 5. Deploy to prod secondary region
cdk deploy --context environment=prod --context region=secondary

# 6. Deploy to prod primary region
cdk deploy --context environment=prod --context region=primary
```

## Stack Naming Convention

| Environment | Region | Base Stack | Service Stack |
|-------------|--------|------------|---------------|
| dev | us-east-1 | EcsFramework-Base-dev | EcsFramework-Services-dev |
| qa | us-east-1 | EcsFramework-Base-qa | EcsFramework-Services-qa |
| uat | us-east-1 | EcsFramework-Base-uat | EcsFramework-Services-uat |
| uat | us-east-2 | EcsFramework-Base-uat-secondary | EcsFramework-Services-uat-secondary |
| prod | us-east-1 | EcsFramework-Base-prod | EcsFramework-Services-prod |
| prod | us-east-2 | EcsFramework-Base-prod-secondary | EcsFramework-Services-prod-secondary |

## Synthesis and Planning

You can use `cdk synth` to preview what will be deployed without actually deploying:

```bash
# Preview dev deployment
cdk synth --context environment=dev

# Preview prod primary region only
cdk synth --context environment=prod --context region=primary

# Preview prod secondary region only  
cdk synth --context environment=prod --context region=secondary

# Preview full prod deployment (both regions)
cdk synth --context environment=prod
```

## Best Practices

1. **Test in Secondary Region First**: For production deployments, always test changes in the secondary region first
2. **Use Environment Filtering**: Configure services with appropriate environment targeting to avoid accidental deployments
3. **Monitor Between Regions**: Always monitor the first region deployment before proceeding to the next
4. **Plan Your Rollbacks**: Know how to rollback each region independently
5. **Use Synthesis**: Always run `cdk synth` first to preview changes before deploying
