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
export declare function loadServiceConfigs(): ServiceConfig[];
export declare function validateServiceConfig(config: ServiceConfig): void;
