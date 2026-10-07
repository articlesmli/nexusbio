"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeStack = void 0;
const cdk = require("aws-cdk-lib");
const ec2 = require("aws-cdk-lib/aws-ec2");
const lambda = require("aws-cdk-lib/aws-lambda");
const python = require("@aws-cdk/aws-lambda-python-alpha");
const ecs = require("aws-cdk-lib/aws-ecs");
const ecs_patterns = require("aws-cdk-lib/aws-ecs-patterns");
class ComputeStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const cluster = new ecs.Cluster(this, 'SandboxCluster', { vpc: props.vpc });
        const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'SandboxServiceV4', {
            cluster,
            memoryLimitMiB: 2048,
            cpu: 1024,
            taskImageOptions: {
                image: ecs.ContainerImage.fromAsset('../cheminformatics_sandbox'),
                containerPort: 8000,
            },
            publicLoadBalancer: true,
        });
        fargateService.targetGroup.configureHealthCheck({
            path: '/health',
        });
        // PythonFunction automatically packages requirements.txt dependencies via Docker
        const orchestratorFunction = new python.PythonFunction(this, 'LambdaOrchestrator', {
            entry: '../lambda_orchestrator',
            runtime: lambda.Runtime.PYTHON_3_11,
            index: 'handler.py',
            handler: 'lambda_handler',
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
exports.ComputeStack = ComputeStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcHV0ZV9zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbXB1dGVfc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDJDQUEyQztBQUMzQyxpREFBaUQ7QUFDakQsMkRBQTJEO0FBQzNELDJDQUEyQztBQUMzQyw2REFBNkQ7QUFTN0QsTUFBYSxZQUFhLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDekMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF3QjtRQUNoRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRTVFLE1BQU0sY0FBYyxHQUFHLElBQUksWUFBWSxDQUFDLHFDQUFxQyxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUN0RyxPQUFPO1lBQ1AsY0FBYyxFQUFFLElBQUk7WUFDcEIsR0FBRyxFQUFFLElBQUk7WUFDVCxnQkFBZ0IsRUFBRTtnQkFDaEIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLDRCQUE0QixDQUFDO2dCQUNqRSxhQUFhLEVBQUUsSUFBSTthQUNwQjtZQUNELGtCQUFrQixFQUFFLElBQUk7U0FDekIsQ0FBQyxDQUFDO1FBRUgsY0FBYyxDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQztZQUM5QyxJQUFJLEVBQUUsU0FBUztTQUNoQixDQUFDLENBQUM7UUFFSCxpRkFBaUY7UUFDakYsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQ2pGLEtBQUssRUFBRSx3QkFBd0I7WUFDL0IsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztZQUNuQyxLQUFLLEVBQUUsWUFBWTtZQUNuQixPQUFPLEVBQUUsZ0JBQWdCO1lBQ3pCLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRztZQUNkLFVBQVUsRUFBRSxFQUFFLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLG1CQUFtQixFQUFFO1lBQzlELE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDakMsV0FBVyxFQUFFO2dCQUNYLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUztnQkFDNUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxjQUFjLENBQUMsVUFBVTtnQkFDaEQsZUFBZSxFQUFFLFVBQVUsY0FBYyxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsdUJBQXVCO2FBQ2xHO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsS0FBSyxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUMxRCxLQUFLLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ3hELENBQUM7Q0FDRjtBQXhDRCxvQ0F3Q0MifQ==