import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';

export interface BaseStackProps extends cdk.StackProps {
  environment: string;
  envConfig: EnvironmentConfig;
}

export class BaseStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly cluster: ecs.Cluster;

  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr(props.envConfig.vpcCidr || '10.0.0.0/16'),
      maxAzs: 3,
      natGateways: props.environment === 'prod' ? 3 : 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 28,
          name: 'Isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    this.cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: this.vpc,
      clusterName: `ecs-cluster-${props.environment}`,
      containerInsights: props.environment === 'prod' || props.environment === 'uat',
    });

    this.cluster.enableFargateCapacityProviders();

    new logs.LogGroup(this, 'LogGroup', {
      logGroupName: `/aws/ecs/${props.environment}`,
      retention: props.environment === 'prod' ? logs.RetentionDays.ONE_YEAR : logs.RetentionDays.ONE_MONTH,
      removalPolicy: props.environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      exportName: `${props.environment}-vpc-id`,
    });

    new cdk.CfnOutput(this, 'ClusterArn', {
      value: this.cluster.clusterArn,
      exportName: `${props.environment}-cluster-arn`,
    });
  }
}
