"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadBalancerConstruct = void 0;
const cdk = require("aws-cdk-lib");
const ec2 = require("aws-cdk-lib/aws-ec2");
const elbv2 = require("aws-cdk-lib/aws-elasticloadbalancingv2");
const certificatemanager = require("aws-cdk-lib/aws-certificatemanager");
const route53 = require("aws-cdk-lib/aws-route53");
const route53targets = require("aws-cdk-lib/aws-route53-targets");
const constructs_1 = require("constructs");
class LoadBalancerConstruct extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const { serviceConfig, environment, envConfig, vpc, service, serviceSecurityGroup } = props;
        const lbSecurityGroup = new ec2.SecurityGroup(this, 'LoadBalancerSecurityGroup', {
            vpc,
            description: `Security group for ${serviceConfig.name} load balancer`,
            allowAllOutbound: true,
        });
        lbSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');
        lbSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS');
        serviceSecurityGroup.addIngressRule(lbSecurityGroup, ec2.Port.tcp(serviceConfig.port), `Allow ALB to reach ${serviceConfig.name} service`);
        this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'LoadBalancer', {
            vpc,
            internetFacing: true,
            securityGroup: lbSecurityGroup,
            loadBalancerName: `${environment}-${serviceConfig.name}-alb`,
        });
        this.targetGroup = new elbv2.ApplicationTargetGroup(this, 'TargetGroup', {
            vpc,
            port: serviceConfig.port,
            protocol: serviceConfig.protocol === 'gRPC' ? elbv2.ApplicationProtocol.HTTP : elbv2.ApplicationProtocol.HTTP,
            targetType: elbv2.TargetType.IP,
            healthCheck: {
                enabled: true,
                path: serviceConfig.healthCheck.path,
                interval: cdk.Duration.seconds(serviceConfig.healthCheck.interval),
                timeout: cdk.Duration.seconds(serviceConfig.healthCheck.timeout),
                healthyThresholdCount: 2,
                unhealthyThresholdCount: serviceConfig.healthCheck.retries,
                protocol: elbv2.Protocol.HTTP,
            },
            targets: [service.loadBalancerTarget({
                    containerName: 'MainContainer',
                    containerPort: serviceConfig.port,
                })],
        });
        if (serviceConfig.protocol === 'gRPC') {
            this.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '30');
            this.targetGroup.setAttribute('load_balancing.algorithm.type', 'least_outstanding_requests');
        }
        let certificate;
        if (serviceConfig.security?.certificateArn) {
            certificate = certificatemanager.Certificate.fromCertificateArn(this, 'Certificate', serviceConfig.security.certificateArn);
        }
        else if (envConfig.certificateArn) {
            certificate = certificatemanager.Certificate.fromCertificateArn(this, 'Certificate', envConfig.certificateArn);
        }
        if (certificate) {
            this.listener = this.loadBalancer.addListener('HttpsListener', {
                port: 443,
                protocol: elbv2.ApplicationProtocol.HTTPS,
                certificates: [certificate],
                defaultTargetGroups: [this.targetGroup],
            });
            if (serviceConfig.security?.mTLS) {
                this.listener.node.addMetadata('mTLS', 'enabled');
            }
            this.loadBalancer.addListener('HttpListener', {
                port: 80,
                protocol: elbv2.ApplicationProtocol.HTTP,
                defaultAction: elbv2.ListenerAction.redirect({
                    protocol: 'HTTPS',
                    port: '443',
                    permanent: true,
                }),
            });
        }
        else {
            this.listener = this.loadBalancer.addListener('HttpListener', {
                port: 80,
                protocol: elbv2.ApplicationProtocol.HTTP,
                defaultTargetGroups: [this.targetGroup],
            });
        }
        if (serviceConfig.contextPath && serviceConfig.contextPath !== '/') {
            this.listener.addTargetGroups('ContextPathTargetGroup', {
                targetGroups: [this.targetGroup],
                conditions: [
                    elbv2.ListenerCondition.pathPatterns([`${serviceConfig.contextPath}*`]),
                ],
                priority: 100,
            });
        }
        if (envConfig.hostedZoneId && serviceConfig.domainName) {
            const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
                hostedZoneId: envConfig.hostedZoneId,
                zoneName: envConfig.domainName || serviceConfig.domainName.split('.').slice(-2).join('.'),
            });
            new route53.ARecord(this, 'AliasRecord', {
                zone: hostedZone,
                recordName: serviceConfig.domainName,
                target: route53.RecordTarget.fromAlias(new route53targets.LoadBalancerTarget(this.loadBalancer)),
            });
        }
    }
}
exports.LoadBalancerConstruct = LoadBalancerConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZC1iYWxhbmNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvYWQtYmFsYW5jZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUUzQyxnRUFBZ0U7QUFDaEUseUVBQXlFO0FBQ3pFLG1EQUFtRDtBQUNuRCxrRUFBa0U7QUFDbEUsMkNBQXVDO0FBYXZDLE1BQWEscUJBQXNCLFNBQVEsc0JBQVM7SUFLbEQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFpQztRQUN6RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRTVGLE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsMkJBQTJCLEVBQUU7WUFDL0UsR0FBRztZQUNILFdBQVcsRUFBRSxzQkFBc0IsYUFBYSxDQUFDLElBQUksZ0JBQWdCO1lBQ3JFLGdCQUFnQixFQUFFLElBQUk7U0FDdkIsQ0FBQyxDQUFDO1FBRUgsZUFBZSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ25GLGVBQWUsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUVyRixvQkFBb0IsQ0FBQyxjQUFjLENBQ2pDLGVBQWUsRUFDZixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQ2hD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Q2pGLFlBQVksRUFBRSxTQUFTLENBQUMsWUFBWTtnQkFDcEMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxVQUFVLElBQUksYUFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQzthQUMxRixDQUFDLENBQUM7WUFFSCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtnQkFDdkMsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLFVBQVUsRUFBRSxhQUFhLENBQUMsVUFBVTtnQkFDcEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksY0FBYyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUNqRyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7Q0FDRjtBQTVIRCxzREE0SEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0ICogYXMgZWNzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lY3MnO1xuaW1wb3J0ICogYXMgZWxidjIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjInO1xuaW1wb3J0ICogYXMgY2VydGlmaWNhdGVtYW5hZ2VyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXInO1xuaW1wb3J0ICogYXMgcm91dGU1MyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtcm91dGU1Myc7XG5pbXBvcnQgKiBhcyByb3V0ZTUzdGFyZ2V0cyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtcm91dGU1My10YXJnZXRzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgU2VydmljZUNvbmZpZyB9IGZyb20gJy4uL3V0aWxzL2NvbmZpZy1sb2FkZXInO1xuaW1wb3J0IHsgRW52aXJvbm1lbnRDb25maWcgfSBmcm9tICcuLi91dGlscy9lbnZpcm9ubWVudCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9hZEJhbGFuY2VyQ29uc3RydWN0UHJvcHMge1xuICBzZXJ2aWNlQ29uZmlnOiBTZXJ2aWNlQ29uZmlnO1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xuICBlbnZDb25maWc6IEVudmlyb25tZW50Q29uZmlnO1xuICB2cGM6IGVjMi5WcGM7XG4gIHNlcnZpY2U6IGVjcy5GYXJnYXRlU2VydmljZTtcbiAgc2VydmljZVNlY3VyaXR5R3JvdXA6IGVjMi5TZWN1cml0eUdyb3VwO1xufVxuXG5leHBvcnQgY2xhc3MgTG9hZEJhbGFuY2VyQ29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgcHVibGljIHJlYWRvbmx5IGxvYWRCYWxhbmNlcjogZWxidjIuQXBwbGljYXRpb25Mb2FkQmFsYW5jZXI7XG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXRHcm91cDogZWxidjIuQXBwbGljYXRpb25UYXJnZXRHcm91cDtcbiAgcHVibGljIHJlYWRvbmx5IGxpc3RlbmVyOiBlbGJ2Mi5BcHBsaWNhdGlvbkxpc3RlbmVyO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBMb2FkQmFsYW5jZXJDb25zdHJ1Y3RQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICBjb25zdCB7IHNlcnZpY2VDb25maWcsIGVudmlyb25tZW50LCBlbnZDb25maWcsIHZwYywgc2VydmljZSwgc2VydmljZVNlY3VyaXR5R3JvdXAgfSA9IHByb3BzO1xuXG4gICAgY29uc3QgbGJTZWN1cml0eUdyb3VwID0gbmV3IGVjMi5TZWN1cml0eUdyb3VwKHRoaXMsICdMb2FkQmFsYW5jZXJTZWN1cml0eUdyb3VwJywge1xuICAgICAgdnBjLFxuICAgICAgZGVzY3JpcHRpb246IGBTZWN1cml0eSBncm91cCBmb3IgJHtzZXJ2aWNlQ29uZmlnLm5hbWV9IGxvYWQgYmFsYW5jZXJgLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICB9KTtcblxuICAgIGxiU2VjdXJpdHlHcm91cC5hZGRJbmdyZXNzUnVsZShlYzIuUGVlci5hbnlJcHY0KCksIGVjMi5Qb3J0LnRjcCg4MCksICdBbGxvdyBIVFRQJyk7XG4gICAgbGJTZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKGVjMi5QZWVyLmFueUlwdjQoKSwgZWMyLlBvcnQudGNwKDQ0MyksICdBbGxvdyBIVFRQUycpO1xuXG4gICAgc2VydmljZVNlY3VyaXR5R3JvdXAuYWRkSW5ncmVzc1J1bGUoXG4gICAgICBsYlNlY3VyaXR5R3JvdXAsXG4gICAgICBlYzIuUG9ydC50Y3Aoc2VydmljZUNvbmZpZy5wb3J0KSxcbiAgICAgIGBBbGxvdyBBTEIgdG8gcmVhY2ggJHtzZXJ2aWNlQ29uZmlnLm5hbWV9IHNlcnZpY2VgXG4gICAgKTtcblxuICAgIHRoaXMubG9hZEJhbGFuY2VyID0gbmV3IGVsYnYyLkFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyKHRoaXMsICdMb2FkQmFsYW5jZXInLCB7XG4gICAgICB2cGMsXG4gICAgICBpbnRlcm5ldEZhY2luZzogdHJ1ZSxcbiAgICAgIHNlY3VyaXR5R3JvdXA6IGxiU2VjdXJpdHlHcm91cCxcbiAgICAgIGxvYWRCYWxhbmNlck5hbWU6IGAke2Vudmlyb25tZW50fS0ke3NlcnZpY2VDb25maWcubmFtZX0tYWxiYCxcbiAgICB9KTtcblxuICAgIHRoaXMudGFyZ2V0R3JvdXAgPSBuZXcgZWxidjIuQXBwbGljYXRpb25UYXJnZXRHcm91cCh0aGlzLCAnVGFyZ2V0R3JvdXAnLCB7XG4gICAgICB2cGMsXG4gICAgICBwb3J0OiBzZXJ2aWNlQ29uZmlnLnBvcnQsXG4gICAgICBwcm90b2NvbDogc2VydmljZUNvbmZpZy5wcm90b2NvbCA9PT0gJ2dSUEMnID8gZWxidjIuQXBwbGljYXRpb25Qcm90b2NvbC5IVFRQIDogZWxidjIuQXBwbGljYXRpb25Qcm90b2NvbC5IVFRQLFxuICAgICAgdGFyZ2V0VHlwZTogZWxidjIuVGFyZ2V0VHlwZS5JUCxcbiAgICAgIGhlYWx0aENoZWNrOiB7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHBhdGg6IHNlcnZpY2VDb25maWcuaGVhbHRoQ2hlY2sucGF0aCxcbiAgICAgICAgaW50ZXJ2YWw6IGNkay5EdXJhdGlvbi5zZWNvbmRzKHNlcnZpY2VDb25maWcuaGVhbHRoQ2hlY2suaW50ZXJ2YWwpLFxuICAgICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyhzZXJ2aWNlQ29uZmlnLmhlYWx0aENoZWNrLnRpbWVvdXQpLFxuICAgICAgICBoZWFsdGh5VGhyZXNob2xkQ291bnQ6IDIsXG4gICAgICAgIHVuaGVhbHRoeVRocmVzaG9sZENvdW50OiBzZXJ2aWNlQ29uZmlnLmhlYWx0aENoZWNrLnJldHJpZXMsXG4gICAgICAgIHByb3RvY29sOiBlbGJ2Mi5Qcm90b2NvbC5IVFRQLFxuICAgICAgfSxcbiAgICAgIHRhcmdldHM6IFtzZXJ2aWNlLmxvYWRCYWxhbmNlclRhcmdldCh7XG4gICAgICAgIGNvbnRhaW5lck5hbWU6ICdNYWluQ29udGFpbmVyJyxcbiAgICAgICAgY29udGFpbmVyUG9ydDogc2VydmljZUNvbmZpZy5wb3J0LFxuICAgICAgfSldLFxuICAgIH0pO1xuXG4gICAgaWYgKHNlcnZpY2VDb25maWcucHJvdG9jb2wgPT09ICdnUlBDJykge1xuICAgICAgdGhpcy50YXJnZXRHcm91cC5zZXRBdHRyaWJ1dGUoJ2RlcmVnaXN0cmF0aW9uX2RlbGF5LnRpbWVvdXRfc2Vjb25kcycsICczMCcpO1xuICAgICAgdGhpcy50YXJnZXRHcm91cC5zZXRBdHRyaWJ1dGUoJ2xvYWRfYmFsYW5jaW5nLmFsZ29yaXRobS50eXBlJywgJ2xlYXN0X291dHN0YW5kaW5nX3JlcXVlc3RzJyk7XG4gICAgfVxuXG4gICAgbGV0IGNlcnRpZmljYXRlOiBjZXJ0aWZpY2F0ZW1hbmFnZXIuSUNlcnRpZmljYXRlIHwgdW5kZWZpbmVkO1xuICAgIGlmIChzZXJ2aWNlQ29uZmlnLnNlY3VyaXR5Py5jZXJ0aWZpY2F0ZUFybikge1xuICAgICAgY2VydGlmaWNhdGUgPSBjZXJ0aWZpY2F0ZW1hbmFnZXIuQ2VydGlmaWNhdGUuZnJvbUNlcnRpZmljYXRlQXJuKFxuICAgICAgICB0aGlzLFxuICAgICAgICAnQ2VydGlmaWNhdGUnLFxuICAgICAgICBzZXJ2aWNlQ29uZmlnLnNlY3VyaXR5LmNlcnRpZmljYXRlQXJuXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoZW52Q29uZmlnLmNlcnRpZmljYXRlQXJuKSB7XG4gICAgICBjZXJ0aWZpY2F0ZSA9IGNlcnRpZmljYXRlbWFuYWdlci5DZXJ0aWZpY2F0ZS5mcm9tQ2VydGlmaWNhdGVBcm4oXG4gICAgICAgIHRoaXMsXG4gICAgICAgICdDZXJ0aWZpY2F0ZScsXG4gICAgICAgIGVudkNvbmZpZy5jZXJ0aWZpY2F0ZUFyblxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoY2VydGlmaWNhdGUpIHtcbiAgICAgIHRoaXMubGlzdGVuZXIgPSB0aGlzLmxvYWRCYWxhbmNlci5hZGRMaXN0ZW5lcignSHR0cHNMaXN0ZW5lcicsIHtcbiAgICAgICAgcG9ydDogNDQzLFxuICAgICAgICBwcm90b2NvbDogZWxidjIuQXBwbGljYXRpb25Qcm90b2NvbC5IVFRQUyxcbiAgICAgICAgY2VydGlmaWNhdGVzOiBbY2VydGlmaWNhdGVdLFxuICAgICAgICBkZWZhdWx0VGFyZ2V0R3JvdXBzOiBbdGhpcy50YXJnZXRHcm91cF0sXG4gICAgICB9KTtcblxuICAgICAgaWYgKHNlcnZpY2VDb25maWcuc2VjdXJpdHk/Lm1UTFMpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lci5ub2RlLmFkZE1ldGFkYXRhKCdtVExTJywgJ2VuYWJsZWQnKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5sb2FkQmFsYW5jZXIuYWRkTGlzdGVuZXIoJ0h0dHBMaXN0ZW5lcicsIHtcbiAgICAgICAgcG9ydDogODAsXG4gICAgICAgIHByb3RvY29sOiBlbGJ2Mi5BcHBsaWNhdGlvblByb3RvY29sLkhUVFAsXG4gICAgICAgIGRlZmF1bHRBY3Rpb246IGVsYnYyLkxpc3RlbmVyQWN0aW9uLnJlZGlyZWN0KHtcbiAgICAgICAgICBwcm90b2NvbDogJ0hUVFBTJyxcbiAgICAgICAgICBwb3J0OiAnNDQzJyxcbiAgICAgICAgICBwZXJtYW5lbnQ6IHRydWUsXG4gICAgICAgIH0pLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGlzdGVuZXIgPSB0aGlzLmxvYWRCYWxhbmNlci5hZGRMaXN0ZW5lcignSHR0cExpc3RlbmVyJywge1xuICAgICAgICBwb3J0OiA4MCxcbiAgICAgICAgcHJvdG9jb2w6IGVsYnYyLkFwcGxpY2F0aW9uUHJvdG9jb2wuSFRUUCxcbiAgICAgICAgZGVmYXVsdFRhcmdldEdyb3VwczogW3RoaXMudGFyZ2V0R3JvdXBdLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKHNlcnZpY2VDb25maWcuY29udGV4dFBhdGggJiYgc2VydmljZUNvbmZpZy5jb250ZXh0UGF0aCAhPT0gJy8nKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyLmFkZFRhcmdldEdyb3VwcygnQ29udGV4dFBhdGhUYXJnZXRHcm91cCcsIHtcbiAgICAgICAgdGFyZ2V0R3JvdXBzOiBbdGhpcy50YXJnZXRHcm91cF0sXG4gICAgICAgIGNvbmRpdGlvbnM6IFtcbiAgICAgICAgICBlbGJ2Mi5MaXN0ZW5lckNvbmRpdGlvbi5wYXRoUGF0dGVybnMoW2Ake3NlcnZpY2VDb25maWcuY29udGV4dFBhdGh9KmBdKSxcbiAgICAgICAgXSxcbiAgICAgICAgcHJpb3JpdHk6IDEwMCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChlbnZDb25maWcuaG9zdGVkWm9uZUlkICYmIHNlcnZpY2VDb25maWcuZG9tYWluTmFtZSkge1xuICAgICAgY29uc3QgaG9zdGVkWm9uZSA9IHJvdXRlNTMuSG9zdGVkWm9uZS5mcm9tSG9zdGVkWm9uZUF0dHJpYnV0ZXModGhpcywgJ0hvc3RlZFpvbmUnLCB7XG4gICAgICAgIGhvc3RlZFpvbmVJZDogZW52Q29uZmlnLmhvc3RlZFpvbmVJZCxcbiAgICAgICAgem9uZU5hbWU6IGVudkNvbmZpZy5kb21haW5OYW1lIHx8IHNlcnZpY2VDb25maWcuZG9tYWluTmFtZS5zcGxpdCgnLicpLnNsaWNlKC0yKS5qb2luKCcuJyksXG4gICAgICB9KTtcblxuICAgICAgbmV3IHJvdXRlNTMuQVJlY29yZCh0aGlzLCAnQWxpYXNSZWNvcmQnLCB7XG4gICAgICAgIHpvbmU6IGhvc3RlZFpvbmUsXG4gICAgICAgIHJlY29yZE5hbWU6IHNlcnZpY2VDb25maWcuZG9tYWluTmFtZSxcbiAgICAgICAgdGFyZ2V0OiByb3V0ZTUzLlJlY29yZFRhcmdldC5mcm9tQWxpYXMobmV3IHJvdXRlNTN0YXJnZXRzLkxvYWRCYWxhbmNlclRhcmdldCh0aGlzLmxvYWRCYWxhbmNlcikpLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=