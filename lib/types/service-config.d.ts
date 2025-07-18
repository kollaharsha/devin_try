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
export declare function isMultiServiceConfig(config: ServiceConfigFile): config is MultiServiceConfig;
/**
 * Type guard to check if config is a single service
 */
export declare function isSingleServiceConfig(config: ServiceConfigFile): config is ServiceConfig;
/**
 * Validation helper to ensure task size combinations are valid
 * AWS Fargate has specific CPU/Memory combinations that are supported
 */
export declare function isValidTaskSize(cpu: number, memory: number): boolean;
/**
 * Default values for service configuration
 */
export declare const DEFAULT_SERVICE_CONFIG: Partial<ServiceConfig>;
/**
 * Configuration validation errors
 */
export declare class ServiceConfigValidationError extends Error {
    readonly field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
/**
 * Validates a service configuration object
 * @param config Service configuration to validate
 * @throws ServiceConfigValidationError if validation fails
 */
export declare function validateServiceConfig(config: ServiceConfig): void;
