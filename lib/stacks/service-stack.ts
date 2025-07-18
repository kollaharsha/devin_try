import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as path from 'path';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { loadAllServiceConfigs } from '../utils/config-loader';
import { validateServiceConfig } from '../types/service-config';
import { EcsServiceConstruct } from '../constructs/ecs-service';

export interface ServiceStackProps extends cdk.StackProps {
  environment: string;
  envConfig: EnvironmentConfig;
  vpc: ec2.Vpc;
  cluster: ecs.Cluster;
}

export class ServiceStack extends cdk.Stack {
  public readonly services: EcsServiceConstruct[] = [];

  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);

    const allServiceConfigs = loadAllServiceConfigs(path.join(__dirname, '../../config/services'));
    
    const serviceConfigs = allServiceConfigs.filter(config => {
      if (!config.environments || config.environments.length === 0) {
        return true;
      }
      return config.environments.includes(props.environment);
    });

    console.log(`Deploying ${serviceConfigs.length} services to ${props.environment} environment`);
    if (allServiceConfigs.length > serviceConfigs.length) {
      const skippedServices = allServiceConfigs
        .filter(config => config.environments && !config.environments.includes(props.environment))
        .map(config => config.name);
      console.log(`Skipping services not configured for ${props.environment}: ${skippedServices.join(', ')}`);
    }

    for (const serviceConfig of serviceConfigs) {
      validateServiceConfig(serviceConfig);

      const ecsService = new EcsServiceConstruct(this, `Service-${serviceConfig.name}`, {
        serviceConfig,
        environment: props.environment,
        envConfig: props.envConfig,
        vpc: props.vpc,
        cluster: props.cluster,
      });

      this.services.push(ecsService);

      new cdk.CfnOutput(this, `${serviceConfig.name}-ServiceArn`, {
        value: ecsService.service.serviceArn,
        exportName: `${props.environment}-${serviceConfig.name}-service-arn`,
      });

      if (ecsService.loadBalancer) {
        new cdk.CfnOutput(this, `${serviceConfig.name}-LoadBalancerDns`, {
          value: ecsService.loadBalancer.loadBalancerDnsName,
          exportName: `${props.environment}-${serviceConfig.name}-alb-dns`,
        });
      }
    }
  }
}
