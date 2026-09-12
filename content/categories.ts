import type { Category } from "@/types/content";

export const categories: Category[] = [
  {
    id: "C1",
    slug: "c1-training-data-integrity-and-traceability",
    title: "Training Data Integrity & Traceability",
    description: "Protect the integrity and traceability of training data as it is sourced, handled, and maintained so unauthorized modification, corruption, or poisoning can be detected.",
    icon: "Database",
    color: "teal",
    standardVersion: "1.0",
  },
  {
    id: "C2",
    slug: "c2-input-validation",
    title: "Input Validation",
    description: "Validate all inputs as a first-line defense against prompt injection, one of the most damaging attacks on AI systems.",
    icon: "ListChecks",
    color: "cyan",
    standardVersion: "1.0",
  },
  {
    id: "C3",
    slug: "c3-model-lifecycle-management-and-change-control",
    title: "Model Lifecycle Management & Change Control",
    description: "Control model changes so that unauthorized or unsafe modifications cannot reach production.",
    icon: "Settings",
    color: "blue",
    standardVersion: "1.0",
  },
  {
    id: "C4",
    slug: "c4-infrastructure-configuration-and-deployment-security",
    title: "Infrastructure, Configuration & Deployment Security",
    description: "Harden AI-specific infrastructure components against model theft, data leakage, and cross-tenant contamination.",
    icon: "LockKeyhole",
    color: "indigo",
    standardVersion: "1.0",
  },
  {
    id: "C5",
    slug: "c5-access-control-and-identity-for-ai-components-and-users",
    title: "Access Control & Identity for AI Components & Users",
    description: "Address access control challenges that AI systems introduce beyond traditional application security.",
    icon: "ShieldCheck",
    color: "violet",
    standardVersion: "1.0",
  },
  {
    id: "C6",
    slug: "c6-supply-chain-security-for-models",
    title: "Supply Chain Security for Models",
    description: "Defend against AI supply chain attacks that exploit third-party models, frameworks, or datasets to embed backdoors, bias, or exploitable code.",
    icon: "Binary",
    color: "fuchsia",
    standardVersion: "1.0",
  },
  {
    id: "C7",
    slug: "c7-model-behavior-output-control-and-safety-assurance",
    title: "Model Behavior, Output Control & Safety Assurance",
    description: "Constrain, validate, and monitor model outputs so that unsafe, malformed, or high-risk responses cannot reach users or downstream systems.",
    icon: "ScrollText",
    color: "rose",
    standardVersion: "1.0",
  },
  {
    id: "C8",
    slug: "c8-memory-embeddings-and-vector-database-security",
    title: "Memory, Embeddings & Vector Database Security",
    description: "Secure the embeddings and vector stores that act as semi-persistent and persistent memory for AI systems through Retrieval-Augmented Generation (RAG).",
    icon: "Braces",
    color: "orange",
    standardVersion: "1.0",
  },
  {
    id: "C9",
    slug: "c9-orchestration-and-agentic-security",
    title: "Orchestration & Agentic Security",
    description: "Ensure autonomous and multi-agent systems execute only authorized, intended, and bounded actions.",
    icon: "Webhook",
    color: "amber",
    standardVersion: "1.0",
  },
  {
    id: "C10",
    slug: "c10-model-context-protocol-mcp-security",
    title: "Model Context Protocol (MCP) Security",
    description: "Secure the discovery, authentication, authorization, transport, and use of MCP-based tool and resource integrations.",
    icon: "BadgeCheck",
    color: "yellow",
    standardVersion: "1.0",
  },
  {
    id: "C11",
    slug: "c11-adversarial-robustness",
    title: "Adversarial Robustness",
    description: "Keep AI systems reliable and abuse-resistant when facing evasion, inference, extraction, or poisoning attacks.",
    icon: "Fingerprint",
    color: "lime",
    standardVersion: "1.0",
  },
  {
    id: "C12",
    slug: "c12-monitoring-logging-and-anomaly-detection",
    title: "Monitoring, Logging & Anomaly Detection",
    description: "Provide real-time and forensic visibility into what the model and other AI components see, do, and return, so AI-specific threats can be detected and triaged.",
    icon: "Code2",
    color: "emerald",
    standardVersion: "1.0",
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getCategoryById(id: string) {
  return categories.find((category) => category.id === id);
}
