import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

export interface CommonConfig {
  environmentVariables?: Record<string, string>;
  sidecarContainers?: Array<{
    name: string;
    image: string;
    essential?: boolean;
    cpu?: number;
    memory?: number;
    environmentVariables?: Record<string, string>;
    portMappings?: Array<{
      containerPort: number;
      protocol: string;
    }>;
  }>;
  taskSize?: {
    cpu?: number;
    memory?: number;
  };
  scaling?: {
    minCapacity?: number;
    maxCapacity?: number;
    targetCpuUtilization?: number;
    targetMemoryUtilization?: number;
  };
}

export interface EnvironmentConfig {
  name: string;
  primaryRegion: string;
  secondaryRegion?: string;
  multiRegion: boolean;
  vpcCidr: string;
  availabilityZones: string[];
  certificateArn?: string;
  hostedZoneId?: string;
  domainName?: string;
  
  defaults?: {
    environmentVariables?: Record<string, string>;
    sidecarContainers?: Array<{
      name: string;
      image: string;
      essential?: boolean;
      cpu?: number;
      memory?: number;
      environmentVariables?: Record<string, string>;
      portMappings?: Array<{
        containerPort: number;
        protocol: string;
      }>;
    }>;
    taskSize?: {
      cpu?: number;
      memory?: number;
    };
    scaling?: {
      minCapacity?: number;
      maxCapacity?: number;
      targetCpuUtilization?: number;
      targetMemoryUtilization?: number;
    };
  };
  
  regions?: {
    [regionName: string]: {
      environmentVariables?: Record<string, string>;
      sidecarContainers?: Array<{
        name: string;
        image: string;
        essential?: boolean;
        cpu?: number;
        memory?: number;
        environmentVariables?: Record<string, string>;
        portMappings?: Array<{
          containerPort: number;
          protocol: string;
        }>;
      }>;
      certificateArn?: string;
      hostedZoneId?: string;
      domainName?: string;
    };
  };
}

/**
 * Loads common configuration that applies across all environments
 */
export function loadCommonConfig(): CommonConfig {
  const commonConfigPath = path.join(__dirname, '../../config/common.yaml');
  
  if (!fs.existsSync(commonConfigPath)) {
    return {}; // Return empty config if common.yaml doesn't exist
  }

  const configContent = fs.readFileSync(commonConfigPath, 'utf8');
  return yaml.parse(configContent) as CommonConfig;
}

export function loadEnvironmentConfig(environment: string): EnvironmentConfig {
  const configPath = path.join(__dirname, '../../config/environments', `${environment}.yaml`);
  
  if (!fs.existsSync(configPath)) {
    throw new Error(`Environment configuration not found: ${configPath}`);
  }

  const configContent = fs.readFileSync(configPath, 'utf8');
  const config = yaml.parse(configContent) as EnvironmentConfig;
  
  config.name = environment;
  config.primaryRegion = config.primaryRegion || 'us-east-1';
  config.multiRegion = config.multiRegion || false;
  
  if (config.multiRegion && !config.secondaryRegion) {
    config.secondaryRegion = 'us-east-2';
  }

  return config;
}

export function getRegions(envConfig: EnvironmentConfig): string[] {
  const regions = [envConfig.primaryRegion];
  if (envConfig.multiRegion && envConfig.secondaryRegion) {
    regions.push(envConfig.secondaryRegion);
  }
  return regions;
}

/**
 * Gets merged configuration for a given environment and region
 * Merges common config -> environment defaults -> region-specific overrides
 */
export function getEnvironmentConfigForRegion(envConfig: EnvironmentConfig, region: string): {
  environmentVariables: Record<string, string>;
  sidecarContainers: Array<any>;
  certificateArn?: string;
  hostedZoneId?: string;
  domainName?: string;
} {
  const commonConfig = loadCommonConfig();
  const envDefaults = envConfig.defaults || {};
  const regionConfig = envConfig.regions?.[region] || {};
  
  const environmentVariables = {
    ...commonConfig.environmentVariables || {},
    ...envDefaults.environmentVariables || {},
    ...regionConfig.environmentVariables || {}
  };
  
  const commonSidecars = commonConfig.sidecarContainers || [];
  const envSidecars = envDefaults.sidecarContainers || [];
  const regionSidecars = regionConfig.sidecarContainers || [];
  
  const sidecarMap = new Map();
  [...commonSidecars, ...envSidecars, ...regionSidecars].forEach(sidecar => {
    sidecarMap.set(sidecar.name, sidecar);
  });
  const sidecarContainers = Array.from(sidecarMap.values());
  
  return {
    environmentVariables,
    sidecarContainers,
    certificateArn: regionConfig.certificateArn || envConfig.certificateArn,
    hostedZoneId: regionConfig.hostedZoneId || envConfig.hostedZoneId,
    domainName: regionConfig.domainName || envConfig.domainName
  };
}

/**
 * Gets merged common and environment defaults (without region-specific overrides)
 * Used for service configuration merging
 */
export function getMergedEnvironmentDefaults(envConfig: EnvironmentConfig): CommonConfig {
  const commonConfig = loadCommonConfig();
  const envDefaults = envConfig.defaults || {};
  
  const environmentVariables = {
    ...commonConfig.environmentVariables || {},
    ...envDefaults.environmentVariables || {}
  };
  
  const commonSidecars = commonConfig.sidecarContainers || [];
  const envSidecars = envDefaults.sidecarContainers || [];
  
  const sidecarMap = new Map();
  [...commonSidecars, ...envSidecars].forEach(sidecar => {
    sidecarMap.set(sidecar.name, sidecar);
  });
  const sidecarContainers = Array.from(sidecarMap.values());
  
  return {
    environmentVariables,
    sidecarContainers,
    taskSize: {
      ...commonConfig.taskSize || {},
      ...envDefaults.taskSize || {}
    },
    scaling: {
      ...commonConfig.scaling || {},
      ...envDefaults.scaling || {}
    }
  };
}
