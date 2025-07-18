import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
export interface BaseStackProps extends cdk.StackProps {
    environment: string;
    envConfig: EnvironmentConfig;
}
export declare class BaseStack extends cdk.Stack {
    readonly vpc: ec2.Vpc;
    readonly cluster: ecs.Cluster;
    constructor(scope: Construct, id: string, props: BaseStackProps);
}
