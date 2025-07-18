/**
 * AWS CDK ECS Framework - Service Configuration Types
 * 
 * This file contains comprehensive TypeScript type definitions for service configurations.
 * These types provide compile-time validation and IDE autocompletion for YAML configurations.
 */

/**
 * Supported communication protocols for ECS services
 */
export type Protocol = 'HTTP' | 'gRPC';

/**
 * Supported deployment strategies
 */
export type DeploymentType = 'rolling' | 'blue-green' | 'canary';

/**
 * Container protocol types for port mappings
 */
export type ContainerProtocol = 'TCP' | 'UDP';

/**
 * Task size configuration for CPU and memory allocation
 */
export interface TaskSize {
  /** CPU units (256, 512, 1024, 2048, 4096) */
  cpu: 256 | 512 | 1024 | 2048 | 4096;
  /** Memory in MiB (512, 1024, 2048, 4096, 8192, 16384, 30720) */
  memory: 512 | 1024 | 2048 | 4096 | 8192 | 16384 | 30720;
}

/**
 * Auto-scaling configuration for ECS services
 */
export interface ScalingConfig {
  /** Minimum number of tasks */
  minCapacity: number;
  /** Maximum number of tasks */
  maxCapacity: number;
  /** Target CPU utilization percentage (0-100) */
  targetCpuUtilization?: number;
  /** Target memory utilization percentage (0-100) */
  targetMemoryUtilization?: number;
}

/**
 * Health check configuration for services
 */
export interface HealthCheck {
  /** Health check endpoint path */
  path: string;
  /** Health check interval in seconds */
  interval: number;
  /** Health check timeout in seconds */
  timeout: number;
  /** Number of consecutive health check failures before marking unhealthy */
  retries: number;
  /** Grace period in seconds before starting health checks */
  gracePeriod?: number;
}

/**
 * Security configuration for services
 */
export interface SecurityConfig {
  /** Enable mutual TLS (mTLS) on the Application Load Balancer */
  mTLS: boolean;
  /** ARN of the SSL certificate for HTTPS/TLS termination */
  certificateArn?: string;
}

/**
 * Port mapping configuration for sidecar containers
 */
export interface PortMapping {
  /** Container port number */
  containerPort: number;
  /** Protocol type */
  protocol: ContainerProtocol;
}

/**
 * Sidecar container configuration
 */
export interface SidecarContainer {
  /** Container name */
  name: string;
  /** Container image URI */
  image: string;
  /** Whether the container is essential (if false, container failure won't stop the task) */
  essential?: boolean;
  /** CPU units allocated to the sidecar container */
  cpu?: number;
  /** Memory in MiB allocated to the sidecar container */
  memory?: number;
  /** Environment variables for the sidecar container */
  environmentVariables?: Record<string, string>;
  /** Port mappings for the sidecar container */
  portMappings?: PortMapping[];
}

/**
 * Deployment configuration for different deployment strategies
 */
export interface DeploymentConfig {
  /** Deployment strategy type */
  type: DeploymentType;
  /** 
   * Termination wait time in seconds for graceful shutdown
   * Used in blue-green and canary deployments
   */
  terminationWaitTime?: number;
  /** 
   * Percentage of traffic to route to canary deployment (0-100)
   * Only used with canary deployment type
   */
  canaryPercentage?: number;
}

/**
 * Complete service configuration schema
 * This represents the structure of a service YAML configuration file
 */
export interface ServiceConfig {
  /** Service name (used for resource naming) */
  name: string;
  
  /** 
   * Environments where this service should be deployed
   * If not specified, service will be deployed to all environments
   * Example: ["dev", "qa"] to deploy only to dev and qa environments
   */
  environments?: string[];
  
  /** 
   * Domain name for the service (optional)
   * If provided, an Application Load Balancer will be created
   */
  domainName?: string;
  
  /** 
   * Context path for routing (e.g., "/api/v1")
   * Used with Application Load Balancer for path-based routing
   */
  contextPath?: string;
  
  /** Communication protocol */
  protocol: Protocol;
  
  /** Container port number */
  port: number;
  
  /** Container image URI (ECR or Docker Hub) */
  containerImage: string;
  
  /** Task size configuration */
  taskSize: TaskSize;
  
  /** Auto-scaling configuration */
  scaling: ScalingConfig;
  
  /** Environment variables for the main container */
  environmentVariables?: Record<string, string>;
  
  /** Health check configuration */
  healthCheck: HealthCheck;
  
  /** Security configuration */
  security?: SecurityConfig;
  
  /** Deployment configuration */
  deployment?: DeploymentConfig;
  
  /** Sidecar containers configuration */
  sidecarContainers?: SidecarContainer[];
}

/**
 * Multi-service configuration schema
 * Allows defining multiple services in a single YAML file
 */
export interface MultiServiceConfig {
  /** Array of service configurations */
  services: ServiceConfig[];
}

/**
 * Union type for service configuration files
 * Can be either a single service or multiple services
 */
export type ServiceConfigFile = ServiceConfig | MultiServiceConfig;

/**
 * Type guard to check if config contains multiple services
 */
export function isMultiServiceConfig(config: ServiceConfigFile): config is MultiServiceConfig {
  return 'services' in config && Array.isArray(config.services);
}

/**
 * Type guard to check if config is a single service
 */
export function isSingleServiceConfig(config: ServiceConfigFile): config is ServiceConfig {
  return 'name' in config && typeof config.name === 'string';
}

