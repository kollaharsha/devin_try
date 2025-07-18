import * as ecs from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import { ScalingConfig } from '../types/service-config';
export interface ScalingConstructProps {
    service: ecs.FargateService;
    scalingConfig: ScalingConfig;
}
export declare class ScalingConstruct extends Construct {
    readonly scalingTarget: ecs.ScalableTaskCount;
    constructor(scope: Construct, id: string, props: ScalingConstructProps);
    getScalingTarget(): ecs.ScalableTaskCount;
}
