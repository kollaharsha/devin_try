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
