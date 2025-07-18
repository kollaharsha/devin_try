"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServicesWithLoadBalancer = exports.getServicesByProtocol = exports.getServiceByName = exports.validateServiceConfigFile = exports.loadServiceConfigs = exports.loadAllServiceConfigs = exports.loadServiceConfig = void 0;
const fs = require("fs");
const path = require("path");
const yaml = require("yaml");
const service_config_1 = require("../types/service-config");
/**
 * Loads and validates a service configuration from a YAML file
 * @param configPath Path to the YAML configuration file
 * @param envDefaults Optional environment-level defaults to merge
 * @returns Array of validated service configurations
 * @throws Error if file not found or validation fails
 */
function loadServiceConfig(configPath, envDefaults) {
    const fullPath = path.resolve(configPath);
    if (!fs.existsSync(fullPath)) {
        throw new Error(`Service configuration file not found: ${fullPath}`);
    }
    try {
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        const rawConfig = yaml.parse(fileContent);
        let services;
        if ((0, service_config_1.isMultiServiceConfig)(rawConfig)) {
            services = rawConfig.services;
        }
        else if ((0, service_config_1.isSingleServiceConfig)(rawConfig)) {
            services = [rawConfig];
        }
        else {
            throw new Error(`Invalid configuration format in ${configPath}. Must contain either a single service or a 'services' array.`);
        }
        const validatedServices = [];
        for (const [index, service] of services.entries()) {
            try {
                const serviceWithDefaults = applyDefaults(service, envDefaults);
                (0, service_config_1.validateServiceConfig)(serviceWithDefaults);
                validatedServices.push(serviceWithDefaults);
            }
            catch (error) {
                if (error instanceof service_config_1.ServiceConfigValidationError) {
                    throw new Error(`Validation error in ${configPath} (service ${index + 1}): ${error.message}`);
                }
                throw error;
            }
        }
        return validatedServices;
    }
    catch (error) {
        if (error instanceof yaml.YAMLParseError) {
            throw new Error(`YAML parsing error in ${configPath}: ${error.message}`);
        }
        throw error;
    }
}
exports.loadServiceConfig = loadServiceConfig;
/**
 * Loads all service configurations from a directory
 * @param servicesDir Directory containing YAML service configuration files
 * @param envDefaults Optional environment-level defaults to merge
 * @returns Array of all validated service configurations
 * @throws Error if directory not found or any validation fails
 */
