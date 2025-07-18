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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9hZC1iYWxhbmNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxvYWQtYmFsYW5jZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUUzQyxnRUFBZ0U7QUFDaEUseUVBQXlFO0FBQ3pFLG1EQUFtRDtBQUNuRCxrRUFBa0U7QUFDbEUsMkNBQXVDO0FBYXZDLE1BQWEscUJBQXNCLFNBQVEsc0JBQVM7SUFLbEQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFpQztRQUN6RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRTVGLE1BQU0sZUFBZSxHQUFHLElBQUksR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsMkJBQTJCLEVBQUU7WUFDL0UsR0FBRztZQUNILFdBQVcsRUFBRSxzQkFBc0IsYUFBYSxDQUFDLElBQUksZ0JBQWdCO1lBQ3JFLGdCQUFnQixFQUFFLElBQUk7U0FDdkIsQ0FBQyxDQUFDO1FBRUgsZUFBZSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ25GLGVBQWUsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUVyRixvQkFBb0IsQ0FBQyxjQUFjLENBQ2pDLGVBQWUsRUFDZixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQ2hD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Q2pGLFlBQVksRUFBRSxTQUFTLENBQUMsWUFBWTtnQkFDcEMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxVQUFVLElBQUksYUFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQzthQUMxRixDQUFDLENBQUM7WUFFSCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtnQkFDdkMsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLFVBQVUsRUFBRSxhQUFhLENBQUMsVUFBVTtnQkFDcEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksY0FBYyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUNqRyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7Q0FDRjtBQTVIRCxzREE0SEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0ICogYXMgZWNzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lY3MnO1xuaW1wb3J0ICogYXMgZWxidjIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVsYXN0aWNsb2FkYmFsYW5jaW5ndjInO1xuaW1wb3J0ICogYXMgY2VydGlmaWNhdGVtYW5hZ2VyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXInO1xuaW1wb3J0ICogYXMgcm91dGU1MyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtcm91dGU1Myc7XG5pbXBvcnQgKiBhcyByb3V0ZTUzdGFyZ2V0cyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtcm91dGU1My10YXJnZXRzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgU2VydmljZUNvbmZpZyB9IGZyb20gJy4uL3R5cGVzL3NlcnZpY2UtY29uZmlnJztcbmltcG9ydCB7IEVudmlyb25tZW50Q29uZmlnIH0gZnJvbSAnLi4vdXRpbHMvZW52aXJvbm1lbnQnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExvYWRCYWxhbmNlckNvbnN0cnVjdFByb3BzIHtcbiAgc2VydmljZUNvbmZpZzogU2VydmljZUNvbmZpZztcbiAgZW52aXJvbm1lbnQ6IHN0cmluZztcbiAgZW52Q29uZmlnOiBFbnZpcm9ubWVudENvbmZpZztcbiAgdnBjOiBlYzIuVnBjO1xuICBzZXJ2aWNlOiBlY3MuRmFyZ2F0ZVNlcnZpY2U7XG4gIHNlcnZpY2VTZWN1cml0eUdyb3VwOiBlYzIuU2VjdXJpdHlHcm91cDtcbn1cblxuZXhwb3J0IGNsYXNzIExvYWRCYWxhbmNlckNvbnN0cnVjdCBleHRlbmRzIENvbnN0cnVjdCB7XG4gIHB1YmxpYyByZWFkb25seSBsb2FkQmFsYW5jZXI6IGVsYnYyLkFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyO1xuICBwdWJsaWMgcmVhZG9ubHkgdGFyZ2V0R3JvdXA6IGVsYnYyLkFwcGxpY2F0aW9uVGFyZ2V0R3JvdXA7XG4gIHB1YmxpYyByZWFkb25seSBsaXN0ZW5lcjogZWxidjIuQXBwbGljYXRpb25MaXN0ZW5lcjtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogTG9hZEJhbGFuY2VyQ29uc3RydWN0UHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgY29uc3QgeyBzZXJ2aWNlQ29uZmlnLCBlbnZpcm9ubWVudCwgZW52Q29uZmlnLCB2cGMsIHNlcnZpY2UsIHNlcnZpY2VTZWN1cml0eUdyb3VwIH0gPSBwcm9wcztcblxuICAgIGNvbnN0IGxiU2VjdXJpdHlHcm91cCA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCAnTG9hZEJhbGFuY2VyU2VjdXJpdHlHcm91cCcsIHtcbiAgICAgIHZwYyxcbiAgICAgIGRlc2NyaXB0aW9uOiBgU2VjdXJpdHkgZ3JvdXAgZm9yICR7c2VydmljZUNvbmZpZy5uYW1lfSBsb2FkIGJhbGFuY2VyYCxcbiAgICAgIGFsbG93QWxsT3V0Ym91bmQ6IHRydWUsXG4gICAgfSk7XG5cbiAgICBsYlNlY3VyaXR5R3JvdXAuYWRkSW5ncmVzc1J1bGUoZWMyLlBlZXIuYW55SXB2NCgpLCBlYzIuUG9ydC50Y3AoODApLCAnQWxsb3cgSFRUUCcpO1xuICAgIGxiU2VjdXJpdHlHcm91cC5hZGRJbmdyZXNzUnVsZShlYzIuUGVlci5hbnlJcHY0KCksIGVjMi5Qb3J0LnRjcCg0NDMpLCAnQWxsb3cgSFRUUFMnKTtcblxuICAgIHNlcnZpY2VTZWN1cml0eUdyb3VwLmFkZEluZ3Jlc3NSdWxlKFxuICAgICAgbGJTZWN1cml0eUdyb3VwLFxuICAgICAgZWMyLlBvcnQudGNwKHNlcnZpY2VDb25maWcucG9ydCksXG4gICAgICBgQWxsb3cgQUxCIHRvIHJlYWNoICR7c2VydmljZUNvbmZpZy5uYW1lfSBzZXJ2aWNlYFxuICAgICk7XG5cbiAgICB0aGlzLmxvYWRCYWxhbmNlciA9IG5ldyBlbGJ2Mi5BcHBsaWNhdGlvbkxvYWRCYWxhbmNlcih0aGlzLCAnTG9hZEJhbGFuY2VyJywge1xuICAgICAgdnBjLFxuICAgICAgaW50ZXJuZXRGYWNpbmc6IHRydWUsXG4gICAgICBzZWN1cml0eUdyb3VwOiBsYlNlY3VyaXR5R3JvdXAsXG4gICAgICBsb2FkQmFsYW5jZXJOYW1lOiBgJHtlbnZpcm9ubWVudH0tJHtzZXJ2aWNlQ29uZmlnLm5hbWV9LWFsYmAsXG4gICAgfSk7XG5cbiAgICB0aGlzLnRhcmdldEdyb3VwID0gbmV3IGVsYnYyLkFwcGxpY2F0aW9uVGFyZ2V0R3JvdXAodGhpcywgJ1RhcmdldEdyb3VwJywge1xuICAgICAgdnBjLFxuICAgICAgcG9ydDogc2VydmljZUNvbmZpZy5wb3J0LFxuICAgICAgcHJvdG9jb2w6IHNlcnZpY2VDb25maWcucHJvdG9jb2wgPT09ICdnUlBDJyA/IGVsYnYyLkFwcGxpY2F0aW9uUHJvdG9jb2wuSFRUUCA6IGVsYnYyLkFwcGxpY2F0aW9uUHJvdG9jb2wuSFRUUCxcbiAgICAgIHRhcmdldFR5cGU6IGVsYnYyLlRhcmdldFR5cGUuSVAsXG4gICAgICBoZWFsdGhDaGVjazoge1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICBwYXRoOiBzZXJ2aWNlQ29uZmlnLmhlYWx0aENoZWNrLnBhdGgsXG4gICAgICAgIGludGVydmFsOiBjZGsuRHVyYXRpb24uc2Vjb25kcyhzZXJ2aWNlQ29uZmlnLmhlYWx0aENoZWNrLmludGVydmFsKSxcbiAgICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoc2VydmljZUNvbmZpZy5oZWFsdGhDaGVjay50aW1lb3V0KSxcbiAgICAgICAgaGVhbHRoeVRocmVzaG9sZENvdW50OiAyLFxuICAgICAgICB1bmhlYWx0aHlUaHJlc2hvbGRDb3VudDogc2VydmljZUNvbmZpZy5oZWFsdGhDaGVjay5yZXRyaWVzLFxuICAgICAgICBwcm90b2NvbDogZWxidjIuUHJvdG9jb2wuSFRUUCxcbiAgICAgIH0sXG4gICAgICB0YXJnZXRzOiBbc2VydmljZS5sb2FkQmFsYW5jZXJUYXJnZXQoe1xuICAgICAgICBjb250YWluZXJOYW1lOiAnTWFpbkNvbnRhaW5lcicsXG4gICAgICAgIGNvbnRhaW5lclBvcnQ6IHNlcnZpY2VDb25maWcucG9ydCxcbiAgICAgIH0pXSxcbiAgICB9KTtcblxuICAgIGlmIChzZXJ2aWNlQ29uZmlnLnByb3RvY29sID09PSAnZ1JQQycpIHtcbiAgICAgIHRoaXMudGFyZ2V0R3JvdXAuc2V0QXR0cmlidXRlKCdkZXJlZ2lzdHJhdGlvbl9kZWxheS50aW1lb3V0X3NlY29uZHMnLCAnMzAnKTtcbiAgICAgIHRoaXMudGFyZ2V0R3JvdXAuc2V0QXR0cmlidXRlKCdsb2FkX2JhbGFuY2luZy5hbGdvcml0aG0udHlwZScsICdsZWFzdF9vdXRzdGFuZGluZ19yZXF1ZXN0cycpO1xuICAgIH1cblxuICAgIGxldCBjZXJ0aWZpY2F0ZTogY2VydGlmaWNhdGVtYW5hZ2VyLklDZXJ0aWZpY2F0ZSB8IHVuZGVmaW5lZDtcbiAgICBpZiAoc2VydmljZUNvbmZpZy5zZWN1cml0eT8uY2VydGlmaWNhdGVBcm4pIHtcbiAgICAgIGNlcnRpZmljYXRlID0gY2VydGlmaWNhdGVtYW5hZ2VyLkNlcnRpZmljYXRlLmZyb21DZXJ0aWZpY2F0ZUFybihcbiAgICAgICAgdGhpcyxcbiAgICAgICAgJ0NlcnRpZmljYXRlJyxcbiAgICAgICAgc2VydmljZUNvbmZpZy5zZWN1cml0eS5jZXJ0aWZpY2F0ZUFyblxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKGVudkNvbmZpZy5jZXJ0aWZpY2F0ZUFybikge1xuICAgICAgY2VydGlmaWNhdGUgPSBjZXJ0aWZpY2F0ZW1hbmFnZXIuQ2VydGlmaWNhdGUuZnJvbUNlcnRpZmljYXRlQXJuKFxuICAgICAgICB0aGlzLFxuICAgICAgICAnQ2VydGlmaWNhdGUnLFxuICAgICAgICBlbnZDb25maWcuY2VydGlmaWNhdGVBcm5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGNlcnRpZmljYXRlKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyID0gdGhpcy5sb2FkQmFsYW5jZXIuYWRkTGlzdGVuZXIoJ0h0dHBzTGlzdGVuZXInLCB7XG4gICAgICAgIHBvcnQ6IDQ0MyxcbiAgICAgICAgcHJvdG9jb2w6IGVsYnYyLkFwcGxpY2F0aW9uUHJvdG9jb2wuSFRUUFMsXG4gICAgICAgIGNlcnRpZmljYXRlczogW2NlcnRpZmljYXRlXSxcbiAgICAgICAgZGVmYXVsdFRhcmdldEdyb3VwczogW3RoaXMudGFyZ2V0R3JvdXBdLFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChzZXJ2aWNlQ29uZmlnLnNlY3VyaXR5Py5tVExTKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXIubm9kZS5hZGRNZXRhZGF0YSgnbVRMUycsICdlbmFibGVkJyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubG9hZEJhbGFuY2VyLmFkZExpc3RlbmVyKCdIdHRwTGlzdGVuZXInLCB7XG4gICAgICAgIHBvcnQ6IDgwLFxuICAgICAgICBwcm90b2NvbDogZWxidjIuQXBwbGljYXRpb25Qcm90b2NvbC5IVFRQLFxuICAgICAgICBkZWZhdWx0QWN0aW9uOiBlbGJ2Mi5MaXN0ZW5lckFjdGlvbi5yZWRpcmVjdCh7XG4gICAgICAgICAgcHJvdG9jb2w6ICdIVFRQUycsXG4gICAgICAgICAgcG9ydDogJzQ0MycsXG4gICAgICAgICAgcGVybWFuZW50OiB0cnVlLFxuICAgICAgICB9KSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxpc3RlbmVyID0gdGhpcy5sb2FkQmFsYW5jZXIuYWRkTGlzdGVuZXIoJ0h0dHBMaXN0ZW5lcicsIHtcbiAgICAgICAgcG9ydDogODAsXG4gICAgICAgIHByb3RvY29sOiBlbGJ2Mi5BcHBsaWNhdGlvblByb3RvY29sLkhUVFAsXG4gICAgICAgIGRlZmF1bHRUYXJnZXRHcm91cHM6IFt0aGlzLnRhcmdldEdyb3VwXSxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChzZXJ2aWNlQ29uZmlnLmNvbnRleHRQYXRoICYmIHNlcnZpY2VDb25maWcuY29udGV4dFBhdGggIT09ICcvJykge1xuICAgICAgdGhpcy5saXN0ZW5lci5hZGRUYXJnZXRHcm91cHMoJ0NvbnRleHRQYXRoVGFyZ2V0R3JvdXAnLCB7XG4gICAgICAgIHRhcmdldEdyb3VwczogW3RoaXMudGFyZ2V0R3JvdXBdLFxuICAgICAgICBjb25kaXRpb25zOiBbXG4gICAgICAgICAgZWxidjIuTGlzdGVuZXJDb25kaXRpb24ucGF0aFBhdHRlcm5zKFtgJHtzZXJ2aWNlQ29uZmlnLmNvbnRleHRQYXRofSpgXSksXG4gICAgICAgIF0sXG4gICAgICAgIHByaW9yaXR5OiAxMDAsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoZW52Q29uZmlnLmhvc3RlZFpvbmVJZCAmJiBzZXJ2aWNlQ29uZmlnLmRvbWFpbk5hbWUpIHtcbiAgICAgIGNvbnN0IGhvc3RlZFpvbmUgPSByb3V0ZTUzLkhvc3RlZFpvbmUuZnJvbUhvc3RlZFpvbmVBdHRyaWJ1dGVzKHRoaXMsICdIb3N0ZWRab25lJywge1xuICAgICAgICBob3N0ZWRab25lSWQ6IGVudkNvbmZpZy5ob3N0ZWRab25lSWQsXG4gICAgICAgIHpvbmVOYW1lOiBlbnZDb25maWcuZG9tYWluTmFtZSB8fCBzZXJ2aWNlQ29uZmlnLmRvbWFpbk5hbWUuc3BsaXQoJy4nKS5zbGljZSgtMikuam9pbignLicpLFxuICAgICAgfSk7XG5cbiAgICAgIG5ldyByb3V0ZTUzLkFSZWNvcmQodGhpcywgJ0FsaWFzUmVjb3JkJywge1xuICAgICAgICB6b25lOiBob3N0ZWRab25lLFxuICAgICAgICByZWNvcmROYW1lOiBzZXJ2aWNlQ29uZmlnLmRvbWFpbk5hbWUsXG4gICAgICAgIHRhcmdldDogcm91dGU1My5SZWNvcmRUYXJnZXQuZnJvbUFsaWFzKG5ldyByb3V0ZTUzdGFyZ2V0cy5Mb2FkQmFsYW5jZXJUYXJnZXQodGhpcy5sb2FkQmFsYW5jZXIpKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuIl19