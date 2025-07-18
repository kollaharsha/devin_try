import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { ServiceConfig } from '../types/service-config';
import { EnvironmentConfig } from '../utils/environment';
export interface EcsServiceConstructProps {
    serviceConfig: ServiceConfig;
    environment: string;
    envConfig: EnvironmentConfig;
    vpc: ec2.Vpc;
    cluster: ecs.Cluster;
}
export declare class EcsServiceConstruct extends Construct {
    readonly service: ecs.FargateService;
    readonly taskDefinition: ecs.FargateTaskDefinition;
    readonly loadBalancer?: elbv2.ApplicationLoadBalancer;
    readonly targetGroup?: elbv2.ApplicationTargetGroup;
    constructor(scope: Construct, id: string, props: EcsServiceConstructProps);
    addCustomConstruct(construct: Construct): void;
    addContainer(name: string, containerDefinition: ecs.ContainerDefinitionOptions): ecs.ContainerDefinition;
    getService(): ecs.FargateService;
    getTaskDefinition(): ecs.FargateTaskDefinition;
}