/**
 * Validation helper to ensure task size combinations are valid
 * AWS Fargate has specific CPU/Memory combinations that are supported
 */
export function isValidTaskSize(cpu: number, memory: number): boolean {
  const validCombinations: Record<number, number[]> = {
    256: [512, 1024, 2048],
    512: [1024, 2048, 3072, 4096],
    1024: [2048, 3072, 4096, 5120, 6144, 7168, 8192],
    2048: [4096, 5120, 6144, 7168, 8192, 9216, 10240, 11264, 12288, 13312, 14336, 15360, 16384],
    4096: [8192, 9216, 10240, 11264, 12288, 13312, 14336, 15360, 16384, 17408, 18432, 19456, 20480, 21504, 22528, 23552, 24576, 25600, 26624, 27648, 28672, 29696, 30720]
  };
  
  return validCombinations[cpu]?.includes(memory) ?? false;
}

/**
 * Default values for service configuration
 */
export const DEFAULT_SERVICE_CONFIG: Partial<ServiceConfig> = {
  protocol: 'HTTP',
  taskSize: {
    cpu: 512,
    memory: 1024
  },
  scaling: {
    minCapacity: 1,
    maxCapacity: 10,
    targetCpuUtilization: 70
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
    type: 'rolling'
  }
};

/**
 * Configuration validation errors
 */
export class ServiceConfigValidationError extends Error {
  constructor(message: string, public readonly field?: string) {
    super(message);
    this.name = 'ServiceConfigValidationError';
  }
}

/**
 * Validates a service configuration object
 * @param config Service configuration to validate
 * @throws ServiceConfigValidationError if validation fails
 */
export function validateServiceConfig(config: ServiceConfig): void {
  if (!config.name || typeof config.name !== 'string') {
    throw new ServiceConfigValidationError('Service name is required and must be a string', 'name');
  }

  if (!config.containerImage || typeof config.containerImage !== 'string') {
    throw new ServiceConfigValidationError('Container image is required and must be a string', 'containerImage');
  }

  if (!config.port || typeof config.port !== 'number' || config.port < 1 || config.port > 65535) {
    throw new ServiceConfigValidationError('Port must be a number between 1 and 65535', 'port');
  }

  if (!isValidTaskSize(config.taskSize.cpu, config.taskSize.memory)) {
    throw new ServiceConfigValidationError(
      `Invalid CPU/Memory combination: ${config.taskSize.cpu}/${config.taskSize.memory}. Check AWS Fargate documentation for valid combinations.`,
      'taskSize'
    );
  }

  if (config.scaling.minCapacity < 0) {
    throw new ServiceConfigValidationError('Minimum capacity must be >= 0', 'scaling.minCapacity');
  }

  if (config.scaling.maxCapacity < config.scaling.minCapacity) {
    throw new ServiceConfigValidationError('Maximum capacity must be >= minimum capacity', 'scaling.maxCapacity');
  }

  if (config.scaling.targetCpuUtilization && (config.scaling.targetCpuUtilization < 1 || config.scaling.targetCpuUtilization > 100)) {
    throw new ServiceConfigValidationError('Target CPU utilization must be between 1 and 100', 'scaling.targetCpuUtilization');
  }

  if (config.scaling.targetMemoryUtilization && (config.scaling.targetMemoryUtilization < 1 || config.scaling.targetMemoryUtilization > 100)) {
    throw new ServiceConfigValidationError('Target memory utilization must be between 1 and 100', 'scaling.targetMemoryUtilization');
  }

  if (config.healthCheck.interval < 5 || config.healthCheck.interval > 300) {
    throw new ServiceConfigValidationError('Health check interval must be between 5 and 300 seconds', 'healthCheck.interval');
  }

  if (config.healthCheck.timeout < 2 || config.healthCheck.timeout > 120) {
    throw new ServiceConfigValidationError('Health check timeout must be between 2 and 120 seconds', 'healthCheck.timeout');
  }

  if (config.healthCheck.timeout >= config.healthCheck.interval) {
    throw new ServiceConfigValidationError('Health check timeout must be less than interval', 'healthCheck.timeout');
  }

  if (config.deployment?.type === 'canary') {
    if (!config.deployment.canaryPercentage || config.deployment.canaryPercentage < 1 || config.deployment.canaryPercentage > 100) {
      throw new ServiceConfigValidationError('Canary percentage must be between 1 and 100 for canary deployments', 'deployment.canaryPercentage');
    }
  }

  if (config.sidecarContainers) {
    for (const [index, sidecar] of config.sidecarContainers.entries()) {
      if (!sidecar.name || typeof sidecar.name !== 'string') {
        throw new ServiceConfigValidationError(`Sidecar container at index ${index} must have a name`, `sidecarContainers[${index}].name`);
      }

      if (!sidecar.image || typeof sidecar.image !== 'string') {
        throw new ServiceConfigValidationError(`Sidecar container at index ${index} must have an image`, `sidecarContainers[${index}].image`);
      }

      if (sidecar.portMappings) {
        for (const [portIndex, portMapping] of sidecar.portMappings.entries()) {
          if (!portMapping.containerPort || portMapping.containerPort < 1 || portMapping.containerPort > 65535) {
            throw new ServiceConfigValidationError(
              `Sidecar container port mapping at index ${portIndex} must have a valid container port`,
              `sidecarContainers[${index}].portMappings[${portIndex}].containerPort`
            );
          }
        }
      }
    }
  }
}
