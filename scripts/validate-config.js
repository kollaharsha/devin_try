#!/usr/bin/env ts-node
"use strict";
/**
 * Configuration Validation Script
 *
 * This script validates all service and environment configurations
 * and provides detailed error reporting for any issues found.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAllConfigurations = void 0;
const fs = require("fs");
const path = require("path");
const config_loader_1 = require("../lib/utils/config-loader");
const environment_1 = require("../lib/utils/environment");
function validateAllConfigurations() {
    console.log('🔍 Validating AWS CDK ECS Framework Configurations...\n');
    const results = [];
    let totalErrors = 0;
    console.log('📁 Validating Environment Configurations:');
    const envDir = path.join(__dirname, '../config/environments');
    const envFiles = fs.readdirSync(envDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
    for (const file of envFiles) {
        const filePath = path.join(envDir, file);
        try {
            (0, environment_1.loadEnvironmentConfig)(filePath);
            console.log(`  ✅ ${file} - Valid`);
            results.push({ file: `environments/${file}`, valid: true, errors: [] });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.log(`  ❌ ${file} - Invalid: ${errorMessage}`);
            results.push({ file: `environments/${file}`, valid: false, errors: [errorMessage] });
            totalErrors++;
        }
    }
    console.log('\n📁 Validating Service Configurations:');
    const servicesDir = path.join(__dirname, '../config/services');
    const serviceFiles = fs.readdirSync(servicesDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
    for (const file of serviceFiles) {
        const filePath = path.join(servicesDir, file);
        const validation = (0, config_loader_1.validateServiceConfigFile)(filePath);
        if (validation.valid) {
            console.log(`  ✅ ${file} - Valid`);
            results.push({ file: `services/${file}`, valid: true, errors: [] });
        }
        else {
            console.log(`  ❌ ${file} - Invalid:`);
            validation.errors.forEach(error => {
                console.log(`    • ${error}`);
            });
            results.push({ file: `services/${file}`, valid: false, errors: validation.errors });
            totalErrors += validation.errors.length;
        }
    }
    console.log('\n🔍 Checking for Duplicate Service Names:');
    try {
        (0, config_loader_1.loadAllServiceConfigs)(servicesDir);
        console.log('  ✅ No duplicate service names found');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`  ❌ Duplicate service names: ${errorMessage}`);
        totalErrors++;
    }
    console.log('\n📊 Validation Summary:');
    console.log(`  Total files validated: ${results.length}`);
    console.log(`  Valid files: ${results.filter(r => r.valid).length}`);
    console.log(`  Invalid files: ${results.filter(r => !r.valid).length}`);
    console.log(`  Total errors: ${totalErrors}`);
    if (totalErrors === 0) {
        console.log('\n🎉 All configurations are valid!');
        process.exit(0);
    }
    else {
        console.log('\n💥 Configuration validation failed. Please fix the errors above.');
        process.exit(1);
    }
}
exports.validateAllConfigurations = validateAllConfigurations;
if (require.main === module) {
    validateAllConfigurations();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidmFsaWRhdGUtY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUE7Ozs7O0dBS0c7OztBQUVILHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsOERBQThGO0FBQzlGLDBEQUFpRTtBQVFqRSxTQUFTLHlCQUF5QjtJQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7SUFFdkUsTUFBTSxPQUFPLEdBQXVCLEVBQUUsQ0FBQztJQUN2QyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFFcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO0lBQ3pELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFDOUQsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUV4RyxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsRUFBRTtRQUMzQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6QyxJQUFJO1lBQ0YsSUFBQSxtQ0FBcUIsRUFBQyxRQUFRLENBQUMsQ0FBQztZQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxVQUFVLENBQUMsQ0FBQztZQUNuQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3pFO1FB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T0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3JFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFFOUMsSUFBSSxXQUFXLEtBQUssQ0FBQyxFQUFFO1FBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO1NBQU07UUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLG9FQUFvRSxDQUFDLENBQUM7UUFDbEYsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtBQUNILENBQUM7QUFNUSw4REFBeUI7QUFKbEMsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtJQUMzQix5QkFBeUIsRUFBRSxDQUFDO0NBQzdCIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgdHMtbm9kZVxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gVmFsaWRhdGlvbiBTY3JpcHRcbiAqIFxuICogVGhpcyBzY3JpcHQgdmFsaWRhdGVzIGFsbCBzZXJ2aWNlIGFuZCBlbnZpcm9ubWVudCBjb25maWd1cmF0aW9uc1xuICogYW5kIHByb3ZpZGVzIGRldGFpbGVkIGVycm9yIHJlcG9ydGluZyBmb3IgYW55IGlzc3VlcyBmb3VuZC5cbiAqL1xuXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgdmFsaWRhdGVTZXJ2aWNlQ29uZmlnRmlsZSwgbG9hZEFsbFNlcnZpY2VDb25maWdzIH0gZnJvbSAnLi4vbGliL3V0aWxzL2NvbmZpZy1sb2FkZXInO1xuaW1wb3J0IHsgbG9hZEVudmlyb25tZW50Q29uZmlnIH0gZnJvbSAnLi4vbGliL3V0aWxzL2Vudmlyb25tZW50JztcblxuaW50ZXJmYWNlIFZhbGlkYXRpb25SZXN1bHQge1xuICBmaWxlOiBzdHJpbmc7XG4gIHZhbGlkOiBib29sZWFuO1xuICBlcnJvcnM6IHN0cmluZ1tdO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUFsbENvbmZpZ3VyYXRpb25zKCk6IHZvaWQge1xuICBjb25zb2xlLmxvZygn8J+UjSBWYWxpZGF0aW5nIEFXUyBDREsgRUNTIEZyYW1ld29yayBDb25maWd1cmF0aW9ucy4uLlxcbicpO1xuXG4gIGNvbnN0IHJlc3VsdHM6IFZhbGlkYXRpb25SZXN1bHRbXSA9IFtdO1xuICBsZXQgdG90YWxFcnJvcnMgPSAwO1xuXG4gIGNvbnNvbGUubG9nKCfwn5OBIFZhbGlkYXRpbmcgRW52aXJvbm1lbnQgQ29uZmlndXJhdGlvbnM6Jyk7XG4gIGNvbnN0IGVudkRpciA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9jb25maWcvZW52aXJvbm1lbnRzJyk7XG4gIGNvbnN0IGVudkZpbGVzID0gZnMucmVhZGRpclN5bmMoZW52RGlyKS5maWx0ZXIoZmlsZSA9PiBmaWxlLmVuZHNXaXRoKCcueWFtbCcpIHx8IGZpbGUuZW5kc1dpdGgoJy55bWwnKSk7XG5cbiAgZm9yIChjb25zdCBmaWxlIG9mIGVudkZpbGVzKSB7XG4gICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4oZW52RGlyLCBmaWxlKTtcbiAgICB0cnkge1xuICAgICAgbG9hZEVudmlyb25tZW50Q29uZmlnKGZpbGVQYXRoKTtcbiAgICAgIGNvbnNvbGUubG9nKGAgIOKchSAke2ZpbGV9IC0gVmFsaWRgKTtcbiAgICAgIHJlc3VsdHMucHVzaCh7IGZpbGU6IGBlbnZpcm9ubWVudHMvJHtmaWxlfWAsIHZhbGlkOiB0cnVlLCBlcnJvcnM6IFtdIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICBjb25zb2xlLmxvZyhgICDinYwgJHtmaWxlfSAtIEludmFsaWQ6ICR7ZXJyb3JNZXNzYWdlfWApO1xuICAgICAgcmVzdWx0cy5wdXNoKHsgZmlsZTogYGVudmlyb25tZW50cy8ke2ZpbGV9YCwgdmFsaWQ6IGZhbHNlLCBlcnJvcnM6IFtlcnJvck1lc3NhZ2VdIH0pO1xuICAgICAgdG90YWxFcnJvcnMrKztcbiAgICB9XG4gIH1cblxuICBjb25zb2xlLmxvZygnXFxu8J+TgSBWYWxpZGF0aW5nIFNlcnZpY2UgQ29uZmlndXJhdGlvbnM6Jyk7XG4gIGNvbnN0IHNlcnZpY2VzRGlyID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2NvbmZpZy9zZXJ2aWNlcycpO1xuICBjb25zdCBzZXJ2aWNlRmlsZXMgPSBmcy5yZWFkZGlyU3luYyhzZXJ2aWNlc0RpcikuZmlsdGVyKGZpbGUgPT4gZmlsZS5lbmRzV2l0aCgnLnlhbWwnKSB8fCBmaWxlLmVuZHNXaXRoKCcueW1sJykpO1xuXG4gIGZvciAoY29uc3QgZmlsZSBvZiBzZXJ2aWNlRmlsZXMpIHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHBhdGguam9pbihzZXJ2aWNlc0RpciwgZmlsZSk7XG4gICAgY29uc3QgdmFsaWRhdGlvbiA9IHZhbGlkYXRlU2VydmljZUNvbmZpZ0ZpbGUoZmlsZVBhdGgpO1xuICAgIFxuICAgIGlmICh2YWxpZGF0aW9uLnZhbGlkKSB7XG4gICAgICBjb25zb2xlLmxvZyhgICDinIUgJHtmaWxlfSAtIFZhbGlkYCk7XG4gICAgICByZXN1bHRzLnB1c2goeyBmaWxlOiBgc2VydmljZXMvJHtmaWxlfWAsIHZhbGlkOiB0cnVlLCBlcnJvcnM6IFtdIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhgICDinYwgJHtmaWxlfSAtIEludmFsaWQ6YCk7XG4gICAgICB2YWxpZGF0aW9uLmVycm9ycy5mb3JFYWNoKGVycm9yID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coYCAgICDigKIgJHtlcnJvcn1gKTtcbiAgICAgIH0pO1xuICAgICAgcmVzdWx0cy5wdXNoKHsgZmlsZTogYHNlcnZpY2VzLyR7ZmlsZX1gLCB2YWxpZDogZmFsc2UsIGVycm9yczogdmFsaWRhdGlvbi5lcnJvcnMgfSk7XG4gICAgICB0b3RhbEVycm9ycyArPSB2YWxpZGF0aW9uLmVycm9ycy5sZW5ndGg7XG4gICAgfVxuICB9XG5cbiAgY29uc29sZS5sb2coJ1xcbvCflI0gQ2hlY2tpbmcgZm9yIER1cGxpY2F0ZSBTZXJ2aWNlIE5hbWVzOicpO1xuICB0cnkge1xuICAgIGxvYWRBbGxTZXJ2aWNlQ29uZmlncyhzZXJ2aWNlc0Rpcik7XG4gICAgY29uc29sZS5sb2coJyAg4pyFIE5vIGR1cGxpY2F0ZSBzZXJ2aWNlIG5hbWVzIGZvdW5kJyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgIGNvbnNvbGUubG9nKGAgIOKdjCBEdXBsaWNhdGUgc2VydmljZSBuYW1lczogJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgdG90YWxFcnJvcnMrKztcbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdcXG7wn5OKIFZhbGlkYXRpb24gU3VtbWFyeTonKTtcbiAgY29uc29sZS5sb2coYCAgVG90YWwgZmlsZXMgdmFsaWRhdGVkOiAke3Jlc3VsdHMubGVuZ3RofWApO1xuICBjb25zb2xlLmxvZyhgICBWYWxpZCBmaWxlczogJHtyZXN1bHRzLmZpbHRlcihyID0+IHIudmFsaWQpLmxlbmd0aH1gKTtcbiAgY29uc29sZS5sb2coYCAgSW52YWxpZCBmaWxlczogJHtyZXN1bHRzLmZpbHRlcihyID0+ICFyLnZhbGlkKS5sZW5ndGh9YCk7XG4gIGNvbnNvbGUubG9nKGAgIFRvdGFsIGVycm9yczogJHt0b3RhbEVycm9yc31gKTtcblxuICBpZiAodG90YWxFcnJvcnMgPT09IDApIHtcbiAgICBjb25zb2xlLmxvZygnXFxu8J+OiSBBbGwgY29uZmlndXJhdGlvbnMgYXJlIHZhbGlkIScpO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZygnXFxu8J+SpSBDb25maWd1cmF0aW9uIHZhbGlkYXRpb24gZmFpbGVkLiBQbGVhc2UgZml4IHRoZSBlcnJvcnMgYWJvdmUuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG5cbmlmIChyZXF1aXJlLm1haW4gPT09IG1vZHVsZSkge1xuICB2YWxpZGF0ZUFsbENvbmZpZ3VyYXRpb25zKCk7XG59XG5cbmV4cG9ydCB7IHZhbGlkYXRlQWxsQ29uZmlndXJhdGlvbnMgfTtcbiJdfQ==