/**
 * AWS CDK ECS Framework - Type Definitions
 *
 * This file exports all type definitions for the framework,
 * making them easily accessible to users of the framework.
 */
export { ServiceConfig, ServiceConfigFile, MultiServiceConfig, TaskSize, ScalingConfig, HealthCheck, SecurityConfig, DeploymentConfig, SidecarContainer, PortMapping, Protocol, DeploymentType, ContainerProtocol, isMultiServiceConfig, isSingleServiceConfig, isValidTaskSize, validateServiceConfig, ServiceConfigValidationError, DEFAULT_SERVICE_CONFIG } from './service-config';
export { EnvironmentConfig, loadEnvironmentConfig } from '../utils/environment';
export { loadServiceConfig, loadAllServiceConfigs, validateServiceConfigFile, getServiceByName, getServicesByProtocol, getServicesWithLoadBalancer } from '../utils/config-loader';
