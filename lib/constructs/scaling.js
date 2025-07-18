"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalingConstruct = void 0;
const cdk = require("aws-cdk-lib");
const constructs_1 = require("constructs");
class ScalingConstruct extends constructs_1.Construct {
    constructor(scope, id, props) {
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
    getScalingTarget() {
        return this.scalingTarget;
    }
}
exports.ScalingConstruct = ScalingConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NhbGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNjYWxpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBR25DLDJDQUF1QztBQVF2QyxNQUFhLGdCQUFpQixTQUFRLHNCQUFTO0lBRzdDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBNEI7UUFDcEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxHQUFHLEtBQUssQ0FBQztRQUV6QyxJQUFJLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQztZQUM5QyxXQUFXLEVBQUUsYUFBYSxDQUFDLFdBQVc7WUFDdEMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxXQUFXO1NBQ3ZDLENBQUMsQ0FBQztRQUVILElBQUksYUFBYSxDQUFDLG9CQUFvQixFQUFFO1lBQ3RDLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsWUFBWSxFQUFFO2dCQUNyRCx3QkFBd0IsRUFBRSxhQUFhLENBQUMsb0JBQW9CO2dCQUM1RCxlQUFlLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDMUMsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxJQUFJLGFBQWEsQ0FBQyx1QkFBdUIsRUFBRTtZQUN6QyxJQUFJLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLGVBQWUsRUFBRTtnQkFDM0Qsd0JBQXdCLEVBQUUsYUFBYSxDQUFDLHVCQUF1QjtnQkFDL0QsZUFBZSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDeEMsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQzFDLENBQUMsQ0FBQztTQUNKO0lBRUgsQ0FBQztJQUVNLGdCQUFnQjtRQUNyQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDNUIsQ0FBQztDQUNGO0FBbENELDRDQWtDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBlY3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjcyc7XG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbmF1dG9zY2FsaW5nIGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcHBsaWNhdGlvbmF1dG9zY2FsaW5nJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgU2NhbGluZ0NvbmZpZyB9IGZyb20gJy4uL3R5cGVzL3NlcnZpY2UtY29uZmlnJztcblxuZXhwb3J0IGludGVyZmFjZSBTY2FsaW5nQ29uc3RydWN0UHJvcHMge1xuICBzZXJ2aWNlOiBlY3MuRmFyZ2F0ZVNlcnZpY2U7XG4gIHNjYWxpbmdDb25maWc6IFNjYWxpbmdDb25maWc7XG59XG5cbmV4cG9ydCBjbGFzcyBTY2FsaW5nQ29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgcHVibGljIHJlYWRvbmx5IHNjYWxpbmdUYXJnZXQ6IGVjcy5TY2FsYWJsZVRhc2tDb3VudDtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogU2NhbGluZ0NvbnN0cnVjdFByb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgIGNvbnN0IHsgc2VydmljZSwgc2NhbGluZ0NvbmZpZyB9ID0gcHJvcHM7XG5cbiAgICB0aGlzLnNjYWxpbmdUYXJnZXQgPSBzZXJ2aWNlLmF1dG9TY2FsZVRhc2tDb3VudCh7XG4gICAgICBtaW5DYXBhY2l0eTogc2NhbGluZ0NvbmZpZy5taW5DYXBhY2l0eSxcbiAgICAgIG1heENhcGFjaXR5OiBzY2FsaW5nQ29uZmlnLm1heENhcGFjaXR5LFxuICAgIH0pO1xuXG4gICAgaWYgKHNjYWxpbmdDb25maWcudGFyZ2V0Q3B1VXRpbGl6YXRpb24pIHtcbiAgICAgIHRoaXMuc2NhbGluZ1RhcmdldC5zY2FsZU9uQ3B1VXRpbGl6YXRpb24oJ0NwdVNjYWxpbmcnLCB7XG4gICAgICAgIHRhcmdldFV0aWxpemF0aW9uUGVyY2VudDogc2NhbGluZ0NvbmZpZy50YXJnZXRDcHVVdGlsaXphdGlvbixcbiAgICAgICAgc2NhbGVJbkNvb2xkb3duOiBjZGsuRHVyYXRpb24ubWludXRlcyg1KSxcbiAgICAgICAgc2NhbGVPdXRDb29sZG93bjogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoMiksXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoc2NhbGluZ0NvbmZpZy50YXJnZXRNZW1vcnlVdGlsaXphdGlvbikge1xuICAgICAgdGhpcy5zY2FsaW5nVGFyZ2V0LnNjYWxlT25NZW1vcnlVdGlsaXphdGlvbignTWVtb3J5U2NhbGluZycsIHtcbiAgICAgICAgdGFyZ2V0VXRpbGl6YXRpb25QZXJjZW50OiBzY2FsaW5nQ29uZmlnLnRhcmdldE1lbW9yeVV0aWxpemF0aW9uLFxuICAgICAgICBzY2FsZUluQ29vbGRvd246IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgICAgICBzY2FsZU91dENvb2xkb3duOiBjZGsuRHVyYXRpb24ubWludXRlcygyKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICB9XG5cbiAgcHVibGljIGdldFNjYWxpbmdUYXJnZXQoKTogZWNzLlNjYWxhYmxlVGFza0NvdW50IHtcbiAgICByZXR1cm4gdGhpcy5zY2FsaW5nVGFyZ2V0O1xuICB9XG59XG4iXX0=