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
    account: '089340569022',
    region: process.env.CDK_DEFAULT_REGION || 'eu-west-2'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV4dXNiaW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJuZXh1c2Jpby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx1Q0FBcUM7QUFDckMsbUNBQW1DO0FBQ25DLDhEQUEwRDtBQUMxRCx3REFBb0Q7QUFDcEQsd0RBQW9EO0FBRXBELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTFCLE1BQU0sR0FBRyxHQUFHO0lBQ1YsT0FBTyxFQUFFLGNBQWM7SUFDdkIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLElBQUksV0FBVztDQUN0RCxDQUFDO0FBRUYsc0NBQXNDO0FBQ3RDLE1BQU0sZUFBZSxHQUFHLElBQUksa0NBQWUsQ0FBQyxHQUFHLEVBQUUseUJBQXlCLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBRXJGLHFFQUFxRTtBQUNyRSxNQUFNLFlBQVksR0FBRyxJQUFJLDRCQUFZLENBQUMsR0FBRyxFQUFFLHNCQUFzQixFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUU1RSwrREFBK0Q7QUFDL0QsTUFBTSxZQUFZLEdBQUcsSUFBSSw0QkFBWSxDQUFDLEdBQUcsRUFBRSxzQkFBc0IsRUFBRTtJQUNqRSxHQUFHO0lBQ0gsR0FBRyxFQUFFLGVBQWUsQ0FBQyxHQUFHO0lBQ3hCLGNBQWMsRUFBRSxZQUFZLENBQUMsY0FBYztJQUMzQyxVQUFVLEVBQUUsWUFBWSxDQUFDLFVBQVU7Q0FDcEMsQ0FBQyxDQUFDO0FBRUgsbURBQW1EO0FBQ25ELFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNqRCxZQUFZLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUM7QUFFOUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDIn0=