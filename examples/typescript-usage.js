"use strict";
/**
 * AWS CDK ECS Framework - TypeScript Usage Examples
 *
 * This file demonstrates how to use the framework's TypeScript types
 * for better type safety and IDE support when working with configurations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceConfigBuilder = exports.multiServiceConfig = exports.workerServiceConfig = exports.grpcServiceConfig = exports.apiServiceConfig = void 0;
const types_1 = require("../lib/types");
const apiServiceConfig = {
    name: 'api-service',
    environments: ['dev', 'qa', 'uat', 'prod'],
    domainName: 'api.example.com',
    contextPath: '/api/v1',
    protocol: 'HTTP',
    port: 8080,
    containerImage: 'my-account.dkr.ecr.us-east-1.amazonaws.com/api-service:latest',
    taskSize: {
        cpu: 512,
        memory: 1024
    },
    scaling: {
        minCapacity: 2,
        maxCapacity: 10,
        targetCpuUtilization: 70,
        targetMemoryUtilization: 80
    },
    environmentVariables: {
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://user:pass@db.example.com:5432/mydb'
    },
    healthCheck: {
        path: '/health',
        interval: 30,
        timeout: 5,
        retries: 3,
        gracePeriod: 60
    },
    security: {
        mTLS: false
    },
    deployment: {
        type: 'blue-green',
        terminationWaitTime: 300
    }
};
exports.apiServiceConfig = apiServiceConfig;
const grpcServiceConfig = {
    name: 'grpc-service',
    domainName: 'grpc.example.com',
    protocol: 'gRPC',
    port: 9090,
    containerImage: 'my-account.dkr.ecr.us-east-1.amazonaws.com/grpc-service:latest',
    taskSize: {
        cpu: 1024,
        memory: 2048
    },
    scaling: {
        minCapacity: 2,
        maxCapacity: 20,
        targetCpuUtilization: 60
    },
    healthCheck: {
        path: '/grpc.health.v1.Health/Check',
        interval: 15,
        timeout: 10,
        retries: 2,
        gracePeriod: 90
    },
    security: {
        mTLS: true
    },
    deployment: {
        type: 'canary',
        canaryPercentage: 20,
        terminationWaitTime: 600
    }
};
exports.grpcServiceConfig = grpcServiceConfig;
const workerServiceConfig = {
    name: 'worker-service',
    environments: ['dev', 'qa'],
    protocol: 'HTTP',
    port: 3000,
    containerImage: 'my-account.dkr.ecr.us-east-1.amazonaws.com/worker-service:latest',
    taskSize: {
        cpu: 256,
        memory: 512
    },
    scaling: {
        minCapacity: 1,
        maxCapacity: 5,
        targetCpuUtilization: 80
    },
    healthCheck: {
        path: '/health',
        interval: 30,
        timeout: 5,
        retries: 3
    },
    deployment: {
        type: 'rolling'
    },
    sidecarContainers: [
        {
            name: 'metrics-collector',
            image: 'prom/node-exporter:latest',
            essential: false,
            cpu: 32,
            memory: 64,
            portMappings: [
                {
                    containerPort: 9100,
                    protocol: 'TCP'
                }
            ]
        },
        {
            name: 'log-router',
            image: 'fluent/fluent-bit:latest',
            essential: false,
            cpu: 64,
            memory: 128,
            environmentVariables: {
                LOG_LEVEL: 'info',
                OUTPUT_DESTINATION: 'cloudwatch'
            }
        }
    ]
};
exports.workerServiceConfig = workerServiceConfig;
const multiServiceConfig = {
    services: [
        apiServiceConfig,
        grpcServiceConfig,
        workerServiceConfig
    ]
};
exports.multiServiceConfig = multiServiceConfig;
class ServiceConfigBuilder {
    constructor(name) {
        this.config = {};
        this.config.name = name;
    }
    withImage(image) {
        this.config.containerImage = image;
        return this;
    }
    withProtocol(protocol) {
        this.config.protocol = protocol;
        return this;
    }
    withPort(port) {
        this.config.port = port;
        return this;
    }
    withTaskSize(cpu, memory) {
        if (!(0, types_1.isValidTaskSize)(cpu, memory)) {
            throw new Error(`Invalid CPU/Memory combination: ${cpu}/${memory}`);
        }
        this.config.taskSize = { cpu, memory };
        return this;
    }
    withScaling(scaling) {
        this.config.scaling = scaling;
        return this;
    }
    withHealthCheck(healthCheck) {
        this.config.healthCheck = healthCheck;
        return this;
    }
    withDeployment(deployment) {
        this.config.deployment = deployment;
        return this;
    }
    withSidecar(sidecar) {
        if (!this.config.sidecarContainers) {
            this.config.sidecarContainers = [];
        }
        this.config.sidecarContainers.push(sidecar);
        return this;
    }
    withEnvironmentVariable(key, value) {
        if (!this.config.environmentVariables) {
            this.config.environmentVariables = {};
        }
        this.config.environmentVariables[key] = value;
        return this;
    }
    build() {
        const serviceConfig = {
            ...types_1.DEFAULT_SERVICE_CONFIG,
            ...this.config
        };
        (0, types_1.validateServiceConfig)(serviceConfig);
        return serviceConfig;
    }
}
exports.ServiceConfigBuilder = ServiceConfigBuilder;
const builtServiceConfig = new ServiceConfigBuilder('my-api')
    .withImage('nginx:latest')
    .withProtocol('HTTP')
    .withPort(80)
    .withTaskSize(512, 1024)
    .withScaling({
    minCapacity: 1,
    maxCapacity: 5,
    targetCpuUtilization: 70
})
    .withHealthCheck({
    path: '/health',
    interval: 30,
    timeout: 5,
    retries: 3
})
    .withEnvironmentVariable('NODE_ENV', 'production')
    .withSidecar({
    name: 'nginx-exporter',
    image: 'nginx/nginx-prometheus-exporter:latest',
    essential: false,
    cpu: 32,
    memory: 64
})
    .build();
function validateAndLogConfig(config) {
    try {
        (0, types_1.validateServiceConfig)(config);
        console.log(`✅ Configuration for ${config.name} is valid`);
    }
    catch (error) {
        console.error(`❌ Configuration for ${config.name} is invalid:`, error);
    }
}
function processServiceConfigs(configs) {
    const httpServices = configs.filter(config => config.protocol === 'HTTP');
    const grpcServices = configs.filter(config => config.protocol === 'gRPC');
    console.log(`Found ${httpServices.length} HTTP services and ${grpcServices.length} gRPC services`);
    const servicesWithLB = configs.filter(config => config.domainName);
    console.log(`${servicesWithLB.length} services require load balancers`);
    configs.forEach(validateAndLogConfig);
}
console.log('=== Service Configuration Examples ===');
validateAndLogConfig(apiServiceConfig);
validateAndLogConfig(grpcServiceConfig);
validateAndLogConfig(workerServiceConfig);
validateAndLogConfig(builtServiceConfig);
processServiceConfigs([apiServiceConfig, grpcServiceConfig, workerServiceConfig]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC11c2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInR5cGVzY3JpcHQtdXNhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7OztHQUtHOzs7QUFFSCx3Q0FXc0I7QUFFdEIsTUFBTSxnQkFBZ0IsR0FBa0I7SUFDdEMsSUFBSSxFQUFFLGFBQWE7SUFDbkIsWUFBWSxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDO0lBQzFDLFVBQVUsRUFBRSxpQkFBaUI7SUFDN0IsV0FBVyxFQUFFLFNBQVM7SUFDdEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsSUFBSSxFQUFFLElBQUk7SUFDVixjQUFjLEVBQUUsK0RBQStEO0lBQy9FLFFBQVEsRUFBRTtRQUNSLEdBQUcsRUFBRSxHQUFHO1FBQ1IsTUFBTSxFQUFFLElBQUk7S0FDYjtJQUNELE9BQU8sRUFBRTtRQUNQLFdBQVcsRUFBRSxDQUFDO1FBQ2QsV0FBVyxFQUFFLEVBQUU7UUFDZixvQkFBb0IsRUFBRSxFQUFFO1FBQ3hCLHVCQUF1QixFQUFFLEVBQUU7S0FDNUI7SUFDRCxvQkFBb0IsRUFBRTtRQUNwQixRQUFRLEVBQUUsWUFBWTtRQUN0QixZQUFZLEVBQUUsaURBQWlEO0tBQ2hFO0lBQ0QsV0FBVyxFQUFFO1FBQ1gsSUFBSSxFQUFFLFNBQVM7UUFDZixRQUFRLEVBQUUsRUFBRTtRQUNaLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLENBQUM7UUFDVixXQUFXLEVBQUUsRUFBRTtLQUNoQjtJQUNELFFBQVEsRUFBRTtRQUNSLElBQUksRUFBRSxLQUFLO0tBQ1o7SUFDRCxVQUFVLEVBQUU7UUFDVixJQUFJLEVBQUUsWUFBWTtRQUNsQixtQkFBbUIsRUFBRSxHQUFHO0tBQ3pCO0NBQ0YsQ0FBQztBQStOQSw0Q0FBZ0I7QUE3TmxCLE1BQU0saUJBQWlCLEdBQWtCO0lBQ3ZDLElBQUksRUFBRSxjQUFjO0lBQ3BCLFVBQVUsRUFB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b0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBRXpDLHFCQUFxQixDQUFDLENBQUMsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBV1MgQ0RLIEVDUyBGcmFtZXdvcmsgLSBUeXBlU2NyaXB0IFVzYWdlIEV4YW1wbGVzXG4gKiBcbiAqIFRoaXMgZmlsZSBkZW1vbnN0cmF0ZXMgaG93IHRvIHVzZSB0aGUgZnJhbWV3b3JrJ3MgVHlwZVNjcmlwdCB0eXBlc1xuICogZm9yIGJldHRlciB0eXBlIHNhZmV0eSBhbmQgSURFIHN1cHBvcnQgd2hlbiB3b3JraW5nIHdpdGggY29uZmlndXJhdGlvbnMuXG4gKi9cblxuaW1wb3J0IHtcbiAgU2VydmljZUNvbmZpZyxcbiAgTXVsdGlTZXJ2aWNlQ29uZmlnLFxuICBUYXNrU2l6ZSxcbiAgU2NhbGluZ0NvbmZpZyxcbiAgSGVhbHRoQ2hlY2ssXG4gIERlcGxveW1lbnRDb25maWcsXG4gIFNpZGVjYXJDb250YWluZXIsXG4gIHZhbGlkYXRlU2VydmljZUNvbmZpZyxcbiAgaXNWYWxpZFRhc2tTaXplLFxuICBERUZBVUxUX1NFUlZJQ0VfQ09ORklHXG59IGZyb20gJy4uL2xpYi90eXBlcyc7XG5cbmNvbnN0IGFwaVNlcnZpY2VDb25maWc6IFNlcnZpY2VDb25maWcgPSB7XG4gIG5hbWU6ICdhcGktc2VydmljZScsXG4gIGVudmlyb25tZW50czogWydkZXYnLCAncWEnLCAndWF0JywgJ3Byb2QnXSwgLy8gRGVwbG95IHRvIGFsbCBlbnZpcm9ubWVudHNcbiAgZG9tYWluTmFtZTogJ2FwaS5leGFtcGxlLmNvbScsXG4gIGNvbnRleHRQYXRoOiAnL2FwaS92MScsXG4gIHByb3RvY29sOiAnSFRUUCcsXG4gIHBvcnQ6IDgwODAsXG4gIGNvbnRhaW5lckltYWdlOiAnbXktYWNjb3VudC5ka3IuZWNyLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL2FwaS1zZXJ2aWNlOmxhdGVzdCcsXG4gIHRhc2tTaXplOiB7XG4gICAgY3B1OiA1MTIsXG4gICAgbWVtb3J5OiAxMDI0XG4gIH0sXG4gIHNjYWxpbmc6IHtcbiAgICBtaW5DYXBhY2l0eTogMixcbiAgICBtYXhDYXBhY2l0eTogMTAsXG4gICAgdGFyZ2V0Q3B1VXRpbGl6YXRpb246IDcwLFxuICAgIHRhcmdldE1lbW9yeVV0aWxpemF0aW9uOiA4MFxuICB9LFxuICBlbnZpcm9ubWVudFZhcmlhYmxlczoge1xuICAgIE5PREVfRU5WOiAncHJvZHVjdGlvbicsXG4gICAgREFUQUJBU0VfVVJMOiAncG9zdGdyZXNxbDovL3VzZXI6cGFzc0BkYi5leGFtcGxlLmNvbTo1NDMyL215ZGInXG4gIH0sXG4gIGhlYWx0aENoZWNrOiB7XG4gICAgcGF0aDogJy9oZWFsdGgnLFxuICAgIGludGVydmFsOiAzMCxcbiAgICB0aW1lb3V0OiA1LFxuICAgIHJldHJpZXM6IDMsXG4gICAgZ3JhY2VQZXJpb2Q6IDYwXG4gIH0sXG4gIHNlY3VyaXR5OiB7XG4gICAgbVRMUzogZmFsc2VcbiAgfSxcbiAgZGVwbG95bWVudDoge1xuICAgIHR5cGU6ICdibHVlLWdyZWVuJyxcbiAgICB0ZXJtaW5hdGlvbldhaXRUaW1lOiAzMDBcbiAgfVxufTtcblxuY29uc3QgZ3JwY1NlcnZpY2VDb25maWc6IFNlcnZpY2VDb25maWcgPSB7XG4gIG5hbWU6ICdncnBjLXNlcnZpY2UnLFxuICBkb21haW5OYW1lOiAnZ3JwYy5leGFtcGxlLmNvbScsXG4gIHByb3RvY29sOiAnZ1JQQycsXG4gIHBvcnQ6IDkwOTAsXG4gIGNvbnRhaW5lckltYWdlOiAnbXktYWNjb3VudC5ka3IuZWNyLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL2dycGMtc2VydmljZTpsYXRlc3QnLFxuICB0YXNrU2l6ZToge1xuICAgIGNwdTogMTAyNCxcbiAgICBtZW1vcnk6IDIwNDhcbiAgfSxcbiAgc2NhbGluZzoge1xuICAgIG1pbkNhcGFjaXR5OiAyLFxuICAgIG1heENhcGFjaXR5OiAyMCxcbiAgICB0YXJnZXRDcHVVdGlsaXphdGlvbjogNjBcbiAgfSxcbiAgaGVhbHRoQ2hlY2s6IHtcbiAgICBwYXRoOiAnL2dycGMuaGVhbHRoLnYxLkhlYWx0aC9DaGVjaycsXG4gICAgaW50ZXJ2YWw6IDE1LFxuICAgIHRpbWVvdXQ6IDEwLFxuICAgIHJldHJpZXM6IDIsXG4gICAgZ3JhY2VQZXJpb2Q6IDkwXG4gIH0sXG4gIHNlY3VyaXR5OiB7XG4gICAgbVRMUzogdHJ1ZVxuICB9LFxuICBkZXBsb3ltZW50OiB7XG4gICAgdHlwZTogJ2NhbmFyeScsXG4gICAgY2FuYXJ5UGVyY2VudGFnZTogMjAsXG4gICAgdGVybWluYXRpb25XYWl0VGltZTogNjAwXG4gIH1cbn07XG5cbmNvbnN0IHdvcmtlclNlcnZpY2VDb25maWc6IFNlcnZpY2VDb25maWcgPSB7XG4gIG5hbWU6ICd3b3JrZXItc2VydmljZScsXG4gIGVudmlyb25tZW50czogWydkZXYnLCAncWEnXSwgLy8gT25seSBkZXBsb3kgdG8gZGV2IGFuZCBxYVxuICBwcm90b2NvbDogJ0hUVFAnLFxuICBwb3J0OiAzMDAwLFxuICBjb250YWluZXJJbWFnZTogJ215LWFjY291bnQuZGtyLmVjci51cy1lYXN0LTEuYW1hem9uYXdzLmNvbS93b3JrZXItc2VydmljZTpsYXRlc3QnLFxuICB0YXNrU2l6ZToge1xuICAgIGNwdTogMjU2LFxuICAgIG1lbW9yeTogNTEyXG4gIH0sXG4gIHNjYWxpbmc6IHtcbiAgICBtaW5DYXBhY2l0eTogMSxcbiAgICBtYXhDYXBhY2l0eTogNSxcbiAgICB0YXJnZXRDcHVVdGlsaXphdGlvbjogODBcbiAgfSxcbiAgaGVhbHRoQ2hlY2s6IHtcbiAgICBwYXRoOiAnL2hlYWx0aCcsXG4gICAgaW50ZXJ2YWw6IDMwLFxuICAgIHRpbWVvdXQ6IDUsXG4gICAgcmV0cmllczogM1xuICB9LFxuICBkZXBsb3ltZW50OiB7XG4gICAgdHlwZTogJ3JvbGxpbmcnXG4gIH0sXG4gIHNpZGVjYXJDb250YWluZXJzOiBbXG4gICAge1xuICAgICAgbmFtZTogJ21ldHJpY3MtY29sbGVjdG9yJyxcbiAgICAgIGltYWdlOiAncHJvbS9ub2RlLWV4cG9ydGVyOmxhdGVzdCcsXG4gICAgICBlc3NlbnRpYWw6IGZhbHNlLFxuICAgICAgY3B1OiAzMixcbiAgICAgIG1lbW9yeTogNjQsXG4gICAgICBwb3J0TWFwcGluZ3M6IFtcbiAgICAgICAge1xuICAgICAgICAgIGNvbnRhaW5lclBvcnQ6IDkxMDAsXG4gICAgICAgICAgcHJvdG9jb2w6ICdUQ1AnXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6ICdsb2ctcm91dGVyJyxcbiAgICAgIGltYWdlOiAnZmx1ZW50L2ZsdWVudC1iaXQ6bGF0ZXN0JyxcbiAgICAgIGVzc2VudGlhbDogZmFsc2UsXG4gICAgICBjcHU6IDY0LFxuICAgICAgbWVtb3J5OiAxMjgsXG4gICAgICBlbnZpcm9ubWVudFZhcmlhYmxlczoge1xuICAgICAgICBMT0dfTEVWRUw6ICdpbmZvJyxcbiAgICAgICAgT1VUUFVUX0RFU1RJTkFUSU9OOiAnY2xvdWR3YXRjaCdcbiAgICAgIH1cbiAgICB9XG4gIF1cbn07XG5cbmNvbnN0IG11bHRpU2VydmljZUNvbmZpZzogTXVsdGlTZXJ2aWNlQ29uZmlnID0ge1xuICBzZXJ2aWNlczogW1xuICAgIGFwaVNlcnZpY2VDb25maWcsXG4gICAgZ3JwY1NlcnZpY2VDb25maWcsXG4gICAgd29ya2VyU2VydmljZUNvbmZpZ1xuICBdXG59O1xuXG5jbGFzcyBTZXJ2aWNlQ29uZmlnQnVpbGRlciB7XG4gIHByaXZhdGUgY29uZmlnOiBQYXJ0aWFsPFNlcnZpY2VDb25maWc+ID0ge307XG5cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5jb25maWcubmFtZSA9IG5hbWU7XG4gIH1cblxuICB3aXRoSW1hZ2UoaW1hZ2U6IHN0cmluZyk6IHRoaXMge1xuICAgIHRoaXMuY29uZmlnLmNvbnRhaW5lckltYWdlID0gaW1hZ2U7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB3aXRoUHJvdG9jb2wocHJvdG9jb2w6ICdIVFRQJyB8ICdnUlBDJyk6IHRoaXMge1xuICAgIHRoaXMuY29uZmlnLnByb3RvY29sID0gcHJvdG9jb2w7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB3aXRoUG9ydChwb3J0OiBudW1iZXIpOiB0aGlzIHtcbiAgICB0aGlzLmNvbmZpZy5wb3J0ID0gcG9ydDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHdpdGhUYXNrU2l6ZShjcHU6IFRhc2tTaXplWydjcHUnXSwgbWVtb3J5OiBUYXNrU2l6ZVsnbWVtb3J5J10pOiB0aGlzIHtcbiAgICBpZiAoIWlzVmFsaWRUYXNrU2l6ZShjcHUsIG1lbW9yeSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBDUFUvTWVtb3J5IGNvbWJpbmF0aW9uOiAke2NwdX0vJHttZW1vcnl9YCk7XG4gICAgfVxuICAgIHRoaXMuY29uZmlnLnRhc2tTaXplID0geyBjcHUsIG1lbW9yeSB9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgd2l0aFNjYWxpbmcoc2NhbGluZzogU2NhbGluZ0NvbmZpZyk6IHRoaXMge1xuICAgIHRoaXMuY29uZmlnLnNjYWxpbmcgPSBzY2FsaW5nO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgd2l0aEhlYWx0aENoZWNrKGhlYWx0aENoZWNrOiBIZWFsdGhDaGVjayk6IHRoaXMge1xuICAgIHRoaXMuY29uZmlnLmhlYWx0aENoZWNrID0gaGVhbHRoQ2hlY2s7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB3aXRoRGVwbG95bWVudChkZXBsb3ltZW50OiBEZXBsb3ltZW50Q29uZmlnKTogdGhpcyB7XG4gICAgdGhpcy5jb25maWcuZGVwbG95bWVudCA9IGRlcGxveW1lbnQ7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB3aXRoU2lkZWNhcihzaWRlY2FyOiBTaWRlY2FyQ29udGFpbmVyKTogdGhpcyB7XG4gICAgaWYgKCF0aGlzLmNvbmZpZy5zaWRlY2FyQ29udGFpbmVycykge1xuICAgICAgdGhpcy5jb25maWcuc2lkZWNhckNvbnRhaW5lcnMgPSBbXTtcbiAgICB9XG4gICAgdGhpcy5jb25maWcuc2lkZWNhckNvbnRhaW5lcnMucHVzaChzaWRlY2FyKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHdpdGhFbnZpcm9ubWVudFZhcmlhYmxlKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdGhpcyB7XG4gICAgaWYgKCF0aGlzLmNvbmZpZy5lbnZpcm9ubWVudFZhcmlhYmxlcykge1xuICAgICAgdGhpcy5jb25maWcuZW52aXJvbm1lbnRWYXJpYWJsZXMgPSB7fTtcbiAgICB9XG4gICAgdGhpcy5jb25maWcuZW52aXJvbm1lbnRWYXJpYWJsZXNba2V5XSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgYnVpbGQoKTogU2VydmljZUNvbmZpZyB7XG4gICAgY29uc3Qgc2VydmljZUNvbmZpZzogU2VydmljZUNvbmZpZyA9IHtcbiAgICAgIC4uLkRFRkFVTFRfU0VSVklDRV9DT05GSUcsXG4gICAgICAuLi50aGlzLmNvbmZpZ1xuICAgIH0gYXMgU2VydmljZUNvbmZpZztcblxuICAgIHZhbGlkYXRlU2VydmljZUNvbmZpZyhzZXJ2aWNlQ29uZmlnKTtcblxuICAgIHJldHVybiBzZXJ2aWNlQ29uZmlnO1xuICB9XG59XG5cbmNvbnN0IGJ1aWx0U2VydmljZUNvbmZpZyA9IG5ldyBTZXJ2aWNlQ29uZmlnQnVpbGRlcignbXktYXBpJylcbiAgLndpdGhJbWFnZSgnbmdpbng6bGF0ZXN0JylcbiAgLndpdGhQcm90b2NvbCgnSFRUUCcpXG4gIC53aXRoUG9ydCg4MClcbiAgLndpdGhUYXNrU2l6ZSg1MTIsIDEwMjQpXG4gIC53aXRoU2NhbGluZyh7XG4gICAgbWluQ2FwYWNpdHk6IDEsXG4gICAgbWF4Q2FwYWNpdHk6IDUsXG4gICAgdGFyZ2V0Q3B1VXRpbGl6YXRpb246IDcwXG4gIH0pXG4gIC53aXRoSGVhbHRoQ2hlY2soe1xuICAgIHBhdGg6ICcvaGVhbHRoJyxcbiAgICBpbnRlcnZhbDogMzAsXG4gICAgdGltZW91dDogNSxcbiAgICByZXRyaWVzOiAzXG4gIH0pXG4gIC53aXRoRW52aXJvbm1lbnRWYXJpYWJsZSgnTk9ERV9FTlYnLCAncHJvZHVjdGlvbicpXG4gIC53aXRoU2lkZWNhcih7XG4gICAgbmFtZTogJ25naW54LWV4cG9ydGVyJyxcbiAgICBpbWFnZTogJ25naW54L25naW54LXByb21ldGhldXMtZXhwb3J0ZXI6bGF0ZXN0JyxcbiAgICBlc3NlbnRpYWw6IGZhbHNlLFxuICAgIGNwdTogMzIsXG4gICAgbWVtb3J5OiA2NFxuICB9KVxuICAuYnVpbGQoKTtcblxuZnVuY3Rpb24gdmFsaWRhdGVBbmRMb2dDb25maWcoY29uZmlnOiBTZXJ2aWNlQ29uZmlnKTogdm9pZCB7XG4gIHRyeSB7XG4gICAgdmFsaWRhdGVTZXJ2aWNlQ29uZmlnKGNvbmZpZyk7XG4gICAgY29uc29sZS5sb2coYOKchSBDb25maWd1cmF0aW9uIGZvciAke2NvbmZpZy5uYW1lfSBpcyB2YWxpZGApO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoYOKdjCBDb25maWd1cmF0aW9uIGZvciAke2NvbmZpZy5uYW1lfSBpcyBpbnZhbGlkOmAsIGVycm9yKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzU2VydmljZUNvbmZpZ3MoY29uZmlnczogU2VydmljZUNvbmZpZ1tdKTogdm9pZCB7XG4gIGNvbnN0IGh0dHBTZXJ2aWNlcyA9IGNvbmZpZ3MuZmlsdGVyKGNvbmZpZyA9PiBjb25maWcucHJvdG9jb2wgPT09ICdIVFRQJyk7XG4gIGNvbnN0IGdycGNTZXJ2aWNlcyA9IGNvbmZpZ3MuZmlsdGVyKGNvbmZpZyA9PiBjb25maWcucHJvdG9jb2wgPT09ICdnUlBDJyk7XG5cbiAgY29uc29sZS5sb2coYEZvdW5kICR7aHR0cFNlcnZpY2VzLmxlbmd0aH0gSFRUUCBzZXJ2aWNlcyBhbmQgJHtncnBjU2VydmljZXMubGVuZ3RofSBnUlBDIHNlcnZpY2VzYCk7XG5cbiAgY29uc3Qgc2VydmljZXNXaXRoTEIgPSBjb25maWdzLmZpbHRlcihjb25maWcgPT4gY29uZmlnLmRvbWFpbk5hbWUpO1xuICBjb25zb2xlLmxvZyhgJHtzZXJ2aWNlc1dpdGhMQi5sZW5ndGh9IHNlcnZpY2VzIHJlcXVpcmUgbG9hZCBiYWxhbmNlcnNgKTtcblxuICBjb25maWdzLmZvckVhY2godmFsaWRhdGVBbmRMb2dDb25maWcpO1xufVxuXG5jb25zb2xlLmxvZygnPT09IFNlcnZpY2UgQ29uZmlndXJhdGlvbiBFeGFtcGxlcyA9PT0nKTtcbnZhbGlkYXRlQW5kTG9nQ29uZmlnKGFwaVNlcnZpY2VDb25maWcpO1xudmFsaWRhdGVBbmRMb2dDb25maWcoZ3JwY1NlcnZpY2VDb25maWcpO1xudmFsaWRhdGVBbmRMb2dDb25maWcod29ya2VyU2VydmljZUNvbmZpZyk7XG52YWxpZGF0ZUFuZExvZ0NvbmZpZyhidWlsdFNlcnZpY2VDb25maWcpO1xuXG5wcm9jZXNzU2VydmljZUNvbmZpZ3MoW2FwaVNlcnZpY2VDb25maWcsIGdycGNTZXJ2aWNlQ29uZmlnLCB3b3JrZXJTZXJ2aWNlQ29uZmlnXSk7XG5cbmV4cG9ydCB7XG4gIGFwaVNlcnZpY2VDb25maWcsXG4gIGdycGNTZXJ2aWNlQ29uZmlnLFxuICB3b3JrZXJTZXJ2aWNlQ29uZmlnLFxuICBtdWx0aVNlcnZpY2VDb25maWcsXG4gIFNlcnZpY2VDb25maWdCdWlsZGVyXG59O1xuIl19