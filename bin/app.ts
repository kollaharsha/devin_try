#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServiceStack } from '../lib/stacks/service-stack';
import { BaseStack } from '../lib/stacks/base-stack';
import { loadEnvironmentConfig } from '../lib/utils/environment';

const app = new cdk.App();

const environment = app.node.tryGetContext('environment') || 'dev';
const targetRegion = app.node.tryGetContext('region'); // Optional: 'primary', 'secondary', or undefined (both)
const envConfig = loadEnvironmentConfig(environment);

const shouldDeployPrimary = !targetRegion || targetRegion === 'primary';
const shouldDeploySecondary = envConfig.multiRegion && envConfig.secondaryRegion && 
  (!targetRegion || targetRegion === 'secondary');

console.log(`Deployment configuration for ${environment}:`);
console.log(`  Primary region (${envConfig.primaryRegion}): ${shouldDeployPrimary ? 'ENABLED' : 'SKIPPED'}`);
if (envConfig.multiRegion && envConfig.secondaryRegion) {
  console.log(`  Secondary region (${envConfig.secondaryRegion}): ${shouldDeploySecondary ? 'ENABLED' : 'SKIPPED'}`);
}

if (shouldDeployPrimary) {
  const baseStack = new BaseStack(app, `EcsFramework-Base-${environment}`, {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: envConfig.primaryRegion,
    },
    environment,
    envConfig,
  });

  const serviceStack = new ServiceStack(app, `EcsFramework-Services-${environment}`, {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: envConfig.primaryRegion,
    },
    environment,
    envConfig,
    vpc: baseStack.vpc,
    cluster: baseStack.cluster,
  });
}

if (shouldDeploySecondary) {
  const baseStackSecondary = new BaseStack(app, `EcsFramework-Base-${environment}-secondary`, {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: envConfig.secondaryRegion,
    },
    environment,
    envConfig,
  });

  const serviceStackSecondary = new ServiceStack(app, `EcsFramework-Services-${environment}-secondary`, {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: envConfig.secondaryRegion,
    },
    environment,
    envConfig,
    vpc: baseStackSecondary.vpc,
    cluster: baseStackSecondary.cluster,
  });
}
