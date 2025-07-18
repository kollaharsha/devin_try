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
export declare function loadCommonConfig(): CommonConfig;
export declare function loadEnvironmentConfig(environment: string): EnvironmentConfig;
export declare function getRegions(envConfig: EnvironmentConfig): string[];
/**
 * Gets merged configuration for a given environment and region
 * Merges common config -> environment defaults -> region-specific overrides
 */
export declare function getEnvironmentConfigForRegion(envConfig: EnvironmentConfig, region: string): {
    environmentVariables: Record<string, string>;
    sidecarContainers: Array<any>;
    certificateArn?: string;
    hostedZoneId?: string;
    domainName?: string;
};
/**
 * Gets merged common and environment defaults (without region-specific overrides)
 * Used for service configuration merging
 */
export declare function getMergedEnvironmentDefaults(envConfig: EnvironmentConfig): CommonConfig;
