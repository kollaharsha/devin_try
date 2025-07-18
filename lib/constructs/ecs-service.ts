import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as applicationautoscaling from 'aws-cdk-lib/aws-applicationautoscaling';
import { Construct } from 'constructs';
import { ServiceConfig } from '../types/service-config';
import { EnvironmentConfig } from '../utils/environment';
import { LoadBalancerConstruct } from './load-balancer';
import { ScalingConstruct } from './scaling';

export interface EcsServiceConstructProps {
  serviceConfig: ServiceConfig;
  environment: string;
  envConfig: EnvironmentConfig;
  vpc: ec2.Vpc;
  cluster: ecs.Cluster;
}

export class EcsServiceConstruct extends Construct {
  public readonly service: ecs.FargateService;
  public readonly taskDefinition: ecs.FargateTaskDefinition;
  public readonly loadBalancer?: elbv2.ApplicationLoadBalancer;
  public readonly targetGroup?: elbv2.ApplicationTargetGroup;

  constructor(scope: Construct, id: string, props: EcsServiceConstructProps) {
    super(scope, id);

    const { serviceConfig, environment, envConfig, vpc, cluster } = props;

    const taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    this.taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
      family: `${environment}-${serviceConfig.name}`,
      cpu: serviceConfig.taskSize.cpu,
      memoryLimitMiB: serviceConfig.taskSize.memory,
      executionRole: taskExecutionRole,
      taskRole: taskRole,
    });

    const logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: `/aws/ecs/${environment}/${serviceConfig.name}`,
      retention: environment === 'prod' ? logs.RetentionDays.ONE_YEAR : logs.RetentionDays.ONE_MONTH,
      removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    const mainContainer = this.taskDefinition.addContainer('MainContainer', {
      image: ecs.ContainerImage.fromRegistry(serviceConfig.containerImage),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'ecs',
        logGroup: logGroup,
      }),
      environment: serviceConfig.environmentVariables || {},
      healthCheck: {
        command: ['CMD-SHELL', `curl -f http://localhost:${serviceConfig.port}${serviceConfig.healthCheck.path} || exit 1`],
        interval: cdk.Duration.seconds(serviceConfig.healthCheck.interval),
        timeout: cdk.Duration.seconds(serviceConfig.healthCheck.timeout),
        retries: serviceConfig.healthCheck.retries,
        startPeriod: cdk.Duration.seconds(serviceConfig.healthCheck.gracePeriod || 60),
      },
    });

    mainContainer.addPortMappings({
      containerPort: serviceConfig.port,
      protocol: ecs.Protocol.TCP,
    });

    if (serviceConfig.sidecarContainers) {
      for (const sidecar of serviceConfig.sidecarContainers) {
        const sidecarContainer = this.taskDefinition.addContainer(sidecar.name, {
          image: ecs.ContainerImage.fromRegistry(sidecar.image),
          essential: sidecar.essential,
          cpu: sidecar.cpu,
          memoryLimitMiB: sidecar.memory,
          environment: sidecar.environmentVariables || {},
          logging: ecs.LogDrivers.awsLogs({
            streamPrefix: `sidecar-${sidecar.name}`,
            logGroup: logGroup,
          }),
        });

        if (sidecar.portMappings) {
          for (const portMapping of sidecar.portMappings) {
            sidecarContainer.addPortMappings({
              containerPort: portMapping.containerPort,
              protocol: portMapping.protocol === 'UDP' ? ecs.Protocol.UDP : ecs.Protocol.TCP,
            });
          }
        }
      }
    }

    const serviceSecurityGroup = new ec2.SecurityGroup(this, 'ServiceSecurityGroup', {
      vpc,
      description: `Security group for ${serviceConfig.name} service`,
      allowAllOutbound: true,
    });

    this.service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition: this.taskDefinition,
      serviceName: `${environment}-${serviceConfig.name}`,
      desiredCount: serviceConfig.scaling.minCapacity,
      assignPublicIp: false,
      securityGroups: [serviceSecurityGroup],
      healthCheckGracePeriod: cdk.Duration.seconds(serviceConfig.healthCheck.gracePeriod || 60),
      enableExecuteCommand: environment === 'prod' || environment === 'uat',
    });

    if (serviceConfig.domainName) {
      const lbConstruct = new LoadBalancerConstruct(this, 'LoadBalancer', {
        serviceConfig,
        environment,
        envConfig,
        vpc,
        service: this.service,
        serviceSecurityGroup,
      });

      this.loadBalancer = lbConstruct.loadBalancer;
      this.targetGroup = lbConstruct.targetGroup;
    }

    const scalingConstruct = new ScalingConstruct(this, 'Scaling', {
      service: this.service,
      scalingConfig: serviceConfig.scaling,
    });

    if (serviceConfig.deployment?.type === 'blue-green') {
      this.service.node.addMetadata('deploymentType', 'blue-green');
    } else if (serviceConfig.deployment?.type === 'canary') {
      this.service.node.addMetadata('deploymentType', 'canary');
      this.service.node.addMetadata('canaryPercentage', serviceConfig.deployment.canaryPercentage || 10);
    }
  }

  public addCustomConstruct(construct: Construct): void {
    construct.node.addDependency(this.service);
  }

  public addContainer(name: string, containerDefinition: ecs.ContainerDefinitionOptions): ecs.ContainerDefinition {
    return this.taskDefinition.addContainer(name, containerDefinition);
  }

  public getService(): ecs.FargateService {
    return this.service;
  }

  public getTaskDefinition(): ecs.FargateTaskDefinition {
    return this.taskDefinition;
  }
}
