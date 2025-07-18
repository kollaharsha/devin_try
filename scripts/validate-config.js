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
    if (!fs.existsSync(envDir)) {
        console.log(`  ⚠️  Environment directory not found: ${envDir}`);
        return;
    }
    const envFiles = fs.readdirSync(envDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
    for (const file of envFiles) {
        const filePath = path.join(envDir, file);
        try {
            (0, environment_1.loadEnvironmentConfig)(file.replace('.yaml', '').replace('.yml', ''));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidmFsaWRhdGUtY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUE7Ozs7O0dBS0c7OztBQUVILHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsOERBQThGO0FBQzlGLDBEQUFpRTtBQVFqRSxTQUFTLHlCQUF5QjtJQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7SUFFdkUsTUFBTSxPQUFPLEdBQXVCLEVBQUUsQ0FBQztJQUN2QyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFFcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO0lBQ3pELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHdCQUF3QixDQUFDLENBQUM7SUFFOUQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNoRSxPQUFPO0tBQ1I7SUFFRCxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBRXhHLEtBQUssTUFBTSxJQUFJLElBQUksUUFBUSxFQUFFO1FBQzNCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pDLElBQUk7WUFDRixJQUFBLG1DQUFxQixFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFB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QUFnQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBQzVELFdBQVcsRUFBRSxDQUFDO0tBQ2Y7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7SUFDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3JFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ3hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFFOUMsSUFBSSxXQUFXLEtBQUssQ0FBQyxFQUFFO1FBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO1NBQU07UUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLG9FQUFvRSxDQUFDLENBQUM7UUFDbEYsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtBQUNILENBQUM7QUFNUSw4REFBeUI7QUFKbEMsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRTtJQUMzQix5QkFBeUIsRUFBRSxDQUFDO0NBQzdCIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgdHMtbm9kZVxuXG4vKipcbiAqIENvbmZpZ3VyYXRpb24gVmFsaWRhdGlvbiBTY3JpcHRcbiAqIFxuICogVGhpcyBzY3JpcHQgdmFsaWRhdGVzIGFsbCBzZXJ2aWNlIGFuZCBlbnZpcm9ubWVudCBjb25maWd1cmF0aW9uc1xuICogYW5kIHByb3ZpZGVzIGRldGFpbGVkIGVycm9yIHJlcG9ydGluZyBmb3IgYW55IGlzc3VlcyBmb3VuZC5cbiAqL1xuXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgdmFsaWRhdGVTZXJ2aWNlQ29uZmlnRmlsZSwgbG9hZEFsbFNlcnZpY2VDb25maWdzIH0gZnJvbSAnLi4vbGliL3V0aWxzL2NvbmZpZy1sb2FkZXInO1xuaW1wb3J0IHsgbG9hZEVudmlyb25tZW50Q29uZmlnIH0gZnJvbSAnLi4vbGliL3V0aWxzL2Vudmlyb25tZW50JztcblxuaW50ZXJmYWNlIFZhbGlkYXRpb25SZXN1bHQge1xuICBmaWxlOiBzdHJpbmc7XG4gIHZhbGlkOiBib29sZWFuO1xuICBlcnJvcnM6IHN0cmluZ1tdO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUFsbENvbmZpZ3VyYXRpb25zKCk6IHZvaWQge1xuICBjb25zb2xlLmxvZygn8J+UjSBWYWxpZGF0aW5nIEFXUyBDREsgRUNTIEZyYW1ld29yayBDb25maWd1cmF0aW9ucy4uLlxcbicpO1xuXG4gIGNvbnN0IHJlc3VsdHM6IFZhbGlkYXRpb25SZXN1bHRbXSA9IFtdO1xuICBsZXQgdG90YWxFcnJvcnMgPSAwO1xuXG4gIGNvbnNvbGUubG9nKCfwn5OBIFZhbGlkYXRpbmcgRW52aXJvbm1lbnQgQ29uZmlndXJhdGlvbnM6Jyk7XG4gIGNvbnN0IGVudkRpciA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9jb25maWcvZW52aXJvbm1lbnRzJyk7XG4gIFxuICBpZiAoIWZzLmV4aXN0c1N5bmMoZW52RGlyKSkge1xuICAgIGNvbnNvbGUubG9nKGAgIOKaoO+4jyAgRW52aXJvbm1lbnQgZGlyZWN0b3J5IG5vdCBmb3VuZDogJHtlbnZEaXJ9YCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIFxuICBjb25zdCBlbnZGaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGVudkRpcikuZmlsdGVyKGZpbGUgPT4gZmlsZS5lbmRzV2l0aCgnLnlhbWwnKSB8fCBmaWxlLmVuZHNXaXRoKCcueW1sJykpO1xuXG4gIGZvciAoY29uc3QgZmlsZSBvZiBlbnZGaWxlcykge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKGVudkRpciwgZmlsZSk7XG4gICAgdHJ5IHtcbiAgICAgIGxvYWRFbnZpcm9ubWVudENvbmZpZyhmaWxlLnJlcGxhY2UoJy55YW1sJywgJycpLnJlcGxhY2UoJy55bWwnLCAnJykpO1xuICAgICAgY29uc29sZS5sb2coYCAg4pyFICR7ZmlsZX0gLSBWYWxpZGApO1xuICAgICAgcmVzdWx0cy5wdXNoKHsgZmlsZTogYGVudmlyb25tZW50cy8ke2ZpbGV9YCwgdmFsaWQ6IHRydWUsIGVycm9yczogW10gfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgIGNvbnNvbGUubG9nKGAgIOKdjCAke2ZpbGV9IC0gSW52YWxpZDogJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgICByZXN1bHRzLnB1c2goeyBmaWxlOiBgZW52aXJvbm1lbnRzLyR7ZmlsZX1gLCB2YWxpZDogZmFsc2UsIGVycm9yczogW2Vycm9yTWVzc2FnZV0gfSk7XG4gICAgICB0b3RhbEVycm9ycysrO1xuICAgIH1cbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdcXG7wn5OBIFZhbGlkYXRpbmcgU2VydmljZSBDb25maWd1cmF0aW9uczonKTtcbiAgY29uc3Qgc2VydmljZXNEaXIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vY29uZmlnL3NlcnZpY2VzJyk7XG4gIGNvbnN0IHNlcnZpY2VGaWxlcyA9IGZzLnJlYWRkaXJTeW5jKHNlcnZpY2VzRGlyKS5maWx0ZXIoZmlsZSA9PiBmaWxlLmVuZHNXaXRoKCcueWFtbCcpIHx8IGZpbGUuZW5kc1dpdGgoJy55bWwnKSk7XG5cbiAgZm9yIChjb25zdCBmaWxlIG9mIHNlcnZpY2VGaWxlcykge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHNlcnZpY2VzRGlyLCBmaWxlKTtcbiAgICBjb25zdCB2YWxpZGF0aW9uID0gdmFsaWRhdGVTZXJ2aWNlQ29uZmlnRmlsZShmaWxlUGF0aCk7XG4gICAgXG4gICAgaWYgKHZhbGlkYXRpb24udmFsaWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKGAgIOKchSAke2ZpbGV9IC0gVmFsaWRgKTtcbiAgICAgIHJlc3VsdHMucHVzaCh7IGZpbGU6IGBzZXJ2aWNlcy8ke2ZpbGV9YCwgdmFsaWQ6IHRydWUsIGVycm9yczogW10gfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKGAgIOKdjCAke2ZpbGV9IC0gSW52YWxpZDpgKTtcbiAgICAgIHZhbGlkYXRpb24uZXJyb3JzLmZvckVhY2goZXJyb3IgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhgICAgIOKAoiAke2Vycm9yfWApO1xuICAgICAgfSk7XG4gICAgICByZXN1bHRzLnB1c2goeyBmaWxlOiBgc2VydmljZXMvJHtmaWxlfWAsIHZhbGlkOiBmYWxzZSwgZXJyb3JzOiB2YWxpZGF0aW9uLmVycm9ycyB9KTtcbiAgICAgIHRvdGFsRXJyb3JzICs9IHZhbGlkYXRpb24uZXJyb3JzLmxlbmd0aDtcbiAgICB9XG4gIH1cblxuICBjb25zb2xlLmxvZygnXFxu8J+UjSBDaGVja2luZyBmb3IgRHVwbGljYXRlIFNlcnZpY2UgTmFtZXM6Jyk7XG4gIHRyeSB7XG4gICAgbG9hZEFsbFNlcnZpY2VDb25maWdzKHNlcnZpY2VzRGlyKTtcbiAgICBjb25zb2xlLmxvZygnICDinIUgTm8gZHVwbGljYXRlIHNlcnZpY2UgbmFtZXMgZm91bmQnKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgY29uc29sZS5sb2coYCAg4p2MIER1cGxpY2F0ZSBzZXJ2aWNlIG5hbWVzOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICB0b3RhbEVycm9ycysrO1xuICB9XG5cbiAgY29uc29sZS5sb2coJ1xcbvCfk4ogVmFsaWRhdGlvbiBTdW1tYXJ5OicpO1xuICBjb25zb2xlLmxvZyhgICBUb3RhbCBmaWxlcyB2YWxpZGF0ZWQ6ICR7cmVzdWx0cy5sZW5ndGh9YCk7XG4gIGNvbnNvbGUubG9nKGAgIFZhbGlkIGZpbGVzOiAke3Jlc3VsdHMuZmlsdGVyKHIgPT4gci52YWxpZCkubGVuZ3RofWApO1xuICBjb25zb2xlLmxvZyhgICBJbnZhbGlkIGZpbGVzOiAke3Jlc3VsdHMuZmlsdGVyKHIgPT4gIXIudmFsaWQpLmxlbmd0aH1gKTtcbiAgY29uc29sZS5sb2coYCAgVG90YWwgZXJyb3JzOiAke3RvdGFsRXJyb3JzfWApO1xuXG4gIGlmICh0b3RhbEVycm9ycyA9PT0gMCkge1xuICAgIGNvbnNvbGUubG9nKCdcXG7wn46JIEFsbCBjb25maWd1cmF0aW9ucyBhcmUgdmFsaWQhJyk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKCdcXG7wn5KlIENvbmZpZ3VyYXRpb24gdmFsaWRhdGlvbiBmYWlsZWQuIFBsZWFzZSBmaXggdGhlIGVycm9ycyBhYm92ZS4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbn1cblxuaWYgKHJlcXVpcmUubWFpbiA9PT0gbW9kdWxlKSB7XG4gIHZhbGlkYXRlQWxsQ29uZmlndXJhdGlvbnMoKTtcbn1cblxuZXhwb3J0IHsgdmFsaWRhdGVBbGxDb25maWd1cmF0aW9ucyB9O1xuIl19