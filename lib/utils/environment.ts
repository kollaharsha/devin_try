import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

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
 * Gets environment-specific configuration for a given region
 * Merges environment defaults with region-specific overrides
 */
export function getEnvironmentConfigForRegion(envConfig: EnvironmentConfig, region: string): {
  environmentVariables: Record<string, string>;
  sidecarContainers: Array<any>;
  certificateArn?: string;
  hostedZoneId?: string;
  domainName?: string;
} {
  const defaults = envConfig.defaults || {};
  const regionConfig = envConfig.regions?.[region] || {};
  
  const environmentVariables = {
    ...defaults.environmentVariables || {},
    ...regionConfig.environmentVariables || {}
  };
  
  const defaultSidecars = defaults.sidecarContainers || [];
  const regionSidecars = regionConfig.sidecarContainers || [];
  
  const sidecarMap = new Map();
  [...defaultSidecars, ...regionSidecars].forEach(sidecar => {
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
