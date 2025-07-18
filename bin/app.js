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
const targetRegion = app.node.tryGetContext('region'); // Optional: 'primary', 'secondary', or undefined (both)
const envConfig = (0, environment_1.loadEnvironmentConfig)(environment);
const shouldDeployPrimary = !targetRegion || targetRegion === 'primary';
const shouldDeploySecondary = envConfig.multiRegion && envConfig.secondaryRegion &&
    (!targetRegion || targetRegion === 'secondary');
console.log(`Deployment configuration for ${environment}:`);
console.log(`  Primary region (${envConfig.primaryRegion}): ${shouldDeployPrimary ? 'ENABLED' : 'SKIPPED'}`);
if (envConfig.multiRegion && envConfig.secondaryRegion) {
    console.log(`  Secondary region (${envConfig.secondaryRegion}): ${shouldDeploySecondary ? 'ENABLED' : 'SKIPPED'}`);
}
if (shouldDeployPrimary) {
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
}
if (shouldDeploySecondary) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVDQUFxQztBQUNyQyxtQ0FBbUM7QUFDbkMsK0RBQTJEO0FBQzNELHlEQUFxRDtBQUNyRCwwREFBaUU7QUFFakUsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFMUIsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksS0FBSyxDQUFDO0FBQ25FLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsd0RBQXdEO0FBQy9HLE1BQU0sU0FBUyxHQUFHLElBQUEsbUNBQXFCLEVBQUMsV0FBVyxDQUFDLENBQUM7QUFFckQsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLFlBQVksSUFBSSxZQUFZLEtBQUssU0FBUyxDQUFDO0FBQ3hFLE1BQU0scUJBQXFCLEdBQUcsU0FBUyxDQUFDLFdBQVcsSUFBSSxTQUFTLENBQUMsZUFBZTtJQUM5RSxDQUFDLENBQUMsWUFBWSxJQUFJLFlBQVksS0FBSyxXQUFXLENBQUMsQ0FBQztBQUVsRCxPQUFPLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQzVELE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLFNBQVMsQ0FBQyxhQUFhLE1BQU0sbUJBQW1CLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztBQUM3RyxJQUFJLFNBQVMsQ0FBQyxXQUFXLElBQUksU0FBUyxDQUFDLGVBQWUsRUFBRTtJQUN0RCxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixTQUFTLENBQUMsZUFBZSxNQUFNLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7Q0FDcEg7QUFFRCxJQUFJLG1CQUFtQixFQUFFO0lBQ3ZCLE1BQU0sU0FBUyxHQUFHLElBQUksc0JBQVMsQ0FBQyxHQUFHLEVBQUUscUJBQXFCLFdBQVcsRUFBRSxFQUFFO1FBQ3ZFLEdBQUcsRUFBRTtZQUNILE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQjtZQUN4QyxNQUFNLEVBQUUsU0FBUyxDQUFDLGFBQWE7U0FDaEM7UUFDRCxXQUFXO1FBQ1gsU0FBUztLQUNWLENBQUMsQ0FBQztJQUVILE1BQU0sWUFBWSxHQUFHLElBQUksNEJBQVksQ0FBQyxHQUFHLEVBQUUseUJBQXlCLFdBQVcsRUFBRSxFQUFFO1FBQ2pGLEdBQUcsRUFBRTtZQUNILE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQjtZQUN4QyxNQUFNLEVBQUUsU0FBUyxDQUFDLGFBQWE7U0FDaEM7UUFDRCxXQUFXO1FBQ1gsU0FBUztRQUNULEdBQUcsRUFBRSxTQUFTLENBQUMsR0FBRztRQUNsQixPQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU87S0FDM0IsQ0FBQyxDQUFDO0NBQ0o7QUFFRCxJQUFJLHFCQUFxQixFQUFFO0lBQ3pCLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxzQkFBUyxDQUFDLEdBQUcsRUFBRSxxQkFBcUIsV0FBVyxZQUFZLEVBQUU7UUFDMUYsR0FBRyxFQUFFO1lBQ0gsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CO1lBQ3hDLE1BQU0sRUFBRSxTQUFTLENBQUMsZUFBZTtTQUNsQztRQUNELFdBQVc7UUFDWCxTQUFTO0tBQ1YsQ0FBQyxDQUFDO0lBRUgsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLDRCQUFZLENBQUMsR0FBRyxFQUFFLHlCQUF5QixXQUFXLFlBQVksRUFBRTtRQUNwRyxHQUFHLEVBQUU7WUFDSCxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUI7WUFDeEMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxlQUFlO1NBQ2xDO1FBQ0QsV0FBVztRQUNYLFNBQVM7UUFDVCxHQUFHLEVBQUUsa0JBQWtCLENBQUMsR0FBRztRQUMzQixPQUFPLEVBQUUsa0JBQWtCLENBQUMsT0FBTztLQUNwQyxDQUFDLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCAnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJztcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBTZXJ2aWNlU3RhY2sgfSBmcm9tICcuLi9saWIvc3RhY2tzL3NlcnZpY2Utc3RhY2snO1xuaW1wb3J0IHsgQmFzZVN0YWNrIH0gZnJvbSAnLi4vbGliL3N0YWNrcy9iYXNlLXN0YWNrJztcbmltcG9ydCB7IGxvYWRFbnZpcm9ubWVudENvbmZpZyB9IGZyb20gJy4uL2xpYi91dGlscy9lbnZpcm9ubWVudCc7XG5cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG5cbmNvbnN0IGVudmlyb25tZW50ID0gYXBwLm5vZGUudHJ5R2V0Q29udGV4dCgnZW52aXJvbm1lbnQnKSB8fCAnZGV2JztcbmNvbnN0IHRhcmdldFJlZ2lvbiA9IGFwcC5ub2RlLnRyeUdldENvbnRleHQoJ3JlZ2lvbicpOyAvLyBPcHRpb25hbDogJ3ByaW1hcnknLCAnc2Vjb25kYXJ5Jywgb3IgdW5kZWZpbmVkIChib3RoKVxuY29uc3QgZW52Q29uZmlnID0gbG9hZEVudmlyb25tZW50Q29uZmlnKGVudmlyb25tZW50KTtcblxuY29uc3Qgc2hvdWxkRGVwbG95UHJpbWFyeSA9ICF0YXJnZXRSZWdpb24gfHwgdGFyZ2V0UmVnaW9uID09PSAncHJpbWFyeSc7XG5jb25zdCBzaG91bGREZXBsb3lTZWNvbmRhcnkgPSBlbnZDb25maWcubXVsdGlSZWdpb24gJiYgZW52Q29uZmlnLnNlY29uZGFyeVJlZ2lvbiAmJiBcbiAgKCF0YXJnZXRSZWdpb24gfHwgdGFyZ2V0UmVnaW9uID09PSAnc2Vjb25kYXJ5Jyk7XG5cbmNvbnNvbGUubG9nKGBEZXBsb3ltZW50IGNvbmZpZ3VyYXRpb24gZm9yICR7ZW52aXJvbm1lbnR9OmApO1xuY29uc29sZS5sb2coYCAgUHJpbWFyeSByZWdpb24gKCR7ZW52Q29uZmlnLnByaW1hcnlSZWdpb259KTogJHtzaG91bGREZXBsb3lQcmltYXJ5ID8gJ0VOQUJMRUQnIDogJ1NLSVBQRUQnfWApO1xuaWYgKGVudkNvbmZpZy5tdWx0aVJlZ2lvbiAmJiBlbnZDb25maWcuc2Vjb25kYXJ5UmVnaW9uKSB7XG4gIGNvbnNvbGUubG9nKGAgIFNlY29uZGFyeSByZWdpb24gKCR7ZW52Q29uZmlnLnNlY29uZGFyeVJlZ2lvbn0pOiAke3Nob3VsZERlcGxveVNlY29uZGFyeSA/ICdFTkFCTEVEJyA6ICdTS0lQUEVEJ31gKTtcbn1cblxuaWYgKHNob3VsZERlcGxveVByaW1hcnkpIHtcbiAgY29uc3QgYmFzZVN0YWNrID0gbmV3IEJhc2VTdGFjayhhcHAsIGBFY3NGcmFtZXdvcmstQmFzZS0ke2Vudmlyb25tZW50fWAsIHtcbiAgICBlbnY6IHtcbiAgICAgIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsXG4gICAgICByZWdpb246IGVudkNvbmZpZy5wcmltYXJ5UmVnaW9uLFxuICAgIH0sXG4gICAgZW52aXJvbm1lbnQsXG4gICAgZW52Q29uZmlnLFxuICB9KTtcblxuICBjb25zdCBzZXJ2aWNlU3RhY2sgPSBuZXcgU2VydmljZVN0YWNrKGFwcCwgYEVjc0ZyYW1ld29yay1TZXJ2aWNlcy0ke2Vudmlyb25tZW50fWAsIHtcbiAgICBlbnY6IHtcbiAgICAgIGFjY291bnQ6IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX0FDQ09VTlQsXG4gICAgICByZWdpb246IGVudkNvbmZpZy5wcmltYXJ5UmVnaW9uLFxuICAgIH0sXG4gICAgZW52aXJvbm1lbnQsXG4gICAgZW52Q29uZmlnLFxuICAgIHZwYzogYmFzZVN0YWNrLnZwYyxcbiAgICBjbHVzdGVyOiBiYXNlU3RhY2suY2x1c3RlcixcbiAgfSk7XG59XG5cbmlmIChzaG91bGREZXBsb3lTZWNvbmRhcnkpIHtcbiAgY29uc3QgYmFzZVN0YWNrU2Vjb25kYXJ5ID0gbmV3IEJhc2VTdGFjayhhcHAsIGBFY3NGcmFtZXdvcmstQmFzZS0ke2Vudmlyb25tZW50fS1zZWNvbmRhcnlgLCB7XG4gICAgZW52OiB7XG4gICAgICBhY2NvdW50OiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5ULFxuICAgICAgcmVnaW9uOiBlbnZDb25maWcuc2Vjb25kYXJ5UmVnaW9uLFxuICAgIH0sXG4gICAgZW52aXJvbm1lbnQsXG4gICAgZW52Q29uZmlnLFxuICB9KTtcblxuICBjb25zdCBzZXJ2aWNlU3RhY2tTZWNvbmRhcnkgPSBuZXcgU2VydmljZVN0YWNrKGFwcCwgYEVjc0ZyYW1ld29yay1TZXJ2aWNlcy0ke2Vudmlyb25tZW50fS1zZWNvbmRhcnlgLCB7XG4gICAgZW52OiB7XG4gICAgICBhY2NvdW50OiBwcm9jZXNzLmVudi5DREtfREVGQVVMVF9BQ0NPVU5ULFxuICAgICAgcmVnaW9uOiBlbnZDb25maWcuc2Vjb25kYXJ5UmVnaW9uLFxuICAgIH0sXG4gICAgZW52aXJvbm1lbnQsXG4gICAgZW52Q29uZmlnLFxuICAgIHZwYzogYmFzZVN0YWNrU2Vjb25kYXJ5LnZwYyxcbiAgICBjbHVzdGVyOiBiYXNlU3RhY2tTZWNvbmRhcnkuY2x1c3RlcixcbiAgfSk7XG59XG4iXX0=