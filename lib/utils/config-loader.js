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
 * @returns Array of validated service configurations
 * @throws Error if file not found or validation fails
 */
function loadServiceConfig(configPath) {
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
                const serviceWithDefaults = applyDefaults(service);
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
 * @returns Array of all validated service configurations
 * @throws Error if directory not found or any validation fails
 */
function loadAllServiceConfigs(servicesDir) {
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
            const configs = loadServiceConfig(filePath);
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
 * @returns Complete service configuration with defaults applied
 */
function applyDefaults(config) {
    return {
        ...service_config_1.DEFAULT_SERVICE_CONFIG,
        ...config,
        taskSize: {
            ...service_config_1.DEFAULT_SERVICE_CONFIG.taskSize,
            ...config.taskSize
        },
        scaling: {
            ...service_config_1.DEFAULT_SERVICE_CONFIG.scaling,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLWxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbmZpZy1sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUM3Qiw2QkFBNkI7QUFDN0IsNERBU2lDO0FBRWpDOzs7OztHQUtHO0FBQ0gsU0FBZ0IsaUJBQWlCLENBQUMsVUFBa0I7SUFDbEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUUxQyxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLHlDQUF5QyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0tBQ3RFO0lBRUQsSUFBSTtRQUNGLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3RELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFzQixDQUFDO1FBRS9ELElBQUksUUFBeUIsQ0FBQztRQUU5QixJQUFJLElBQUEscUNBQW9CLEVBQUMsU0FBUyxDQUFDLEVBQUU7WUFDbkMsUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7U0FDL0I7YUFBTSxJQUFJLElBQUEsc0NBQXFCLEVBQUMsU0FBUyxDQUFDLEVBQUU7WUFDM0MsUUFBUSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDeEI7YUFBTTtZQUNMLE1BQU0sSUFBSSxLQUFLLENBQUMsbUNBQW1DLFVBQVUsK0RBQStELENBQUMsQ0FBQztTQUMvSDtRQUVELE1BQU0saUJBQWlCLEdBQW9CLEVBQUUsQ0FBQztRQUM5QyxLQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLElBQUksUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ2pELElBQUk7Z0JBQ0YsTUFBTSxtQkFBbUIsR0FBRyxh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QztRQUNwRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQztLQUNqQztBQUNILENBQUM7QUFWRCw4REFVQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsZ0JBQWdCLENBQUMsT0FBd0IsRUFBRSxXQUFtQjtJQUM1RSxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLFdBQVcsQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFGRCw0Q0FFQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0IscUJBQXFCLENBQUMsT0FBd0IsRUFBRSxRQUF5QjtJQUN2RixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDO0FBQ2hFLENBQUM7QUFGRCxzREFFQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQiwyQkFBMkIsQ0FBQyxPQUF3QjtJQUNsRSxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDckQsQ0FBQztBQUZELGtFQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHlhbWwgZnJvbSAneWFtbCc7XG5pbXBvcnQge1xuICBTZXJ2aWNlQ29uZmlnLFxuICBTZXJ2aWNlQ29uZmlnRmlsZSxcbiAgTXVsdGlTZXJ2aWNlQ29uZmlnLFxuICBpc011bHRpU2VydmljZUNvbmZpZyxcbiAgaXNTaW5nbGVTZXJ2aWNlQ29uZmlnLFxuICB2YWxpZGF0ZVNlcnZpY2VDb25maWcsXG4gIFNlcnZpY2VDb25maWdWYWxpZGF0aW9uRXJyb3IsXG4gIERFRkFVTFRfU0VSVklDRV9DT05GSUdcbn0gZnJvbSAnLi4vdHlwZXMvc2VydmljZS1jb25maWcnO1xuXG4vKipcbiAqIExvYWRzIGFuZCB2YWxpZGF0ZXMgYSBzZXJ2aWNlIGNvbmZpZ3VyYXRpb24gZnJvbSBhIFlBTUwgZmlsZVxuICogQHBhcmFtIGNvbmZpZ1BhdGggUGF0aCB0byB0aGUgWUFNTCBjb25maWd1cmF0aW9uIGZpbGVcbiAqIEByZXR1cm5zIEFycmF5IG9mIHZhbGlkYXRlZCBzZXJ2aWNlIGNvbmZpZ3VyYXRpb25zXG4gKiBAdGhyb3dzIEVycm9yIGlmIGZpbGUgbm90IGZvdW5kIG9yIHZhbGlkYXRpb24gZmFpbHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRTZXJ2aWNlQ29uZmlnKGNvbmZpZ1BhdGg6IHN0cmluZyk6IFNlcnZpY2VDb25maWdbXSB7XG4gIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5yZXNvbHZlKGNvbmZpZ1BhdGgpO1xuICBcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGZ1bGxQYXRoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgU2VydmljZSBjb25maWd1cmF0aW9uIGZpbGUgbm90IGZvdW5kOiAke2Z1bGxQYXRofWApO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmdWxsUGF0aCwgJ3V0ZjgnKTtcbiAgICBjb25zdCByYXdDb25maWcgPSB5YW1sLnBhcnNlKGZpbGVDb250ZW50KSBhcyBTZXJ2aWNlQ29uZmlnRmlsZTtcblxuICAgIGxldCBzZXJ2aWNlczogU2VydmljZUNvbmZpZ1tdO1xuXG4gICAgaWYgKGlzTXVsdGlTZXJ2aWNlQ29uZmlnKHJhd0NvbmZpZykpIHtcbiAgICAgIHNlcnZpY2VzID0gcmF3Q29uZmlnLnNlcnZpY2VzO1xuICAgIH0gZWxzZSBpZiAoaXNTaW5nbGVTZXJ2aWNlQ29uZmlnKHJhd0NvbmZpZykpIHtcbiAgICAgIHNlcnZpY2VzID0gW3Jhd0NvbmZpZ107XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBjb25maWd1cmF0aW9uIGZvcm1hdCBpbiAke2NvbmZpZ1BhdGh9LiBNdXN0IGNvbnRhaW4gZWl0aGVyIGEgc2luZ2xlIHNlcnZpY2Ugb3IgYSAnc2VydmljZXMnIGFycmF5LmApO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbGlkYXRlZFNlcnZpY2VzOiBTZXJ2aWNlQ29uZmlnW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IFtpbmRleCwgc2VydmljZV0gb2Ygc2VydmljZXMuZW50cmllcygpKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBzZXJ2aWNlV2l0aERlZmF1bHRzID0gYXBwbHlEZWZhdWx0cyhzZXJ2aWNlKTtcbiAgICAgICAgdmFsaWRhdGVTZXJ2aWNlQ29uZmlnKHNlcnZpY2VXaXRoRGVmYXVsdHMpO1xuICAgICAgICB2YWxpZGF0ZWRTZXJ2aWNlcy5wdXNoKHNlcnZpY2VXaXRoRGVmYXVsdHMpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgU2VydmljZUNvbmZpZ1ZhbGlkYXRpb25FcnJvcikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVmFsaWRhdGlvbiBlcnJvciBpbiAke2NvbmZpZ1BhdGh9IChzZXJ2aWNlICR7aW5kZXggKyAxfSk6ICR7ZXJyb3IubWVzc2FnZX1gKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWRhdGVkU2VydmljZXM7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgeWFtbC5ZQU1MUGFyc2VFcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBZQU1MIHBhcnNpbmcgZXJyb3IgaW4gJHtjb25maWdQYXRofTogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIExvYWRzIGFsbCBzZXJ2aWNlIGNvbmZpZ3VyYXRpb25zIGZyb20gYSBkaXJlY3RvcnlcbiAqIEBwYXJhbSBzZXJ2aWNlc0RpciBEaXJlY3RvcnkgY29udGFpbmluZyBZQU1MIHNlcnZpY2UgY29uZmlndXJhdGlvbiBmaWxlc1xuICogQHJldHVybnMgQXJyYXkgb2YgYWxsIHZhbGlkYXRlZCBzZXJ2aWNlIGNvbmZpZ3VyYXRpb25zXG4gKiBAdGhyb3dzIEVycm9yIGlmIGRpcmVjdG9yeSBub3QgZm91bmQgb3IgYW55IHZhbGlkYXRpb24gZmFpbHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRBbGxTZXJ2aWNlQ29uZmlncyhzZXJ2aWNlc0Rpcjogc3RyaW5nKTogU2VydmljZUNvbmZpZ1tdIHtcbiAgY29uc3QgZnVsbFBhdGggPSBwYXRoLnJlc29sdmUoc2VydmljZXNEaXIpO1xuICBcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGZ1bGxQYXRoKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgU2VydmljZXMgZGlyZWN0b3J5IG5vdCBmb3VuZDogJHtmdWxsUGF0aH1gKTtcbiAgfVxuXG4gIGNvbnN0IHNlcnZpY2VDb25maWdzOiBTZXJ2aWNlQ29uZmlnW10gPSBbXTtcbiAgY29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhmdWxsUGF0aCk7XG4gIGNvbnN0IHlhbWxGaWxlcyA9IGZpbGVzLmZpbHRlcihmaWxlID0+IGZpbGUuZW5kc1dpdGgoJy55YW1sJykgfHwgZmlsZS5lbmRzV2l0aCgnLnltbCcpKTtcblxuICBpZiAoeWFtbEZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIGNvbnNvbGUud2FybihgTm8gWUFNTCBmaWxlcyBmb3VuZCBpbiBzZXJ2aWNlcyBkaXJlY3Rvcnk6ICR7ZnVsbFBhdGh9YCk7XG4gICAgcmV0dXJuIHNlcnZpY2VDb25maWdzO1xuICB9XG5cbiAgZm9yIChjb25zdCBmaWxlIG9mIHlhbWxGaWxlcykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihmdWxsUGF0aCwgZmlsZSk7XG4gICAgICBjb25zdCBjb25maWdzID0gbG9hZFNlcnZpY2VDb25maWcoZmlsZVBhdGgpO1xuICAgICAgc2VydmljZUNvbmZpZ3MucHVzaCguLi5jb25maWdzKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gbG9hZCBzZXJ2aWNlIGNvbmZpZ3VyYXRpb24gZnJvbSAke2ZpbGV9OiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBzZXJ2aWNlTmFtZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgZm9yIChjb25zdCBjb25maWcgb2Ygc2VydmljZUNvbmZpZ3MpIHtcbiAgICBpZiAoc2VydmljZU5hbWVzLmhhcyhjb25maWcubmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRHVwbGljYXRlIHNlcnZpY2UgbmFtZSBmb3VuZDogJHtjb25maWcubmFtZX0uIFNlcnZpY2UgbmFtZXMgbXVzdCBiZSB1bmlxdWUgYWNyb3NzIGFsbCBjb25maWd1cmF0aW9uIGZpbGVzLmApO1xuICAgIH1cbiAgICBzZXJ2aWNlTmFtZXMuYWRkKGNvbmZpZy5uYW1lKTtcbiAgfVxuXG4gIHJldHVybiBzZXJ2aWNlQ29uZmlncztcbn1cblxuLyoqXG4gKiBMZWdhY3kgZnVuY3Rpb24gZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAqIEBkZXByZWNhdGVkIFVzZSBsb2FkQWxsU2VydmljZUNvbmZpZ3MgaW5zdGVhZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9hZFNlcnZpY2VDb25maWdzKCk6IFNlcnZpY2VDb25maWdbXSB7XG4gIGNvbnN0IHNlcnZpY2VzRGlyID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uL2NvbmZpZy9zZXJ2aWNlcycpO1xuICByZXR1cm4gbG9hZEFsbFNlcnZpY2VDb25maWdzKHNlcnZpY2VzRGlyKTtcbn1cblxuLyoqXG4gKiBBcHBsaWVzIGRlZmF1bHQgdmFsdWVzIHRvIGEgc2VydmljZSBjb25maWd1cmF0aW9uXG4gKiBAcGFyYW0gY29uZmlnIFBhcnRpYWwgc2VydmljZSBjb25maWd1cmF0aW9uXG4gKiBAcmV0dXJucyBDb21wbGV0ZSBzZXJ2aWNlIGNvbmZpZ3VyYXRpb24gd2l0aCBkZWZhdWx0cyBhcHBsaWVkXG4gKi9cbmZ1bmN0aW9uIGFwcGx5RGVmYXVsdHMoY29uZmlnOiBTZXJ2aWNlQ29uZmlnKTogU2VydmljZUNvbmZpZyB7XG4gIHJldHVybiB7XG4gICAgLi4uREVGQVVMVF9TRVJWSUNFX0NPTkZJRyxcbiAgICAuLi5jb25maWcsXG4gICAgdGFza1NpemU6IHtcbiAgICAgIC4uLkRFRkFVTFRfU0VSVklDRV9DT05GSUcudGFza1NpemUhLFxuICAgICAgLi4uY29uZmlnLnRhc2tTaXplXG4gICAgfSxcbiAgICBzY2FsaW5nOiB7XG4gICAgICAuLi5ERUZBVUxUX1NFUlZJQ0VfQ09ORklHLnNjYWxpbmchLFxuICAgICAgLi4uY29uZmlnLnNjYWxpbmdcbiAgICB9LFxuICAgIGhlYWx0aENoZWNrOiB7XG4gICAgICAuLi5ERUZBVUxUX1NFUlZJQ0VfQ09ORklHLmhlYWx0aENoZWNrISxcbiAgICAgIC4uLmNvbmZpZy5oZWFsdGhDaGVja1xuICAgIH0sXG4gICAgc2VjdXJpdHk6IHtcbiAgICAgIC4uLkRFRkFVTFRfU0VSVklDRV9DT05GSUcuc2VjdXJpdHkhLFxuICAgICAgLi4uY29uZmlnLnNlY3VyaXR5XG4gICAgfSxcbiAgICBkZXBsb3ltZW50OiB7XG4gICAgICAuLi5ERUZBVUxUX1NFUlZJQ0VfQ09ORklHLmRlcGxveW1lbnQhLFxuICAgICAgLi4uY29uZmlnLmRlcGxveW1lbnRcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIGEgc2VydmljZSBjb25maWd1cmF0aW9uIGZpbGUgd2l0aG91dCBsb2FkaW5nIGl0XG4gKiBVc2VmdWwgZm9yIENJL0NEIHBpcGVsaW5lcyBvciBjb25maWd1cmF0aW9uIHZhbGlkYXRpb24gdG9vbHNcbiAqIEBwYXJhbSBjb25maWdQYXRoIFBhdGggdG8gdGhlIFlBTUwgY29uZmlndXJhdGlvbiBmaWxlXG4gKiBAcmV0dXJucyBWYWxpZGF0aW9uIHJlc3VsdCB3aXRoIGFueSBlcnJvcnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU2VydmljZUNvbmZpZ0ZpbGUoY29uZmlnUGF0aDogc3RyaW5nKTogeyB2YWxpZDogYm9vbGVhbjsgZXJyb3JzOiBzdHJpbmdbXSB9IHtcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICBcbiAgdHJ5IHtcbiAgICBsb2FkU2VydmljZUNvbmZpZyhjb25maWdQYXRoKTtcbiAgICByZXR1cm4geyB2YWxpZDogdHJ1ZSwgZXJyb3JzOiBbXSB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGVycm9ycy5wdXNoKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKSk7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IGZhbHNlLCBlcnJvcnMgfTtcbiAgfVxufVxuXG4vKipcbiAqIEdldHMgYSBzZXJ2aWNlIGNvbmZpZ3VyYXRpb24gYnkgbmFtZSBmcm9tIGEgbGlzdCBvZiBjb25maWd1cmF0aW9uc1xuICogQHBhcmFtIGNvbmZpZ3MgQXJyYXkgb2Ygc2VydmljZSBjb25maWd1cmF0aW9uc1xuICogQHBhcmFtIHNlcnZpY2VOYW1lIE5hbWUgb2YgdGhlIHNlcnZpY2UgdG8gZmluZFxuICogQHJldHVybnMgU2VydmljZSBjb25maWd1cmF0aW9uIGlmIGZvdW5kLCB1bmRlZmluZWQgb3RoZXJ3aXNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXJ2aWNlQnlOYW1lKGNvbmZpZ3M6IFNlcnZpY2VDb25maWdbXSwgc2VydmljZU5hbWU6IHN0cmluZyk6IFNlcnZpY2VDb25maWcgfCB1bmRlZmluZWQge1xuICByZXR1cm4gY29uZmlncy5maW5kKGNvbmZpZyA9PiBjb25maWcubmFtZSA9PT0gc2VydmljZU5hbWUpO1xufVxuXG4vKipcbiAqIEZpbHRlcnMgc2VydmljZSBjb25maWd1cmF0aW9ucyBieSBwcm90b2NvbFxuICogQHBhcmFtIGNvbmZpZ3MgQXJyYXkgb2Ygc2VydmljZSBjb25maWd1cmF0aW9uc1xuICogQHBhcmFtIHByb3RvY29sIFByb3RvY29sIHRvIGZpbHRlciBieVxuICogQHJldHVybnMgQXJyYXkgb2Ygc2VydmljZSBjb25maWd1cmF0aW9ucyBtYXRjaGluZyB0aGUgcHJvdG9jb2xcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNlcnZpY2VzQnlQcm90b2NvbChjb25maWdzOiBTZXJ2aWNlQ29uZmlnW10sIHByb3RvY29sOiAnSFRUUCcgfCAnZ1JQQycpOiBTZXJ2aWNlQ29uZmlnW10ge1xuICByZXR1cm4gY29uZmlncy5maWx0ZXIoY29uZmlnID0+IGNvbmZpZy5wcm90b2NvbCA9PT0gcHJvdG9jb2wpO1xufVxuXG4vKipcbiAqIEdldHMgc2VydmljZXMgdGhhdCByZXF1aXJlIGxvYWQgYmFsYW5jZXJzIChoYXZlIGRvbWFpbk5hbWUgY29uZmlndXJlZClcbiAqIEBwYXJhbSBjb25maWdzIEFycmF5IG9mIHNlcnZpY2UgY29uZmlndXJhdGlvbnNcbiAqIEByZXR1cm5zIEFycmF5IG9mIHNlcnZpY2UgY29uZmlndXJhdGlvbnMgdGhhdCBuZWVkIGxvYWQgYmFsYW5jZXJzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZXJ2aWNlc1dpdGhMb2FkQmFsYW5jZXIoY29uZmlnczogU2VydmljZUNvbmZpZ1tdKTogU2VydmljZUNvbmZpZ1tdIHtcbiAgcmV0dXJuIGNvbmZpZ3MuZmlsdGVyKGNvbmZpZyA9PiBjb25maWcuZG9tYWluTmFtZSk7XG59XG5cbmV4cG9ydCB7XG4gIFNlcnZpY2VDb25maWcsXG4gIFNlcnZpY2VDb25maWdGaWxlLFxuICBNdWx0aVNlcnZpY2VDb25maWcsXG4gIFRhc2tTaXplLFxuICBTY2FsaW5nQ29uZmlnLFxuICBIZWFsdGhDaGVjayxcbiAgU2VjdXJpdHlDb25maWcsXG4gIERlcGxveW1lbnRDb25maWcsXG4gIFNpZGVjYXJDb250YWluZXIsXG4gIFBvcnRNYXBwaW5nLFxuICBQcm90b2NvbCxcbiAgRGVwbG95bWVudFR5cGUsXG4gIENvbnRhaW5lclByb3RvY29sXG59IGZyb20gJy4uL3R5cGVzL3NlcnZpY2UtY29uZmlnJztcbiJdfQ==