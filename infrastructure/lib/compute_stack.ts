import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecs_patterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as iam from 'aws-cdk-lib/aws-iam'; // 👈 Added IAM import for ECR permissions
import { Construct } from 'constructs';

interface ComputeStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  dataLakeBucket: s3.IBucket;
  auditTable: dynamodb.ITable;
}

export class ComputeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    // [Point 3] Cheminformatics Sandbox: ECS Fargate container behind an Internal ALB
    const cluster = new ecs.Cluster(this, 'SandboxCluster', { vpc: props.vpc });

    const fargateService = new ecs_patterns.NetworkLoadBalancedFargateService(this, 'SandboxService', {
      cluster,
      memoryLimitMiB: 2048,
      cpu: 1024,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset('../cheminformatics_sandbox'),
        containerPort: 8000,
      },
      publicLoadBalancer: false,    // Internal-only access restricted within VPC
      listenerPort: 8000,           // Exposes port 8000 externally on the NLB
      circuitBreaker: { rollback: true }, // 👈 Added: Rollback quickly if tasks crash on startup
      minHealthyPercent: 0,         // 👈 Added: Prevents deployment bottlenecks during startup
    });

    // Forces the Network Load Balancer health checks to target your verified /health endpoint on port 8000
    fargateService.targetGroup.configureHealthCheck({
      port: '8000',
      path: '/health',              // 👈 Updated to use your functional FastAPI health route
    });

    // Grant the ECS Task Execution Role explicit rights to pull your custom ECR base layer image
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

    // [Point 1] Lambda Orchestrator Function (ZIP deployment inside VPC)
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
