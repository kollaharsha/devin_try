"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceStack = void 0;
const cdk = require("aws-cdk-lib");
const path = require("path");
const config_loader_1 = require("../utils/config-loader");
const service_config_1 = require("../types/service-config");
const ecs_service_1 = require("../constructs/ecs-service");
class ServiceStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        this.services = [];
        const serviceConfigs = (0, config_loader_1.loadAllServiceConfigs)(path.join(__dirname, '../../config/services'));
        for (const serviceConfig of serviceConfigs) {
            (0, service_config_1.validateServiceConfig)(serviceConfig);
            const ecsService = new ecs_service_1.EcsServiceConstruct(this, `Service-${serviceConfig.name}`, {
                serviceConfig,
                environment: props.environment,
                envConfig: props.envConfig,
                vpc: props.vpc,
                cluster: props.cluster,
            });
            this.services.push(ecsService);
            new cdk.CfnOutput(this, `${serviceConfig.name}-ServiceArn`, {
                value: ecsService.service.serviceArn,
                exportName: `${props.environment}-${serviceConfig.name}-service-arn`,
            });
            if (ecsService.loadBalancer) {
                new cdk.CfnOutput(this, `${serviceConfig.name}-LoadBalancerDns`, {
                    value: ecsService.loadBalancer.loadBalancerDnsName,
                    exportName: `${props.environment}-${serviceConfig.name}-alb-dns`,
                });
            }
        }
    }
}
exports.ServiceStack = ServiceStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZpY2Utc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBR25DLDZCQUE2QjtBQUc3QiwwREFBK0Q7QUFDL0QsNERBQWdFO0FBQ2hFLDJEQUFnRTtBQVNoRSxNQUFhLFlBQWEsU0FBUSxHQUFHLENBQUMsS0FBSztJQUd6QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXdCO1FBQ2hFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBSFYsYUFBUSxHQUEwQixFQUFFLENBQUM7UUFLbkQsTUFBTSxjQUFjLEdBQUcsSUFBQSxxQ0FBcUIsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDLENBQUM7UUFFNUYsS0FBSyxNQUFNLGFBQWEsSUFBSSxjQUFjLEVBQUU7WUFDMUMsSUFBQSxzQ0FBcUIsRUFBQyxhQUFhLENBQUMsQ0FBQztZQUVyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLGlDQUFtQixDQUFDLElBQUksRUFBRSxXQUFXLGFBQWEsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDaEYsYUFBYTtnQkFDYixXQUFXLEVBQUUsS0FBSyxDQUFDLFdBQVc7Z0JBQzlCLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUztnQkFDMUIsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO2dCQUNkLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTzthQUN2QixDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUUvQixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsYUFBYSxDQUFDLElBQUksYUFBYSxFQUFFO2dCQUMxRCxLQUFLLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVO2dCQUNwQyxVQUFVLEVBQUUsR0FBRyxLQUFLLENBQUMsV0FBVyxJQUFJLGFBQWEsQ0FBQyxJQUFJLGNBQWM7YUFDckUsQ0FBQyxDQUFDO1lBRUgsSUFBSSxVQUFVLENBQUMsWUFBWSxFQUFFO2dCQUMzQixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsYUFBYSxDQUFDLElBQUksa0JBQWtCLEVBQUU7b0JBQy9ELEtBQUssRUFBRSxVQUFVLENBQUMsWUFBWSxDQUFDLG1CQUFtQjtvQkFDbEQsVUFBVSxFQUFFLEdBQUcsS0FBSyxDQUFDLFdBQVcsSUFBSSxhQUFhLENBQUMsSUFBSSxVQUFVO2lCQUNqRSxDQUFDLENBQUM7YUFDSjtTQUNGO0lBQ0gsQ0FBQztDQUNGO0FBbENELG9DQWtDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XG5pbXBvcnQgKiBhcyBlY3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBFbnZpcm9ubWVudENvbmZpZyB9IGZyb20gJy4uL3V0aWxzL2Vudmlyb25tZW50JztcbmltcG9ydCB7IGxvYWRBbGxTZXJ2aWNlQ29uZmlncyB9IGZyb20gJy4uL3V0aWxzL2NvbmZpZy1sb2FkZXInO1xuaW1wb3J0IHsgdmFsaWRhdGVTZXJ2aWNlQ29uZmlnIH0gZnJvbSAnLi4vdHlwZXMvc2VydmljZS1jb25maWcnO1xuaW1wb3J0IHsgRWNzU2VydmljZUNvbnN0cnVjdCB9IGZyb20gJy4uL2NvbnN0cnVjdHMvZWNzLXNlcnZpY2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlcnZpY2VTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xuICBlbnZDb25maWc6IEVudmlyb25tZW50Q29uZmlnO1xuICB2cGM6IGVjMi5WcGM7XG4gIGNsdXN0ZXI6IGVjcy5DbHVzdGVyO1xufVxuXG5leHBvcnQgY2xhc3MgU2VydmljZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IHNlcnZpY2VzOiBFY3NTZXJ2aWNlQ29uc3RydWN0W10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogU2VydmljZVN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IHNlcnZpY2VDb25maWdzID0gbG9hZEFsbFNlcnZpY2VDb25maWdzKHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi9jb25maWcvc2VydmljZXMnKSk7XG5cbiAgICBmb3IgKGNvbnN0IHNlcnZpY2VDb25maWcgb2Ygc2VydmljZUNvbmZpZ3MpIHtcbiAgICAgIHZhbGlkYXRlU2VydmljZUNvbmZpZyhzZXJ2aWNlQ29uZmlnKTtcblxuICAgICAgY29uc3QgZWNzU2VydmljZSA9IG5ldyBFY3NTZXJ2aWNlQ29uc3RydWN0KHRoaXMsIGBTZXJ2aWNlLSR7c2VydmljZUNvbmZpZy5uYW1lfWAsIHtcbiAgICAgICAgc2VydmljZUNvbmZpZyxcbiAgICAgICAgZW52aXJvbm1lbnQ6IHByb3BzLmVudmlyb25tZW50LFxuICAgICAgICBlbnZDb25maWc6IHByb3BzLmVudkNvbmZpZyxcbiAgICAgICAgdnBjOiBwcm9wcy52cGMsXG4gICAgICAgIGNsdXN0ZXI6IHByb3BzLmNsdXN0ZXIsXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zZXJ2aWNlcy5wdXNoKGVjc1NlcnZpY2UpO1xuXG4gICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBgJHtzZXJ2aWNlQ29uZmlnLm5hbWV9LVNlcnZpY2VBcm5gLCB7XG4gICAgICAgIHZhbHVlOiBlY3NTZXJ2aWNlLnNlcnZpY2Uuc2VydmljZUFybixcbiAgICAgICAgZXhwb3J0TmFtZTogYCR7cHJvcHMuZW52aXJvbm1lbnR9LSR7c2VydmljZUNvbmZpZy5uYW1lfS1zZXJ2aWNlLWFybmAsXG4gICAgICB9KTtcblxuICAgICAgaWYgKGVjc1NlcnZpY2UubG9hZEJhbGFuY2VyKSB7XG4gICAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIGAke3NlcnZpY2VDb25maWcubmFtZX0tTG9hZEJhbGFuY2VyRG5zYCwge1xuICAgICAgICAgIHZhbHVlOiBlY3NTZXJ2aWNlLmxvYWRCYWxhbmNlci5sb2FkQmFsYW5jZXJEbnNOYW1lLFxuICAgICAgICAgIGV4cG9ydE5hbWU6IGAke3Byb3BzLmVudmlyb25tZW50fS0ke3NlcnZpY2VDb25maWcubmFtZX0tYWxiLWRuc2AsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19