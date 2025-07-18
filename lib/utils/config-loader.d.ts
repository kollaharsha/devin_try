import { ServiceConfig } from '../types/service-config';
/**
 * Loads and validates a service configuration from a YAML file
 * @param configPath Path to the YAML configuration file
 * @returns Array of validated service configurations
 * @throws Error if file not found or validation fails
 */
export declare function loadServiceConfig(configPath: string): ServiceConfig[];
/**
 * Loads all service configurations from a directory
 * @param servicesDir Directory containing YAML service configuration files
 * @returns Array of all validated service configurations
 * @throws Error if directory not found or any validation fails
 */
export declare function loadAllServiceConfigs(servicesDir: string): ServiceConfig[];
/**
 * Legacy function for backward compatibility
 * @deprecated Use loadAllServiceConfigs instead
 */
export declare function loadServiceConfigs(): ServiceConfig[];
/**
 * Validates a service configuration file without loading it
 * Useful for CI/CD pipelines or configuration validation tools
 * @param configPath Path to the YAML configuration file
 * @returns Validation result with any errors
 */
export declare function validateServiceConfigFile(configPath: string): {
    valid: boolean;
    errors: string[];
};
/**
 * Gets a service configuration by name from a list of configurations
 * @param configs Array of service configurations
 * @param serviceName Name of the service to find
 * @returns Service configuration if found, undefined otherwise
 */
export declare function getServiceByName(configs: ServiceConfig[], serviceName: string): ServiceConfig | undefined;
/**
 * Filters service configurations by protocol
 * @param configs Array of service configurations
 * @param protocol Protocol to filter by
 * @returns Array of service configurations matching the protocol
 */
export declare function getServicesByProtocol(configs: ServiceConfig[], protocol: 'HTTP' | 'gRPC'): ServiceConfig[];
/**
 * Gets services that require load balancers (have domainName configured)
 * @param configs Array of service configurations
 * @returns Array of service configurations that need load balancers
 */
export declare function getServicesWithLoadBalancer(configs: ServiceConfig[]): ServiceConfig[];
export { ServiceConfig, ServiceConfigFile, MultiServiceConfig, TaskSize, ScalingConfig, HealthCheck, SecurityConfig, DeploymentConfig, SidecarContainer, PortMapping, Protocol, DeploymentType, ContainerProtocol } from '../types/service-config';
