"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceStack = void 0;
const cdk = require("aws-cdk-lib");
const path = require("path");
const environment_1 = require("../utils/environment");
const config_loader_1 = require("../utils/config-loader");
const service_config_1 = require("../types/service-config");
const ecs_service_1 = require("../constructs/ecs-service");
class ServiceStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        this.services = [];
        const mergedDefaults = (0, environment_1.getMergedEnvironmentDefaults)(props.envConfig);
        const allServiceConfigs = (0, config_loader_1.loadAllServiceConfigs)(path.join(__dirname, '../../config/services'), mergedDefaults);
        const serviceConfigs = allServiceConfigs.filter(config => {
            if (!config.environments || config.environments.length === 0) {
                return true;
            }
            return config.environments.includes(props.environment);
        });
        console.log(`Deploying ${serviceConfigs.length} services to ${props.environment} environment`);
        if (allServiceConfigs.length > serviceConfigs.length) {
            const skippedServices = allServiceConfigs
                .filter(config => config.environments && !config.environments.includes(props.environment))
                .map(config => config.name);
            console.log(`Skipping services not configured for ${props.environment}: ${skippedServices.join(', ')}`);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZpY2Utc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBR25DLDZCQUE2QjtBQUU3QixzREFBdUY7QUFDdkYsMERBQStEO0FBQy9ELDREQUFnRTtBQUNoRSwyREFBZ0U7QUFTaEUsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFHekMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF3QjtRQUNoRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUhWLGFBQVEsR0FBMEIsRUFBRSxDQUFDO1FBS25ELE1BQU0sY0FBYyxHQUFHLElBQUEsMENBQTRCLEVBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0saUJBQWlCLEdBQUcsSUFBQSxxQ0FBcUIsRUFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSx1QkFBdUIsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRS9HLE1BQU0sY0FBYyxHQUFHLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN2RCxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksSUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzVELE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxPQUFPLE1BQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxjQUFjLENBQUMsTUFBTSxnQkFBZ0IsS0FBSyxDQUFDLFdBQVcsY0FBYyxDQUFDLENBQUM7UUFDL0YsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRTtZQUNwRCxNQUFNLGVBQWUsR0FBRyxpQkFBaUI7aUJBQ3RDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQ3pGLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLHdDQUF3QyxLQUFLLENBQUMsV0FBVyxLQUFLLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3pHO1FBRUQsS0FBSyxNQUFNLGFBQWEsSUFBSSxjQUFjLEVBQUU7WUFDMUMsSUFBQSxzQ0FBcUIsRUFBQyxhQUFhLENBQUMsQ0FBQztZQUVyQyxNQUFNLFVBQVUsR0FBRyxJQUFJLGlDQUFtQixDQUFDLElBQUksRUFBRSxXQUFXLGFBQWEsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDaEYsYUFBYTtnQkFDYixXQUFXLEVBQUUsS0FBSyxDQUFDLFdBQVc7Z0JBQzlCLFNBQVMsRUFBRSxLQUFLLENBQUMsU0FBUztnQkFDMUIsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHO2dCQUNkLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTzthQUN2QixDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUUvQixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsYUFBYSxDQUFDLElBQUksYUFBYSxFQUFFO2dCQUMxRCxLQUFLLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVO2dCQUNwQyxVQUFVLEVBQUUsR0FBRyxLQUFLLENBQUMsV0FBVyxJQUFJLGFBQWEsQ0FBQyxJQUFJLGNBQWM7YUFDckUsQ0FBQyxDQUFDO1lBRUgsSUFBSSxVQUFVLENBQUMsWUFBWSxFQUFFO2dCQUMzQixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsYUFBYSxDQUFDLElBQUksa0JBQWtCLEVBQUU7b0JBQy9ELEtBQUssRUFBRSxVQUFVLENBQUMsWUFBWSxDQUFDLG1CQUFtQjtvQkFDbEQsVUFBVSxFQUFFLEdBQUcsS0FBSyxDQUFDLFdBQVcsSUFBSSxhQUFhLENBQUMsSUFBSSxVQUFVO2lCQUNqRSxDQUFDLENBQUM7YUFDSjtTQUNGO0lBQ0gsQ0FBQztDQUNGO0FBbERELG9DQWtEQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBlYzIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjMic7XG5pbXBvcnQgKiBhcyBlY3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWVjcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBFbnZpcm9ubWVudENvbmZpZywgZ2V0TWVyZ2VkRW52aXJvbm1lbnREZWZhdWx0cyB9IGZyb20gJy4uL3V0aWxzL2Vudmlyb25tZW50JztcbmltcG9ydCB7IGxvYWRBbGxTZXJ2aWNlQ29uZmlncyB9IGZyb20gJy4uL3V0aWxzL2NvbmZpZy1sb2FkZXInO1xuaW1wb3J0IHsgdmFsaWRhdGVTZXJ2aWNlQ29uZmlnIH0gZnJvbSAnLi4vdHlwZXMvc2VydmljZS1jb25maWcnO1xuaW1wb3J0IHsgRWNzU2VydmljZUNvbnN0cnVjdCB9IGZyb20gJy4uL2NvbnN0cnVjdHMvZWNzLXNlcnZpY2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlcnZpY2VTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xuICBlbnZDb25maWc6IEVudmlyb25tZW50Q29uZmlnO1xuICB2cGM6IGVjMi5WcGM7XG4gIGNsdXN0ZXI6IGVjcy5DbHVzdGVyO1xufVxuXG5leHBvcnQgY2xhc3MgU2VydmljZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IHNlcnZpY2VzOiBFY3NTZXJ2aWNlQ29uc3RydWN0W10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogU2VydmljZVN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IG1lcmdlZERlZmF1bHRzID0gZ2V0TWVyZ2VkRW52aXJvbm1lbnREZWZhdWx0cyhwcm9wcy5lbnZDb25maWcpO1xuICAgIGNvbnN0IGFsbFNlcnZpY2VDb25maWdzID0gbG9hZEFsbFNlcnZpY2VDb25maWdzKHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi9jb25maWcvc2VydmljZXMnKSwgbWVyZ2VkRGVmYXVsdHMpO1xuICAgIFxuICAgIGNvbnN0IHNlcnZpY2VDb25maWdzID0gYWxsU2VydmljZUNvbmZpZ3MuZmlsdGVyKGNvbmZpZyA9PiB7XG4gICAgICBpZiAoIWNvbmZpZy5lbnZpcm9ubWVudHMgfHwgY29uZmlnLmVudmlyb25tZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29uZmlnLmVudmlyb25tZW50cy5pbmNsdWRlcyhwcm9wcy5lbnZpcm9ubWVudCk7XG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZyhgRGVwbG95aW5nICR7c2VydmljZUNvbmZpZ3MubGVuZ3RofSBzZXJ2aWNlcyB0byAke3Byb3BzLmVudmlyb25tZW50fSBlbnZpcm9ubWVudGApO1xuICAgIGlmIChhbGxTZXJ2aWNlQ29uZmlncy5sZW5ndGggPiBzZXJ2aWNlQ29uZmlncy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHNraXBwZWRTZXJ2aWNlcyA9IGFsbFNlcnZpY2VDb25maWdzXG4gICAgICAgIC5maWx0ZXIoY29uZmlnID0+IGNvbmZpZy5lbnZpcm9ubWVudHMgJiYgIWNvbmZpZy5lbnZpcm9ubWVudHMuaW5jbHVkZXMocHJvcHMuZW52aXJvbm1lbnQpKVxuICAgICAgICAubWFwKGNvbmZpZyA9PiBjb25maWcubmFtZSk7XG4gICAgICBjb25zb2xlLmxvZyhgU2tpcHBpbmcgc2VydmljZXMgbm90IGNvbmZpZ3VyZWQgZm9yICR7cHJvcHMuZW52aXJvbm1lbnR9OiAke3NraXBwZWRTZXJ2aWNlcy5qb2luKCcsICcpfWApO1xuICAgIH1cblxuICAgIGZvciAoY29uc3Qgc2VydmljZUNvbmZpZyBvZiBzZXJ2aWNlQ29uZmlncykge1xuICAgICAgdmFsaWRhdGVTZXJ2aWNlQ29uZmlnKHNlcnZpY2VDb25maWcpO1xuXG4gICAgICBjb25zdCBlY3NTZXJ2aWNlID0gbmV3IEVjc1NlcnZpY2VDb25zdHJ1Y3QodGhpcywgYFNlcnZpY2UtJHtzZXJ2aWNlQ29uZmlnLm5hbWV9YCwge1xuICAgICAgICBzZXJ2aWNlQ29uZmlnLFxuICAgICAgICBlbnZpcm9ubWVudDogcHJvcHMuZW52aXJvbm1lbnQsXG4gICAgICAgIGVudkNvbmZpZzogcHJvcHMuZW52Q29uZmlnLFxuICAgICAgICB2cGM6IHByb3BzLnZwYyxcbiAgICAgICAgY2x1c3RlcjogcHJvcHMuY2x1c3RlcixcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNlcnZpY2VzLnB1c2goZWNzU2VydmljZSk7XG5cbiAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIGAke3NlcnZpY2VDb25maWcubmFtZX0tU2VydmljZUFybmAsIHtcbiAgICAgICAgdmFsdWU6IGVjc1NlcnZpY2Uuc2VydmljZS5zZXJ2aWNlQXJuLFxuICAgICAgICBleHBvcnROYW1lOiBgJHtwcm9wcy5lbnZpcm9ubWVudH0tJHtzZXJ2aWNlQ29uZmlnLm5hbWV9LXNlcnZpY2UtYXJuYCxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZWNzU2VydmljZS5sb2FkQmFsYW5jZXIpIHtcbiAgICAgICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgYCR7c2VydmljZUNvbmZpZy5uYW1lfS1Mb2FkQmFsYW5jZXJEbnNgLCB7XG4gICAgICAgICAgdmFsdWU6IGVjc1NlcnZpY2UubG9hZEJhbGFuY2VyLmxvYWRCYWxhbmNlckRuc05hbWUsXG4gICAgICAgICAgZXhwb3J0TmFtZTogYCR7cHJvcHMuZW52aXJvbm1lbnR9LSR7c2VydmljZUNvbmZpZy5uYW1lfS1hbGItZG5zYCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=