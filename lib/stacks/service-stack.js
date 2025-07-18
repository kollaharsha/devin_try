"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceStack = void 0;
const cdk = require("aws-cdk-lib");
const config_loader_1 = require("../utils/config-loader");
const ecs_service_1 = require("../constructs/ecs-service");
class ServiceStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        this.services = [];
        const serviceConfigs = (0, config_loader_1.loadServiceConfigs)();
        for (const serviceConfig of serviceConfigs) {
            (0, config_loader_1.validateServiceConfig)(serviceConfig);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZpY2Utc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBS25DLDBEQUFtRjtBQUNuRiwyREFBZ0U7QUFTaEUsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFHekMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF3QjtRQUNoRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUhWLGFBQVEsR0FBMEIsRUFBRSxDQUFDO1FBS25ELE1BQU0sY0FBYyxHQUFHLElBQUEsa0NBQWtCLEdBQUUsQ0FBQztRQUU1QyxLQUFLLE1BQU0sYUFBYSxJQUFJLGNBQWMsRUFBRTtZQUMxQyxJQUFBLHFDQUFxQixFQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRXJDLE1BQU0sVUFBVSxHQUFHLElBQUksaUNBQW1CLENBQUMsSUFBSSxFQUFFLFdBQVcsYUFBYSxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUNoRixhQUFhO2dCQUNiLFdBQVcsRUFBRSxLQUFLLENBQUMsV0FBVztnQkFDOUIsU0FBUyxFQUFFLEtBQUssQ0FBQyxTQUFTO2dCQUMxQixHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUc7Z0JBQ2QsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO2FBQ3ZCLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRS9CLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxhQUFhLENBQUMsSUFBSSxhQUFhLEVBQUU7Z0JBQzFELEtBQUssRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVU7Z0JBQ3BDLFVBQVUsRUFBRSxHQUFHLEtBQUssQ0FBQyxXQUFXLElBQUksYUFBYSxDQUFDLElBQUksY0FBYzthQUNyRSxDQUFDLENBQUM7WUFFSCxJQUFJLFVBQVUsQ0FBQyxZQUFZLEVBQUU7Z0JBQzNCLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxhQUFhLENBQUMsSUFBSSxrQkFBa0IsRUFBRTtvQkFDL0QsS0FBSyxFQUFFLFVBQVUsQ0FBQyxZQUFZLENBQUMsbUJBQW1CO29CQUNsRCxVQUFVLEVBQUUsR0FBRyxLQUFLLENBQUMsV0FBVyxJQUFJLGFBQWEsQ0FBQyxJQUFJLFVBQVU7aUJBQ2pFLENBQUMsQ0FBQzthQUNKO1NBQ0Y7SUFDSCxDQUFDO0NBQ0Y7QUFsQ0Qsb0NBa0NDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGVjMiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWMyJztcbmltcG9ydCAqIGFzIGVjcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWNzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgRW52aXJvbm1lbnRDb25maWcgfSBmcm9tICcuLi91dGlscy9lbnZpcm9ubWVudCc7XG5pbXBvcnQgeyBsb2FkU2VydmljZUNvbmZpZ3MsIHZhbGlkYXRlU2VydmljZUNvbmZpZyB9IGZyb20gJy4uL3V0aWxzL2NvbmZpZy1sb2FkZXInO1xuaW1wb3J0IHsgRWNzU2VydmljZUNvbnN0cnVjdCB9IGZyb20gJy4uL2NvbnN0cnVjdHMvZWNzLXNlcnZpY2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFNlcnZpY2VTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICBlbnZpcm9ubWVudDogc3RyaW5nO1xuICBlbnZDb25maWc6IEVudmlyb25tZW50Q29uZmlnO1xuICB2cGM6IGVjMi5WcGM7XG4gIGNsdXN0ZXI6IGVjcy5DbHVzdGVyO1xufVxuXG5leHBvcnQgY2xhc3MgU2VydmljZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgcHVibGljIHJlYWRvbmx5IHNlcnZpY2VzOiBFY3NTZXJ2aWNlQ29uc3RydWN0W10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogU2VydmljZVN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IHNlcnZpY2VDb25maWdzID0gbG9hZFNlcnZpY2VDb25maWdzKCk7XG5cbiAgICBmb3IgKGNvbnN0IHNlcnZpY2VDb25maWcgb2Ygc2VydmljZUNvbmZpZ3MpIHtcbiAgICAgIHZhbGlkYXRlU2VydmljZUNvbmZpZyhzZXJ2aWNlQ29uZmlnKTtcblxuICAgICAgY29uc3QgZWNzU2VydmljZSA9IG5ldyBFY3NTZXJ2aWNlQ29uc3RydWN0KHRoaXMsIGBTZXJ2aWNlLSR7c2VydmljZUNvbmZpZy5uYW1lfWAsIHtcbiAgICAgICAgc2VydmljZUNvbmZpZyxcbiAgICAgICAgZW52aXJvbm1lbnQ6IHByb3BzLmVudmlyb25tZW50LFxuICAgICAgICBlbnZDb25maWc6IHByb3BzLmVudkNvbmZpZyxcbiAgICAgICAgdnBjOiBwcm9wcy52cGMsXG4gICAgICAgIGNsdXN0ZXI6IHByb3BzLmNsdXN0ZXIsXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zZXJ2aWNlcy5wdXNoKGVjc1NlcnZpY2UpO1xuXG4gICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCBgJHtzZXJ2aWNlQ29uZmlnLm5hbWV9LVNlcnZpY2VBcm5gLCB7XG4gICAgICAgIHZhbHVlOiBlY3NTZXJ2aWNlLnNlcnZpY2Uuc2VydmljZUFybixcbiAgICAgICAgZXhwb3J0TmFtZTogYCR7cHJvcHMuZW52aXJvbm1lbnR9LSR7c2VydmljZUNvbmZpZy5uYW1lfS1zZXJ2aWNlLWFybmAsXG4gICAgICB9KTtcblxuICAgICAgaWYgKGVjc1NlcnZpY2UubG9hZEJhbGFuY2VyKSB7XG4gICAgICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsIGAke3NlcnZpY2VDb25maWcubmFtZX0tTG9hZEJhbGFuY2VyRG5zYCwge1xuICAgICAgICAgIHZhbHVlOiBlY3NTZXJ2aWNlLmxvYWRCYWxhbmNlci5sb2FkQmFsYW5jZXJEbnNOYW1lLFxuICAgICAgICAgIGV4cG9ydE5hbWU6IGAke3Byb3BzLmVudmlyb25tZW50fS0ke3NlcnZpY2VDb25maWcubmFtZX0tYWxiLWRuc2AsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19