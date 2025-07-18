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
export declare function loadEnvironmentConfig(environment: string): EnvironmentConfig;
export declare function getRegions(envConfig: EnvironmentConfig): string[];
/**
 * Gets environment-specific configuration for a given region
 * Merges environment defaults with region-specific overrides
 */
export declare function getEnvironmentConfigForRegion(envConfig: EnvironmentConfig, region: string): {
    environmentVariables: Record<string, string>;
    sidecarContainers: Array<any>;
    certificateArn?: string;
    hostedZoneId?: string;
    domainName?: string;
};
