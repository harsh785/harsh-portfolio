import puppeteer from "puppeteer";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:10px;color:#1e293b;background:#fff;display:flex;min-height:100vh;}

  /* ── SIDEBAR ── */
  .sidebar{
    width:215px;
    min-height:100vh;
    background:linear-gradient(160deg,#0f172a 0%,#1e3a5f 100%);
    padding:32px 20px;
    display:flex;
    flex-direction:column;
    gap:22px;
    flex-shrink:0;
  }

  /* Avatar / name block */
  .avatar-block{text-align:center;}
  .avatar{
    width:72px;height:72px;border-radius:50%;
    background:linear-gradient(135deg,#0ea5e9,#6366f1);
    display:flex;align-items:center;justify-content:center;
    font-size:26px;font-weight:800;color:#fff;
    margin:0 auto 10px;
    border:3px solid rgba(255,255,255,0.15);
  }
  .sidebar-name{font-size:14px;font-weight:700;color:#fff;line-height:1.3;}
  .sidebar-title{font-size:8.5px;font-weight:500;color:#7dd3fc;margin-top:3px;letter-spacing:0.05em;text-transform:uppercase;}
  .cert-pill{
    display:inline-flex;align-items:center;gap:4px;
    background:linear-gradient(90deg,#f59e0b,#FF9900);
    color:#fff;font-size:7.5px;font-weight:700;
    padding:3px 8px;border-radius:20px;margin-top:7px;
    letter-spacing:0.04em;
  }

  /* Sidebar section */
  .s-section{border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;}
  .s-heading{
    font-size:7.5px;font-weight:700;text-transform:uppercase;
    letter-spacing:0.12em;color:#7dd3fc;margin-bottom:10px;
  }

  /* Contact list */
  .contact-item{display:flex;align-items:flex-start;gap:7px;margin-bottom:8px;}
  .c-icon{font-size:11px;margin-top:0px;flex-shrink:0;}
  .c-text{font-size:8.5px;color:#cbd5e1;line-height:1.4;word-break:break-all;}
  .c-text a{color:#7dd3fc;text-decoration:none;}

  /* Skill pills */
  .skill-group{margin-bottom:10px;}
  .skill-group-name{font-size:7.5px;font-weight:600;color:#94a3b8;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.06em;}
  .pill-wrap{display:flex;flex-wrap:wrap;gap:3px;}
  .pill{
    font-size:7.5px;font-weight:500;
    background:rgba(255,255,255,0.08);
    color:#e2e8f0;padding:2px 7px;
    border-radius:20px;border:1px solid rgba(255,255,255,0.1);
    white-space:nowrap;
  }
  .pill.hi{background:rgba(14,165,233,0.2);border-color:rgba(14,165,233,0.35);color:#7dd3fc;}

  /* Education */
  .edu-block{margin-bottom:10px;}
  .edu-deg{font-size:8.5px;font-weight:600;color:#e2e8f0;line-height:1.4;}
  .edu-inst{font-size:8px;color:#94a3b8;margin-top:2px;line-height:1.4;}

  /* ── MAIN ── */
  .main{flex:1;padding:32px 30px 32px 28px;display:flex;flex-direction:column;gap:18px;}

  /* Section heading */
  h2{
    font-size:9.5px;font-weight:700;text-transform:uppercase;
    letter-spacing:0.12em;color:#0ea5e9;
    padding-bottom:5px;border-bottom:2px solid #e0f2fe;
    margin-bottom:10px;
  }

  /* Summary */
  .summary{
    font-size:9px;line-height:1.7;color:#475569;
    background:#f8faff;border-left:3px solid #0ea5e9;
    padding:9px 12px;border-radius:0 6px 6px 0;
  }

  /* Experience */
  .job{margin-bottom:13px;}
  .job:last-child{margin-bottom:0;}
  .job-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1px;}
  .role{font-size:10.5px;font-weight:700;color:#0f172a;}
  .duration{font-size:8px;color:#64748b;white-space:nowrap;padding-top:1px;}
  .company-line{display:flex;align-items:center;gap:6px;margin-bottom:5px;}
  .company{font-size:9px;font-weight:600;color:#0ea5e9;}
  .loc{font-size:8px;color:#94a3b8;}
  .dot-live{width:5px;height:5px;border-radius:50%;background:#22c55e;flex-shrink:0;}

  ul.pts{margin-left:12px;}
  ul.pts li{font-size:8.5px;color:#374151;margin-bottom:2.5px;line-height:1.55;}

  .tags{margin-top:5px;display:flex;flex-wrap:wrap;gap:3px;}
  .tag{
    font-size:7.5px;font-weight:600;
    background:#eff6ff;color:#1d4ed8;
    padding:1.5px 6px;border-radius:20px;
    border:1px solid #bfdbfe;
  }

  /* Achievements */
  .ach-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;}
  .ach{
    background:#fafbff;border:1px solid #e2e8f0;
    border-radius:7px;padding:7px 8px;
  }
  .ach-badge{
    font-size:6.5px;font-weight:800;letter-spacing:0.06em;
    padding:1.5px 5px;border-radius:10px;
    display:inline-block;margin-bottom:3px;
  }
  .LEGENDARY{background:#fde68a;color:#92400e;}
  .EPIC{background:#ede9fe;color:#6d28d9;}
  .RARE{background:#dbeafe;color:#1e40af;}
  .ach-title{font-size:8.5px;font-weight:700;color:#1e3a6e;margin-bottom:2px;}
  .ach-desc{font-size:8px;color:#64748b;line-height:1.45;}
</style>
</head>
<body>

<!-- ══════════════ SIDEBAR ══════════════ -->
<div class="sidebar">

  <div class="avatar-block">
    <div class="avatar">HD</div>
    <div class="sidebar-name">Harsh Dixit</div>
    <div class="sidebar-title">Senior Cloud &amp; DevOps Engineer</div>
    <div><span class="cert-pill">☁ AWS SAA-C03</span></div>
  </div>

  <!-- Contact -->
  <div class="s-section">
    <div class="s-heading">Contact</div>
    <div class="contact-item"><span class="c-icon">📧</span><span class="c-text"><a href="mailto:Harshdixit23mar@gmail.com">Harshdixit23mar@gmail.com</a></span></div>
    <div class="contact-item"><span class="c-icon">📱</span><span class="c-text">+91 8949827264</span></div>
    <div class="contact-item"><span class="c-icon">📍</span><span class="c-text">India</span></div>
    <div class="contact-item"><span class="c-icon">🔗</span><span class="c-text"><a href="https://linkedin.com/in/harsh-dixit-156a371b0">linkedin.com/in/harsh-dixit-156a371b0</a></span></div>
    <div class="contact-item"><span class="c-icon">💻</span><span class="c-text"><a href="https://github.com/harsh785">github.com/harsh785</a></span></div>
  </div>

  <!-- Skills -->
  <div class="s-section">
    <div class="s-heading">Skills</div>

    <div class="skill-group">
      <div class="skill-group-name">Cloud &amp; IaC</div>
      <div class="pill-wrap">
        <span class="pill hi">AWS</span><span class="pill hi">Terraform</span><span class="pill">CloudFormation</span><span class="pill">Ansible</span>
      </div>
    </div>

    <div class="skill-group">
      <div class="skill-group-name">Containers &amp; Orchestration</div>
      <div class="pill-wrap">
        <span class="pill hi">Kubernetes</span><span class="pill hi">Docker</span><span class="pill">ECS</span><span class="pill">ECR</span>
      </div>
    </div>

    <div class="skill-group">
      <div class="skill-group-name">CI / CD</div>
      <div class="pill-wrap">
        <span class="pill hi">GitHub Actions</span><span class="pill hi">Jenkins</span><span class="pill">GitLab CI</span>
      </div>
    </div>

    <div class="skill-group">
      <div class="skill-group-name">Observability</div>
      <div class="pill-wrap">
        <span class="pill">Prometheus</span><span class="pill">Grafana</span><span class="pill">ELK</span><span class="pill">CloudWatch</span>
      </div>
    </div>

    <div class="skill-group">
      <div class="skill-group-name">Databases</div>
      <div class="pill-wrap">
        <span class="pill">MySQL</span><span class="pill">PostgreSQL</span><span class="pill">DynamoDB</span><span class="pill">ElastiCache</span><span class="pill">Neo4j</span>
      </div>
    </div>

    <div class="skill-group">
      <div class="skill-group-name">Servers &amp; Networking</div>
      <div class="pill-wrap">
        <span class="pill">Nginx</span><span class="pill">Apache</span><span class="pill">VPN</span><span class="pill">Load Balancers</span>
      </div>
    </div>
  </div>

  <!-- Education -->
  <div class="s-section">
    <div class="s-heading">Education</div>
    <div class="edu-block">
      <div class="edu-deg">BCA in Computers &amp; Engineering</div>
      <div class="edu-inst">Maharishi Arvind Institute of Science and Management · 2020</div>
    </div>
  </div>

  <!-- Certification -->
  <div class="s-section">
    <div class="s-heading">Certification</div>
    <div class="edu-block">
      <div class="edu-deg" style="color:#fbbf24;">AWS Solutions Architect – Associate</div>
      <div class="edu-inst">SAA-C03 · Amazon Web Services</div>
    </div>
  </div>

</div>

<!-- ══════════════ MAIN ══════════════ -->
<div class="main">

  <!-- Summary -->
  <div>
    <h2>Professional Summary</h2>
    <div class="summary">
      Experienced DevOps professional with 5+ years designing, implementing, and managing complex cloud infrastructures on AWS. Proven track record owning the full DevOps lifecycle — from CI/CD pipelines and container orchestration to observability, security, and cost optimisation. AWS Solutions Architect Associate certified with deep hands-on expertise in Terraform, Kubernetes, GitHub Actions, and the ELK stack. Delivered SOC2 compliance, secured $5,000 in AWS credits, and maintained 99.9% production uptime.
    </div>
  </div>

  <!-- Experience -->
  <div>
    <h2>Professional Experience</h2>

    <div class="job">
      <div class="job-top">
        <div class="role">Senior Cloud Engineer</div>
        <div class="duration">Dec 2025 – Present</div>
      </div>
      <div class="company-line"><span class="dot-live"></span><span class="company">Caylent</span><span class="loc">· Full-time · Remote · Irvine, California, US</span></div>
      <ul class="pts">
        <li>Designed CI/CD deployment approval gates using GitHub Environments — production requires manual review; dev/staging deploys remain fast.</li>
        <li>Enabled AWS Security Hub with CIS and FSBP standards across all environments, meeting SOC2 compliance requirements.</li>
        <li>Tuned CloudWatch alarms per environment to reduce false-positive pages and improve signal quality.</li>
        <li>Managed all infrastructure via Terraform + GitHub Actions on EKS, Lambda, Neptune/Neo4j, and RDS.</li>
      </ul>
      <div class="tags">
        <span class="tag">AWS</span><span class="tag">Terraform</span><span class="tag">GitHub Actions</span><span class="tag">EKS</span><span class="tag">Lambda</span><span class="tag">Neo4j</span><span class="tag">SOC2</span><span class="tag">CloudWatch</span>
      </div>
    </div>

    <div class="job">
      <div class="job-top">
        <div class="role">Senior DevOps Engineer</div>
        <div class="duration">Nov 2024 – Dec 2025</div>
      </div>
      <div class="company-line"><span class="company">Hudle</span><span class="loc">· Full-time · On-site · South Delhi, India</span></div>
      <ul class="pts">
        <li>Solely owned the entire DevOps lifecycle at a fast-growing sports-tech startup — CI/CD, monitoring, cost, security, and infrastructure.</li>
        <li>Built and maintained CI/CD pipelines with GitHub Actions and Jenkins, enabling faster and more reliable releases.</li>
        <li>Provisioned scalable, highly available AWS infrastructure using Terraform and CloudFormation.</li>
        <li>Containerised applications with Docker and Kubernetes; implemented auto-scaling and production-grade reliability.</li>
        <li>Designed observability stack: Prometheus, Grafana, and ELK for real-time health monitoring and bottleneck resolution.</li>
      </ul>
      <div class="tags">
        <span class="tag">AWS</span><span class="tag">Kubernetes</span><span class="tag">Docker</span><span class="tag">Jenkins</span><span class="tag">GitHub Actions</span><span class="tag">Terraform</span><span class="tag">Prometheus</span><span class="tag">Grafana</span><span class="tag">ELK</span>
      </div>
    </div>

    <div class="job">
      <div class="job-top">
        <div class="role">Senior DevOps Engineer</div>
        <div class="duration">Jan 2024 – Jul 2024</div>
      </div>
      <div class="company-line"><span class="company">Squareboat Solutions</span><span class="loc">· Full-time · Hybrid · Gurugram, India</span></div>
      <ul class="pts">
        <li>Managed DevOps across multiple simultaneous projects and teams; trained the engineering team on cloud best practices.</li>
        <li>Deep AWS administration: EC2, S3, EBS, VPC, ELB, RDS, IAM, Route 53, CloudFront, CloudWatch.</li>
        <li>Authored Terraform scripts provisioning EC2, EFS, ECR, ECS, ELB, IAM roles, and S3 at scale.</li>
      </ul>
      <div class="tags"><span class="tag">AWS</span><span class="tag">Terraform</span><span class="tag">Ansible</span><span class="tag">CloudFormation</span><span class="tag">Docker</span></div>
    </div>

    <div class="job">
      <div class="job-top">
        <div class="role">DevOps Engineer</div>
        <div class="duration">Jul 2022 – Jan 2024</div>
      </div>
      <div class="company-line"><span class="company">Squareboat Solutions</span><span class="loc">· Full-time · Gurugram, India</span></div>
      <ul class="pts">
        <li>Set up and maintained logging and monitoring with Elasticsearch, Kibana, Prometheus, and Grafana.</li>
        <li>Managed IaC with CloudFormation, Terraform, and Ansible; orchestrated Docker containers via Kubernetes.</li>
        <li>Deployed Linux Kubernetes clusters; managed MySQL, DynamoDB, and ElastiCache.</li>
      </ul>
      <div class="tags"><span class="tag">Kubernetes</span><span class="tag">Docker</span><span class="tag">ELK</span><span class="tag">Prometheus</span><span class="tag">Terraform</span></div>
    </div>

    <div class="job">
      <div class="job-top">
        <div class="role">Cloud Solutions Engineer</div>
        <div class="duration">Mar 2021 – Jun 2022</div>
      </div>
      <div class="company-line"><span class="company">I2K2 Networks</span><span class="loc">· Full-time · Noida, India</span></div>
      <ul class="pts">
        <li>Managed EC2, S3, SES, and SNS; automated S3 operations via AWS CLI.</li>
        <li>Administered Nginx, Apache, MySQL, PHP, and MariaDB for internet-facing applications.</li>
        <li>Migrated workloads to AWS from multiple cloud providers; authored Terraform provisioning scripts.</li>
      </ul>
      <div class="tags"><span class="tag">AWS</span><span class="tag">Nginx</span><span class="tag">Apache</span><span class="tag">Terraform</span><span class="tag">Docker</span></div>
    </div>
  </div>

  <!-- Achievements -->
  <div>
    <h2>Key Achievements</h2>
    <div class="ach-grid">
      <div class="ach"><span class="ach-badge LEGENDARY">LEGENDARY</span><div class="ach-title">⚡ Sole DevOps — Full Lifecycle</div><div class="ach-desc">Owned entire DevOps lifecycle solo at Hudle — CI/CD, monitoring, cost, security, and infra.</div></div>
      <div class="ach"><span class="ach-badge EPIC">EPIC</span><div class="ach-title">💰 $5,000 AWS Credits Secured</div><div class="ach-desc">Helped client Hero Vired obtain $5,000 in free AWS credits, enabling accelerated cloud adoption.</div></div>
      <div class="ach"><span class="ach-badge EPIC">EPIC</span><div class="ach-title">🛡️ SOC2 Compliance Achieved</div><div class="ach-desc">Enabled Security Hub with CIS &amp; FSBP across all environments at Caylent.</div></div>
      <div class="ach"><span class="ach-badge RARE">RARE</span><div class="ach-title">🏆 $1,300 AWS Dispute Resolved</div><div class="ach-desc">Successfully disputed an AWS charge, saving $1,300. Received client commendations.</div></div>
      <div class="ach"><span class="ach-badge RARE">RARE</span><div class="ach-title">🚀 99.9% Production Uptime</div><div class="ach-desc">Maintained uptime via rolling deployments, health checks, and automated rollback pipelines.</div></div>
      <div class="ach"><span class="ach-badge RARE">RARE</span><div class="ach-title">📊 Observability Built from Scratch</div><div class="ach-desc">Designed Prometheus + Grafana + ELK, giving teams real-time production visibility.</div></div>
    </div>
  </div>

</div>

</body>
</html>`;

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle0" });
const pdfBuffer = await page.pdf({
  format: "A4",
  printBackground: true,
  margin: { top: "0", bottom: "0", left: "0", right: "0" },
});
await browser.close();

const outPath = join(__dirname, "../public/resume.pdf");
writeFileSync(outPath, pdfBuffer);
console.log("✓ Resume written to public/resume.pdf");
