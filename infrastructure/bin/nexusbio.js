#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const networking_stack_1 = require("../lib/networking_stack");
const storage_stack_1 = require("../lib/storage_stack");
const compute_stack_1 = require("../lib/compute_stack");
const app = new cdk.App();
const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};
// 1. Networking Stack (VPC & Subnets)
const networkingStack = new networking_stack_1.NetworkingStack(app, 'NexusBioNetworkingStack', { env });
// 2. Storage & Knowledge Stack (S3, DynamoDB, OpenSearch Serverless)
const storageStack = new storage_stack_1.StorageStack(app, 'NexusBioStorageStack', { env });
// 3. Compute Stack (ECS Fargate Sandbox & Lambda Orchestrator)
const computeStack = new compute_stack_1.ComputeStack(app, 'NexusBioComputeStack', {
    env,
    vpc: networkingStack.vpc,
    dataLakeBucket: storageStack.dataLakeBucket,
    auditTable: storageStack.auditTable,
});
// Explicit dependency mapping using the modern API
computeStack.addStackDependency(networkingStack);
computeStack.addStackDependency(storageStack);
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV4dXNiaW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJuZXh1c2Jpby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx1Q0FBcUM7QUFDckMsbUNBQW1DO0FBQ25DLDhEQUEwRDtBQUMxRCx3REFBb0Q7QUFDcEQsd0RBQW9EO0FBRXBELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTFCLE1BQU0sR0FBRyxHQUFHO0lBQ1YsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CO0lBQ3hDLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixJQUFJLFdBQVc7Q0FDdEQsQ0FBQztBQUVGLHNDQUFzQztBQUN0QyxNQUFNLGVBQWUsR0FBRyxJQUFJLGtDQUFlLENBQUMsR0FBRyxFQUFFLHlCQUF5QixFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUVyRixxRUFBcUU7QUFDckUsTUFBTSxZQUFZLEdBQUcsSUFBSSw0QkFBWSxDQUFDLEdBQUcsRUFBRSxzQkFBc0IsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFFNUUsK0RBQStEO0FBQy9ELE1BQU0sWUFBWSxHQUFHLElBQUksNEJBQVksQ0FBQyxHQUFHLEVBQUUsc0JBQXNCLEVBQUU7SUFDakUsR0FBRztJQUNILEdBQUcsRUFBRSxlQUFlLENBQUMsR0FBRztJQUN4QixjQUFjLEVBQUUsWUFBWSxDQUFDLGNBQWM7SUFDM0MsVUFBVSxFQUFFLFlBQVksQ0FBQyxVQUFVO0NBQ3BDLENBQUMsQ0FBQztBQUVILG1EQUFtRDtBQUNuRCxZQUFZLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDakQsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO0FBRTlDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyJ9