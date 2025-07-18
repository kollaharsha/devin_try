#!/usr/bin/env ts-node

/**
 * Configuration Validation Script
 * 
 * This script validates all service and environment configurations
 * and provides detailed error reporting for any issues found.
 */

import * as fs from 'fs';
import * as path from 'path';
import { validateServiceConfigFile, loadAllServiceConfigs } from '../lib/utils/config-loader';
import { loadEnvironmentConfig } from '../lib/utils/environment';

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
}

function validateAllConfigurations(): void {
  console.log('🔍 Validating AWS CDK ECS Framework Configurations...\n');

  const results: ValidationResult[] = [];
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
      loadEnvironmentConfig(file.replace('.yaml', '').replace('.yml', ''));
      console.log(`  ✅ ${file} - Valid`);
      results.push({ file: `environments/${file}`, valid: true, errors: [] });
    } catch (error) {
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
    const validation = validateServiceConfigFile(filePath);
    
    if (validation.valid) {
      console.log(`  ✅ ${file} - Valid`);
      results.push({ file: `services/${file}`, valid: true, errors: [] });
    } else {
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
    loadAllServiceConfigs(servicesDir);
    console.log('  ✅ No duplicate service names found');
  } catch (error) {
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
  } else {
    console.log('\n💥 Configuration validation failed. Please fix the errors above.');
    process.exit(1);
  }
}

if (require.main === module) {
  validateAllConfigurations();
}

export { validateAllConfigurations };