function loadAllServiceConfigs(servicesDir, envDefaults) {
    const fullPath = path.resolve(servicesDir);
    if (!fs.existsSync(fullPath)) {
        throw new Error(`Services directory not found: ${fullPath}`);
    }
    const serviceConfigs = [];
    const files = fs.readdirSync(fullPath);
    const yamlFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
    if (yamlFiles.length === 0) {
        console.warn(`No YAML files found in services directory: ${fullPath}`);
        return serviceConfigs;
    }
    for (const file of yamlFiles) {
        try {
            const filePath = path.join(fullPath, file);
            const configs = loadServiceConfig(filePath, envDefaults);
            serviceConfigs.push(...configs);
        }
        catch (error) {
            throw new Error(`Failed to load service configuration from ${file}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    const serviceNames = new Set();
    for (const config of serviceConfigs) {
        if (serviceNames.has(config.name)) {
            throw new Error(`Duplicate service name found: ${config.name}. Service names must be unique across all configuration files.`);
        }
        serviceNames.add(config.name);
    }
    return serviceConfigs;
}
exports.loadAllServiceConfigs = loadAllServiceConfigs;
/**
 * Legacy function for backward compatibility
 * @deprecated Use loadAllServiceConfigs instead
 */
function loadServiceConfigs() {
    const servicesDir = path.join(__dirname, '../../config/services');
    return loadAllServiceConfigs(servicesDir);
}
exports.loadServiceConfigs = loadServiceConfigs;
/**
 * Applies default values to a service configuration
 * @param config Partial service configuration
 * @param envDefaults Optional environment-level defaults
 * @returns Complete service configuration with defaults applied
 */
function applyDefaults(config, envDefaults) {
    const baseConfig = {
        ...service_config_1.DEFAULT_SERVICE_CONFIG,
        ...config,
        taskSize: {
            ...service_config_1.DEFAULT_SERVICE_CONFIG.taskSize,
            ...envDefaults?.taskSize,
            ...config.taskSize
        },
        scaling: {
            ...service_config_1.DEFAULT_SERVICE_CONFIG.scaling,
            ...envDefaults?.scaling,
            ...config.scaling
        },
        healthCheck: {
            ...service_config_1.DEFAULT_SERVICE_CONFIG.healthCheck,
            ...config.healthCheck
        },
        security: {
            ...service_config_1.DEFAULT_SERVICE_CONFIG.security,
            ...config.security
        },
        deployment: {
            ...service_config_1.DEFAULT_SERVICE_CONFIG.deployment,
            ...config.deployment
        }
    };
    if (envDefaults?.environmentVariables || config.environmentVariables) {
        baseConfig.environmentVariables = {
            ...envDefaults?.environmentVariables || {},
            ...config.environmentVariables || {}
        };
    }
    if (envDefaults?.sidecarContainers || config.sidecarContainers) {
        const envSidecars = envDefaults?.sidecarContainers || [];
        const serviceSidecars = config.sidecarContainers || [];
        const sidecarMap = new Map();
        [...envSidecars, ...serviceSidecars].forEach((sidecar) => {
            sidecarMap.set(sidecar.name, sidecar);
        });
        baseConfig.sidecarContainers = Array.from(sidecarMap.values());
    }
    return baseConfig;
}
/**
 * Validates a service configuration file without loading it
 * Useful for CI/CD pipelines or configuration validation tools
 * @param configPath Path to the YAML configuration file
 * @returns Validation result with any errors
 */
function validateServiceConfigFile(configPath) {
    const errors = [];
    try {
        loadServiceConfig(configPath);
        return { valid: true, errors: [] };
    }
    catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
        return { valid: false, errors };
    }
}
exports.validateServiceConfigFile = validateServiceConfigFile;
/**
 * Gets a service configuration by name from a list of configurations
 * @param configs Array of service configurations
 * @param serviceName Name of the service to find
 * @returns Service configuration if found, undefined otherwise
 */
function getServiceByName(configs, serviceName) {
    return configs.find(config => config.name === serviceName);
}
exports.getServiceByName = getServiceByName;
/**
 * Filters service configurations by protocol
 * @param configs Array of service configurations
 * @param protocol Protocol to filter by
 * @returns Array of service configurations matching the protocol
 */
function getServicesByProtocol(configs, protocol) {
    return configs.filter(config => config.protocol === protocol);
}
exports.getServicesByProtocol = getServicesByProtocol;
/**
 * Gets services that require load balancers (have domainName configured)
 * @param configs Array of service configurations
 * @returns Array of service configurations that need load balancers
 */
function getServicesWithLoadBalancer(configs) {
    return configs.filter(config => config.domainName);
}
exports.getServicesWithLoadBalancer = getServicesWithLoadBalancer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLWxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbmZpZy1sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3Qiw2QkFBNkI7QUFDN0IsNERBU2lDO0FBRWpDOzs7Ozs7R0FNRztBQUNILFNBQWdCLGlCQUFpQixDQUFDLFVBQWtCLEVBQUUsV0FBaUI7SUFDckUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUUxQyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLHlDQUF5QyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0tBQ3RFO0lBRUQsSUFBSTtRQUNGLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3RELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFzQixDQUFDO1FBRS9ELElBQUksUUFBeUIsQ0FBQztRQUU5QixJQUFJLElBQUEscUNBQW9CLEVBQUMsU0FBUyxDQUFDLEVBQUU7WUFDbkMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7U0FDL0I7YUFBTSxJQUFJLElBQUEsc0NBQXFCLEVBQUMsU0FBUyxDQUFDLEVBQUU7WUFDM0MsUUFBUSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDeEI7YUFBTTtZQUNMLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLFVBQVUsK0RBQStELENBQUMsQ0FBQztTQUMvSDtRQUVELE1BQU0saUJBQWlCLEdBQW9CLEVBQUUsQ0FBQztRQUM5QyxLQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLElBQUksUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ2pELElBQUk7Z0JBQ0YsTUFBTSxt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LE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFGRCw0Q0FFQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0IscUJBQXFCLENBQUMsT0FBd0IsRUFBRSxRQUF5QjtJQUN2RixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDO0FBQ2hFLENBQUM7QUFGRCxzREFFQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQiwyQkFBMkIsQ0FBQyxPQUF3QjtJQUNsRSxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckQsQ0FBQztBQUZELGtFQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHlhbWwgZnJvbSAneWFtbCc7XG5pbXBvcnQge1xuICBTZXJ2aWNlQ29uZmlnLFxuICBTZXJ2aWNlQ29uZmlnRmlsZSxcbiAgTXVsdGlTZXJ2aWNlQ29uZmlnLFxuICBpc011bHRpU2VydmljZUNvbmZpZyxcbiAgaXNTaW5nbGVTZXJ2aWNlQ29uZmlnLFxuICB2YWxpZGF0ZVNlcnZpY2VDb25maWcsXG4gIFNlcnZpY2VDb25maWdWYWxpZGF0aW9uRXJyb3IsXG4gIERFRkFVTFRfU0VSVklDRV9DT05GSUdcbn0gZnJvbSAnLi4vdHlwZXMvc2VydmljZS1jb25maWcnO1xuXG4vKipcbiAqIExvYWRzIGFuZCB2YWxpZGF0ZXMgYSBzZXJ2aWNlIGNvbmZpZ3VyYXRpb24gZnJvbSBhIFlBTUwgZmlsZVxuICogQHBhcmFtIGNvbmZpZ1BhdGggUGF0aCB0byB0aGUgWUFNTCBjb25maWd1cmF0aW9uIGZpbGVcbiAqIEBwYXJhbSBlbnZEZWZhdWx0cyBPcHRpb25hbCBlbnZpcm9ubWVudC1sZXZlbCBkZWZhdWx0cyB0byBtZXJnZVxuICogQHJldHVybnMgQXJyYXkgb2YgdmFsaWRhdGVkIHNlcnZpY2UgY29uZmlndXJhdGlvbnNcbiAqIEB0aHJvd3MgRXJyb3IgaWYgZmlsZSBub3QgZm91bmQgb3IgdmFsaWRhdGlvbiBmYWlsc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZFNlcnZpY2VDb25maWcoY29uZmlnUGF0aDogc3RyaW5nLCBlbnZEZWZhdWx0cz86IGFueSk6IFNlcnZpY2VDb25maWdbXSB7XG4gIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5yZXNvbHZlKGNvbmZpZ1BhdGgpO1xuICBcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGZ1bGxQYXRoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgU2VydmljZSBjb25maWd1cmF0aW9uIGZpbGUgbm90IGZvdW5kOiAke2Z1bGxQYXRofWApO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmdWxsUGF0aCwgJ3V0ZjgnKTtcbiAgICBjb25zdCByYXdDb25maWcgPSB5YW1sLnBhcnNlKGZpbGVDb250ZW50KSBhcyBTZXJ2aWNlQ29uZmlnRmlsZTtcblxuICAgIGxldCBzZXJ2aWNlczogU2VydmljZUNvbmZpZ1tdO1xuXG4gICAgaWYgKGlzTXVsdGlTZXJ2aWNlQ29uZmlnKHJhd0NvbmZpZykpIHtcbiAgICAgIHNlcnZpY2VzID0gcmF3Q29uZmlnLnNlcnZpY2VzO1xuICAgIH0gZWxzZSBpZiAoaXNTaW5nbGVTZXJ2aWNlQ29uZmlnKHJhd0NvbmZpZykpIHtcbiAgICAgIHNlcnZpY2VzID0gW3Jhd0NvbmZpZ107XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjb25maWd1cmF0aW9uIGZvcm1hdCBpbiAke2NvbmZpZ1BhdGh9LiBNdXN0IGNvbnRhaW4gZWl0aGVyIGEgc2luZ2xlIHNlcnZpY2Ugb3IgYSAnc2VydmljZXMnIGFycmF5LmApO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbGlkYXRlZFNlcnZpY2VzOiBTZXJ2aWNlQ29uZmlnW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IFtpbmRleCwgc2VydmljZV0gb2Ygc2VydmljZXMuZW50cmllcygpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzZXJ2aWNlV2l0aERlZmF1bHRzID0gYXBwbHlEZWZhdWx0cyhzZXJ2aWNlLCBlbnZEZWZhdWx0cyk7XG4gICAgICAgIHZhbGlkYXRlU2VydmljZUNvbmZpZyhzZXJ2aWNlV2l0aERlZmF1bHRzKTtcbiAgICAgICAgdmFsaWRhdGVkU2VydmljZXMucHVzaChzZXJ2aWNlV2l0aERlZmF1bHRzKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFNlcnZpY2VDb25maWdWYWxpZGF0aW9uRXJyb3IpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFZhbGlkYXRpb24gZXJyb3IgaW4gJHtjb25maWdQYXRofSAoc2VydmljZSAke2luZGV4ICsgMX0pOiAke2Vycm9yLm1lc3NhZ2V9YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbGlkYXRlZFNlcnZpY2VzO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIHlhbWwuWUFNTFBhcnNlRXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgWUFNTCBwYXJzaW5nIGVycm9yIGluICR7Y29uZmlnUGF0aH06ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn1cblxuLyoqXG4gKiBMb2FkcyBhbGwgc2VydmljZSBjb25maWd1cmF0aW9ucyBmcm9tIGEgZGlyZWN0b3J5XG4gKiBAcGFyYW0gc2VydmljZXNEaXIgRGlyZWN0b3J5IGNvbnRhaW5pbmcgWUFNTCBzZXJ2aWNlIGNvbmZpZ3VyYXRpb24gZmlsZXNcbiAqIEBwYXJhbSBlbnZEZWZhdWx0cyBPcHRpb25hbCBlbnZpcm9ubWVudC1sZXZlbCBkZWZhdWx0cyB0byBtZXJnZVxuICogQHJldHVybnMgQXJyYXkgb2YgYWxsIHZhbGlkYXRlZCBzZXJ2aWNlIGNvbmZpZ3VyYXRpb25zXG4gKiBAdGhyb3dzIEVycm9yIGlmIGRpcmVjdG9yeSBub3QgZm91bmQgb3IgYW55IHZhbGlkYXRpb24gZmFpbHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRBbGxTZXJ2aWNlQ29uZmlncyhzZXJ2aWNlc0Rpcjogc3RyaW5nLCBlbnZEZWZhdWx0cz86IGFueSk6IFNlcnZpY2VDb25maWdbXSB7XG4gIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5yZXNvbHZlKHNlcnZpY2VzRGlyKTtcbiAgXG4gIGlmICghZnMuZXhpc3RzU3luYyhmdWxsUGF0aCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFNlcnZpY2VzIGRpcmVjdG9yeSBub3QgZm91bmQ6ICR7ZnVsbFBhdGh9YCk7XG4gIH1cblxuICBjb25zdCBzZXJ2aWNlQ29uZmlnczogU2VydmljZUNvbmZpZ1tdID0gW107XG4gIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZnVsbFBhdGgpO1xuICBjb25zdCB5YW1sRmlsZXMgPSBmaWxlcy5maWx0ZXIoZmlsZSA9PiBmaWxlLmVuZHNXaXRoKCcueWFtbCcpIHx8IGZpbGUuZW5kc1dpdGgoJy55bWwnKSk7XG5cbiAgaWYgKHlhbWxGaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICBjb25zb2xlLndhcm4oYE5vIFlBTUwgZmlsZXMgZm91bmQgaW4gc2VydmljZXMgZGlyZWN0b3J5OiAke2Z1bGxQYXRofWApO1xuICAgIHJldHVybiBzZXJ2aWNlQ29uZmlncztcbiAgfVxuXG4gIGZvciAoY29uc3QgZmlsZSBvZiB5YW1sRmlsZXMpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4oZnVsbFBhdGgsIGZpbGUpO1xuICAgICAgY29uc3QgY29uZmlncyA9IGxvYWRTZXJ2aWNlQ29uZmlnKGZpbGVQYXRoLCBlbnZEZWZhdWx0cyk7XG4gICAgICBzZXJ2aWNlQ29uZmlncy5wdXNoKC4uLmNvbmZpZ3MpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBsb2FkIHNlcnZpY2UgY29uZmlndXJhdGlvbiBmcm9tICR7ZmlsZX06ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpfWApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHNlcnZpY2VOYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IGNvbmZpZyBvZiBzZXJ2aWNlQ29uZmlncykge1xuICAgIGlmIChzZXJ2aWNlTmFtZXMuaGFzKGNvbmZpZy5uYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBEdXBsaWNhdGUgc2VydmljZSBuYW1lIGZvdW5kOiAke2NvbmZpZy5uYW1lfS4gU2VydmljZSBuYW1lcyBtdXN0IGJlIHVuaXF1ZSBhY3Jvc3MgYWxsIGNvbmZpZ3VyYXRpb24gZmlsZXMuYCk7XG4gICAgfVxuICAgIHNlcnZpY2VOYW1lcy5hZGQoY29uZmlnLm5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHNlcnZpY2VDb25maWdzO1xufVxuXG4vKipcbiAqIExlZ2FjeSBmdW5jdGlvbiBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICogQGRlcHJlY2F0ZWQgVXNlIGxvYWRBbGxTZXJ2aWNlQ29uZmlncyBpbnN0ZWFkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkU2VydmljZUNvbmZpZ3MoKTogU2VydmljZUNvbmZpZ1tdIHtcbiAgY29uc3Qgc2VydmljZXNEaXIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vY29uZmlnL3NlcnZpY2VzJyk7XG4gIHJldHVybiBsb2FkQWxsU2VydmljZUNvbmZpZ3Moc2VydmljZXNEaXIpO1xufVxuXG4vKipcbiAqIEFwcGxpZXMgZGVmYXVsdCB2YWx1ZXMgdG8gYSBzZXJ2aWNlIGNvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSBjb25maWcgUGFydGlhbCBzZXJ2aWNlIGNvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSBlbnZEZWZhdWx0cyBPcHRpb25hbCBlbnZpcm9ubWVudC1sZXZlbCBkZWZhdWx0c1xuICogQHJldHVybnMgQ29tcGxldGUgc2VydmljZSBjb25maWd1cmF0aW9uIHdpdGggZGVmYXVsdHMgYXBwbGllZFxuICovXG5mdW5jdGlvbiBhcHBseURlZmF1bHRzKGNvbmZpZzogU2VydmljZUNvbmZpZywgZW52RGVmYXVsdHM/OiBhbnkpOiBTZXJ2aWNlQ29uZmlnIHtcbiAgY29uc3QgYmFzZUNvbmZpZyA9IHtcbiAgICAuLi5ERUZBVUxUX1NFUlZJQ0VfQ09ORklHLFxuICAgIC4uLmNvbmZpZyxcbiAgICB0YXNrU2l6ZToge1xuICAgICAgLi4uREVGQVVMVF9TRVJWSUNFX0NPTkZJRy50YXNrU2l6ZSEsXG4gICAgICAuLi5lbnZEZWZhdWx0cz8udGFza1NpemUsXG4gICAgICAuLi5jb25maWcudGFza1NpemVcbiAgICB9LFxuICAgIHNjYWxpbmc6IHtcbiAgICAgIC4uLkRFRkFVTFRfU0VSVklDRV9DT05GSUcuc2NhbGluZyEsXG4gICAgICAuLi5lbnZEZWZhdWx0cz8uc2NhbGluZyxcbiAgICAgIC4uLmNvbmZpZy5zY2FsaW5nXG4gICAgfSxcbiAgICBoZWFsdGhDaGVjazoge1xuICAgICAgLi4uREVGQVVMVF9TRVJWSUNFX0NPTkZJRy5oZWFsdGhDaGVjayEsXG4gICAgICAuLi5jb25maWcuaGVhbHRoQ2hlY2tcbiAgICB9LFxuICAgIHNlY3VyaXR5OiB7XG4gICAgICAuLi5ERUZBVUxUX1NFUlZJQ0VfQ09ORklHLnNlY3VyaXR5ISxcbiAgICAgIC4uLmNvbmZpZy5zZWN1cml0eVxuICAgIH0sXG4gICAgZGVwbG95bWVudDoge1xuICAgICAgLi4uREVGQVVMVF9TRVJWSUNFX0NPTkZJRy5kZXBsb3ltZW50ISxcbiAgICAgIC4uLmNvbmZpZy5kZXBsb3ltZW50XG4gICAgfVxuICB9O1xuXG4gIGlmIChlbnZEZWZhdWx0cz8uZW52aXJvbm1lbnRWYXJpYWJsZXMgfHwgY29uZmlnLmVudmlyb25tZW50VmFyaWFibGVzKSB7XG4gICAgYmFzZUNvbmZpZy5lbnZpcm9ubWVudFZhcmlhYmxlcyA9IHtcbiAgICAgIC4uLmVudkRlZmF1bHRzPy5lbnZpcm9ubWVudFZhcmlhYmxlcyB8fCB7fSxcbiAgICAgIC4uLmNvbmZpZy5lbnZpcm9ubWVudFZhcmlhYmxlcyB8fCB7fVxuICAgIH07XG4gIH1cblxuICBpZiAoZW52RGVmYXVsdHM/LnNpZGVjYXJDb250YWluZXJzIHx8IGNvbmZpZy5zaWRlY2FyQ29udGFpbmVycykge1xuICAgIGNvbnN0IGVudlNpZGVjYXJzID0gZW52RGVmYXVsdHM/LnNpZGVjYXJDb250YWluZXJzIHx8IFtdO1xuICAgIGNvbnN0IHNlcnZpY2VTaWRlY2FycyA9IGNvbmZpZy5zaWRlY2FyQ29udGFpbmVycyB8fCBbXTtcbiAgICBcbiAgICBjb25zdCBzaWRlY2FyTWFwID0gbmV3IE1hcCgpO1xuICAgIFsuLi5lbnZTaWRlY2FycywgLi4uc2VydmljZVNpZGVjYXJzXS5mb3JFYWNoKChzaWRlY2FyOiBhbnkpID0+IHtcbiAgICAgIHNpZGVjYXJNYXAuc2V0KHNpZGVjYXIubmFtZSwgc2lkZWNhcik7XG4gICAgfSk7XG4gICAgYmFzZUNvbmZpZy5zaWRlY2FyQ29udGFpbmVycyA9IEFycmF5LmZyb20oc2lkZWNhck1hcC52YWx1ZXMoKSk7XG4gIH1cblxuICByZXR1cm4gYmFzZUNvbmZpZztcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgYSBzZXJ2aWNlIGNvbmZpZ3VyYXRpb24gZmlsZSB3aXRob3V0IGxvYWRpbmcgaXRcbiAqIFVzZWZ1bCBmb3IgQ0kvQ0QgcGlwZWxpbmVzIG9yIGNvbmZpZ3VyYXRpb24gdmFsaWRhdGlvbiB0b29sc1xuICogQHBhcmFtIGNvbmZpZ1BhdGggUGF0aCB0byB0aGUgWUFNTCBjb25maWd1cmF0aW9uIGZpbGVcbiAqIEByZXR1cm5zIFZhbGlkYXRpb24gcmVzdWx0IHdpdGggYW55IGVycm9yc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTZXJ2aWNlQ29uZmlnRmlsZShjb25maWdQYXRoOiBzdHJpbmcpOiB7IHZhbGlkOiBib29sZWFuOyBlcnJvcnM6IHN0cmluZ1tdIH0ge1xuICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gIFxuICB0cnkge1xuICAgIGxvYWRTZXJ2aWNlQ29uZmlnKGNvbmZpZ1BhdGgpO1xuICAgIHJldHVybiB7IHZhbGlkOiB0cnVlLCBlcnJvcnM6IFtdIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgZXJyb3JzLnB1c2goZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpKTtcbiAgICByZXR1cm4geyB2YWxpZDogZmFsc2UsIGVycm9ycyB9O1xuICB9XG59XG5cbi8qKlxuICogR2V0cyBhIHNlcnZpY2UgY29uZmlndXJhdGlvbiBieSBuYW1lIGZyb20gYSBsaXN0IG9mIGNvbmZpZ3VyYXRpb25zXG4gKiBAcGFyYW0gY29uZmlncyBBcnJheSBvZiBzZXJ2aWNlIGNvbmZpZ3VyYXRpb25zXG4gKiBAcGFyYW0gc2VydmljZU5hbWUgTmFtZSBvZiB0aGUgc2VydmljZSB0byBmaW5kXG4gKiBAcmV0dXJucyBTZXJ2aWNlIGNvbmZpZ3VyYXRpb24gaWYgZm91bmQsIHVuZGVmaW5lZCBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNlcnZpY2VCeU5hbWUoY29uZmlnczogU2VydmljZUNvbmZpZ1tdLCBzZXJ2aWNlTmFtZTogc3RyaW5nKTogU2VydmljZUNvbmZpZyB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBjb25maWdzLmZpbmQoY29uZmlnID0+IGNvbmZpZy5uYW1lID09PSBzZXJ2aWNlTmFtZSk7XG59XG5cbi8qKlxuICogRmlsdGVycyBzZXJ2aWNlIGNvbmZpZ3VyYXRpb25zIGJ5IHByb3RvY29sXG4gKiBAcGFyYW0gY29uZmlncyBBcnJheSBvZiBzZXJ2aWNlIGNvbmZpZ3VyYXRpb25zXG4gKiBAcGFyYW0gcHJvdG9jb2wgUHJvdG9jb2wgdG8gZmlsdGVyIGJ5XG4gKiBAcmV0dXJucyBBcnJheSBvZiBzZXJ2aWNlIGNvbmZpZ3VyYXRpb25zIG1hdGNoaW5nIHRoZSBwcm90b2NvbFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VydmljZXNCeVByb3RvY29sKGNvbmZpZ3M6IFNlcnZpY2VDb25maWdbXSwgcHJvdG9jb2w6ICdIVFRQJyB8ICdnUlBDJyk6IFNlcnZpY2VDb25maWdbXSB7XG4gIHJldHVybiBjb25maWdzLmZpbHRlcihjb25maWcgPT4gY29uZmlnLnByb3RvY29sID09PSBwcm90b2NvbCk7XG59XG5cbi8qKlxuICogR2V0cyBzZXJ2aWNlcyB0aGF0IHJlcXVpcmUgbG9hZCBiYWxhbmNlcnMgKGhhdmUgZG9tYWluTmFtZSBjb25maWd1cmVkKVxuICogQHBhcmFtIGNvbmZpZ3MgQXJyYXkgb2Ygc2VydmljZSBjb25maWd1cmF0aW9uc1xuICogQHJldHVybnMgQXJyYXkgb2Ygc2VydmljZSBjb25maWd1cmF0aW9ucyB0aGF0IG5lZWQgbG9hZCBiYWxhbmNlcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNlcnZpY2VzV2l0aExvYWRCYWxhbmNlcihjb25maWdzOiBTZXJ2aWNlQ29uZmlnW10pOiBTZXJ2aWNlQ29uZmlnW10ge1xuICByZXR1cm4gY29uZmlncy5maWx0ZXIoY29uZmlnID0+IGNvbmZpZy5kb21haW5OYW1lKTtcbn1cblxuZXhwb3J0IHtcbiAgU2VydmljZUNvbmZpZyxcbiAgU2VydmljZUNvbmZpZ0ZpbGUsXG4gIE11bHRpU2VydmljZUNvbmZpZyxcbiAgVGFza1NpemUsXG4gIFNjYWxpbmdDb25maWcsXG4gIEhlYWx0aENoZWNrLFxuICBTZWN1cml0eUNvbmZpZyxcbiAgRGVwbG95bWVudENvbmZpZyxcbiAgU2lkZWNhckNvbnRhaW5lcixcbiAgUG9ydE1hcHBpbmcsXG4gIFByb3RvY29sLFxuICBEZXBsb3ltZW50VHlwZSxcbiAgQ29udGFpbmVyUHJvdG9jb2xcbn0gZnJvbSAnLi4vdHlwZXMvc2VydmljZS1jb25maWcnO1xuIl19