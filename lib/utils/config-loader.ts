import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

export interface TaskSize {
  cpu: number;
  memory: number;
}

export interface ScalingConfig {
  minCapacity: number;
  maxCapacity: number;
  targetCpuUtilization?: number;
  targetMemoryUtilization?: number;
}

export interface HealthCheckConfig {
  path: string;
  interval: number;
  timeout: number;
  retries: number;
  gracePeriod?: number;
}

export interface SecurityConfig {
  mTLS?: boolean;
  certificateArn?: string;
}

export interface DeploymentConfig {
  type: 'rolling' | 'blue-green' | 'canary';
  canaryPercentage?: number;
  terminationWaitTime?: number;
}

export interface SidecarContainer {
  name: string;
  image: string;
  essential: boolean;
  cpu?: number;
  memory?: number;
  environmentVariables?: Record<string, string>;
  portMappings?: Array<{
    containerPort: number;
    protocol?: string;
  }>;
}

export interface ServiceConfig {
  name: string;
  domainName?: string;
  contextPath?: string;
  protocol: 'HTTP' | 'gRPC';
  port: number;
  containerImage: string;
  taskSize: TaskSize;
  scaling: ScalingConfig;
  environmentVariables?: Record<string, string>;
  healthCheck: HealthCheckConfig;
  security?: SecurityConfig;
  deployment?: DeploymentConfig;
  sidecarContainers?: SidecarContainer[];
}

export interface ServicesConfig {
  services: ServiceConfig[];
}

export function loadServiceConfigs(): ServiceConfig[] {
  const servicesDir = path.join(__dirname, '../../config/services');
  const services: ServiceConfig[] = [];

  if (!fs.existsSync(servicesDir)) {
    throw new Error(`Services directory not found: ${servicesDir}`);
  }

  const files = fs.readdirSync(servicesDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));

  for (const file of files) {
    const filePath = path.join(servicesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const config = yaml.parse(content);

    if (config.services && Array.isArray(config.services)) {
      services.push(...config.services);
    } else {
      services.push(config as ServiceConfig);
    }
  }

  return services;
}

export function validateServiceConfig(config: ServiceConfig): void {
  const required = ['name', 'protocol', 'port', 'containerImage', 'taskSize', 'scaling', 'healthCheck'];
  
  for (const field of required) {
    if (!config[field as keyof ServiceConfig]) {
      throw new Error(`Missing required field '${field}' in service config for ${config.name}`);
    }
  }

  if (!['HTTP', 'gRPC'].includes(config.protocol)) {
    throw new Error(`Invalid protocol '${config.protocol}' for service ${config.name}. Must be HTTP or gRPC`);
  }

  if (config.deployment?.type && !['rolling', 'blue-green', 'canary'].includes(config.deployment.type)) {
    throw new Error(`Invalid deployment type '${config.deployment.type}' for service ${config.name}`);
  }
}
