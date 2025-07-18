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
export declare function loadEnvironmentConfig(environment: string): EnvironmentConfig;
export declare function getRegions(envConfig: EnvironmentConfig): string[];
