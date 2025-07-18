import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import {
  ServiceConfig,
  ServiceConfigFile,
  MultiServiceConfig,
  isMultiServiceConfig,
  isSingleServiceConfig,
  validateServiceConfig,
  ServiceConfigValidationError,
  DEFAULT_SERVICE_CONFIG
} from '../types/service-config';

/**
 * Loads and validates a service configuration from a YAML file
 * @param configPath Path to the YAML configuration file
 * @param envDefaults Optional environment-level defaults to merge
 * @returns Array of validated service configurations
 * @throws Error if file not found or validation fails
 */
export function loadServiceConfig(configPath: string, envDefaults?: any): ServiceConfig[] {
  const fullPath = path.resolve(configPath);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Service configuration file not found: ${fullPath}`);
  }

  try {
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const rawConfig = yaml.parse(fileContent) as ServiceConfigFile;

    let services: ServiceConfig[];

    if (isMultiServiceConfig(rawConfig)) {
      services = rawConfig.services;
    } else if (isSingleServiceConfig(rawConfig)) {
      services = [rawConfig];
    } else {
      throw new Error(`Invalid configuration format in ${configPath}. Must contain either a single service or a 'services' array.`);
    }

    const validatedServices: ServiceConfig[] = [];
    for (const [index, service] of services.entries()) {
      try {
        const serviceWithDefaults = applyDefaults(service, envDefaults);
        validateServiceConfig(serviceWithDefaults);
        validatedServices.push(serviceWithDefaults);
      } catch (error) {
        if (error instanceof ServiceConfigValidationError) {
          throw new Error(`Validation error in ${configPath} (service ${index + 1}): ${error.message}`);
        }
        throw error;
      }
    }

    return validatedServices;
  } catch (error) {
    if (error instanceof yaml.YAMLParseError) {
      throw new Error(`YAML parsing error in ${configPath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Loads all service configurations from a directory
 * @param servicesDir Directory containing YAML service configuration files
 * @param envDefaults Optional environment-level defaults to merge
 * @returns Array of all validated service configurations
 * @throws Error if directory not found or any validation fails
 */
export function loadAllServiceConfigs(servicesDir: string, envDefaults?: any): ServiceConfig[] {
  const fullPath = path.resolve(servicesDir);
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Services directory not found: ${fullPath}`);
  }

  const serviceConfigs: ServiceConfig[] = [];
  const files = fs.readdirSync(fullPath);
  const yamlFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));

  if (yamlFiles.length === 0) {
    console.warn(`No YAML files found in services directory: ${fullPath}`);
    return serviceConfigs;
  }

  for (const file of yamlFiles) {
    try {
      const filePath = path.join(fullPath, file);
      const configs = loadServiceConfig(filePath, envDefaults);
      serviceConfigs.push(...configs);
    } catch (error) {
      throw new Error(`Failed to load service configuration from ${file}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const serviceNames = new Set<string>();
  for (const config of serviceConfigs) {
    if (serviceNames.has(config.name)) {
      throw new Error(`Duplicate service name found: ${config.name}. Service names must be unique across all configuration files.`);
    }
    serviceNames.add(config.name);
  }

  return serviceConfigs;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use loadAllServiceConfigs instead
 */
export function loadServiceConfigs(): ServiceConfig[] {
  const servicesDir = path.join(__dirname, '../../config/services');
  return loadAllServiceConfigs(servicesDir);
}

/**
 * Applies default values to a service configuration
 * @param config Partial service configuration
 * @param envDefaults Optional environment-level defaults
 * @returns Complete service configuration with defaults applied
 */
function applyDefaults(config: ServiceConfig, envDefaults?: any): ServiceConfig {
  const baseConfig = {
    ...DEFAULT_SERVICE_CONFIG,
    ...config,
    taskSize: {
      ...DEFAULT_SERVICE_CONFIG.taskSize!,
      ...envDefaults?.taskSize,
      ...config.taskSize
    },
    scaling: {
      ...DEFAULT_SERVICE_CONFIG.scaling!,
      ...envDefaults?.scaling,
      ...config.scaling
    },
    healthCheck: {
      ...DEFAULT_SERVICE_CONFIG.healthCheck!,
      ...config.healthCheck
    },
    security: {
      ...DEFAULT_SERVICE_CONFIG.security!,
      ...config.security
    },
    deployment: {
      ...DEFAULT_SERVICE_CONFIG.deployment!,
      ...config.deployment
    }
  };

  if (envDefaults?.environmentVariables || config.environmentVariables) {
    baseConfig.environmentVariables = {
      ...envDefaults?.environmentVariables || {},
      ...config.environmentVariables || {}
    };
  }

  if (envDefaults?.sidecarContainers || config.sidecarContainers) {
    const envSidecars = envDefaults?.sidecarContainers || [];
    const serviceSidecars = config.sidecarContainers || [];
    
    const sidecarMap = new Map();
    [...envSidecars, ...serviceSidecars].forEach((sidecar: any) => {
      sidecarMap.set(sidecar.name, sidecar);
    });
    baseConfig.sidecarContainers = Array.from(sidecarMap.values());
  }

  return baseConfig;
}

/**
 * Validates a service configuration file without loading it
 * Useful for CI/CD pipelines or configuration validation tools
 * @param configPath Path to the YAML configuration file
 * @returns Validation result with any errors
 */
export function validateServiceConfigFile(configPath: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    loadServiceConfig(configPath);
    return { valid: true, errors: [] };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return { valid: false, errors };
  }
}

/**
 * Gets a service configuration by name from a list of configurations
 * @param configs Array of service configurations
 * @param serviceName Name of the service to find
 * @returns Service configuration if found, undefined otherwise
 */
export function getServiceByName(configs: ServiceConfig[], serviceName: string): ServiceConfig | undefined {
  return configs.find(config => config.name === serviceName);
}

/**
 * Filters service configurations by protocol
 * @param configs Array of service configurations
 * @param protocol Protocol to filter by
 * @returns Array of service configurations matching the protocol
 */
export function getServicesByProtocol(configs: ServiceConfig[], protocol: 'HTTP' | 'gRPC'): ServiceConfig[] {
  return configs.filter(config => config.protocol === protocol);
}

/**
 * Gets services that require load balancers (have domainName configured)
 * @param configs Array of service configurations
 * @returns Array of service configurations that need load balancers
 */
export function getServicesWithLoadBalancer(configs: ServiceConfig[]): ServiceConfig[] {
  return configs.filter(config => config.domainName);
}

export {
  ServiceConfig,
  ServiceConfigFile,
  MultiServiceConfig,
  TaskSize,
  ScalingConfig,
  HealthCheck,
  SecurityConfig,
  DeploymentConfig,
  SidecarContainer,
  PortMapping,
  Protocol,
  DeploymentType,
  ContainerProtocol
} from '../types/service-config';
