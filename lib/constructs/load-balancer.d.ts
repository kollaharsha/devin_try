import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { ServiceConfig } from '../utils/config-loader';
import { EnvironmentConfig } from '../utils/environment';
export interface LoadBalancerConstructProps {
    serviceConfig: ServiceConfig;
    environment: string;
    envConfig: EnvironmentConfig;
    vpc: ec2.Vpc;
    service: ecs.FargateService;
    serviceSecurityGroup: ec2.SecurityGroup;
}
export declare class LoadBalancerConstruct extends Construct {
    readonly loadBalancer: elbv2.ApplicationLoadBalancer;
    readonly targetGroup: elbv2.ApplicationTargetGroup;
    readonly listener: elbv2.ApplicationListener;
    constructor(scope: Construct, id: string, props: LoadBalancerConstructProps);
}
