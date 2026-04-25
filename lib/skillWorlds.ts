export type SkillWorld = {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgGradient: string;
  tagline: string;
  what: string;
  howIUseIt: string[];
  keyFacts: { label: string; value: string }[];
  terminalCommands: { cmd: string; output: string }[];
  category: string;
};

export const skillWorlds: SkillWorld[] = [
  {
    id: "aws",
    name: "Amazon Web Services",
    icon: "☁️",
    color: "#FF9900",
    bgGradient: "from-[#1a0f00] via-[#0a0a0f] to-[#0a0a0f]",
    tagline: "The cloud platform powering everything I build",
    category: "Cloud",
    what: "AWS is the world's most comprehensive cloud platform. It provides 200+ services — from compute (EC2, Lambda) to storage (S3), databases (RDS, DynamoDB), networking (VPC, Route53), and security (IAM, Security Hub). It's the backbone of modern infrastructure.",
    howIUseIt: [
      "Architect and manage VPCs, subnets, security groups, and IAM roles for enterprise-grade environments",
      "Deploy containerized workloads on EKS (Kubernetes) and ECS with auto-scaling",
      "Enable SOC2 compliance using AWS Security Hub with CIS and Foundational Security Best Practices",
      "Tune CloudWatch alarms to reduce false-positives with parameterized thresholds per environment",
      "Manage serverless functions on Lambda and graph databases on Neptune/Neo4j",
    ],
    keyFacts: [
      { label: "Experience", value: "5+ Years" },
      { label: "Certification", value: "SAA-C03" },
      { label: "Services Used", value: "20+" },
      { label: "Environments", value: "Dev · Staging · Prod" },
    ],
    terminalCommands: [
      { cmd: "aws sts get-caller-identity", output: '{\n  "Account": "123456789012",\n  "UserId": "AIDA...",\n  "Arn": "arn:aws:iam::123456789012:user/harsh"\n}' },
      { cmd: "aws eks update-kubeconfig --name prod-cluster --region us-east-1", output: "Updated context arn:aws:eks:us-east-1:...:cluster/prod-cluster in ~/.kube/config" },
      { cmd: "aws s3 sync ./dist s3://my-app-bucket --delete", output: "upload: dist/index.html to s3://my-app-bucket/index.html\nupload: dist/main.js to s3://my-app-bucket/main.js\nCompleted 2 of 2 file(s)" },
    ],
  },
  {
    id: "terraform",
    name: "Terraform",
    icon: "🏗️",
    color: "#7c3aed",
    bgGradient: "from-[#0f0a1a] via-[#0a0a0f] to-[#0a0a0f]",
    tagline: "Infrastructure as code — define everything, automate everything",
    category: "IaC",
    what: "Terraform by HashiCorp lets you define infrastructure as declarative code. Instead of clicking through AWS consoles, you write .tf files that describe your desired state — EC2 instances, VPCs, IAM roles, RDS databases — and Terraform creates, updates, or destroys them automatically.",
    howIUseIt: [
      "Write modular Terraform to provision EC2, EKS, RDS, EFS, ECR, ELB, IAM roles, and S3 across environments",
      "Manage remote state with S3 backends and DynamoDB state locking to prevent conflicts",
      "Deploy GitHub Actions workflows that run terraform plan on PRs and terraform apply on merge to main",
      "Use Terraform workspaces and variable files to manage dev/staging/prod from a single codebase",
      "Implemented security controls — KMS encryption, VPC flow logs, Security Hub standards — all via Terraform",
    ],
    keyFacts: [
      { label: "Experience", value: "4+ Years" },
      { label: "Provider", value: "AWS Primary" },
      { label: "State Backend", value: "S3 + DynamoDB" },
      { label: "Pattern", value: "Module-based" },
    ],
    terminalCommands: [
      { cmd: "terraform init", output: "Initializing modules...\nInitializing the backend...\nInitializing provider plugins...\n✓ Terraform has been successfully initialized!" },
      { cmd: "terraform plan -var-file=prod.tfvars", output: 'Plan: 3 to add, 1 to change, 0 to destroy.\n\n  + aws_eks_cluster.main\n  + aws_rds_instance.db\n  ~ aws_security_group.app (tags updated)' },
      { cmd: "terraform apply -auto-approve", output: "aws_eks_cluster.main: Creating...\naws_rds_instance.db: Creating...\nApply complete! Resources: 3 added, 1 changed, 0 destroyed." },
    ],
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    icon: "⎈",
    color: "#326ce5",
    bgGradient: "from-[#000d1a] via-[#0a0a0f] to-[#0a0a0f]",
    tagline: "Orchestrate containers at scale, automatically",
    category: "Containers",
    what: "Kubernetes (K8s) is an open-source container orchestration platform. It automates deployment, scaling, and management of containerized applications across clusters of machines. It handles self-healing, load balancing, rolling updates, and secrets management.",
    howIUseIt: [
      "Deployed and managed Linux Kubernetes clusters on AWS EKS for production workloads",
      "Wrote Deployments, Services, ConfigMaps, Secrets, and HPA (auto-scaling) manifests",
      "Implemented zero-downtime rolling deployments and blue-green strategies",
      "Set up Prometheus + Grafana to scrape K8s metrics for cluster health monitoring",
      "Containerized sports-tech apps at Hudle with Docker, orchestrated on K8s with production-grade reliability",
    ],
    keyFacts: [
      { label: "Platform", value: "AWS EKS" },
      { label: "Experience", value: "4+ Years" },
      { label: "Pattern", value: "GitOps" },
      { label: "Monitoring", value: "Prometheus + Grafana" },
    ],
    terminalCommands: [
      { cmd: "kubectl get pods -n production", output: "NAME                          READY   STATUS    RESTARTS   AGE\napi-deployment-7d9f8b-xk2p   1/1     Running   0          2d\nworker-5c6d4f-mn8q            1/1     Running   0          2d" },
      { cmd: "kubectl rollout status deployment/api-deployment", output: "Waiting for deployment \"api-deployment\" rollout to finish...\n1 of 3 updated replicas are available...\ndeployment \"api-deployment\" successfully rolled out" },
      { cmd: "kubectl autoscale deployment api-deployment --cpu-percent=70 --min=2 --max=10", output: "horizontalpodautoscaler.autoscaling/api-deployment autoscaled" },
    ],
  },
  {
    id: "docker",
    name: "Docker",
    icon: "🐳",
    color: "#2496ed",
    bgGradient: "from-[#001020] via-[#0a0a0f] to-[#0a0a0f]",
    tagline: "Package once, run anywhere",
    category: "Containers",
    what: "Docker lets you package an application and all its dependencies into a portable container. Unlike VMs, containers share the host OS kernel, making them lightweight and fast. Docker images are built from Dockerfiles and stored in registries like ECR or Docker Hub.",
    howIUseIt: [
      "Containerized applications across multiple projects — Node.js, Python, Java — with optimized multi-stage Dockerfiles",
      "Managed Docker images in AWS ECR with lifecycle policies to control storage costs",
      "Built Docker Compose setups for local development environments mirroring production",
      "Integrated Docker builds into GitHub Actions and Jenkins CI/CD pipelines",
      "Pushed hardened images with non-root users, minimal base images, and vulnerability scanning",
    ],
    keyFacts: [
      { label: "Registry", value: "AWS ECR" },
      { label: "Experience", value: "5+ Years" },
      { label: "Build Tool", value: "Multi-stage builds" },
      { label: "CI Integration", value: "GitHub Actions" },
    ],
    terminalCommands: [
      { cmd: "docker build -t my-app:latest --target prod .", output: "[1/3] FROM node:20-alpine\n[2/3] RUN npm ci --only=production\n[3/3] COPY --from=builder /app/dist .\nSuccessfully built a1b2c3d4e5f6\nSuccessfully tagged my-app:latest" },
      { cmd: "docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/my-app:latest", output: "The push refers to repository [123456789.dkr.ecr.us-east-1.amazonaws.com/my-app]\nlatest: digest: sha256:abc123... size: 1234" },
      { cmd: "docker stats --no-stream", output: "CONTAINER   CPU %   MEM USAGE / LIMIT   NET I/O\napi         0.5%    128MiB / 512MiB     1.2MB / 800kB" },
    ],
  },
  {
    id: "github-actions",
    name: "GitHub Actions",
    icon: "⚙️",
    color: "#00d4ff",
    bgGradient: "from-[#001a1a] via-[#0a0a0f] to-[#0a0a0f]",
    tagline: "Automate everything from code to cloud",
    category: "CI/CD",
    what: "GitHub Actions is a CI/CD platform built into GitHub. You define workflows in YAML that trigger on events (push, PR, schedule). Jobs run on GitHub-hosted or self-hosted runners and can build, test, scan, and deploy your application automatically.",
    howIUseIt: [
      "Built CI/CD pipelines that run tests, build Docker images, push to ECR, and deploy to EKS on merge to main",
      "Designed deployment approval gates using GitHub Environments — production requires manual review",
      "Automated Terraform plan/apply workflows with PR comments showing infrastructure diffs",
      "Set up reusable workflow templates across multiple repositories for consistent DevOps standards",
      "Integrated AWS OIDC authentication — no long-lived secrets, temporary credentials only",
    ],
    keyFacts: [
      { label: "Experience", value: "4+ Years" },
      { label: "Auth Method", value: "OIDC (no secrets)" },
      { label: "Pattern", value: "GitOps" },
      { label: "Environments", value: "Dev · Staging · Prod" },
    ],
    terminalCommands: [
      { cmd: "# .github/workflows/deploy.yml", output: "on:\n  push:\n    branches: [main]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: terraform apply -auto-approve" },
      { cmd: "gh workflow run deploy.yml --ref main", output: "✓ Created workflow_dispatch event for deploy.yml at main\n\nTo see runs for this workflow, try: gh run list --workflow=deploy.yml" },
      { cmd: "gh run watch 12345678", output: "Refreshing run status every 3 seconds. Press Ctrl+C to quit.\n\n✓ main deploy.yml · 12345678\nTriggered via push about 2 minutes ago\n\n  ✓ build    1m30s\n  ✓ deploy   45s" },
    ],
  },
  {
    id: "prometheus",
    name: "Prometheus & Grafana",
    icon: "📊",
    color: "#f59e0b",
    bgGradient: "from-[#1a1000] via-[#0a0a0f] to-[#0a0a0f]",
    tagline: "See everything that's happening in your infrastructure",
    category: "Observability",
    what: "Prometheus is an open-source metrics collection and alerting system. It scrapes time-series data from your services via HTTP. Grafana is the visualization layer — it connects to Prometheus (and other sources) to build beautiful dashboards showing CPU, memory, request rates, error rates, and custom business metrics.",
    howIUseIt: [
      "Set up the full Prometheus + Grafana + Alertmanager stack for production Kubernetes clusters",
      "Wrote custom PromQL queries to track application latency, error rates, and pod health",
      "Built Grafana dashboards for engineering teams showing real-time application and infrastructure health",
      "Configured alerting rules that page on-call when SLOs are breached",
      "Tuned CloudWatch alarm thresholds at Caylent to reduce false-positive pages",
    ],
    keyFacts: [
      { label: "Stack", value: "Prometheus + Grafana" },
      { label: "Alerting", value: "Alertmanager" },
      { label: "Platform", value: "Kubernetes" },
      { label: "Experience", value: "4+ Years" },
    ],
    terminalCommands: [
      { cmd: "# PromQL — HTTP error rate", output: "rate(http_requests_total{status=~\"5..\"}[5m])\n/ rate(http_requests_total[5m]) * 100\n\n→ Result: 0.12% error rate (healthy ✓)" },
      { cmd: "# PromQL — p99 latency", output: "histogram_quantile(0.99,\n  rate(http_request_duration_seconds_bucket[5m]))\n\n→ Result: 0.245s p99 latency" },
      { cmd: "curl -s http://prometheus:9090/api/v1/query?query=up | jq '.data.result | length'", output: "42\n# 42 targets currently being scraped ✓" },
    ],
  },
  {
    id: "elk",
    name: "ELK Stack",
    icon: "🔍",
    color: "#10b981",
    bgGradient: "from-[#001a10] via-[#0a0a0f] to-[#0a0a0f]",
    tagline: "Centralize logs, search everything, debug instantly",
    category: "Observability",
    what: "ELK stands for Elasticsearch, Logstash, and Kibana. Elasticsearch stores and indexes logs. Logstash (or Filebeat) collects and ships logs from applications. Kibana provides a web UI to search, visualize, and analyze log data. It's essential for debugging distributed systems.",
    howIUseIt: [
      "Set up and maintained the ELK stack for centralized logging across multiple microservices",
      "Configured Filebeat agents on each node to ship application and system logs to Elasticsearch",
      "Built Kibana dashboards and saved searches for engineers to debug production issues",
      "Set up index lifecycle management (ILM) policies to manage storage costs automatically",
      "Used Elasticsearch queries to trace request flows across services during incidents",
    ],
    keyFacts: [
      { label: "Components", value: "ES + Logstash + Kibana" },
      { label: "Log Shipper", value: "Filebeat" },
      { label: "Platform", value: "Kubernetes + EC2" },
      { label: "Experience", value: "4+ Years" },
    ],
    terminalCommands: [
      { cmd: "# Search logs for errors in last hour", output: "GET /logs-*/_search\n{\n  \"query\": { \"match\": { \"level\": \"ERROR\" } },\n  \"sort\": [{ \"@timestamp\": \"desc\" }]\n}\n→ Found 12 errors in last 60 minutes" },
      { cmd: "curl -X GET 'http://elasticsearch:9200/_cluster/health?pretty'", output: '{\n  "status": "green",\n  "number_of_nodes": 3,\n  "active_shards": 45,\n  "unassigned_shards": 0\n}' },
      { cmd: "# Check index sizes", output: "filebeat-2025.04    green  45.2gb  3 shards\napp-logs-2025.04    green  12.8gb  2 shards\nnginx-logs-2025.04  green   8.1gb  1 shard" },
    ],
  },
  {
    id: "jenkins",
    name: "Jenkins",
    icon: "🤖",
    color: "#d33833",
    bgGradient: "from-[#1a0000] via-[#0a0a0f] to-[#0a0a0f]",
    tagline: "The battle-hardened automation server",
    category: "CI/CD",
    what: "Jenkins is an open-source automation server used for building, testing, and deploying software. It's the most widely used CI/CD tool in enterprises. Pipelines are defined as Jenkinsfile (Groovy) and support complex multi-stage workflows, parallel execution, and integrations with hundreds of plugins.",
    howIUseIt: [
      "Built and maintained Jenkins pipelines for multiple development teams at Squareboat and Hudle",
      "Wrote declarative Jenkinsfiles for build → test → Docker build → ECR push → EKS deploy flows",
      "Set up Jenkins on Kubernetes using the Kubernetes plugin for ephemeral build agents",
      "Configured pipeline notifications to Slack and email on build failures",
      "Migrated legacy Jenkins jobs to modern declarative pipelines with shared libraries",
    ],
    keyFacts: [
      { label: "Pipeline Type", value: "Declarative" },
      { label: "Agents", value: "Kubernetes pods" },
      { label: "Experience", value: "4+ Years" },
      { label: "Plugins", value: "K8s · AWS · Slack" },
    ],
    terminalCommands: [
      { cmd: "# Jenkinsfile — declarative pipeline", output: "pipeline {\n  agent { kubernetes { yaml agentYaml } }\n  stages {\n    stage('Build') { steps { sh 'npm ci && npm run build' } }\n    stage('Docker') { steps { sh 'docker build -t $IMAGE .' } }\n    stage('Deploy') { steps { sh 'kubectl apply -f k8s/' } }\n  }\n}" },
      { cmd: "java -jar jenkins-cli.jar -s http://jenkins:8080 build my-pipeline -p ENV=prod", output: "Started my-pipeline #142\nWaiting for build to complete...\nBuild #142 completed: SUCCESS" },
    ],
  },
];

export const skillCategories = ["All", "Cloud", "IaC", "Containers", "CI/CD", "Observability"];
