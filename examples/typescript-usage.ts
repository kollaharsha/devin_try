/**
 * AWS CDK ECS Framework - TypeScript Usage Examples
 * 
 * This file demonstrates how to use the framework's TypeScript types
 * for better type safety and IDE support when working with configurations.
 */

import {
  ServiceConfig,
  MultiServiceConfig,
  TaskSize,
  ScalingConfig,
  HealthCheck,
  DeploymentConfig,
  SidecarContainer,
  validateServiceConfig,
  isValidTaskSize,
  DEFAULT_SERVICE_CONFIG
} from '../lib/types';

const apiServiceConfig: ServiceConfig = {
  name: 'api-service',
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

const grpcServiceConfig: ServiceConfig = {
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

const workerServiceConfig: ServiceConfig = {
  name: 'worker-service',
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

const multiServiceConfig: MultiServiceConfig = {
  services: [
    apiServiceConfig,
    grpcServiceConfig,
    workerServiceConfig
  ]
};

class ServiceConfigBuilder {
  private config: Partial<ServiceConfig> = {};

  constructor(name: string) {
    this.config.name = name;
  }

  withImage(image: string): this {
    this.config.containerImage = image;
    return this;
  }

  withProtocol(protocol: 'HTTP' | 'gRPC'): this {
    this.config.protocol = protocol;
    return this;
  }

  withPort(port: number): this {
    this.config.port = port;
    return this;
  }

  withTaskSize(cpu: TaskSize['cpu'], memory: TaskSize['memory']): this {
    if (!isValidTaskSize(cpu, memory)) {
      throw new Error(`Invalid CPU/Memory combination: ${cpu}/${memory}`);
    }
    this.config.taskSize = { cpu, memory };
    return this;
  }

  withScaling(scaling: ScalingConfig): this {
    this.config.scaling = scaling;
    return this;
  }

  withHealthCheck(healthCheck: HealthCheck): this {
    this.config.healthCheck = healthCheck;
    return this;
  }

  withDeployment(deployment: DeploymentConfig): this {
    this.config.deployment = deployment;
    return this;
  }

  withSidecar(sidecar: SidecarContainer): this {
    if (!this.config.sidecarContainers) {
      this.config.sidecarContainers = [];
    }
    this.config.sidecarContainers.push(sidecar);
    return this;
  }

  withEnvironmentVariable(key: string, value: string): this {
    if (!this.config.environmentVariables) {
      this.config.environmentVariables = {};
    }
    this.config.environmentVariables[key] = value;
    return this;
  }

  build(): ServiceConfig {
    const serviceConfig: ServiceConfig = {
      ...DEFAULT_SERVICE_CONFIG,
      ...this.config
    } as ServiceConfig;

    validateServiceConfig(serviceConfig);

    return serviceConfig;
  }
}

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

function validateAndLogConfig(config: ServiceConfig): void {
  try {
    validateServiceConfig(config);
    console.log(`✅ Configuration for ${config.name} is valid`);
  } catch (error) {
    console.error(`❌ Configuration for ${config.name} is invalid:`, error);
  }
}

function processServiceConfigs(configs: ServiceConfig[]): void {
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

export {
  apiServiceConfig,
  grpcServiceConfig,
  workerServiceConfig,
  multiServiceConfig,
  ServiceConfigBuilder
};
