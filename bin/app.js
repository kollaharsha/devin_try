#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const service_stack_1 = require("../lib/stacks/service-stack");
const base_stack_1 = require("../lib/stacks/base-stack");
const environment_1 = require("../lib/utils/environment");
const app = new cdk.App();
const environment = app.node.tryGetContext('environment') || 'dev';
const envConfig = (0, environment_1.loadEnvironmentConfig)(environment);
const baseStack = new base_stack_1.BaseStack(app, `EcsFramework-Base-${environment}`, {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: envConfig.primaryRegion,
    },
    environment,
    envConfig,
});
const serviceStack = new service_stack_1.ServiceStack(app, `EcsFramework-Services-${environment}`, {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: envConfig.primaryRegion,
    },
    environment,
    envConfig,
    vpc: baseStack.vpc,
    cluster: baseStack.cluster,
});
if (envConfig.multiRegion && envConfig.secondaryRegion) {
    const baseStackSecondary = new base_stack_1.BaseStack(app, `EcsFramework-Base-${environment}-secondary`, {
        env: {
            account: process.env.CDK_DEFAULT_ACCOUNT,
            region: envConfig.secondaryRegion,
        },
        environment,
        envConfig,
    });
    const serviceStackSecondary = new service_stack_1.ServiceStack(app, `EcsFramework-Services-${environment}-secondary`, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVDQUFxQztBQUNyQyxtQ0FBbUM7QUFDbkMsK0RBQTJEO0FBQzNELHlEQUFxRDtBQUNyRCwwREFBaUU7QUFFakUsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFMUIsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksS0FBSyxDQUFDO0FBQ25FLE1BQU0sU0FBUyxHQUFHLElBQUEsbUNBQXFCLEVBQUMsV0FBVyxDQUFDLENBQUM7QUFFckQsTUFBTSxTQUFTLEdBQUcsSUFBSSxzQkFBUyxDQUFDLEdBQUcsRUFBRSxxQkFBcUIsV0FBVyxFQUFFLEVBQUU7SUFDdkUsR0FBRyxFQUFFO1FBQ0gsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CO1FBQ3hDLE1BQU0sRUFBRSxTQUFTLENBQUMsYUFBYTtLQUNoQztJQUNELFdBQVc7SUFDWCxTQUFTO0NBQ1YsQ0FBQyxDQUFDO0FBRUgsTUFBTSxZQUFZLEdBQUcsSUFBSSw0QkFBWSxDQUFDLEdBQUcsRUFBRSx5QkFBeUIsV0FBVyxFQUFFLEVBQUU7SUFDakYsR0FBRyxFQUFFO1FBQ0gsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CO1FBQ3hDLE1BQU0sRUFBRSxTQUFTLENBQUMsYUFBYTtLQUNoQztJQUNELFdBQVc7SUFDWCxTQUFTO0lBQ1QsR0FBRyxFQUFFLFNBQVMsQ0FBQyxHQUFHO0lBQ2xCLE9BQU8sRUFBRSxTQUFTLENBQUMsT0FBTztDQUMzQixDQUFDLENBQUM7QUFFSCxJQUFJLFNBQVMsQ0FBQyxXQUFXLElBQUksU0FBUyxDQUFDLGVBQWUsRUFBRTtJQUN0RCxNQUFNLGtCQUFrQixHQUFHLElBQUksc0JBQVMsQ0FBQyxHQUFHLEVBQUUscUJBQXFCLFdBQVcsWUFBWSxFQUFFO1FBQzFGLEdBQUcsRUFBRTtZQUNILE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQjtZQUN4QyxNQUFNLEVBQUUsU0FBUyxDQUFDLGVBQWU7U0FDbEM7UUFDRCxXQUFXO1FBQ1gsU0FBUztLQUNWLENBQUMsQ0FBQztJQUVILE1BQU0scUJBQXFCLEdBQUcsSUFBSSw0QkFBWSxDQUFDLEdBQUcsRUFBRSx5QkFBeUIsV0FBVyxZQUFZLEVBQUU7UUFDcEcsR0FBRyxFQUFFO1lBQ0gsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CO1lBQ3hDLE1BQU0sRUFBRSxTQUFTLENBQUMsZUFBZTtTQUNsQztRQUNELFdBQVc7UUFDWCxTQUFTO1FBQ1QsR0FBRyxFQUFFLGtCQUFrQixDQUFDLEdBQUc7UUFDM0IsT0FBTyxFQUFFLGtCQUFrQixDQUFDLE9BQU87S0FDcEMsQ0FBQyxDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3Rlcic7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgU2VydmljZVN0YWNrIH0gZnJvbSAnLi4vbGliL3N0YWNrcy9zZXJ2aWNlLXN0YWNrJztcbmltcG9ydCB7IEJhc2VTdGFjayB9IGZyb20gJy4uL2xpYi9zdGFja3MvYmFzZS1zdGFjayc7XG5pbXBvcnQgeyBsb2FkRW52aXJvbm1lbnRDb25maWcgfSBmcm9tICcuLi9saWIvdXRpbHMvZW52aXJvbm1lbnQnO1xuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuXG5jb25zdCBlbnZpcm9ubWVudCA9IGFwcC5ub2RlLnRyeUdldENvbnRleHQoJ2Vudmlyb25tZW50JykgfHwgJ2Rldic7XG5jb25zdCBlbnZDb25maWcgPSBsb2FkRW52aXJvbm1lbnRDb25maWcoZW52aXJvbm1lbnQpO1xuXG5jb25zdCBiYXNlU3RhY2sgPSBuZXcgQmFzZVN0YWNrKGFwcCwgYEVjc0ZyYW1ld29yay1CYXNlLSR7ZW52aXJvbm1lbnR9YCwge1xuICBlbnY6IHtcbiAgICBhY2NvdW50OiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5ULFxuICAgIHJlZ2lvbjogZW52Q29uZmlnLnByaW1hcnlSZWdpb24sXG4gIH0sXG4gIGVudmlyb25tZW50LFxuICBlbnZDb25maWcsXG59KTtcblxuY29uc3Qgc2VydmljZVN0YWNrID0gbmV3IFNlcnZpY2VTdGFjayhhcHAsIGBFY3NGcmFtZXdvcmstU2VydmljZXMtJHtlbnZpcm9ubWVudH1gLCB7XG4gIGVudjoge1xuICAgIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsXG4gICAgcmVnaW9uOiBlbnZDb25maWcucHJpbWFyeVJlZ2lvbixcbiAgfSxcbiAgZW52aXJvbm1lbnQsXG4gIGVudkNvbmZpZyxcbiAgdnBjOiBiYXNlU3RhY2sudnBjLFxuICBjbHVzdGVyOiBiYXNlU3RhY2suY2x1c3Rlcixcbn0pO1xuXG5pZiAoZW52Q29uZmlnLm11bHRpUmVnaW9uICYmIGVudkNvbmZpZy5zZWNvbmRhcnlSZWdpb24pIHtcbiAgY29uc3QgYmFzZVN0YWNrU2Vjb25kYXJ5ID0gbmV3IEJhc2VTdGFjayhhcHAsIGBFY3NGcmFtZXdvcmstQmFzZS0ke2Vudmlyb25tZW50fS1zZWNvbmRhcnlgLCB7XG4gICAgZW52OiB7XG4gICAgICBhY2NvdW50OiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5ULFxuICAgICAgcmVnaW9uOiBlbnZDb25maWcuc2Vjb25kYXJ5UmVnaW9uLFxuICAgIH0sXG4gICAgZW52aXJvbm1lbnQsXG4gICAgZW52Q29uZmlnLFxuICB9KTtcblxuICBjb25zdCBzZXJ2aWNlU3RhY2tTZWNvbmRhcnkgPSBuZXcgU2VydmljZVN0YWNrKGFwcCwgYEVjc0ZyYW1ld29yay1TZXJ2aWNlcy0ke2Vudmlyb25tZW50fS1zZWNvbmRhcnlgLCB7XG4gICAgZW52OiB7XG4gICAgICBhY2NvdW50OiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5ULFxuICAgICAgcmVnaW9uOiBlbnZDb25maWcuc2Vjb25kYXJ5UmVnaW9uLFxuICAgIH0sXG4gICAgZW52aXJvbm1lbnQsXG4gICAgZW52Q29uZmlnLFxuICAgIHZwYzogYmFzZVN0YWNrU2Vjb25kYXJ5LnZwYyxcbiAgICBjbHVzdGVyOiBiYXNlU3RhY2tTZWNvbmRhcnkuY2x1c3RlcixcbiAgfSk7XG59XG4iXX0=