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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NhbGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNjYWxpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBR25DLDJDQUF1QztBQVF2QyxNQUFhLGdCQUFpQixTQUFRLHNCQUFTO0lBRzdDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBNEI7UUFDcEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxHQUFHLEtBQUssQ0FBQztRQUV6QyxJQUFJLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQztZQUM5QyxXQUFXLEVBQUUsYUFBYSxDQUFDLFdBQVc7WUFDdEMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxXQUFXO1NBQ3ZDLENBQUMsQ0FBQztRQUVILElBQUksYUFBYSxDQUFDLG9CQUFvQixFQUFFO1lBQ3RDLElBQUksQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsWUFBWSxFQUFFO2dCQUNyRCx3QkFBd0IsRUFBRSxhQUFhLENBQUMsb0JBQW9CO2dCQUM1RCxlQUFlLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDMUMsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxJQUFJLGFBQWEsQ0FBQyx1QkFBdUIsRUFBRTtZQUN6QyxJQUFJLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLGVBQWUsRUFBRTtnQkFDM0Qsd0JBQXdCLEVBQUUsYUFBYSxDQUFDLHVCQUF1QjtnQkFDL0QsZUFBZSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDeEMsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQzFDLENBQUMsQ0FBQztTQUNKO0lBRUgsQ0FBQztJQUVNLGdCQUFnQjtRQUNyQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDNUIsQ0FBQztDQUNGO0FBbENELDRDQWtDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBlY3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjcyc7XG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbmF1dG9zY2FsaW5nIGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcHBsaWNhdGlvbmF1dG9zY2FsaW5nJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgU2NhbGluZ0NvbmZpZyB9IGZyb20gJy4uL3V0aWxzL2NvbmZpZy1sb2FkZXInO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNjYWxpbmdDb25zdHJ1Y3RQcm9wcyB7XG4gIHNlcnZpY2U6IGVjcy5GYXJnYXRlU2VydmljZTtcbiAgc2NhbGluZ0NvbmZpZzogU2NhbGluZ0NvbmZpZztcbn1cblxuZXhwb3J0IGNsYXNzIFNjYWxpbmdDb25zdHJ1Y3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgc2NhbGluZ1RhcmdldDogZWNzLlNjYWxhYmxlVGFza0NvdW50O1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBTY2FsaW5nQ29uc3RydWN0UHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgY29uc3QgeyBzZXJ2aWNlLCBzY2FsaW5nQ29uZmlnIH0gPSBwcm9wcztcblxuICAgIHRoaXMuc2NhbGluZ1RhcmdldCA9IHNlcnZpY2UuYXV0b1NjYWxlVGFza0NvdW50KHtcbiAgICAgIG1pbkNhcGFjaXR5OiBzY2FsaW5nQ29uZmlnLm1pbkNhcGFjaXR5LFxuICAgICAgbWF4Q2FwYWNpdHk6IHNjYWxpbmdDb25maWcubWF4Q2FwYWNpdHksXG4gICAgfSk7XG5cbiAgICBpZiAoc2NhbGluZ0NvbmZpZy50YXJnZXRDcHVVdGlsaXphdGlvbikge1xuICAgICAgdGhpcy5zY2FsaW5nVGFyZ2V0LnNjYWxlT25DcHVVdGlsaXphdGlvbignQ3B1U2NhbGluZycsIHtcbiAgICAgICAgdGFyZ2V0VXRpbGl6YXRpb25QZXJjZW50OiBzY2FsaW5nQ29uZmlnLnRhcmdldENwdVV0aWxpemF0aW9uLFxuICAgICAgICBzY2FsZUluQ29vbGRvd246IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgICAgICBzY2FsZU91dENvb2xkb3duOiBjZGsuRHVyYXRpb24ubWludXRlcygyKSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChzY2FsaW5nQ29uZmlnLnRhcmdldE1lbW9yeVV0aWxpemF0aW9uKSB7XG4gICAgICB0aGlzLnNjYWxpbmdUYXJnZXQuc2NhbGVPbk1lbW9yeVV0aWxpemF0aW9uKCdNZW1vcnlTY2FsaW5nJywge1xuICAgICAgICB0YXJnZXRVdGlsaXphdGlvblBlcmNlbnQ6IHNjYWxpbmdDb25maWcudGFyZ2V0TWVtb3J5VXRpbGl6YXRpb24sXG4gICAgICAgIHNjYWxlSW5Db29sZG93bjogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICAgIHNjYWxlT3V0Q29vbGRvd246IGNkay5EdXJhdGlvbi5taW51dGVzKDIpLFxuICAgICAgfSk7XG4gICAgfVxuXG4gIH1cblxuICBwdWJsaWMgZ2V0U2NhbGluZ1RhcmdldCgpOiBlY3MuU2NhbGFibGVUYXNrQ291bnQge1xuICAgIHJldHVybiB0aGlzLnNjYWxpbmdUYXJnZXQ7XG4gIH1cbn1cbiJdfQ==