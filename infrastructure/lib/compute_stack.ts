import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface ComputeStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  dataLakeBucket: s3.IBucket;
  auditTable: dynamodb.ITable;
}

export class ComputeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, 'SandboxCluster', { vpc: props.vpc });

    // MUST BE ApplicationLoadBalancedFargateService (NOT NetworkLoadBalancedFargateService)
    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'SandboxServiceV3', {
      cluster,
      memoryLimitMiB: 2048,
      cpu: 1024,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../../cheminformatics_sandbox'),
        containerPort: 8000,
        environment: {
          PYTHONUNBUFFERED: '1',
        },
      },
      publicLoadBalancer: false,
      listenerPort: 8000,
      circuitBreaker: { rollback: true },
      minHealthyPercent: 0,
    });

    // Configured for your /health endpoint
    fargateService.targetGroup.configureHealthCheck({
      path: '/health',
      port: '8000',
      healthyHttpCodes: '200-299',
      interval: cdk.Duration.seconds(30),
      timeout: cdk.Duration.seconds(5),
    });

    fargateService.taskDefinition.addToExecutionRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ],
        resources: ["arn:aws:ecr:eu-west-2:089340569022:repository/nexusbio-sandbox-base"]
      })
    );

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

    props.dataLakeBucket.grantReadWrite(orchestratorFunction);
    props.auditTable.grantWriteData(orchestratorFunction);
  }
}