import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { EcsServiceConstruct } from '../constructs/ecs-service';
export interface ServiceStackProps extends cdk.StackProps {
    environment: string;
    envConfig: EnvironmentConfig;
    vpc: ec2.Vpc;
    cluster: ecs.Cluster;
}
export declare class ServiceStack extends cdk.Stack {
    readonly services: EcsServiceConstruct[];
    constructor(scope: Construct, id: string, props: ServiceStackProps);
}
