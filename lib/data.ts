export const personalInfo = {
  name: "Harsh Dixit",
  title: "Senior Cloud & DevOps Engineer",
  tagline: "AWS SAA-C03 Certified · 5+ Years Experience",
  summary:
    "Experienced DevOps professional with 5+ years of expertise in crafting, executing, and overseeing intricate cloud infrastructures. Skilled in utilizing various DevOps tools and methodologies, with extensive knowledge in automating infrastructures and managing configurations at scale.",
  email: "Harshdixit23mar@gmail.com",
  phone: "+91 8949827264",
  location: "India",
  github: "https://github.com/harsh785",
  linkedin: "https://www.linkedin.com/in/harsh-dixit-156a371b0",
};

export const experiences = [
  {
    role: "Senior Cloud Engineer",
    company: "Caylent",
    type: "Full-time · Remote",
    location: "Irvine, California, US",
    duration: "Dec 2025 – Present",
    current: true,
    highlights: [
      "Designed and implemented CI/CD deployment approval gates using GitHub Environments, ensuring production deployments require manual review while keeping dev/staging fast.",
      "Enabled AWS Security Hub with CIS and AWS Foundational Security Best Practices standards across all environments for SOC2 compliance.",
      "Tuned CloudWatch monitoring to reduce false-positive alerts by parameterizing alarm thresholds per environment.",
      "Infrastructure managed with Terraform, deployed via GitHub Actions, running on EKS, Lambda, Neptune/Neo4j, and RDS.",
    ],
    skills: ["AWS", "Terraform", "GitHub Actions", "EKS", "Lambda", "Neo4j", "SOC2", "CloudWatch"],
  },
  {
    role: "Senior DevOps Engineer",
    company: "Hudle",
    type: "Full-time · On-site",
    location: "South Delhi, India",
    duration: "Nov 2024 – Dec 2025",
    current: false,
    highlights: [
      "Solely managed and optimized the entire DevOps lifecycle at Hudle, a fast-growing sports-tech startup, including deployment automation, monitoring, and cost optimization.",
      "Built and maintained CI/CD pipelines using GitHub Actions and Jenkins, enabling faster and more reliable software releases.",
      "Designed and deployed scalable infrastructure on AWS using Terraform and CloudFormation, with a focus on high availability and cloud security.",
      "Containerized applications with Docker and orchestrated them using Kubernetes, implementing auto-scaling and production-grade reliability.",
      "Set up observability stack with Prometheus, Grafana, and the ELK stack to monitor application health and troubleshoot performance bottlenecks.",
    ],
    skills: ["AWS", "Kubernetes", "Docker", "Jenkins", "GitHub Actions", "Terraform", "Prometheus", "Grafana", "ELK"],
  },
  {
    role: "Senior DevOps Engineer",
    company: "Squareboat Solutions",
    type: "Full-time · Hybrid",
    location: "Gurugram, India",
    duration: "Jan 2024 – Jul 2024",
    current: false,
    highlights: [
      "Managed DevOps for various projects involving different development teams and multiple simultaneous software releases.",
      "Gained expertise in Amazon AWS Cloud Administration — EC2, S3, Glacier, EBS, VPC, ELB, AMI, SNS, RDS, IAM, Route 53, Auto Scaling, CloudFront, and CloudWatch.",
      "Wrote Terraform scripts to provision AWS resources: EC2, EFS, ECR, ECS, ELB, IAM roles, and S3.",
      "Deployed, automated, and maintained web-scale infrastructure; helped upskill and train the team.",
    ],
    skills: ["AWS", "Terraform", "Ansible", "CloudFormation", "Docker"],
  },
  {
    role: "DevOps Engineer",
    company: "Squareboat Solutions",
    type: "Full-time",
    location: "Gurugram, India",
    duration: "Jul 2022 – Jan 2024",
    current: false,
    highlights: [
      "Set up and maintained logging and monitoring subsystems using Elasticsearch, Kibana, Prometheus, and Grafana.",
      "Managed configuration with CloudFormation, Terraform, and Ansible.",
      "Integrated Docker container orchestration using Kubernetes — Pods, ConfigMaps, and Deployments.",
      "Deployed Linux Kubernetes Clusters and managed MySQL, DynamoDB, and ElastiCache.",
    ],
    skills: ["Kubernetes", "Docker", "ELK", "Prometheus", "Grafana", "Terraform", "MySQL", "DynamoDB"],
  },
  {
    role: "Cloud Solutions Engineer",
    company: "I2K2 Networks",
    type: "Full-time",
    location: "Noida, India",
    duration: "Mar 2021 – Jun 2022",
    current: false,
    highlights: [
      "Managed EC2, S3, SES, and SNS; used AWS CLI for S3 bucket operations.",
      "Managed internet applications: FTP, SFTP, Nginx, Apache, MySQL, PHP, MariaDB.",
      "Migrated workloads to AWS from different cloud providers.",
      "Created Terraform scripts for automated infrastructure provisioning.",
      "Created Virtual hosts in Apache, Nginx, and IIS.",
    ],
    skills: ["AWS", "Nginx", "Apache", "Terraform", "Docker", "IIS", "MySQL"],
  },
];

