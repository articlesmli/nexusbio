"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeStack = void 0;
const cdk = require("aws-cdk-lib");
const ec2 = require("aws-cdk-lib/aws-ec2");
const lambda = require("aws-cdk-lib/aws-lambda");
const ecs = require("aws-cdk-lib/aws-ecs");
const ecs_patterns = require("aws-cdk-lib/aws-ecs-patterns");
class ComputeStack extends cdk.Stack {
    constructor(scope, id, props) {
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
            publicLoadBalancer: false, // Internal-only access restricted within VPC
        });
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
exports.ComputeStack = ComputeStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcHV0ZV9zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbXB1dGVfc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUczQyxpREFBaUQ7QUFDakQsMkNBQTJDO0FBQzNDLDZEQUE2RDtBQVM3RCxNQUFhLFlBQWEsU0FBUSxHQUFHLENBQUMsS0FBSztJQUN6QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXdCO1FBQ2hFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLGtGQUFrRjtRQUNsRixNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRTVFLE1BQU0sY0FBYyxHQUFHLElBQUksWUFBWSxDQUFDLGlDQUFpQyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUNoRyxPQUFPO1lBQ1AsY0FBYyxFQUFFLElBQUk7WUFDcEIsR0FBRyxFQUFFLElBQUk7WUFDVCxnQkFBZ0IsRUFBRTtnQkFDaEIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLDRCQUE0QixDQUFDO2dCQUNqRSxhQUFhLEVBQUUsSUFBSTthQUNwQjtZQUNELGtCQUFrQixFQUFFLEtBQUssRUFBRSw2Q0FBNkM7U0FDekUsQ0FBQyxDQUFDO1FBRUgscUVBQXFFO1FBQ3JFLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxvQkFBb0IsRUFBRTtZQUMzRSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSx3QkFBd0I7WUFDakMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUFDO1lBQ3JELEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRztZQUNkLFVBQVUsRUFBRSxFQUFFLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFO1lBQzlELE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDakMsV0FBVyxFQUFFO2dCQUNYLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUztnQkFDNUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsVUFBVTtnQkFDaEQsZUFBZSxFQUFFLFVBQVUsY0FBYyxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsdUJBQXVCO2FBQ2xHO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsd0NBQXdDO1FBQ3hDLEtBQUssQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDMUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUN4RCxDQUFDO0NBQ0Y7QUFyQ0Qsb0NBcUNDIn0=