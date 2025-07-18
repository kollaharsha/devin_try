/**
 * AWS CDK ECS Framework - TypeScript Usage Examples
 *
 * This file demonstrates how to use the framework's TypeScript types
 * for better type safety and IDE support when working with configurations.
 */
import { ServiceConfig, MultiServiceConfig, TaskSize, ScalingConfig, HealthCheck, DeploymentConfig, SidecarContainer } from '../lib/types';
declare const apiServiceConfig: ServiceConfig;
declare const grpcServiceConfig: ServiceConfig;
declare const workerServiceConfig: ServiceConfig;
declare const multiServiceConfig: MultiServiceConfig;
declare class ServiceConfigBuilder {
    private config;
    constructor(name: string);
    withImage(image: string): this;
    withProtocol(protocol: 'HTTP' | 'gRPC'): this;
    withPort(port: number): this;
    withTaskSize(cpu: TaskSize['cpu'], memory: TaskSize['memory']): this;
    withScaling(scaling: ScalingConfig): this;
    withHealthCheck(healthCheck: HealthCheck): this;
    withDeployment(deployment: DeploymentConfig): this;
    withSidecar(sidecar: SidecarContainer): this;
    withEnvironmentVariable(key: string, value: string): this;
    build(): ServiceConfig;
}
export { apiServiceConfig, grpcServiceConfig, workerServiceConfig, multiServiceConfig, ServiceConfigBuilder };
