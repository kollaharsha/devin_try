import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { loadServiceConfigs, validateServiceConfig } from '../utils/config-loader';
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

    const serviceConfigs = loadServiceConfigs();

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
