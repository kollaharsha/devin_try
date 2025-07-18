"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcsServiceConstruct = void 0;
const cdk = require("aws-cdk-lib");
const ec2 = require("aws-cdk-lib/aws-ec2");
const ecs = require("aws-cdk-lib/aws-ecs");
const iam = require("aws-cdk-lib/aws-iam");
const logs = require("aws-cdk-lib/aws-logs");
const constructs_1 = require("constructs");
const load_balancer_1 = require("./load-balancer");
const scaling_1 = require("./scaling");
class EcsServiceConstruct extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const { serviceConfig, environment, envConfig, vpc, cluster } = props;
        const taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
            ],
        });
        const taskRole = new iam.Role(this, 'TaskRole', {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
        });
        this.taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDefinition', {
            family: `${environment}-${serviceConfig.name}`,
            cpu: serviceConfig.taskSize.cpu,
            memoryLimitMiB: serviceConfig.taskSize.memory,
            executionRole: taskExecutionRole,
            taskRole: taskRole,
        });
        const logGroup = new logs.LogGroup(this, 'LogGroup', {
            logGroupName: `/aws/ecs/${environment}/${serviceConfig.name}`,
            retention: environment === 'prod' ? logs.RetentionDays.ONE_YEAR : logs.RetentionDays.ONE_MONTH,
            removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
        });
        const mainContainer = this.taskDefinition.addContainer('MainContainer', {
            image: ecs.ContainerImage.fromRegistry(serviceConfig.containerImage),
            logging: ecs.LogDrivers.awsLogs({
                streamPrefix: 'ecs',
                logGroup: logGroup,
            }),
            environment: serviceConfig.environmentVariables || {},
            healthCheck: {
                command: ['CMD-SHELL', `curl -f http://localhost:${serviceConfig.port}${serviceConfig.healthCheck.path} || exit 1`],
                interval: cdk.Duration.seconds(serviceConfig.healthCheck.interval),
                timeout: cdk.Duration.seconds(serviceConfig.healthCheck.timeout),
                retries: serviceConfig.healthCheck.retries,
                startPeriod: cdk.Duration.seconds(serviceConfig.healthCheck.gracePeriod || 60),
            },
        });
        mainContainer.addPortMappings({
            containerPort: serviceConfig.port,
            protocol: ecs.Protocol.TCP,
        });
        if (serviceConfig.sidecarContainers) {
            for (const sidecar of serviceConfig.sidecarContainers) {
                const sidecarContainer = this.taskDefinition.addContainer(sidecar.name, {
                    image: ecs.ContainerImage.fromRegistry(sidecar.image),
                    essential: sidecar.essential,
                    cpu: sidecar.cpu,
                    memoryLimitMiB: sidecar.memory,
                    environment: sidecar.environmentVariables || {},
                    logging: ecs.LogDrivers.awsLogs({
                        streamPrefix: `sidecar-${sidecar.name}`,
                        logGroup: logGroup,
                    }),
                });
                if (sidecar.portMappings) {
                    for (const portMapping of sidecar.portMappings) {
                        sidecarContainer.addPortMappings({
                            containerPort: portMapping.containerPort,
                            protocol: portMapping.protocol === 'UDP' ? ecs.Protocol.UDP : ecs.Protocol.TCP,
                        });
                    }
                }
            }
        }
        const serviceSecurityGroup = new ec2.SecurityGroup(this, 'ServiceSecurityGroup', {
            vpc,
            description: `Security group for ${serviceConfig.name} service`,
            allowAllOutbound: true,
        });
        this.service = new ecs.FargateService(this, 'Service', {
            cluster,
            taskDefinition: this.taskDefinition,
            serviceName: `${environment}-${serviceConfig.name}`,
            desiredCount: serviceConfig.scaling.minCapacity,
            assignPublicIp: false,
            securityGroups: [serviceSecurityGroup],
            healthCheckGracePeriod: cdk.Duration.seconds(serviceConfig.healthCheck.gracePeriod || 60),
            enableExecuteCommand: environment === 'prod' || environment === 'uat',
        });
        if (serviceConfig.domainName) {
            const lbConstruct = new load_balancer_1.LoadBalancerConstruct(this, 'LoadBalancer', {
                serviceConfig,
                environment,
                envConfig,
                vpc,
                service: this.service,
                serviceSecurityGroup,
            });
            this.loadBalancer = lbConstruct.loadBalancer;
            this.targetGroup = lbConstruct.targetGroup;
        }
        const scalingConstruct = new scaling_1.ScalingConstruct(this, 'Scaling', {
            service: this.service,
            scalingConfig: serviceConfig.scaling,
        });
        if (serviceConfig.deployment?.type === 'blue-green') {
            this.service.node.addMetadata('deploymentType', 'blue-green');
        }
        else if (serviceConfig.deployment?.type === 'canary') {
            this.service.node.addMetadata('deploymentType', 'canary');
            this.service.node.addMetadata('canaryPercentage', serviceConfig.deployment.canaryPercentage || 10);
        }
    }
    addCustomConstruct(construct) {
        construct.node.addDependency(this.service);
    }
    addContainer(name, containerDefinition) {
        return this.taskDefinition.addContainer(name, containerDefinition);
    }
    getService() {
        return this.service;
    }
    getTaskDefinition() {
        return this.taskDefinition;
    }
}
exports.EcsServiceConstruct = EcsServiceConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNzLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJlY3Mtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMsMkNBQTJDO0FBQzNDLDJDQUEyQztBQUUzQywyQ0FBMkM7QUFDM0MsNkNBQTZDO0FBRTdDLDJDQUF1QztBQUd2QyxtREFBd0Q7QUFDeEQsdUNBQTZDO0FBVTdDLE1BQWEsbUJBQW9CLFNBQVEsc0JBQVM7SUFNaEQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUErQjtRQUN2RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRXRFLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUNoRSxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLENBQUM7WUFDOUQsZUFBZSxFQUFFO2dCQUNmLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsK0NBQStDLENBQUM7YUFDNUY7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUM5QyxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLENBQUM7U0FDL0QsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDMUUsTUFBTSxFQUFFLEdBQUcsV0FBVyxJQUFJLGFBQWEsQ0FBQyxJQUFJLEVBQUU7WUFDOUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxR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QVksQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRU0sVUFBVTtRQUNmLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBRU0saUJBQWlCO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUM3QixDQUFDO0NBQ0Y7QUE3SUQsa0RBNklDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCAqIGFzIGVjcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWNzJztcbmltcG9ydCAqIGFzIGVsYnYyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lbGFzdGljbG9hZGJhbGFuY2luZ3YyJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xuaW1wb3J0ICogYXMgYXBwbGljYXRpb25hdXRvc2NhbGluZyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBwbGljYXRpb25hdXRvc2NhbGluZyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IFNlcnZpY2VDb25maWcgfSBmcm9tICcuLi90eXBlcy9zZXJ2aWNlLWNvbmZpZyc7XG5pbXBvcnQgeyBFbnZpcm9ubWVudENvbmZpZyB9IGZyb20gJy4uL3V0aWxzL2Vudmlyb25tZW50JztcbmltcG9ydCB7IExvYWRCYWxhbmNlckNvbnN0cnVjdCB9IGZyb20gJy4vbG9hZC1iYWxhbmNlcic7XG5pbXBvcnQgeyBTY2FsaW5nQ29uc3RydWN0IH0gZnJvbSAnLi9zY2FsaW5nJztcblxuZXhwb3J0IGludGVyZmFjZSBFY3NTZXJ2aWNlQ29uc3RydWN0UHJvcHMge1xuICBzZXJ2aWNlQ29uZmlnOiBTZXJ2aWNlQ29uZmlnO1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xuICBlbnZDb25maWc6IEVudmlyb25tZW50Q29uZmlnO1xuICB2cGM6IGVjMi5WcGM7XG4gIGNsdXN0ZXI6IGVjcy5DbHVzdGVyO1xufVxuXG5leHBvcnQgY2xhc3MgRWNzU2VydmljZUNvbnN0cnVjdCBleHRlbmRzIENvbnN0cnVjdCB7XG4gIHB1YmxpYyByZWFkb25seSBzZXJ2aWNlOiBlY3MuRmFyZ2F0ZVNlcnZpY2U7XG4gIHB1YmxpYyByZWFkb25seSB0YXNrRGVmaW5pdGlvbjogZWNzLkZhcmdhdGVUYXNrRGVmaW5pdGlvbjtcbiAgcHVibGljIHJlYWRvbmx5IGxvYWRCYWxhbmNlcj86IGVsYnYyLkFwcGxpY2F0aW9uTG9hZEJhbGFuY2VyO1xuICBwdWJsaWMgcmVhZG9ubHkgdGFyZ2V0R3JvdXA/OiBlbGJ2Mi5BcHBsaWNhdGlvblRhcmdldEdyb3VwO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBFY3NTZXJ2aWNlQ29uc3RydWN0UHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgY29uc3QgeyBzZXJ2aWNlQ29uZmlnLCBlbnZpcm9ubWVudCwgZW52Q29uZmlnLCB2cGMsIGNsdXN0ZXIgfSA9IHByb3BzO1xuXG4gICAgY29uc3QgdGFza0V4ZWN1dGlvblJvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ1Rhc2tFeGVjdXRpb25Sb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2Vjcy10YXNrcy5hbWF6b25hd3MuY29tJyksXG4gICAgICBtYW5hZ2VkUG9saWNpZXM6IFtcbiAgICAgICAgaWFtLk1hbmFnZWRQb2xpY3kuZnJvbUF3c01hbmFnZWRQb2xpY3lOYW1lKCdzZXJ2aWNlLXJvbGUvQW1hem9uRUNTVGFza0V4ZWN1dGlvblJvbGVQb2xpY3knKSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICBjb25zdCB0YXNrUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnVGFza1JvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbCgnZWNzLXRhc2tzLmFtYXpvbmF3cy5jb20nKSxcbiAgICB9KTtcblxuICAgIHRoaXMudGFza0RlZmluaXRpb24gPSBuZXcgZWNzLkZhcmdhdGVUYXNrRGVmaW5pdGlvbih0aGlzLCAnVGFza0RlZmluaXRpb24nLCB7XG4gICAgICBmYW1pbHk6IGAke2Vudmlyb25tZW50fS0ke3NlcnZpY2VDb25maWcubmFtZX1gLFxuICAgICAgY3B1OiBzZXJ2aWNlQ29uZmlnLnRhc2tTaXplLmNwdSxcbiAgICAgIG1lbW9yeUxpbWl0TWlCOiBzZXJ2aWNlQ29uZmlnLnRhc2tTaXplLm1lbW9yeSxcbiAgICAgIGV4ZWN1dGlvblJvbGU6IHRhc2tFeGVjdXRpb25Sb2xlLFxuICAgICAgdGFza1JvbGU6IHRhc2tSb2xlLFxuICAgIH0pO1xuXG4gICAgY29uc3QgbG9nR3JvdXAgPSBuZXcgbG9ncy5Mb2dHcm91cCh0aGlzLCAnTG9nR3JvdXAnLCB7XG4gICAgICBsb2dHcm91cE5hbWU6IGAvYXdzL2Vjcy8ke2Vudmlyb25tZW50fS8ke3NlcnZpY2VDb25maWcubmFtZX1gLFxuICAgICAgcmV0ZW50aW9uOiBlbnZpcm9ubWVudCA9PT0gJ3Byb2QnID8gbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9ZRUFSIDogbG9ncy5SZXRlbnRpb25EYXlzLk9ORV9NT05USCxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGVudmlyb25tZW50ID09PSAncHJvZCcgPyBjZGsuUmVtb3ZhbFBvbGljeS5SRVRBSU4gOiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuXG4gICAgY29uc3QgbWFpbkNvbnRhaW5lciA9IHRoaXMudGFza0RlZmluaXRpb24uYWRkQ29udGFpbmVyKCdNYWluQ29udGFpbmVyJywge1xuICAgICAgaW1hZ2U6IGVjcy5Db250YWluZXJJbWFnZS5mcm9tUmVnaXN0cnkoc2VydmljZUNvbmZpZy5jb250YWluZXJJbWFnZSksXG4gICAgICBsb2dnaW5nOiBlY3MuTG9nRHJpdmVycy5hd3NMb2dzKHtcbiAgICAgICAgc3RyZWFtUHJlZml4OiAnZWNzJyxcbiAgICAgICAgbG9nR3JvdXA6IGxvZ0dyb3VwLFxuICAgICAgfSksXG4gICAgICBlbnZpcm9ubWVudDogc2VydmljZUNvbmZpZy5lbnZpcm9ubWVudFZhcmlhYmxlcyB8fCB7fSxcbiAgICAgIGhlYWx0aENoZWNrOiB7XG4gICAgICAgIGNvbW1hbmQ6IFsnQ01ELVNIRUxMJywgYGN1cmwgLWYgaHR0cDovL2xvY2FsaG9zdDoke3NlcnZpY2VDb25maWcucG9ydH0ke3NlcnZpY2VDb25maWcuaGVhbHRoQ2hlY2sucGF0aH0gfHwgZXhpdCAxYF0sXG4gICAgICAgIGludGVydmFsOiBjZGsuRHVyYXRpb24uc2Vjb25kcyhzZXJ2aWNlQ29uZmlnLmhlYWx0aENoZWNrLmludGVydmFsKSxcbiAgICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoc2VydmljZUNvbmZpZy5oZWFsdGhDaGVjay50aW1lb3V0KSxcbiAgICAgICAgcmV0cmllczogc2VydmljZUNvbmZpZy5oZWFsdGhDaGVjay5yZXRyaWVzLFxuICAgICAgICBzdGFydFBlcmlvZDogY2RrLkR1cmF0aW9uLnNlY29uZHMoc2VydmljZUNvbmZpZy5oZWFsdGhDaGVjay5ncmFjZVBlcmlvZCB8fCA2MCksXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgbWFpbkNvbnRhaW5lci5hZGRQb3J0TWFwcGluZ3Moe1xuICAgICAgY29udGFpbmVyUG9ydDogc2VydmljZUNvbmZpZy5wb3J0LFxuICAgICAgcHJvdG9jb2w6IGVjcy5Qcm90b2NvbC5UQ1AsXG4gICAgfSk7XG5cbiAgICBpZiAoc2VydmljZUNvbmZpZy5zaWRlY2FyQ29udGFpbmVycykge1xuICAgICAgZm9yIChjb25zdCBzaWRlY2FyIG9mIHNlcnZpY2VDb25maWcuc2lkZWNhckNvbnRhaW5lcnMpIHtcbiAgICAgICAgY29uc3Qgc2lkZWNhckNvbnRhaW5lciA9IHRoaXMudGFza0RlZmluaXRpb24uYWRkQ29udGFpbmVyKHNpZGVjYXIubmFtZSwge1xuICAgICAgICAgIGltYWdlOiBlY3MuQ29udGFpbmVySW1hZ2UuZnJvbVJlZ2lzdHJ5KHNpZGVjYXIuaW1hZ2UpLFxuICAgICAgICAgIGVzc2VudGlhbDogc2lkZWNhci5lc3NlbnRpYWwsXG4gICAgICAgICAgY3B1OiBzaWRlY2FyLmNwdSxcbiAgICAgICAgICBtZW1vcnlMaW1pdE1pQjogc2lkZWNhci5tZW1vcnksXG4gICAgICAgICAgZW52aXJvbm1lbnQ6IHNpZGVjYXIuZW52aXJvbm1lbnRWYXJpYWJsZXMgfHwge30sXG4gICAgICAgICAgbG9nZ2luZzogZWNzLkxvZ0RyaXZlcnMuYXdzTG9ncyh7XG4gICAgICAgICAgICBzdHJlYW1QcmVmaXg6IGBzaWRlY2FyLSR7c2lkZWNhci5uYW1lfWAsXG4gICAgICAgICAgICBsb2dHcm91cDogbG9nR3JvdXAsXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChzaWRlY2FyLnBvcnRNYXBwaW5ncykge1xuICAgICAgICAgIGZvciAoY29uc3QgcG9ydE1hcHBpbmcgb2Ygc2lkZWNhci5wb3J0TWFwcGluZ3MpIHtcbiAgICAgICAgICAgIHNpZGVjYXJDb250YWluZXIuYWRkUG9ydE1hcHBpbmdzKHtcbiAgICAgICAgICAgICAgY29udGFpbmVyUG9ydDogcG9ydE1hcHBpbmcuY29udGFpbmVyUG9ydCxcbiAgICAgICAgICAgICAgcHJvdG9jb2w6IHBvcnRNYXBwaW5nLnByb3RvY29sID09PSAnVURQJyA/IGVjcy5Qcm90b2NvbC5VRFAgOiBlY3MuUHJvdG9jb2wuVENQLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc2VydmljZVNlY3VyaXR5R3JvdXAgPSBuZXcgZWMyLlNlY3VyaXR5R3JvdXAodGhpcywgJ1NlcnZpY2VTZWN1cml0eUdyb3VwJywge1xuICAgICAgdnBjLFxuICAgICAgZGVzY3JpcHRpb246IGBTZWN1cml0eSBncm91cCBmb3IgJHtzZXJ2aWNlQ29uZmlnLm5hbWV9IHNlcnZpY2VgLFxuICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICB9KTtcblxuICAgIHRoaXMuc2VydmljZSA9IG5ldyBlY3MuRmFyZ2F0ZVNlcnZpY2UodGhpcywgJ1NlcnZpY2UnLCB7XG4gICAgICBjbHVzdGVyLFxuICAgICAgdGFza0RlZmluaXRpb246IHRoaXMudGFza0RlZmluaXRpb24sXG4gICAgICBzZXJ2aWNlTmFtZTogYCR7ZW52aXJvbm1lbnR9LSR7c2VydmljZUNvbmZpZy5uYW1lfWAsXG4gICAgICBkZXNpcmVkQ291bnQ6IHNlcnZpY2VDb25maWcuc2NhbGluZy5taW5DYXBhY2l0eSxcbiAgICAgIGFzc2lnblB1YmxpY0lwOiBmYWxzZSxcbiAgICAgIHNlY3VyaXR5R3JvdXBzOiBbc2VydmljZVNlY3VyaXR5R3JvdXBdLFxuICAgICAgaGVhbHRoQ2hlY2tHcmFjZVBlcmlvZDogY2RrLkR1cmF0aW9uLnNlY29uZHMoc2VydmljZUNvbmZpZy5oZWFsdGhDaGVjay5ncmFjZVBlcmlvZCB8fCA2MCksXG4gICAgICBlbmFibGVFeGVjdXRlQ29tbWFuZDogZW52aXJvbm1lbnQgPT09ICdwcm9kJyB8fCBlbnZpcm9ubWVudCA9PT0gJ3VhdCcsXG4gICAgfSk7XG5cbiAgICBpZiAoc2VydmljZUNvbmZpZy5kb21haW5OYW1lKSB7XG4gICAgICBjb25zdCBsYkNvbnN0cnVjdCA9IG5ldyBMb2FkQmFsYW5jZXJDb25zdHJ1Y3QodGhpcywgJ0xvYWRCYWxhbmNlcicsIHtcbiAgICAgICAgc2VydmljZUNvbmZpZyxcbiAgICAgICAgZW52aXJvbm1lbnQsXG4gICAgICAgIGVudkNvbmZpZyxcbiAgICAgICAgdnBjLFxuICAgICAgICBzZXJ2aWNlOiB0aGlzLnNlcnZpY2UsXG4gICAgICAgIHNlcnZpY2VTZWN1cml0eUdyb3VwLFxuICAgICAgfSk7XG5cbiAgICAgIHRoaXMubG9hZEJhbGFuY2VyID0gbGJDb25zdHJ1Y3QubG9hZEJhbGFuY2VyO1xuICAgICAgdGhpcy50YXJnZXRHcm91cCA9IGxiQ29uc3RydWN0LnRhcmdldEdyb3VwO1xuICAgIH1cblxuICAgIGNvbnN0IHNjYWxpbmdDb25zdHJ1Y3QgPSBuZXcgU2NhbGluZ0NvbnN0cnVjdCh0aGlzLCAnU2NhbGluZycsIHtcbiAgICAgIHNlcnZpY2U6IHRoaXMuc2VydmljZSxcbiAgICAgIHNjYWxpbmdDb25maWc6IHNlcnZpY2VDb25maWcuc2NhbGluZyxcbiAgICB9KTtcblxuICAgIGlmIChzZXJ2aWNlQ29uZmlnLmRlcGxveW1lbnQ/LnR5cGUgPT09ICdibHVlLWdyZWVuJykge1xuICAgICAgdGhpcy5zZXJ2aWNlLm5vZGUuYWRkTWV0YWRhdGEoJ2RlcGxveW1lbnRUeXBlJywgJ2JsdWUtZ3JlZW4nKTtcbiAgICB9IGVsc2UgaWYgKHNlcnZpY2VDb25maWcuZGVwbG95bWVudD8udHlwZSA9PT0gJ2NhbmFyeScpIHtcbiAgICAgIHRoaXMuc2VydmljZS5ub2RlLmFkZE1ldGFkYXRhKCdkZXBsb3ltZW50VHlwZScsICdjYW5hcnknKTtcbiAgICAgIHRoaXMuc2VydmljZS5ub2RlLmFkZE1ldGFkYXRhKCdjYW5hcnlQZXJjZW50YWdlJywgc2VydmljZUNvbmZpZy5kZXBsb3ltZW50LmNhbmFyeVBlcmNlbnRhZ2UgfHwgMTApO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhZGRDdXN0b21Db25zdHJ1Y3QoY29uc3RydWN0OiBDb25zdHJ1Y3QpOiB2b2lkIHtcbiAgICBjb25zdHJ1Y3Qubm9kZS5hZGREZXBlbmRlbmN5KHRoaXMuc2VydmljZSk7XG4gIH1cblxuICBwdWJsaWMgYWRkQ29udGFpbmVyKG5hbWU6IHN0cmluZywgY29udGFpbmVyRGVmaW5pdGlvbjogZWNzLkNvbnRhaW5lckRlZmluaXRpb25PcHRpb25zKTogZWNzLkNvbnRhaW5lckRlZmluaXRpb24ge1xuICAgIHJldHVybiB0aGlzLnRhc2tEZWZpbml0aW9uLmFkZENvbnRhaW5lcihuYW1lLCBjb250YWluZXJEZWZpbml0aW9uKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRTZXJ2aWNlKCk6IGVjcy5GYXJnYXRlU2VydmljZSB7XG4gICAgcmV0dXJuIHRoaXMuc2VydmljZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRUYXNrRGVmaW5pdGlvbigpOiBlY3MuRmFyZ2F0ZVRhc2tEZWZpbml0aW9uIHtcbiAgICByZXR1cm4gdGhpcy50YXNrRGVmaW5pdGlvbjtcbiAgfVxufVxuIl19