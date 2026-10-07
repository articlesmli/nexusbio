import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import { Construct } from 'constructs';

interface ComputeStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  auditTable: cdk.aws_dynamodb.ITable;
  dataLakeBucket: cdk.aws_s3.IBucket;
}

export class ComputeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    // ECS Fargate container behind an Application Load Balancer (ALB)
    const cluster = new ecs.Cluster(this, 'SandboxCluster', { vpc: props.vpc });

    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'SandboxServiceV4', {
      cluster,
      memoryLimitMiB: 2048,
      cpu: 1024,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../cheminformatics_sandbox'),
        containerPort: 8000,
      },
      publicLoadBalancer: true, // Public ALB to route incoming traffic
    });

    // Configure health check path for the Application Load Balancer target group
    fargateService.targetGroup.configureHealthCheck({
      path: '/health',
    });

    // Lambda Orchestrator Function
    const orchestratorFunction = new lambda.Function(this, 'LambdaOrchestrator', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'handler.lambda_handler',
      code: lambda.Code.fromAsset('../lambda_orchestrator'),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      timeout: cdk.Duration.seconds(60),
      environment: {
        AUDIT_TABLE_NAME: props.auditTable.tableName,
        DATALAKE_BUCKET: props.dataLakeBucket.bucketName,
        SANDBOX_API_URL: `http://${fargateService.loadBalancer.loadBalancerDnsName}:8000/evaluate-smiles`,
      },
    });

    // Grant least-privilege resource access
    props.dataLakeBucket.grantReadWrite(orchestratorFunction);
    props.auditTable.grantWriteData(orchestratorFunction);
  }
}