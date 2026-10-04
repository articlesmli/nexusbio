#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkingStack } from '../lib/networking_stack';
import { StorageStack } from '../lib/storage_stack';
import { ComputeStack } from '../lib/compute_stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// 1. Networking Stack (VPC & Subnets)
const networkingStack = new NetworkingStack(app, 'NexusBioNetworkingStack', { env });

// 2. Storage & Knowledge Stack (S3, DynamoDB, OpenSearch Serverless)
const storageStack = new StorageStack(app, 'NexusBioStorageStack', { env });

// 3. Compute Stack (ECS Fargate Sandbox & Lambda Orchestrator)
const computeStack = new ComputeStack(app, 'NexusBioComputeStack', {
  env,
  vpc: networkingStack.vpc,
  dataLakeBucket: storageStack.dataLakeBucket,
  auditTable: storageStack.auditTable,
});

// Explicit dependency mapping using the modern API
computeStack.addStackDependency(networkingStack);
computeStack.addStackDependency(storageStack);

app.synth();