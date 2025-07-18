import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';
import { ServiceConfig } from '../types/service-config';
import { EnvironmentConfig } from '../utils/environment';

export interface LoadBalancerConstructProps {
  serviceConfig: ServiceConfig;
  environment: string;
  envConfig: EnvironmentConfig;
  vpc: ec2.Vpc;
  service: ecs.FargateService;
  serviceSecurityGroup: ec2.SecurityGroup;
}

export class LoadBalancerConstruct extends Construct {
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;
  public readonly targetGroup: elbv2.ApplicationTargetGroup;
  public readonly listener: elbv2.ApplicationListener;

  constructor(scope: Construct, id: string, props: LoadBalancerConstructProps) {
    super(scope, id);

    const { serviceConfig, environment, envConfig, vpc, service, serviceSecurityGroup } = props;

    const lbSecurityGroup = new ec2.SecurityGroup(this, 'LoadBalancerSecurityGroup', {
      vpc,
      description: `Security group for ${serviceConfig.name} load balancer`,
      allowAllOutbound: true,
    });

    lbSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP');
    lbSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS');

    serviceSecurityGroup.addIngressRule(
      lbSecurityGroup,
      ec2.Port.tcp(serviceConfig.port),
      `Allow ALB to reach ${serviceConfig.name} service`
    );

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

    let certificate: certificatemanager.ICertificate | undefined;
    if (serviceConfig.security?.certificateArn) {
      certificate = certificatemanager.Certificate.fromCertificateArn(
        this,
        'Certificate',
        serviceConfig.security.certificateArn
      );
    } else if (envConfig.certificateArn) {
      certificate = certificatemanager.Certificate.fromCertificateArn(
        this,
        'Certificate',
        envConfig.certificateArn
      );
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
    } else {
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