export const skills = {
  "Cloud & Infrastructure": ["AWS (EC2, EKS, Lambda, RDS, S3, VPC, IAM, CloudFront, Route 53, CloudWatch)", "Terraform", "CloudFormation", "Ansible"],
  "Containers & Orchestration": ["Docker", "Kubernetes", "ECS", "ECR", "Auto Scaling"],
  "CI/CD & DevOps": ["GitHub Actions", "Jenkins", "GitLab CI", "Git"],
  "Observability": ["Prometheus", "Grafana", "ELK Stack (Elasticsearch, Kibana, Logstash)", "Sentry", "CloudWatch"],
  "Databases": ["MySQL", "PostgreSQL", "DynamoDB", "ElastiCache", "Neptune/Neo4j"],
  "Servers & Networking": ["Nginx", "Apache", "IIS", "VPN", "Load Balancers"],
};

export const certifications = [
  {
    name: "AWS Solutions Architect Associate",
    code: "SAA-C03",
    issuer: "Amazon Web Services",
    color: "#FF9900",
  },
];

export const achievements = [
  {
    title: "$5,000 AWS Credits Secured",
    description: "Helped client Hero Vired obtain free $5,000 in AWS credits, enabling accelerated cloud adoption.",
    rarity: "EPIC",
    icon: "💰",
  },
  {
    title: "$1,300 AWS Dispute Resolved",
    description: "Successfully resolved a dispute charge with AWS, saving the company $1,300. Received client commendations.",
    rarity: "RARE",
    icon: "🏆",
  },
  {
    title: "Sole DevOps — Full Lifecycle",
    description: "Owned the entire DevOps lifecycle solo at Hudle — CI/CD, monitoring, cost, security, and infra — for a fast-growing sports-tech startup.",
    rarity: "LEGENDARY",
    icon: "⚡",
  },
  {
    title: "SOC2 Compliance Achieved",
    description: "Enabled AWS Security Hub with CIS & FSBP standards across all environments at Caylent, meeting SOC2 requirements.",
    rarity: "EPIC",
    icon: "🛡️",
  },
  {
    title: "Zero-Downtime Deployments",
    description: "Maintained 99.9% uptime across production environments using rolling deployments, health checks, and automated rollback pipelines.",
    rarity: "RARE",
    icon: "🚀",
  },
  {
    title: "Observability Stack Built from Scratch",
    description: "Designed and deployed full Prometheus + Grafana + ELK observability stack, giving engineering teams real-time visibility into production.",
    rarity: "RARE",
    icon: "📊",
  },
];

export const careerStats = [
  { label: "Years Experience",   value: 5,    suffix: "+",  prefix: "",  icon: "⚡", color: "#00d4ff" },
  { label: "AWS Credits Secured",value: 5000, suffix: "",   prefix: "$", icon: "💰", color: "#10b981" },
  { label: "AWS Dispute Saved",  value: 1300, suffix: "",   prefix: "$", icon: "🏆", color: "#FF9900" },
  { label: "Pipelines Built",    value: 50,   suffix: "+",  prefix: "",  icon: "⚙️", color: "#7c3aed" },
  { label: "Prod Uptime",        value: 99,   suffix: ".9%", prefix: "", icon: "📡", color: "#39ff14" },
  { label: "AWS Services Used",  value: 20,   suffix: "+",  prefix: "",  icon: "☁️", color: "#f59e0b" },
  { label: "K8s Clusters",       value: 10,   suffix: "+",  prefix: "",  icon: "⎈", color: "#326ce5" },
  { label: "Companies Served",   value: 4,    suffix: "",   prefix: "",  icon: "🏢", color: "#e05" },
];

export const education = {
  degree: "BCA in Computers and Engineering",
  institution: "Maharishi Arvind Institute of Science and Management",
  year: "2020",
};
