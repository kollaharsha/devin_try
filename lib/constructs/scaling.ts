import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as applicationautoscaling from 'aws-cdk-lib/aws-applicationautoscaling';
import { Construct } from 'constructs';
import { ScalingConfig } from '../utils/config-loader';

export interface ScalingConstructProps {
  service: ecs.FargateService;
  scalingConfig: ScalingConfig;
}

export class ScalingConstruct extends Construct {
  public readonly scalingTarget: ecs.ScalableTaskCount;

  constructor(scope: Construct, id: string, props: ScalingConstructProps) {
    super(scope, id);

    const { service, scalingConfig } = props;

    this.scalingTarget = service.autoScaleTaskCount({
      minCapacity: scalingConfig.minCapacity,
      maxCapacity: scalingConfig.maxCapacity,
    });

    if (scalingConfig.targetCpuUtilization) {
      this.scalingTarget.scaleOnCpuUtilization('CpuScaling', {
        targetUtilizationPercent: scalingConfig.targetCpuUtilization,
        scaleInCooldown: cdk.Duration.minutes(5),
        scaleOutCooldown: cdk.Duration.minutes(2),
      });
    }

    if (scalingConfig.targetMemoryUtilization) {
      this.scalingTarget.scaleOnMemoryUtilization('MemoryScaling', {
        targetUtilizationPercent: scalingConfig.targetMemoryUtilization,
        scaleInCooldown: cdk.Duration.minutes(5),
        scaleOutCooldown: cdk.Duration.minutes(2),
      });
    }

  }

  public getScalingTarget(): ecs.ScalableTaskCount {
    return this.scalingTarget;
  }
}
