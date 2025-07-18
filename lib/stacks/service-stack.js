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
        const allServiceConfigs = (0, config_loader_1.loadAllServiceConfigs)(path.join(__dirname, '../../config/services'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZpY2Utc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBR25DLDZCQUE2QjtBQUc3QiwwREFBK0Q7QUFDL0QsNERBQWdFO0FBQ2hFLDJEQUFnRTtBQVNoRSxNQUFhLFlBQWEsU0FBUSxHQUFHLENBQUMsS0FBSztJQUd6QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXdCO1FBQ2hFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBSFYsYUFBUSxHQUEwQixFQUFFLENBQUM7UUFLbkQsTUFBTSxpQkFBaUIsR0FBRyxJQUFBLHFDQUFxQixFQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHVCQUF1QixDQUFDLENBQUMsQ0FBQztRQUUvRixNQUFNLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDdkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUM1RCxPQUFPLElBQUksQ0FBQzthQUNiO1lBQ0QsT0FBTyxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDekQsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsY0FBYyxDQUFDLE1BQU0sZ0JBQWdCLEtBQUssQ0FBQyxXQUFXLGNBQWMsQ0FBQyxDQUFDO1FBQy9GLElBQUksaUJBQWlCLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUU7WUFDcEQsTUFBTSxlQUFlLEdBQUcsaUJBQWlCO2lCQUN0QyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2lCQUN6RixHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsS0FBSyxDQUFDLFdBQVcsS0FBSyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUN6RztRQUVELEtBQUssTUFBTSxhQUFhLElBQUksY0FBYyxFQUFFO1lBQzFDLElBQUEsc0NBQXFCLEVBQUMsYUFBYSxDQUFDLENBQUM7WUFFckMsTUFBTSxVQUFVLEdBQUcsSUFBSSxpQ0FBbUIsQ0FBQyxJQUFJLEVBQUUsV0FBVyxhQUFhLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ2hGLGFBQWE7Z0JBQ2IsV0FBVyxFQUFFLEtBQUssQ0FBQyxXQUFXO2dCQUM5QixTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVM7Z0JBQzFCLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRztnQkFDZCxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87YUFDdkIsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFL0IsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLGFBQWEsQ0FBQyxJQUFJLGFBQWEsRUFBRTtnQkFDMUQsS0FBSyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVTtnQkFDcEMsVUFBVSxFQUFFLEdBQUcsS0FBSyxDQUFDLFdBQVcsSUFBSSxhQUFhLENBQUMsSUFBSSxjQUFjO2FBQ3JFLENBQUMsQ0FBQztZQUVILElBQUksVUFBVSxDQUFDLFlBQVksRUFBRTtnQkFDM0IsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLGFBQWEsQ0FBQyxJQUFJLGtCQUFrQixFQUFFO29CQUMvRCxLQUFLLEVBQUUsVUFBVSxDQUFDLFlBQVksQ0FBQyxtQkFBbUI7b0JBQ2xELFVBQVUsRUFBRSxHQUFHLEtBQUssQ0FBQyxXQUFXLElBQUksYUFBYSxDQUFDLElBQUksVUFBVTtpQkFDakUsQ0FBQyxDQUFDO2FBQ0o7U0FDRjtJQUNILENBQUM7Q0FDRjtBQWpERCxvQ0FpREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0ICogYXMgZWNzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lY3MnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgRW52aXJvbm1lbnRDb25maWcgfSBmcm9tICcuLi91dGlscy9lbnZpcm9ubWVudCc7XG5pbXBvcnQgeyBsb2FkQWxsU2VydmljZUNvbmZpZ3MgfSBmcm9tICcuLi91dGlscy9jb25maWctbG9hZGVyJztcbmltcG9ydCB7IHZhbGlkYXRlU2VydmljZUNvbmZpZyB9IGZyb20gJy4uL3R5cGVzL3NlcnZpY2UtY29uZmlnJztcbmltcG9ydCB7IEVjc1NlcnZpY2VDb25zdHJ1Y3QgfSBmcm9tICcuLi9jb25zdHJ1Y3RzL2Vjcy1zZXJ2aWNlJztcblxuZXhwb3J0IGludGVyZmFjZSBTZXJ2aWNlU3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcbiAgZW52aXJvbm1lbnQ6IHN0cmluZztcbiAgZW52Q29uZmlnOiBFbnZpcm9ubWVudENvbmZpZztcbiAgdnBjOiBlYzIuVnBjO1xuICBjbHVzdGVyOiBlY3MuQ2x1c3Rlcjtcbn1cblxuZXhwb3J0IGNsYXNzIFNlcnZpY2VTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIHB1YmxpYyByZWFkb25seSBzZXJ2aWNlczogRWNzU2VydmljZUNvbnN0cnVjdFtdID0gW107XG5cbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IFNlcnZpY2VTdGFja1Byb3BzKSB7XG4gICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG5cbiAgICBjb25zdCBhbGxTZXJ2aWNlQ29uZmlncyA9IGxvYWRBbGxTZXJ2aWNlQ29uZmlncyhwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vY29uZmlnL3NlcnZpY2VzJykpO1xuICAgIFxuICAgIGNvbnN0IHNlcnZpY2VDb25maWdzID0gYWxsU2VydmljZUNvbmZpZ3MuZmlsdGVyKGNvbmZpZyA9PiB7XG4gICAgICBpZiAoIWNvbmZpZy5lbnZpcm9ubWVudHMgfHwgY29uZmlnLmVudmlyb25tZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29uZmlnLmVudmlyb25tZW50cy5pbmNsdWRlcyhwcm9wcy5lbnZpcm9ubWVudCk7XG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZyhgRGVwbG95aW5nICR7c2VydmljZUNvbmZpZ3MubGVuZ3RofSBzZXJ2aWNlcyB0byAke3Byb3BzLmVudmlyb25tZW50fSBlbnZpcm9ubWVudGApO1xuICAgIGlmIChhbGxTZXJ2aWNlQ29uZmlncy5sZW5ndGggPiBzZXJ2aWNlQ29uZmlncy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHNraXBwZWRTZXJ2aWNlcyA9IGFsbFNlcnZpY2VDb25maWdzXG4gICAgICAgIC5maWx0ZXIoY29uZmlnID0+IGNvbmZpZy5lbnZpcm9ubWVudHMgJiYgIWNvbmZpZy5lbnZpcm9ubWVudHMuaW5jbHVkZXMocHJvcHMuZW52aXJvbm1lbnQpKVxuICAgICAgICAubWFwKGNvbmZpZyA9PiBjb25maWcubmFtZSk7XG4gICAgICBjb25zb2xlLmxvZyhgU2tpcHBpbmcgc2VydmljZXMgbm90IGNvbmZpZ3VyZWQgZm9yICR7cHJvcHMuZW52aXJvbm1lbnR9OiAke3NraXBwZWRTZXJ2aWNlcy5qb2luKCcsICcpfWApO1xuICAgIH1cblxuICAgIGZvciAoY29uc3Qgc2VydmljZUNvbmZpZyBvZiBzZXJ2aWNlQ29uZmlncykge1xuICAgICAgdmFsaWRhdGVTZXJ2aWNlQ29uZmlnKHNlcnZpY2VDb25maWcpO1xuXG4gICAgICBjb25zdCBlY3NTZXJ2aWNlID0gbmV3IEVjc1NlcnZpY2VDb25zdHJ1Y3QodGhpcywgYFNlcnZpY2UtJHtzZXJ2aWNlQ29uZmlnLm5hbWV9YCwge1xuICAgICAgICBzZXJ2aWNlQ29uZmlnLFxuICAgICAgICBlbnZpcm9ubWVudDogcHJvcHMuZW52aXJvbm1lbnQsXG4gICAgICAgIGVudkNvbmZpZzogcHJvcHMuZW52Q29uZmlnLFxuICAgICAgICB2cGM6IHByb3BzLnZwYyxcbiAgICAgICAgY2x1c3RlcjogcHJvcHMuY2x1c3RlcixcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLnNlcnZpY2VzLnB1c2goZWNzU2VydmljZSk7XG5cbiAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIGAke3NlcnZpY2VDb25maWcubmFtZX0tU2VydmljZUFybmAsIHtcbiAgICAgICAgdmFsdWU6IGVjc1NlcnZpY2Uuc2VydmljZS5zZXJ2aWNlQXJuLFxuICAgICAgICBleHBvcnROYW1lOiBgJHtwcm9wcy5lbnZpcm9ubWVudH0tJHtzZXJ2aWNlQ29uZmlnLm5hbWV9LXNlcnZpY2UtYXJuYCxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoZWNzU2VydmljZS5sb2FkQmFsYW5jZXIpIHtcbiAgICAgICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgYCR7c2VydmljZUNvbmZpZy5uYW1lfS1Mb2FkQmFsYW5jZXJEbnNgLCB7XG4gICAgICAgICAgdmFsdWU6IGVjc1NlcnZpY2UubG9hZEJhbGFuY2VyLmxvYWRCYWxhbmNlckRuc05hbWUsXG4gICAgICAgICAgZXhwb3J0TmFtZTogYCR7cHJvcHMuZW52aXJvbm1lbnR9LSR7c2VydmljZUNvbmZpZy5uYW1lfS1hbGItZG5zYCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=