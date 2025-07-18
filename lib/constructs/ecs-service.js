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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNzLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJlY3Mtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBbUM7QUFDbkMsMkNBQTJDO0FBQzNDLDJDQUEyQztBQUUzQywyQ0FBMkM7QUFDM0MsNkNBQTZDO0FBRTdDLDJDQUF1QztBQUd2QyxtREFBd0Q7QUFDeEQsdUNBQTZDO0FBVTdDLE1BQWEsbUJBQW9CLFNBQVEsc0JBQVM7SUFNaEQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUErQjtRQUN2RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRXRFLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUNoRSxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLENBQUM7WUFDOUQsZUFBZSxFQUFFO2dCQUNmLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsK0NBQStDLENBQUM7YUFDNUY7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUM5QyxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLENBQUM7U0FDL0QsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDMUUsTUFBTSxFQUFFLEdBQUcsV0FBVyxJQUFJLGFBQWEsQ0FBQyxJQUFJLEVBQUU7WUFDOUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxR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QVksQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRU0sVUFBVTtRQUNmLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBRU0saUJBQWlCO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUM3QixDQUFDO0NBQ0Y7QUE3SUQsa0RBNklDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCAqIGFzIGVjcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWNzJztcbmltcG9ydCAqIGFzIGVsYnYyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lbGFzdGljbG9hZGJhbGFuY2luZ3YyJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xuaW1wb3J0ICogYXMgYXBwbGljYXRpb25hdXRvc2NhbGluZyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBwbGljYXRpb25hdXRvc2NhbGluZyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IFNlcnZpY2VDb25maWcgfSBmcm9tICcuLi91dGlscy9jb25maWctbG9hZGVyJztcbmltcG9ydCB7IEVudmlyb25tZW50Q29uZmlnIH0gZnJvbSAnLi4vdXRpbHMvZW52aXJvbm1lbnQnO1xuaW1wb3J0IHsgTG9hZEJhbGFuY2VyQ29uc3RydWN0IH0gZnJvbSAnLi9sb2FkLWJhbGFuY2VyJztcbmltcG9ydCB7IFNjYWxpbmdDb25zdHJ1Y3QgfSBmcm9tICcuL3NjYWxpbmcnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVjc1NlcnZpY2VDb25zdHJ1Y3RQcm9wcyB7XG4gIHNlcnZpY2VDb25maWc6IFNlcnZpY2VDb25maWc7XG4gIGVudmlyb25tZW50OiBzdHJpbmc7XG4gIGVudkNvbmZpZzogRW52aXJvbm1lbnRDb25maWc7XG4gIHZwYzogZWMyLlZwYztcbiAgY2x1c3RlcjogZWNzLkNsdXN0ZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBFY3NTZXJ2aWNlQ29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgcHVibGljIHJlYWRvbmx5IHNlcnZpY2U6IGVjcy5GYXJnYXRlU2VydmljZTtcbiAgcHVibGljIHJlYWRvbmx5IHRhc2tEZWZpbml0aW9uOiBlY3MuRmFyZ2F0ZVRhc2tEZWZpbml0aW9uO1xuICBwdWJsaWMgcmVhZG9ubHkgbG9hZEJhbGFuY2VyPzogZWxidjIuQXBwbGljYXRpb25Mb2FkQmFsYW5jZXI7XG4gIHB1YmxpYyByZWFkb25seSB0YXJnZXRHcm91cD86IGVsYnYyLkFwcGxpY2F0aW9uVGFyZ2V0R3JvdXA7XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEVjc1NlcnZpY2VDb25zdHJ1Y3RQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICBjb25zdCB7IHNlcnZpY2VDb25maWcsIGVudmlyb25tZW50LCBlbnZDb25maWcsIHZwYywgY2x1c3RlciB9ID0gcHJvcHM7XG5cbiAgICBjb25zdCB0YXNrRXhlY3V0aW9uUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnVGFza0V4ZWN1dGlvblJvbGUnLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbCgnZWNzLXRhc2tzLmFtYXpvbmF3cy5jb20nKSxcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoJ3NlcnZpY2Utcm9sZS9BbWF6b25FQ1NUYXNrRXhlY3V0aW9uUm9sZVBvbGljeScpLFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHRhc2tSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsICdUYXNrUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdlY3MtdGFza3MuYW1hem9uYXdzLmNvbScpLFxuICAgIH0pO1xuXG4gICAgdGhpcy50YXNrRGVmaW5pdGlvbiA9IG5ldyBlY3MuRmFyZ2F0ZVRhc2tEZWZpbml0aW9uKHRoaXMsICdUYXNrRGVmaW5pdGlvbicsIHtcbiAgICAgIGZhbWlseTogYCR7ZW52aXJvbm1lbnR9LSR7c2VydmljZUNvbmZpZy5uYW1lfWAsXG4gICAgICBjcHU6IHNlcnZpY2VDb25maWcudGFza1NpemUuY3B1LFxuICAgICAgbWVtb3J5TGltaXRNaUI6IHNlcnZpY2VDb25maWcudGFza1NpemUubWVtb3J5LFxuICAgICAgZXhlY3V0aW9uUm9sZTogdGFza0V4ZWN1dGlvblJvbGUsXG4gICAgICB0YXNrUm9sZTogdGFza1JvbGUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBsb2dHcm91cCA9IG5ldyBsb2dzLkxvZ0dyb3VwKHRoaXMsICdMb2dHcm91cCcsIHtcbiAgICAgIGxvZ0dyb3VwTmFtZTogYC9hd3MvZWNzLyR7ZW52aXJvbm1lbnR9LyR7c2VydmljZUNvbmZpZy5uYW1lfWAsXG4gICAgICByZXRlbnRpb246IGVudmlyb25tZW50ID09PSAncHJvZCcgPyBsb2dzLlJldGVudGlvbkRheXMuT05FX1lFQVIgOiBsb2dzLlJldGVudGlvbkRheXMuT05FX01PTlRILFxuICAgICAgcmVtb3ZhbFBvbGljeTogZW52aXJvbm1lbnQgPT09ICdwcm9kJyA/IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTiA6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgfSk7XG5cbiAgICBjb25zdCBtYWluQ29udGFpbmVyID0gdGhpcy50YXNrRGVmaW5pdGlvbi5hZGRDb250YWluZXIoJ01haW5Db250YWluZXInLCB7XG4gICAgICBpbWFnZTogZWNzLkNvbnRhaW5lckltYWdlLmZyb21SZWdpc3RyeShzZXJ2aWNlQ29uZmlnLmNvbnRhaW5lckltYWdlKSxcbiAgICAgIGxvZ2dpbmc6IGVjcy5Mb2dEcml2ZXJzLmF3c0xvZ3Moe1xuICAgICAgICBzdHJlYW1QcmVmaXg6ICdlY3MnLFxuICAgICAgICBsb2dHcm91cDogbG9nR3JvdXAsXG4gICAgICB9KSxcbiAgICAgIGVudmlyb25tZW50OiBzZXJ2aWNlQ29uZmlnLmVudmlyb25tZW50VmFyaWFibGVzIHx8IHt9LFxuICAgICAgaGVhbHRoQ2hlY2s6IHtcbiAgICAgICAgY29tbWFuZDogWydDTUQtU0hFTEwnLCBgY3VybCAtZiBodHRwOi8vbG9jYWxob3N0OiR7c2VydmljZUNvbmZpZy5wb3J0fSR7c2VydmljZUNvbmZpZy5oZWFsdGhDaGVjay5wYXRofSB8fCBleGl0IDFgXSxcbiAgICAgICAgaW50ZXJ2YWw6IGNkay5EdXJhdGlvbi5zZWNvbmRzKHNlcnZpY2VDb25maWcuaGVhbHRoQ2hlY2suaW50ZXJ2YWwpLFxuICAgICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcyhzZXJ2aWNlQ29uZmlnLmhlYWx0aENoZWNrLnRpbWVvdXQpLFxuICAgICAgICByZXRyaWVzOiBzZXJ2aWNlQ29uZmlnLmhlYWx0aENoZWNrLnJldHJpZXMsXG4gICAgICAgIHN0YXJ0UGVyaW9kOiBjZGsuRHVyYXRpb24uc2Vjb25kcyhzZXJ2aWNlQ29uZmlnLmhlYWx0aENoZWNrLmdyYWNlUGVyaW9kIHx8IDYwKSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBtYWluQ29udGFpbmVyLmFkZFBvcnRNYXBwaW5ncyh7XG4gICAgICBjb250YWluZXJQb3J0OiBzZXJ2aWNlQ29uZmlnLnBvcnQsXG4gICAgICBwcm90b2NvbDogZWNzLlByb3RvY29sLlRDUCxcbiAgICB9KTtcblxuICAgIGlmIChzZXJ2aWNlQ29uZmlnLnNpZGVjYXJDb250YWluZXJzKSB7XG4gICAgICBmb3IgKGNvbnN0IHNpZGVjYXIgb2Ygc2VydmljZUNvbmZpZy5zaWRlY2FyQ29udGFpbmVycykge1xuICAgICAgICBjb25zdCBzaWRlY2FyQ29udGFpbmVyID0gdGhpcy50YXNrRGVmaW5pdGlvbi5hZGRDb250YWluZXIoc2lkZWNhci5uYW1lLCB7XG4gICAgICAgICAgaW1hZ2U6IGVjcy5Db250YWluZXJJbWFnZS5mcm9tUmVnaXN0cnkoc2lkZWNhci5pbWFnZSksXG4gICAgICAgICAgZXNzZW50aWFsOiBzaWRlY2FyLmVzc2VudGlhbCxcbiAgICAgICAgICBjcHU6IHNpZGVjYXIuY3B1LFxuICAgICAgICAgIG1lbW9yeUxpbWl0TWlCOiBzaWRlY2FyLm1lbW9yeSxcbiAgICAgICAgICBlbnZpcm9ubWVudDogc2lkZWNhci5lbnZpcm9ubWVudFZhcmlhYmxlcyB8fCB7fSxcbiAgICAgICAgICBsb2dnaW5nOiBlY3MuTG9nRHJpdmVycy5hd3NMb2dzKHtcbiAgICAgICAgICAgIHN0cmVhbVByZWZpeDogYHNpZGVjYXItJHtzaWRlY2FyLm5hbWV9YCxcbiAgICAgICAgICAgIGxvZ0dyb3VwOiBsb2dHcm91cCxcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHNpZGVjYXIucG9ydE1hcHBpbmdzKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBwb3J0TWFwcGluZyBvZiBzaWRlY2FyLnBvcnRNYXBwaW5ncykge1xuICAgICAgICAgICAgc2lkZWNhckNvbnRhaW5lci5hZGRQb3J0TWFwcGluZ3Moe1xuICAgICAgICAgICAgICBjb250YWluZXJQb3J0OiBwb3J0TWFwcGluZy5jb250YWluZXJQb3J0LFxuICAgICAgICAgICAgICBwcm90b2NvbDogcG9ydE1hcHBpbmcucHJvdG9jb2wgPT09ICdVRFAnID8gZWNzLlByb3RvY29sLlVEUCA6IGVjcy5Qcm90b2NvbC5UQ1AsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzZXJ2aWNlU2VjdXJpdHlHcm91cCA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCAnU2VydmljZVNlY3VyaXR5R3JvdXAnLCB7XG4gICAgICB2cGMsXG4gICAgICBkZXNjcmlwdGlvbjogYFNlY3VyaXR5IGdyb3VwIGZvciAke3NlcnZpY2VDb25maWcubmFtZX0gc2VydmljZWAsXG4gICAgICBhbGxvd0FsbE91dGJvdW5kOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgdGhpcy5zZXJ2aWNlID0gbmV3IGVjcy5GYXJnYXRlU2VydmljZSh0aGlzLCAnU2VydmljZScsIHtcbiAgICAgIGNsdXN0ZXIsXG4gICAgICB0YXNrRGVmaW5pdGlvbjogdGhpcy50YXNrRGVmaW5pdGlvbixcbiAgICAgIHNlcnZpY2VOYW1lOiBgJHtlbnZpcm9ubWVudH0tJHtzZXJ2aWNlQ29uZmlnLm5hbWV9YCxcbiAgICAgIGRlc2lyZWRDb3VudDogc2VydmljZUNvbmZpZy5zY2FsaW5nLm1pbkNhcGFjaXR5LFxuICAgICAgYXNzaWduUHVibGljSXA6IGZhbHNlLFxuICAgICAgc2VjdXJpdHlHcm91cHM6IFtzZXJ2aWNlU2VjdXJpdHlHcm91cF0sXG4gICAgICBoZWFsdGhDaGVja0dyYWNlUGVyaW9kOiBjZGsuRHVyYXRpb24uc2Vjb25kcyhzZXJ2aWNlQ29uZmlnLmhlYWx0aENoZWNrLmdyYWNlUGVyaW9kIHx8IDYwKSxcbiAgICAgIGVuYWJsZUV4ZWN1dGVDb21tYW5kOiBlbnZpcm9ubWVudCA9PT0gJ3Byb2QnIHx8IGVudmlyb25tZW50ID09PSAndWF0JyxcbiAgICB9KTtcblxuICAgIGlmIChzZXJ2aWNlQ29uZmlnLmRvbWFpbk5hbWUpIHtcbiAgICAgIGNvbnN0IGxiQ29uc3RydWN0ID0gbmV3IExvYWRCYWxhbmNlckNvbnN0cnVjdCh0aGlzLCAnTG9hZEJhbGFuY2VyJywge1xuICAgICAgICBzZXJ2aWNlQ29uZmlnLFxuICAgICAgICBlbnZpcm9ubWVudCxcbiAgICAgICAgZW52Q29uZmlnLFxuICAgICAgICB2cGMsXG4gICAgICAgIHNlcnZpY2U6IHRoaXMuc2VydmljZSxcbiAgICAgICAgc2VydmljZVNlY3VyaXR5R3JvdXAsXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5sb2FkQmFsYW5jZXIgPSBsYkNvbnN0cnVjdC5sb2FkQmFsYW5jZXI7XG4gICAgICB0aGlzLnRhcmdldEdyb3VwID0gbGJDb25zdHJ1Y3QudGFyZ2V0R3JvdXA7XG4gICAgfVxuXG4gICAgY29uc3Qgc2NhbGluZ0NvbnN0cnVjdCA9IG5ldyBTY2FsaW5nQ29uc3RydWN0KHRoaXMsICdTY2FsaW5nJywge1xuICAgICAgc2VydmljZTogdGhpcy5zZXJ2aWNlLFxuICAgICAgc2NhbGluZ0NvbmZpZzogc2VydmljZUNvbmZpZy5zY2FsaW5nLFxuICAgIH0pO1xuXG4gICAgaWYgKHNlcnZpY2VDb25maWcuZGVwbG95bWVudD8udHlwZSA9PT0gJ2JsdWUtZ3JlZW4nKSB7XG4gICAgICB0aGlzLnNlcnZpY2Uubm9kZS5hZGRNZXRhZGF0YSgnZGVwbG95bWVudFR5cGUnLCAnYmx1ZS1ncmVlbicpO1xuICAgIH0gZWxzZSBpZiAoc2VydmljZUNvbmZpZy5kZXBsb3ltZW50Py50eXBlID09PSAnY2FuYXJ5Jykge1xuICAgICAgdGhpcy5zZXJ2aWNlLm5vZGUuYWRkTWV0YWRhdGEoJ2RlcGxveW1lbnRUeXBlJywgJ2NhbmFyeScpO1xuICAgICAgdGhpcy5zZXJ2aWNlLm5vZGUuYWRkTWV0YWRhdGEoJ2NhbmFyeVBlcmNlbnRhZ2UnLCBzZXJ2aWNlQ29uZmlnLmRlcGxveW1lbnQuY2FuYXJ5UGVyY2VudGFnZSB8fCAxMCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFkZEN1c3RvbUNvbnN0cnVjdChjb25zdHJ1Y3Q6IENvbnN0cnVjdCk6IHZvaWQge1xuICAgIGNvbnN0cnVjdC5ub2RlLmFkZERlcGVuZGVuY3kodGhpcy5zZXJ2aWNlKTtcbiAgfVxuXG4gIHB1YmxpYyBhZGRDb250YWluZXIobmFtZTogc3RyaW5nLCBjb250YWluZXJEZWZpbml0aW9uOiBlY3MuQ29udGFpbmVyRGVmaW5pdGlvbk9wdGlvbnMpOiBlY3MuQ29udGFpbmVyRGVmaW5pdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMudGFza0RlZmluaXRpb24uYWRkQ29udGFpbmVyKG5hbWUsIGNvbnRhaW5lckRlZmluaXRpb24pO1xuICB9XG5cbiAgcHVibGljIGdldFNlcnZpY2UoKTogZWNzLkZhcmdhdGVTZXJ2aWNlIHtcbiAgICByZXR1cm4gdGhpcy5zZXJ2aWNlO1xuICB9XG5cbiAgcHVibGljIGdldFRhc2tEZWZpbml0aW9uKCk6IGVjcy5GYXJnYXRlVGFza0RlZmluaXRpb24ge1xuICAgIHJldHVybiB0aGlzLnRhc2tEZWZpbml0aW9uO1xuICB9XG59XG4iXX0=