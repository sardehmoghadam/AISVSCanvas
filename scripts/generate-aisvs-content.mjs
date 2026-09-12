// Generates AISVS content from the source standard:
//   - content/categories.ts
//   - content/sections.ts
//   - content/controls/*.mdx (one file per requirement)
//
// Run from the repo root:  node scripts/generate-aisvs-content.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const VERSION = "1.0";

function kebab(s) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Valid YAML scalar (JSON strings are valid YAML flow scalars). */
function q(s) {
  return JSON.stringify(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// Chapters (categories)
// ─────────────────────────────────────────────────────────────────────────────
const CHAPTERS = [
  { id: "C1", title: "Training Data Integrity & Traceability", icon: "Database", color: "teal",
    objective: "Protect the integrity and traceability of training data as it is sourced, handled, and maintained so unauthorized modification, corruption, or poisoning can be detected." },
  { id: "C2", title: "Input Validation", icon: "ListChecks", color: "cyan",
    objective: "Validate all inputs as a first-line defense against prompt injection, one of the most damaging attacks on AI systems." },
  { id: "C3", title: "Model Lifecycle Management & Change Control", icon: "Settings", color: "blue",
    objective: "Control model changes so that unauthorized or unsafe modifications cannot reach production." },
  { id: "C4", title: "Infrastructure, Configuration & Deployment Security", icon: "LockKeyhole", color: "indigo",
    objective: "Harden AI-specific infrastructure components against model theft, data leakage, and cross-tenant contamination." },
  { id: "C5", title: "Access Control & Identity for AI Components & Users", icon: "ShieldCheck", color: "violet",
    objective: "Address access control challenges that AI systems introduce beyond traditional application security." },
  { id: "C6", title: "Supply Chain Security for Models", icon: "Binary", color: "fuchsia",
    objective: "Defend against AI supply chain attacks that exploit third-party models, frameworks, or datasets to embed backdoors, bias, or exploitable code." },
  { id: "C7", title: "Model Behavior, Output Control & Safety Assurance", icon: "ScrollText", color: "rose",
    objective: "Constrain, validate, and monitor model outputs so that unsafe, malformed, or high-risk responses cannot reach users or downstream systems." },
  { id: "C8", title: "Memory, Embeddings & Vector Database Security", icon: "Braces", color: "orange",
    objective: "Secure the embeddings and vector stores that act as semi-persistent and persistent memory for AI systems through Retrieval-Augmented Generation (RAG)." },
  { id: "C9", title: "Orchestration & Agentic Security", icon: "Webhook", color: "amber",
    objective: "Ensure autonomous and multi-agent systems execute only authorized, intended, and bounded actions." },
  { id: "C10", title: "Model Context Protocol (MCP) Security", icon: "BadgeCheck", color: "yellow",
    objective: "Secure the discovery, authentication, authorization, transport, and use of MCP-based tool and resource integrations." },
  { id: "C11", title: "Adversarial Robustness", icon: "Fingerprint", color: "lime",
    objective: "Keep AI systems reliable and abuse-resistant when facing evasion, inference, extraction, or poisoning attacks." },
  { id: "C12", title: "Monitoring, Logging & Anomaly Detection", icon: "Code2", color: "emerald",
    objective: "Provide real-time and forensic visibility into what the model and other AI components see, do, and return, so AI-specific threats can be detected and triaged." },
];

const SECTIONS = [
  { id: "C1.1", title: "Training Data Origin & Data Security", description: "Datasets must be sourced from verifiable origins, tracked across their full lifecycle, and protected against tampering, corruption, and poisoning so that unauthorized modification can be detected." },
  { id: "C1.2", title: "Data Labeling and Annotation Security", description: "Labeling and annotation processes must be protected against unauthorized modification, data leakage, and integrity compromise, with access control, auditability, and protected labeling artifacts throughout the training pipeline." },
  { id: "C1.3", title: "Training Data Quality and Security Assurance", description: "Automated validation, poisoning detection, label quality checks, and bias analysis help detect corruption, poisoning, labeling errors, and exploitable dataset patterns before they affect model behavior." },

  { id: "C2.1", title: "Prompt Injection Defenses", description: "Defending against prompt injection requires a combination of pattern filters, data classifiers, and instruction hierarchy enforcement." },
  { id: "C2.2", title: "Content & Policy Screening", description: "Input-side content screening prevents syntactically valid prompts from requesting disallowed content such as policy-violating instructions, harmful material, or restricted information." },

  { id: "C3.1", title: "Model Authorization & Integrity", description: "Only authorized models with verified integrity should reach production environments." },
  { id: "C3.2", title: "Model Validation & Testing", description: "Models must pass defined security and safety validations before deployment." },
  { id: "C3.3", title: "Controlled Deployment & Rollback", description: "Model deployments must be controlled, monitored, and reversible to support lifecycle management." },
  { id: "C3.4", title: "Secure Development Practices", description: "Model development environments must be separated from production environments." },
  { id: "C3.5", title: "Pipeline Fine-Tuning", description: "Fine-tuning pipelines are high-privilege operations that can alter deployed model behavior at scale; a compromise at any intermediate stage of a multi-stage pipeline produces a subtly altered artifact that subsequent stages accept." },

  { id: "C4.1", title: "AI Workload Sandboxing & Validation", description: "Untrusted AI models must be isolated in secure sandboxes, and sensitive AI workloads protected using trusted execution environments (TEEs) and confidential computing technologies." },
  { id: "C4.2", title: "AI Hardware Security", description: "AI-specific hardware components, including GPUs, TPUs, and specialized AI accelerators, must be secured." },
  { id: "C4.3", title: "Edge & Distributed AI Security", description: "Distributed AI deployments, including edge computing, federated learning, and multi-site architectures, must be secured." },

  { id: "C5.1", title: "Authentication", description: "AI agents and human users accessing resources must be properly authenticated and authorized for their level of access." },
  { id: "C5.2", title: "AI Resource Authorization & Classification", description: "The caller's authorization context must be enforced through AI-specific query pipelines (RAG retrieval, embedding lookups, inference chains) so the system does not return data the caller is not entitled to access." },
  { id: "C5.3", title: "Multi-Tenant Isolation", description: "Cross-tenant information leakage through AI-specific shared infrastructure, such as inference caches and shared model state, must be prevented." },

  { id: "C6.1", title: "Model Artifact Integrity", description: "Third-party model origins must be authenticated and checked for hidden behavior before fine-tuning or deployment, and AI artifacts should be downloaded only from approved sources." },
  { id: "C6.2", title: "AI BOM & Supply Chain Monitoring", description: "Detailed AI-specific bills of materials must be generated and signed, with readiness to respond to supply chain compromise events." },

  { id: "C7.1", title: "Output Format Enforcement", description: "Model outputs must be structured and validated to reduce downstream injection risk." },
  { id: "C7.2", title: "Hallucination Detection & Mitigation", description: "Potentially inaccurate or fabricated content must be detected so unreliable outputs do not reach users or downstream systems." },
  { id: "C7.3", title: "Output Safety", description: "Technical controls must detect and remove unsafe content before it is shown to the user." },
  { id: "C7.4", title: "Source Attribution & Citation Integrity", description: "RAG-grounded outputs must be traceable to their source documents, with cited claims verifiably supported by retrieved content." },

  { id: "C8.1", title: "Access Controls on Memory & RAG Indices", description: "Fine-grained access controls and query-time scope enforcement must be applied to every vector collection." },
  { id: "C8.2", title: "Embedding Sanitization & Validation", description: "Content must be pre-screened before vectorization, and memory writes treated as untrusted input, to prevent ingestion of unsafe payloads." },
  { id: "C8.3", title: "Memory Expiry & Revocation", description: "Retention and revocation must be explicit and enforceable for memory and RAG indices." },

  { id: "C9.1", title: "Execution Budgets, Loop Control, and Circuit Breakers", description: "Runtime expansion (recursion, concurrency, cost) must be bounded, with safe halting on runaway behavior." },
  { id: "C9.2", title: "High-Impact Action Approval and Irreversibility Controls", description: "Privileged, high-impact, or hard-to-reverse agent actions must require trusted approval checkpoints." },
  { id: "C9.3", title: "Component Isolation and Tool Authorization", description: "Tool and plugin execution, loading, and outputs must be constrained to prevent unauthorized system access and unsafe side effects." },
  { id: "C9.4", title: "Agent and Orchestrator Identity", description: "Every action must be attributable and every mutation detectable." },
  { id: "C9.5", title: "Agent Authorization, Delegation, and Continuous Enforcement", description: "Every action must be authorized at execution time and constrained by scope." },
  { id: "C9.6", title: "Shutdown and Graceful Degradation", description: "Shutdown and graceful degradation paths must remain under human control, with mechanisms that stay reliable and are exercised over time." },

  { id: "C10.1", title: "Component Integrity", description: "Only trusted MCP components must be used, and locally launched servers must be secured." },
  { id: "C10.2", title: "Authentication & Authorization", description: "Callers must be authenticated and access to MCP servers authorized, following protocol best practices." },
  { id: "C10.3", title: "Secure Transport", description: "MCP communications must be secured following protocol best practices." },
  { id: "C10.4", title: "Schema, Message, and Input Validation", description: "Schema, message, and input validation must be enforced in both MCP servers and clients." },

  { id: "C11.1", title: "Model Alignment, Safety, and Robustness Testing and Training", description: "Model resilience to manipulated inputs designed to cause misclassification or policy bypass must be increased, primarily through adversarial testing and robustness benchmarking." },
  { id: "C11.2", title: "Membership-Inference and Model-Inversion Mitigation", description: "The ability to determine whether a specific record was in the training data must be limited, and reconstruction of private training data or sensitive attributes from model outputs prevented." },
  { id: "C11.3", title: "Model-Extraction Defense", description: "Unauthorized model cloning through API abuse must be detected and deterred using rate limiting, query-pattern analysis, and watermarking." },
  { id: "C11.4", title: "Model Runtime Anomaly Detection", description: "Manipulated, backdoored, or adversarial data entering the model context at inference time via external sources must be identified and neutralized." },

  { id: "C12.1", title: "Request & Response Logging", description: "AI requests and responses must be logged to create an audit trail and support incident response." },
  { id: "C12.2", title: "Detection and Alerting", description: "AI-specific attack patterns (jailbreak, prompt injection, model extraction, multi-turn trajectory attacks, covert channels over LLM endpoints) must be detected, and security events enriched with AI-specific context so downstream detection and response systems can act on them." },
  { id: "C12.3", title: "Model, Data, and Performance Drift Detection", description: "Drift and degradation across model outputs, input distributions, and data schemas must be monitored to identify quality regressions and security-relevant behavioral shifts." },
  { id: "C12.4", title: "Proactive Security Behavior Monitoring", description: "Security threats arising from proactive (agent-initiated) behavior must be detected and prevented, including pre-execution validation, behavior pattern analysis, and audit trails for approval of security-critical actions." },
  { id: "C12.5", title: "Training Data & Model Lifecycle Audit", description: "The provenance and change history of training data, model artifacts, and knowledge sources must be auditable throughout the AI development lifecycle." },
];

// ─────────────────────────────────────────────────────────────────────────────
// Chapter references (conservative, stable canonical URLs only)
// ─────────────────────────────────────────────────────────────────────────────
const CHAPTER_REFERENCES = {
  C1: [
    ["NIST AI Risk Management Framework", "https://www.nist.gov/itl/ai-risk-management-framework"],
    ["MITRE ATLAS: Poison Training Data (AML.T0020)", "https://atlas.mitre.org/techniques/AML.T0020/"],
  ],
  C2: [
    ["OWASP Top 10 for LLM Applications 2025: Prompt Injection", "https://genai.owasp.org/llm-top-10/"],
    ["MITRE ATLAS: LLM Prompt Injection (AML.T0051)", "https://atlas.mitre.org/techniques/AML.T0051/"],
  ],
  C3: [
    ["NIST AI Risk Management Framework", "https://www.nist.gov/itl/ai-risk-management-framework"],
    ["NIST SP 800-218A: Secure Software Development Practices for Generative AI", "https://csrc.nist.gov/pubs/sp/800/218a/final"],
  ],
  C4: [
    ["NIST SP 800-190: Application Container Security Guide", "https://csrc.nist.gov/pubs/sp/800/190/final"],
    ["NIST AI Risk Management Framework", "https://www.nist.gov/itl/ai-risk-management-framework"],
  ],
  C5: [
    ["NIST SP 800-207: Zero Trust Architecture", "https://csrc.nist.gov/pubs/sp/800/207/final"],
    ["OAuth 2.1 (IETF Draft)", "https://oauth.net/2.1/"],
  ],
  C6: [
    ["OWASP Top 10 for LLM Applications 2025: Supply Chain", "https://genai.owasp.org/llm-top-10/"],
    ["CycloneDX: Machine Learning Bill of Materials", "https://cyclonedx.org/capabilities/mlbom/"],
    ["CISA SBOM", "https://www.cisa.gov/sbom"],
  ],
  C7: [
    ["OWASP Top 10 for LLM Applications 2025: Improper Output Handling", "https://genai.owasp.org/llm-top-10/"],
    ["NIST AI 600-1: Generative AI Profile", "https://www.nist.gov/itl/ai-risk-management-framework"],
  ],
  C8: [
    ["OWASP Top 10 for LLM Applications 2025: Vector and Embedding Weaknesses", "https://genai.owasp.org/llm-top-10/"],
    ["MITRE ATLAS: RAG Poisoning", "https://atlas.mitre.org/"],
  ],
  C9: [
    ["OWASP Top 10 for Agentic Applications 2026", "https://genai.owasp.org/"],
    ["NIST AI 100-1: AI Risk Management Framework (AI RMF 1.0)", "https://www.nist.gov/itl/ai-risk-management-framework"],
  ],
  C10: [
    ["Model Context Protocol (MCP) Specification", "https://modelcontextprotocol.io/"],
    ["OAuth 2.1 (IETF Draft)", "https://oauth.net/2.1/"],
  ],
  C11: [
    ["NIST AI 100-2e2023: Adversarial Machine Learning", "https://csrc.nist.gov/pubs/ai/100/2/e2023/final"],
    ["MITRE ATLAS: Evade ML Model (AML.T0015)", "https://atlas.mitre.org/techniques/AML.T0015/"],
  ],
  C12: [
    ["OWASP Top 10 for LLM Applications 2025", "https://genai.owasp.org/llm-top-10/"],
    ["NIST AI Risk Management Framework (AI RMF 1.0)", "https://www.nist.gov/itl/ai-risk-management-framework"],
    ["MITRE ATLAS", "https://atlas.mitre.org/"],
  ],
};

const AISVS_REF = ["OWASP AISVS 1.0", "https://github.com/OWASP/AISVS"];

// [[ENRICH]]
const CHAPTER_ENRICH = {
  C1: {
    risk: "Compromised or untraceable training data silently changes model behavior at scale. Once poisoned data is ingested, the defect is embedded in the model and is hard to attribute, detect, or reverse after deployment.",
    failures: [
      "**No data inventory** — pulling datasets from unrecorded sources makes provenance and licensing impossible to verify.",
      "**Plaintext transfer and storage** — training data moves without integrity checks, so silent tampering goes unnoticed.",
      "**Annotations open to everyone** — labeling platforms grant broad write access without role separation or audit trails.",
      "**No poisoning detection** — pipelines accept backdoored or corrupted samples that shift model behavior.",
    ],
    rules: [
      "Record the origin, license, and processing history of every training-data source.",
      "Protect training data and labels with integrity controls at rest and in transit.",
      "Run poisoning, label-quality, and bias checks before training consumes any data.",
    ],
    checklist: [
      "Is every dataset source inventoried with origin, license, and processing history?",
      "Is integrity monitoring in place to detect unauthorized modification?",
      "Do labeling platforms enforce role-based access and auditability?",
      "Do pipelines run poisoning detection and label-quality checks before training?",
    ],
  },
  C2: {
    risk: "Prompt injection lets untrusted content steer the model into revealing secrets, calling tools, or executing instructions the developer never intended. Because injected text is indistinguishable from legitimate input, defense must happen before the model processes it.",
    failures: [
      "**Trusting user text as instructions** — untrusted input is concatenated with system prompts without an instruction hierarchy.",
      "**Truncating instead of rejecting** — over-long or malformed inputs are silently clipped, hiding malicious payloads.",
      "**No screening ruleset** — inputs reach the model without prompt-injection or content policy classifiers.",
      "**Encoding blind spots** — special tokens and representation smuggling pass validation because nothing canonicalizes them.",
    ],
    rules: [
      "Treat every model-steering input as untrusted and screen it before tokenization.",
      "Enforce an instruction hierarchy so system/developer messages override user text.",
      "Reject (never truncate) inputs that exceed token, length, or character allow-lists.",
    ],
    checklist: [
      "Are all steering inputs screened by a prompt-injection ruleset or classifier?",
      "Does an instruction hierarchy keep user text from overriding system messages?",
      "Are special tokens and encoding smuggling detected and mitigated?",
      "Are over-limit inputs rejected rather than truncated?",
    ],
  },
  C3: {
    risk: "An unapproved or tampered model is the most powerful backdoor in an AI system. Without registry, signing, and controlled rollout, a modified artifact can reach production and inherit the trust of the legitimate model.",
    failures: [
      "**Unsigned artifacts** — model weights and adapters are deployed without cryptographic signatures or admission checks.",
      "**No pre-deployment testing** — models skip security and safety validation before promotion.",
      "**Shared runtime across environments** — development and production components share runtime state, leaking or contaminating behavior.",
      "**Untracked fine-tune stages** — intermediate fine-tuning checkpoints are not versioned or integrity-verified.",
    ],
    rules: [
      "Maintain a registry of every deployed artifact and its origin.",
      "Sign artifacts and verify signatures at deployment admission and on load.",
      "Isolate development and production runtime state, and make rollouts reversible.",
    ],
    checklist: [
      "Are all model artifacts inventoried, signed, and integrity-verified before load?",
      "Do models pass security/safety validation before deployment?",
      "Is runtime state isolated across environment boundaries?",
      "Is rollout reversible with automated rollback triggers?",
    ],
  },
  C4: {
    risk: "AI infrastructure is a high-value target for model theft and cross-tenant contamination. A weakly sandboxed model or unverified accelerator turns a single artifact load into arbitrary code execution or weight exfiltration.",
    failures: [
      "**No sandbox** — models run in shared, unconstrained environments with broad filesystem and network access.",
      "**Unsafe deserialization** — serialization formats that allow code execution are loaded without an allow-list.",
      "**Unattested hardware** — accelerator firmware and workloads run without signed, attested boot or workload attestation.",
      "**Unencrypted edge models** — weights ship in plaintext and can be extracted from device storage.",
    ],
    rules: [
      "Isolate every model in a least-privilege sandbox.",
      "Allow-list serialization formats that cannot execute code during deserialization.",
      "Attest hardware and workloads, and protect weights with encryption or confidential computing.",
    ],
    checklist: [
      "Do models execute in isolated sandboxes?",
      "Is deserialization restricted to safe, allow-listed formats?",
      "Is workload/hardware attestation performed before loading?",
      "Are edge-deployed weights signed and encrypted at rest?",
    ],
  },
  C5: {
    risk: "AI pipelines add new authorization surfaces — vector stores, embeddings, and agents — where a single leaked retrieval or service-account permission exposes data across tenants and users.",
    failures: [
      "**Service-account authorization only** — RAG retrieval trusts the service account instead of the end-user's context.",
      "**Broad allow-lists** — AI resources default to permissive access instead of default-deny.",
      "**Standing privilege** — operators hold persistent access to weights and training pipelines.",
      "**PDP in the agent** — authorization decisions run inside the same environment as the agent, so they can be influenced.",
    ],
    rules: [
      "Enforce end-user authorization context at every retrieval and assembly stage.",
      "Default-deny every AI resource with explicit allow-lists.",
      "Isolate the policy decision point from the agent execution environment.",
    ],
    checklist: [
      "Does every AI resource enforce explicit allow-lists and default-deny?",
      "Is the end-user's authorization context enforced through RAG/embedding lookups?",
      "Is privileged access just-in-time and auto-expiring?",
      "Are data classification labels propagated to embeddings, caches, and outputs?",
    ],
  },
  C6: {
    risk: "Third-party models, frameworks, and datasets can carry backdoors, bias, or embedded code. Importing them without provenance and behavioral checks turns a supply-chain compromise into a production vulnerability.",
    failures: [
      "**Unvetted sources** — weights and adapters are pulled from unapproved or unknown origins.",
      "**No malicious-code scan** — model files are imported without scanning for embedded code or pickle-style payloads.",
      "**No AI BOM** — artifacts ship without a machine-readable inventory of datasets, licenses, and origins.",
      "**No acceptance testing** — models are promoted without behavioral acceptance tests.",
    ],
    rules: [
      "Import models only from approved, integrity-verifiable sources.",
      "Scan artifacts for malicious code and run behavioral acceptance tests before promotion.",
      "Publish and sign a version-controlled AI BOM for every artifact.",
    ],
    checklist: [
      "Are models downloaded only from approved, integrity-verified sources?",
      "Is every artifact scanned for malicious code and behavior-tested?",
      "Is a signed AI BOM published and validated before deployment?",
      "Does an AI BOM completeness failure block the build?",
    ],
  },
  C7: {
    risk: "Unvalidated model output can carry injection payloads, fabricated claims, or unsafe content straight into users or downstream systems. Output is a new untrusted boundary that must be checked before it is consumed.",
    failures: [
      "**No schema validation** — raw model output flows downstream without structure or rejection.",
      "**No confidence or hallucination gate** — low-confidence or fabricated answers reach users.",
      "**Fabricated provenance** — the model invents citations instead of deriving them from retrieval metadata.",
      "**Unchecked output content** — outputs that encode instructions or dangerous content are not screened.",
    ],
    rules: [
      "Validate every output against a schema and reject mismatches.",
      "Gate low-confidence and high-risk answers with fallbacks and verification steps.",
      "Derive attribution from retrieval metadata, never from the model's imagination.",
    ],
    checklist: [
      "Are model outputs validated against a schema and bounded by length?",
      "Are hallucinated or low-confidence answers blocked or flagged?",
      "Are RAG attributions traceable to retrieved chunks?",
      "Is generated media watermarked as AI-generated?",
    ],
  },
  C8: {
    risk: "Vector stores and embeddings are persistent memory that attackers can poison, exfiltrate, or abuse to manipulate retrieval. Untrusted content written to memory becomes trusted context in future answers.",
    failures: [
      "**Cross-tenant collisions** — vector namespaces are not unique per tenant.",
      "**Sensitive fields embedded** — raw PII or secrets are embedded without masking or redaction.",
      "**Untrusted writes to memory** — agent/tool output is auto-persisted without source validation.",
      "**No expiry or revocation** — stale or quarantined vectors remain retrievable indefinitely.",
    ],
    rules: [
      "Enforce per-tenant uniqueness and scope constraints on retrieval.",
      "Detect and mask sensitive fields before embedding.",
      "Validate and quarantine untrusted memory writes; enforce expiry and revocation.",
    ],
    checklist: [
      "Are vector identifiers unique per tenant and collision-proof?",
      "Are sensitive fields masked, tokenized, or dropped before embedding?",
      "Are agent/tool outputs validated before writing to memory?",
      "Are expired and quarantined vectors excluded from retrieval?",
    ],
  },
  C9: {
    risk: "Agentic systems act on the world, so a hijacked or runaway agent can spend resources, mutate systems, or execute high-impact actions without human control. Every privileged step needs bounded scope, approval, and a kill-switch.",
    failures: [
      "**Unbounded loops** — no quotas, budgets, or timeouts on tool use, recursion, or spend.",
      "**No approval gate** — high-impact actions execute without human approval.",
      "**Fabricated approvals** — approval evidence is not cryptographically bound to the action.",
      "**Model-enforced controls** — access control decisions depend on the model instead of a policy engine.",
    ],
    rules: [
      "Bound execution with quotas, budgets, timeouts, and circuit breakers.",
      "Require trusted, human approval for high-impact or irreversible actions.",
      "Enforce authorization in application logic, never in the model itself.",
    ],
    checklist: [
      "Are per-tool and per-execution budgets, quotas, and timeouts enforced?",
      "Do high-impact or irreversible actions require verified human approval?",
      "Are access control decisions enforced by a policy engine, not the model?",
      "Does a manual, out-of-band kill-switch exist?",
    ],
  },
  C10: {
    risk: "MCP integrations hand the model tools and data, so a compromised or malicious MCP server becomes a remote-control channel. Authentication, transport, and input validation must hold even against untrusted servers and clients.",
    failures: [
      "**Transport-only trust** — servers rely on TLS without validating access tokens.",
      "**No schema or injection screening** — tool responses are injected into the model context unchecked.",
      "**Token pass-through** — client tokens are forwarded to downstream APIs.",
      "**DNS rebinding exposure** — Host/Origin headers are not independently validated.",
    ],
    rules: [
      "Validate access tokens (issuer, audience, expiry, scope) on every request.",
      "Validate and screen tools/list and tools/call responses before model injection.",
      "Only allow allow-listed components and least-privilege sandboxes.",
    ],
    checklist: [
      "Are access tokens validated on every MCP request?",
      "Are tool responses schema-validated and screened for injection?",
      "Are tokens never persisted or passed through to downstream APIs?",
      "Are Origin and Host headers validated against DNS rebinding?",
    ],
  },
  C11: {
    risk: "Adversarial inputs can make models misclassify, memorize, or leak their training data. Without aligned training, privacy mitigations, and extraction defenses, an API can be turned into a data-exfiltration or model-cloning engine.",
    failures: [
      "**No alignment suite** — model updates ship without running a version-controlled safety test suite.",
      "**Uncalibrated outputs** — overconfident predictions reveal sensitive attributes.",
      "**Generic rate limits** — throttles ignore the extraction threat model.",
      "**Exposed raw outputs** — raw model output exposes detail that aids cloning.",
    ],
    rules: [
      "Run adversarial and alignment testing on every model update.",
      "Limit membership inference with calibration, differential privacy, and rate limits.",
      "Detect and deter extraction with query-pattern analysis and watermarking.",
    ],
    checklist: [
      "Is the model aligned, safety-trained, and adversarially evaluated?",
      "Are sensitive attributes and overconfident predictions suppressed?",
      "Are per-principal rate limits sized to the extraction threat model?",
      "Does query-pattern analysis feed an extraction detector?",
    ],
  },
  C12: {
    risk: "AI-specific abuse — jailbreaks, prompt injection, extraction, covert channels — is invisible without purpose-built telemetry. Logging and detection must capture what the model sees, does, and returns, with attribution granular enough to investigate.",
    failures: [
      "**No AI telemetry** — interactions are logged without session context or model/token metadata.",
      "**No detection rules** — jailbreak, injection, and extraction attempts raise no alerts or enrichments.",
      "**No drift monitoring** — distribution and hallucination drift go unnoticed until users complain.",
      "**No lifecycle audit** — dataset lineage and model changes are not immutable or auditable.",
    ],
    rules: [
      "Log AI interactions with session context and structured AI telemetry.",
      "Detect and enrich known AI attack patterns with AI-specific context.",
      "Track drift, hallucination rates, and provenance as continuous metrics.",
    ],
    checklist: [
      "Are AI interactions logged with model, token, and session metadata?",
      "Are jailbreak, injection, and extraction attempts detected and alerted?",
      "Is data/hallucination drift tracked as continuous metrics?",
      "Are model and dataset changes recorded in immutable audit logs?",
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Requirements: [chapterId, sectionId, reqId, level, title, "Verify that ..."]
// ─────────────────────────────────────────────────────────────────────────────
const R = [
  // ── C1 Training Data Integrity & Traceability ──────────────────────────────
  ["C1","1.1","1.1.1","1","Restrict training data to required fields","Verify that training data includes only features, attributes, and fields required for the model's stated purpose."],
  ["C1","1.1","1.1.2","2","Maintain training data source inventory","Verify that an up-to-date inventory is kept of every training-data source, including its origin, responsible party, license, collection method, intended use constraints, and processing history."],
  ["C1","1.1","1.1.3","2","Protect training data integrity in storage and transfer","Verify that data integrity is provided when training data is stored and transferred."],
  ["C1","1.1","1.1.4","2","Monitor training data integrity","Verify that integrity monitoring is applied to guard against unauthorized modifications or corruption of training data."],
  ["C1","1.1","1.1.5","3","Watermark datasets for provenance","Verify that datasets are watermarked so their use can be attributed and any unauthorized use detected."],
  ["C1","1.2","1.2.1","1","Restrict annotation access","Verify that labeling platforms enforce access controls that restrict who can create, modify, or approve annotations."],
  ["C1","1.2","1.2.2","2","Protect labeling artifacts with cryptographic integrity","Verify that cryptographic integrity is applied to labeling artifacts."],
  ["C1","1.2","1.2.3","2","Protect sensitive label content","Verify that sensitive information in labels is redacted, anonymized, or encrypted before being used in any labeling artifact."],
  ["C1","1.3","1.3.1","2","Detect training data poisoning","Verify that training and fine-tuning pipelines implement poisoning detection techniques to identify potential data poisoning or unintentional corruption in training data."],
  ["C1","1.3","1.3.2","2","Validate automatic labels","Verify that automatically generated labels are subject to confidence thresholds and consistency checks to detect misleading or low-confidence labels."],
  ["C1","1.3","1.3.3","2","Evaluate models for bias","Verify that models used in security-relevant decisions are evaluated for bias patterns."],
  ["C1","1.3","1.3.4","2","Remove disallowed content before training","Verify that disallowed content is detected and removed before training."],
  ["C1","1.3","1.3.5","3","Defend against clean-label poisoning","Verify that defenses against clean-label poisoning attacks are implemented."],
  // ── C2 Input Validation ────────────────────────────────────────────────────
  ["C2","2.1","2.1.1","1","Normalize input before tokenization","Verify that input normalization is applied before tokenization or embedding."],
  ["C2","2.1","2.1.2","1","Detect encoding and representation smuggling","Verify that encoding and representation smuggling in inputs is detected and mitigated. Approved mitigations include canonicalization, strict schema validation, policy-based rejection, or explicit marking."],
  ["C2","2.1","2.1.3","1","Screen model-steering inputs for prompt injection","Verify that all inputs that could steer model behavior are treated as untrusted and screened by a prompt injection detection ruleset or classifier, with flagged inputs blocked."],
  ["C2","2.1","2.1.4","1","Reject over-limit inputs","Verify that input length controls prevent content from exceeding the context window. The controls must reject inputs that exceed token limits rather than truncating them."],
  ["C2","2.1","2.1.5","1","Restrict input character set with allow-list","Verify that the system implements a character set restriction for all inputs. The restriction must use an allow-list approach that permits only characters that are explicitly required."],
  ["C2","2.1","2.1.6","2","Enforce instruction hierarchy","Verify that the system enforces an instruction hierarchy in which system and developer messages override user instructions and other untrusted inputs, even after user instructions have been processed."],
  ["C2","2.1","2.1.7","2","Encode reserved special tokens","Verify that reserved special tokens are encoded as literal characters and cannot be injected into the model context."],
  ["C2","2.1","2.1.8","3","Detect many-shot jailbreaking","Verify that the system can detect many-shot jailbreaking patterns."],
  ["C2","2.2","2.2.1","1","Screen prompt content against policy","Verify that every prompt is scored by a content classifier for violence, self-harm, hate, and sexual content against configurable thresholds. Prompts that exceed those thresholds are rejected or sanitized before reaching the model context."],
  ["C2","2.2","2.2.2","1","Evaluate content classification for unsupported languages","Verify that prompt content classification is evaluated for unsupported languages."],
  ["C2","2.2","2.2.3","2","Screen non-text inputs for hidden content","Verify that non-text inputs (image/video/audio) are checked for adversarial perturbations, steganographic payloads, hidden or embedded content, or known attack patterns."],
  ["C2","2.2","2.2.4","3","Detect coordinated multi-input attacks","Verify that coordinated attacks spanning multiple input types (e.g., steganographic payloads in images combined with prompt injection in text) are detected and blocked."],
  // ── C3 Model Lifecycle Management & Change Control ─────────────────────────
  ["C3","3.1","3.1.1","1","Maintain model registry","Verify that a model registry maintains an inventory of all deployed model artifacts and their origin."],
  ["C3","3.1","3.1.2","2","Sign model artifacts","Verify that all model artifacts (weights, configurations, tokenizers, base models, fine-tunes, adapters, and safety/policy models) are cryptographically signed by authorized entities."],
  ["C3","3.1","3.1.3","2","Verify model signatures on load","Verify that model cryptographic signatures are verified at deployment admission and on load."],
  ["C3","3.2","3.2.1","1","Test models before deployment","Verify that models undergo automated input validation testing, safety evaluation testing, and output sanitization testing before deployment."],
  ["C3","3.2","3.2.2","2","Re-evaluate quantized models","Verify that models subjected to post-training quantization are re-evaluated against the same safety and alignment test suite on the compressed artifact before deployment."],
  ["C3","3.2","3.2.3","3","Re-evaluate on model changes","Verify that provider model, version, or routing changes trigger security re-evaluation before continued use."],
  ["C3","3.3","3.3.1","2","Implement controlled rollouts with rollback","Verify that production deployments implement rollout mechanisms with automated rollback triggers."],
  ["C3","3.3","3.3.2","2","Restore complete model state on rollback","Verify that rollback capabilities restore the complete model state."],
  ["C3","3.3","3.3.3","2","Isolate parallel model runtime state","Verify that model versions running in parallel use isolated runtime state so that AI-specific shared resources are not shared across deployments."],
  ["C3","3.4","3.4.1","1","Separate runtime components across environments","Verify that AI-specific runtime components are not shared across environment boundaries (e.g., development, staging, production)."],
  ["C3","3.4","3.4.2","2","Isolate training from production","Verify that model training and fine-tuning environments are isolated from production environments."],
  ["C3","3.5","3.5.1","2","Verify RLHF models before training","Verify that models used in RLHF fine-tuning are versioned and integrity-verified before use in a training run."],
  ["C3","3.5","3.5.2","3","Detect reward hacking in RLHF","Verify that RLHF training stages include automated detection of reward hacking or reward model over-optimization."],
  ["C3","3.5","3.5.3","3","Verify multi-stage fine-tuning outputs","Verify that in multi-stage fine-tuning pipelines, each stage's output is integrity-verified before it is consumed by the next stage."],
  ["C3","3.5","3.5.4","3","Register fine-tuning checkpoints","Verify that fine-tuning checkpoints are registered as distinct artifacts."],
  // ── C4 Infrastructure, Configuration & Deployment Security ─────────────────
  ["C4","4.1","4.1.1","1","Isolate AI models in sandboxes","Verify that AI models execute in isolated sandboxes."],
  ["C4","4.1","4.1.2","1","Restrict deserialization formats","Verify that model artifact loading enforces an explicit allow-list of serialization formats that do not permit arbitrary code execution during deserialization."],
  ["C4","4.1","4.1.3","3","Attest workloads before model loading","Verify that workload attestation is performed before model loading to provide proof that the execution environment has not been tampered with."],
  ["C4","4.1","4.1.4","3","Protect weights with confidential inference","Verify that confidential inference services protect model weights during runtime through isolated execution environments."],
  ["C4","4.2","4.2.1","2","Pin, sign, and attest accelerator firmware","Verify that AI accelerator (GPU) firmware is version-pinned, signed, and attested at boot."],
  ["C4","4.2","4.2.2","3","Use TEE for hardware-enforced isolation","Verify that execution within a trusted execution environment (TEE) provides hardware-enforced isolation, memory encryption, and integrity protection."],
  ["C4","4.2","4.2.3","3","Attest accelerator integrity before workloads","Verify that AI accelerator (GPU) integrity is validated using hardware-based attestation mechanisms before each workload executes."],
  ["C4","4.2","4.2.4","3","Isolate accelerator memory between workloads","Verify that accelerator (GPU) memory is isolated between workloads through partitioning mechanisms with memory sanitization between jobs."],
  ["C4","4.2","4.2.5","3","Restrict accelerator interconnects","Verify that accelerator interconnects are restricted to approved topologies and authenticated endpoints."],
  ["C4","4.3","4.3.1","1","Authenticate edge AI devices","Verify that edge AI devices authenticate to central infrastructure using strong authentication mechanisms."],
  ["C4","4.3","4.3.2","2","Sign and verify edge models","Verify that models deployed to edge or mobile devices are cryptographically signed during packaging, and that the on-device runtime validates these signatures or checksums before loading or inference."],
  ["C4","4.3","4.3.3","3","Isolate inference runtime access","Verify that inference runtimes enforce process, memory, and file access isolation."],
  ["C4","4.3","4.3.4","3","Encrypt local model weights","Verify that model weights and sensitive parameters stored locally are encrypted using hardware-backed key stores or secure enclaves."],
  ["C4","4.3","4.3.5","3","Encrypt packaged models at rest","Verify that models packaged within mobile, IoT, or embedded applications are encrypted at rest, and decrypted only inside a trusted runtime or secure enclave, preventing direct extraction from the app package or filesystem."],
  // ── C5 Access Control & Identity ───────────────────────────────────────────
  ["C5","5.1","5.1.1","3","Require step-up auth for high-risk AI operations","Verify that high-risk AI operations (model deployment, weight export, training data access, production configuration changes) require step-up authentication."],
  ["C5","5.1","5.1.2","3","Authenticate federated AI agents with short-lived tokens","Verify that AI agents in federated or multi-system deployments authenticate using short-lived, minimal-scoped, cryptographically signed tokens."],
  ["C5","5.2","5.2.1","2","Default-deny AI resources","Verify that every AI resource (datasets, endpoints, vector collections, embedding indices, compute instances) enforces access controls with explicit allow-lists and default-deny policies."],
  ["C5","5.2","5.2.2","2","Enforce user authorization in retrieval pipelines","Verify that retrieval pipelines (e.g., RAG queries, embedding lookups) enforce the end-user's authorization context at each retrieval and assembly stage, rather than relying solely on the service account's permissions."],
  ["C5","5.2","5.2.3","2","Retrieve sensitive data via pipelines","Verify that sensitive data is retrieved via retrieval pipelines (e.g., RAG queries, embedding lookups) to prevent permanent storage in models."],
  ["C5","5.2","5.2.4","2","Filter unauthorized data from responses","Verify that post-inference filtering mechanisms prevent responses from including data that the requester is not authorized to receive."],
  ["C5","5.2","5.2.5","2","Isolate the policy decision point","Verify that the policy decision point for agent authorization is isolated from the agent's execution environment."],
  ["C5","5.2","5.2.6","3","Grant privileged access just in time","Verify that privileged access to model weights, training pipelines, and production AI configuration is granted just in time, with a defined maximum session duration and automatic expiry. Zero Standing Privilege (ZSP) to these resources is encouraged."],
  ["C5","5.2","5.2.7","3","Propagate data classification labels","Verify that data classification labels propagate to downstream resources (embeddings, prompt caches, model outputs)."],
  ["C5","5.3","5.3.1","2","Prevent cross-tenant model interference","Verify that shared model serving infrastructure prevents one tenant's fine-tuning, inference, or embedding operations from influencing or observing another tenant's operations."],
  ["C5","5.3","5.3.2","3","Prevent cross-tenant compute observation","Verify that one tenant cannot influence or observe another tenant's operations through shared compute resources. Satisfying this requirement typically requires hardware partitioning, confidential computing, or dedicated per-tenant compute allocation."],
  // ── C6 Supply Chain Security for Models ────────────────────────────────────
  ["C6","6.1","6.1.1","1","Scan models for malicious code","Verify that models are scanned for malicious code before import."],
  ["C6","6.1","6.1.2","1","Download from approved sources only","Verify that model weights, datasets, and fine-tuning adapters are downloaded only from approved sources."],
  ["C6","6.1","6.1.3","2","Verify third-party artifact integrity","Verify that every third-party model artifact can be integrity-verified."],
  ["C6","6.1","6.1.4","2","Run behavioral acceptance tests","Verify that models pass a behavioral acceptance test suite before being promoted to any non-development environment."],
  ["C6","6.2","6.2.1","1","Publish machine-readable AI BOMs","Verify that every model artifact publishes a version-controlled, machine-readable AI BOM listing datasets, weights, licenses, and data-origin statements."],
  ["C6","6.2","6.2.2","2","Sign AI BOMs","Verify that AI BOMs are cryptographically signed before deployment."],
  ["C6","6.2","6.2.3","2","Fail build on incomplete AI BOMs","Verify that AI BOM completeness checks fail the build if any component metadata is missing."],
  // ── C7 Model Behavior, Output Control & Safety Assurance ───────────────────
  ["C7","7.1","7.1.1","1","Validate outputs against a schema","Verify that the application validates all model outputs against a defined schema and rejects any output that does not match."],
  ["C7","7.1","7.1.2","1","Bound output length","Verify that model-generated output is bounded by length limits and termination controls."],
  ["C7","7.2","7.2.1","2","Estimate answer confidence","Verify that the system assesses the reliability of generated answers using a confidence estimation method."],
  ["C7","7.2","7.2.2","2","Block low-confidence answers","Verify that the application automatically blocks answers or switches to a fallback message if the confidence score drops below a defined threshold."],
  ["C7","7.2","7.2.3","3","Verify high-risk responses","Verify that for responses classified as high-risk by policy, the system performs an additional verification step."],
  ["C7","7.3","7.3.1","1","Block harmful output content","Verify that automated classifiers scan every response and block content that matches defined harmful content categories."],
  ["C7","7.3","7.3.2","2","Block system prompt disclosure","Verify that output filters detect and block responses that disclose system prompt content or backend data."],
  ["C7","7.3","7.3.3","2","Prevent outbound requests from output","Verify that model-generated output is prevented from triggering outbound requests."],
  ["C7","7.3","7.3.4","3","Detect hidden output content","Verify that model outputs are checked for hidden, encoded, or misleading content created through homoglyphs, formatting, metadata, or structured fields."],
  ["C7","7.4","7.4.1","1","Attribute RAG responses","Verify that responses generated using retrieval-augmented generation (RAG) include attribution to the source documents."],
  ["C7","7.4","7.4.2","1","Derive attribution from retrieval metadata","Verify that RAG attributions are derived from retrieval metadata and are not generated by the model, so provenance cannot be fabricated."],
  ["C7","7.4","7.4.3","2","Trace claims to retrieved chunks","Verify that claims in a RAG response can be traced to the retrieved chunk."],
  ["C7","7.4","7.4.4","3","Watermark generated media","Verify that generated media is watermarked to prove it was AI-generated."],
  // ── C8 Memory, Embeddings & Vector Database Security ───────────────────────
  ["C8","8.1","8.1.1","1","Enforce tenant-unique vector identifiers","Verify that vector identifiers and namespaces enforce uniqueness per tenant and prevent cross-tenant collisions."],
  ["C8","8.1","8.1.2","2","Make document metadata tags immutable","Verify that document metadata tags are immutable after the initial write."],
  ["C8","8.1","8.1.3","2","Enforce retrieval scope constraints","Verify that retrieval operations enforce scope constraints."],
  ["C8","8.2","8.2.1","1","Mask sensitive fields before embedding","Verify that sensitive fields are detected before embedding and are masked, tokenized, or dropped."],
  ["C8","8.2","8.2.2","2","Quarantine outlying vectors","Verify that vectors that fall outside normal clustering patterns are flagged and quarantined before entering production indices."],
  ["C8","8.2","8.2.3","2","Validate agent outputs before memory writes","Verify that agent outputs and tool outputs are not automatically written to trusted agent memory without explicit source validation."],
  ["C8","8.2","8.2.4","3","Detect retrieval-manipulation content","Verify that content crafted to manipulate retrieval results is detected and rejected or quarantined before vectorization."],
  ["C8","8.2","8.2.5","3","Check memory writes for contradictions","Verify that new content written to memory is checked for contradictions with what is already stored and that conflicts trigger alerts."],
  ["C8","8.3","8.3.1","2","Exclude expired vectors from retrieval","Verify that expired vectors are excluded from retrieval results."],
  ["C8","8.3","8.3.2","2","Allow memory reset","Verify that memory can be reset."],
  ["C8","8.3","8.3.3","3","Retain quarantined content out of retrieval","Verify that quarantined content is retained but excluded from all retrieval results."],
  // ── C9 Orchestration & Agentic Security ────────────────────────────────────
  ["C9","9.1","9.1.1","1","Enforce per-tool quotas and timeouts","Verify that per-tool quotas and timeouts (e.g., CPU, memory, disk, egress, and execution time) are enforced."],
  ["C9","9.1","9.1.2","1","Enforce per-execution budgets","Verify that per-execution budgets (e.g., max recursion depth, token use, and monetary spend) are configured and enforced by the runtime."],
  ["C9","9.1","9.1.3","2","Provide a swarm kill-switch","Verify that a swarm-level kill-switch exists that can halt all active agent instances."],
  ["C9","9.2","9.2.1","1","Require human approval for high-impact actions","Verify that the agent runtime blocks execution of privileged, high-impact, or irreversible actions until explicit human approval is received and verified."],
  ["C9","9.2","9.2.2","2","Display canonicalized approval parameters","Verify that approval requests display canonicalized and complete action parameters, such as diffs, commands, recipients, amounts, resources, and scopes, without truncation or unsafe transformation."],
  ["C9","9.2","9.2.3","2","Classify action reversibility","Verify that each high-impact action has a trusted reversibility classification, such as read-only, reversible, externally reversible, or irreversible."],
  ["C9","9.2","9.2.4","2","Enforce reversibility classifications","Verify that the agent runtime enforces reversibility classifications by blocking, requiring approval, or restricting actions based on their impact and ability to be reversed."],
  ["C9","9.2","9.2.5","2","Bound self-modification capabilities","Verify that any self-modification capability (e.g., prompt rewriting, tool-list changes, parameter updates) is restricted by enforceable boundaries."],
  ["C9","9.2","9.2.6","2","Add AI-augmented review of high-risk actions","Verify that agentic systems include an AI-augmented review of planned high-risk actions before execution that adds to, and does not replace, the deterministic policy gate."],
  ["C9","9.2","9.2.7","2","Protect review from manipulation","Verify that the AI-augmented review mechanism is protected against manipulation by adversarial inputs, and cannot be overridden or bypassed through prompt injection."],
  ["C9","9.2","9.2.8","3","Cryptographically bind approvals","Verify that approvals are cryptographically bound to action parameters, requester identity, execution context, and a unique single-use nonce."],
  ["C9","9.2","9.2.9","3","Isolate approval key material","Verify that cryptographic key material or credentials used to issue approvals are isolated from the agent runtime."],
  ["C9","9.2","9.2.10","3","Enforce highest-impact reversibility in chains","Verify that approval gates for multi-step or multi-agent action chains enforce the highest-impact reversibility classification present anywhere in the chain."],
  ["C9","9.3","9.3.1","1","Isolate tools in least-privilege sandboxes","Verify that each tool/plugin executes in a least-privilege sandbox or is otherwise isolated from model operations."],
  ["C9","9.3","9.3.2","1","Validate tool outputs against schemas","Verify that tool outputs are validated against schemas."],
  ["C9","9.3","9.3.3","2","Declare tool privileges in manifests","Verify that tool manifests declare required privileges, resource limits, and output validation requirements."],
  ["C9","9.3","9.3.4","2","Enforce tool manifest constraints","Verify that the runtime enforces the privileges, resource limits, and output-validation requirements declared in tool manifests."],
  ["C9","9.3","9.3.5","2","Isolate untrusted data from tool calling","Verify that components processing untrusted data are isolated from tool-calling capabilities, ensuring that compromised data processing cannot trigger unauthorized tool invocations."],
  ["C9","9.3","9.3.6","2","Separate untrusted tool output processing","Verify that there is architectural separation between processing of untrusted tool outputs and agent operations."],
  ["C9","9.3","9.3.7","2","Verify external resources against allow-lists","Verify that external resources named in model output are verified against an approved allow-list or registry before the agent installs or invokes them."],
  ["C9","9.3","9.3.8","3","Automate tool containment on policy violations","Verify that policy violations trigger automated tool containment."],
  ["C9","9.4","9.4.1","2","Give agents unique cryptographic identity","Verify that each agent instance has a unique cryptographic identity and authenticates as a first-class principal to downstream systems."],
  ["C9","9.4","9.4.2","2","Bind actions to the execution chain","Verify that agent-initiated actions are cryptographically bound to each step of the execution chain for non-repudiation."],
  ["C9","9.4","9.4.3","3","Rotate agent identity credentials","Verify that agent identity credentials rotate on a defined schedule."],
  ["C9","9.4","9.4.4","3","Protect persisted agent state","Verify that agent state persisted between invocations is integrity-protected."],
  ["C9","9.5","9.5.1","2","Authorize actions against fine-grained policy","Verify that agent actions are authorized against fine-grained policies enforced by the runtime that restrict which tools an agent may invoke, and which parameter values it may supply."],
  ["C9","9.5","9.5.2","2","Propagate scope-limited user tokens","Verify that when an agent acts on a user's behalf, the runtime propagates an integrity-protected, scope-limited token that carries the user's authorization context and is enforced at every downstream call."],
  ["C9","9.5","9.5.3","2","Enforce access control outside the model","Verify that all access control decisions are enforced by application logic or a policy engine, never by the AI model itself."],
  ["C9","9.5","9.5.4","2","Keep secrets out of model context","Verify that secrets and credentials required by an agent at runtime are not exposed within the model's observable context, including the context window, system prompts, or tool call parameters."],
  ["C9","9.5","9.5.5","2","Restrict inter-agent delegation","Verify that inter-agent task delegation is restricted by an explicit authorization policy."],
  ["C9","9.5","9.5.6","3","Re-evaluate authorization on privileged actions","Verify that long-running agent sessions re-evaluate current backend authorization policy on every privileged action."],
  ["C9","9.6","9.6.1","1","Provide a manual inference kill-switch","Verify that a manual kill-switch mechanism exists to immediately halt AI model inference and outputs."],
  ["C9","9.6","9.6.2","2","Block actions on missed approvals","Verify that when a human-approval gate is not satisfied within the defined approval time, the system blocks the pending action."],
  ["C9","9.6","9.6.3","3","Isolate kill-switch channel","Verify that kill-switch commands are implemented through an out-of-band channel that is isolated from the agent runtime."],
  // ── C10 Model Context Protocol (MCP) Security ──────────────────────────────
  ["C10","10.1","10.1.1","1","Verify MCP component provenance","Verify that MCP components are obtained only from trusted sources and cryptographically verified."],
  ["C10","10.1","10.1.2","2","Allow-list MCP servers","Verify that only allow-listed MCP servers are permitted."],
  ["C10","10.1","10.1.3","2","Sandbox local MCP servers","Verify that locally launched MCP servers run in a least-privilege sandbox with restricted file system, network, and system access."],
  ["C10","10.2","10.2.1","1","Validate MCP access tokens","Verify that MCP servers validate access tokens for each request and do not rely on transport security alone."],
  ["C10","10.2","10.2.2","1","Validate token claims per OAuth 2.1","Verify that MCP servers validate the presented access token's issuer, audience, expiration, and scope claims in accordance with OAuth 2.1."],
  ["C10","10.2","10.2.3","1","Avoid persisting tokens","Verify that MCP servers acting as OAuth 2.1 resource servers do not store or persist access tokens or user credentials."],
  ["C10","10.2","10.2.4","2","Expose authorized tools only","Verify that MCP tools/list returns only tools permitted by resource owners' authorized scopes."],
  ["C10","10.2","10.2.5","2","Authorize each tool invocation","Verify that MCP servers enforce access control on every tool invocation, validating that the user's access token authorizes both the requested tool and the specific argument values supplied."],
  ["C10","10.2","10.2.6","2","Remove session artifacts on termination","Verify that MCP servers ensure all session artifacts are removed when a session terminates."],
  ["C10","10.2","10.2.7","2","Do not pass through access tokens","Verify that MCP servers do not pass through access tokens received from clients to downstream APIs."],
  ["C10","10.3","10.3.1","1","Use authenticated encrypted HTTP transport","Verify that authenticated, encrypted streamable HTTP is used for MCP transport for remote services."],
  ["C10","10.3","10.3.2","1","Restrict stdio transport","Verify that stdio transport is permitted only in controlled local environments."],
  ["C10","10.3","10.3.3","2","Validate Origin and Host headers","Verify that MCP servers validate both the Origin header and the Host header independently on all HTTP-based transports to prevent DNS rebinding attacks."],
  ["C10","10.3","10.3.4","2","Enforce minimum protocol version","Verify that MCP clients enforce a minimum acceptable protocol version and reject initialize responses that propose a version below that minimum."],
  ["C10","10.3","10.3.5","3","Sender-constrain MCP tokens","Verify that access tokens between the MCP client and server are sender-constrained using mTLS or DPoP."],
  ["C10","10.4","10.4.1","1","Validate MCP responses against schemas","Verify that MCP tools/list and tools/call responses are validated against their declared schemas before being injected into the model context."],
  ["C10","10.4","10.4.2","1","Screen MCP responses for injection","Verify that MCP tools/list and tools/call responses are screened for indirect prompt injection before being injected into the model context."],
  ["C10","10.4","10.4.3","1","Reject unrecognized parameters","Verify that MCP servers reject unrecognized or oversized parameters in function calls."],
  ["C10","10.4","10.4.4","2","Enforce strict MCP schema validation","Verify that all MCP servers enforce strict schema validation."],
  ["C10","10.4","10.4.5","2","Enforce MCP payload limits","Verify that all MCP transports enforce maximum payload size limits."],
  ["C10","10.4","10.4.6","2","Sign tool responses against replay","Verify that MCP servers sign tool responses with a unique nonce and timestamp so MCP clients can detect replay attempts."],
  ["C10","10.4","10.4.7","2","Require consent for local MCP installs","Verify that MCP clients present users with explicit consent dialogue and cancellation options upon installation of a local MCP server."],
  ["C10","10.4","10.4.8","3","Re-approve changed tool definitions","Verify that MCP clients maintain a snapshot of tool definitions and that any change to a tool definition triggers re-approval before the modified tool can be invoked."],
  // ── C11 Adversarial Robustness ─────────────────────────────────────────────
  ["C11","11.1","11.1.1","1","Apply alignment and safety training","Verify that the model has undergone alignment and safety training or fine-tuning to prevent the model from generating disallowed content categories."],
  ["C11","11.1","11.1.2","1","Run version-controlled alignment tests","Verify that a version-controlled alignment test suite is run on every model update or release."],
  ["C11","11.1","11.1.3","1","Evaluate against adversarial techniques","Verify that models are evaluated against known adversarial attack techniques relevant to their modality."],
  ["C11","11.1","11.1.4","2","Harden models against adversarial inputs","Verify that models are hardened against adversarial inputs."],
  ["C11","11.1","11.1.5","3","Measure and gate harmful-content rate","Verify that an automated evaluator measures harmful-content rate and flags regressions beyond a defined threshold."],
  ["C11","11.2","11.2.1","1","Suppress inferred sensitive attributes","Verify that model-inferred sensitive attributes are not directly returned in outputs."],
  ["C11","11.2","11.2.2","1","Size rate limits to extraction threat","Verify that inference endpoints enforce per-principal and global rate limits sized to the extraction threat model, and not solely as a generic API throttle."],
  ["C11","11.2","11.2.3","2","Calibrate model outputs","Verify that model outputs are calibrated to reduce overconfident predictions."],
  ["C11","11.2","11.2.4","2","Use differentially-private training","Verify that training on sensitive datasets employs differentially-private optimization."],
  ["C11","11.2","11.2.5","3","Simulate membership-inference attacks","Verify that membership-inference attack simulations demonstrate that attack accuracy does not exceed random guessing on evaluated data."],
  ["C11","11.3","11.3.1","1","Feed extraction detection via query patterns","Verify that query-pattern analysis feeds an extraction-attempt detector."],
  ["C11","11.3","11.3.2","2","Limit raw output exposure","Verify that raw model outputs are not directly exposed beyond the application backend, and that externally visible responses are calibrated to the extraction risk level."],
  ["C11","11.3","11.3.3","3","Watermark or fingerprint models","Verify that model watermarking or fingerprinting techniques are applied so that unauthorized copies can be identified."],
  ["C11","11.3","11.3.4","3","Respond to suspected extraction","Verify that detection of suspected extraction triggers response measures."],
  ["C11","11.4","11.4.1","2","Anomaly-detect inputs before inference","Verify that inputs from external or untrusted sources pass through anomaly detection before model inference."],
  ["C11","11.4","11.4.2","2","Gate anomalous inputs","Verify that inputs flagged as anomalous trigger gating actions."],
  ["C11","11.4","11.4.3","3","Protect feedback pipeline from poisoning","Verify that the safety violation feedback pipeline includes poisoning detection and human review gates to prevent adversarial manipulation of the improvement mechanism."],
  // ── C12 Monitoring, Logging & Anomaly Detection ────────────────────────────
  ["C12","12.1","12.1.1","1","Log AI interactions with telemetry","Verify that AI interactions are logged with session context and AI-specific telemetry."],
  ["C12","12.1","12.1.2","2","Log safety filtering decisions","Verify that safety filtering and policy decisions are logged with sufficient detail to support audit, debugging, and forensic analysis of content moderation systems."],
  ["C12","12.1","12.1.3","2","Use structured inference log schema","Verify that log entries for AI inference events follow a structured, interoperable schema that includes at least the model identifier, token usage (input and output), provider name, and operation type."],
  ["C12","12.1","12.1.4","2","Log RAG retrieval events","Verify that RAG pipeline retrieval events are logged, including the query, documents retrieved, and knowledge source."],
  ["C12","12.2","12.2.1","1","Alert on jailbreak and injection","Verify that the system detects and alerts on known jailbreak patterns, prompt injection attempts, and adversarial inputs."],
  ["C12","12.2","12.2.2","2","Detect behavioral anomalies","Verify that behavioral anomaly detection identifies unusual conversation patterns, excessive retry attempts, or probing behaviors."],
  ["C12","12.2","12.2.3","2","Detect AI threat patterns","Verify that custom rules detect AI-specific threat patterns for coordinated jailbreak attempts, prompt injection, and system prompt extraction attempts."],
  ["C12","12.2","12.2.4","2","Include query metadata in extraction alerts","Verify that extraction-alert events include offending query metadata to support investigation."],
  ["C12","12.2","12.2.5","2","Track token usage granularly","Verify that token usage is tracked at granular attribution levels including per user, per session, per feature endpoint, and per team or workspace."],
  ["C12","12.2","12.2.6","3","Monitor for covert-channel indicators","Verify that LLM API traffic is monitored for covert-channel indicators and communication signatures to identify malware and command-and-control (C2) activity."],
  ["C12","12.3","12.3.1","1","Detect data drift","Verify that data drift detection monitors input distribution changes that may impact model performance, using statistically validated methods matched to the input data type (e.g., KS test or PSI for tabular numeric features, embedding-distance metrics for text or image)."],
  ["C12","12.3","12.3.2","2","Detect hallucination","Verify that hallucination detection monitors identify and flag model outputs that contain factually incorrect, inconsistent, or fabricated information."],
  ["C12","12.3","12.3.3","2","Track hallucination rates as time series","Verify that hallucination rates are tracked as continuous time-series metrics to enable trend analysis and detection of sustained model degradation."],
  ["C12","12.3","12.3.4","3","Distinguish unexplained behavioral shifts","Verify that unexplained behavioral shifts are distinguished from gradual, expected operational drift."],
  ["C12","12.4","12.4.1","2","Analyze proactive action triggers","Verify that autonomous action triggers include proactive behavior-pattern analysis, security evaluation, and threat-landscape assessment."],
  ["C12","12.4","12.4.2","2","Audit security-critical proactive actions","Verify that audit logs capture security-critical proactive actions, including approver identity, timestamp, action parameters, and decision outcomes."],
  ["C12","12.4","12.4.3","2","Log kill-switch activations","Verify that kill-switch activations and override commands are logged."],
  ["C12","12.5","12.5.1","1","Record dataset lineage","Verify that dataset lineage records each dataset and its components, including all transformations, augmentations, and merges."],
  ["C12","12.5","12.5.2","1","Log labeling activities","Verify that all labeling activities are recorded in logs."],
  ["C12","12.5","12.5.3","2","Make model changes immutable","Verify that all model changes generate immutable audit records."],
  ["C12","12.5","12.5.4","2","Tag ingested documents at write time","Verify that every ingested document is tagged at write time with source, writer identity, and timestamp."],
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const chapterById = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]));
const sectionById = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));

const STOP = new Set([
  "that","this","with","from","which","their","must","only","into",
  "will","have","when","they","about","these","been","being","using",
]);

function summarize(verify) {
  let s = verify.replace(/^Verify that\s+/i, "");
  s = s.charAt(0).toUpperCase() + s.slice(1);
  if (s.length > 160) s = s.slice(0, 157).trimEnd() + "...";
  return s;
}

function tagsFromTitle(title) {
  return title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !STOP.has(w))
    .slice(0, 3);
}

function difficultyForLevel(level) {
  return level === "1" ? "foundational" : level === "2" ? "intermediate" : "advanced";
}

const controls = R.map(([chapterId, sectionNum, reqId, level, title, verify]) => {
  const controlId = `C${reqId}`;
  const sectionId = `C${sectionNum}`;
  const canonicalId = `v${VERSION}-${controlId}`;
  const slug = `${controlId.toLowerCase().replace(/\./g, "-")}-${kebab(title)}`;
  const summary = summarize(verify);
  const chapter = chapterById[chapterId];
  const section = sectionById[sectionId];
  return {
    chapterId, sectionId, controlId, canonicalId, slug, level, title, verify, summary,
    chapterTitle: chapter.title, sectionTitle: section.title,
    tags: tagsFromTitle(title), difficulty: difficultyForLevel(level),
  };
});

const chapterSeq = {};
for (const c of controls) (chapterSeq[c.chapterId] ??= []).push(c);
for (const ch of Object.values(chapterSeq)) {
  ch.forEach((c, i) => {
    c.related = [];
    if (i + 1 < ch.length) c.related.push(ch[i + 1]);
    if (i > 0 && c.related.length < 2) c.related.push(ch[i - 1]);
  });
}

function refsFor(chapterId) {
  return [AISVS_REF, ...CHAPTER_REFERENCES[chapterId]];
}

function yamlRefs(chapterId) {
  return refsFor(chapterId).map(
    ([label, url]) => `  - label: ${q(label)}\n    url: ${q(url)}`,
  ).join("\n");
}

function bullet(items, indent) {
  return items.map((it) => `${indent}- ${it}`).join("\n");
}

// [[EMIT_BODIES]]
function bodyFor(c) {
  const e = CHAPTER_ENRICH[c.chapterId];
  const whatItMeans = `${c.summary} This is a Level ${c.level} requirement of OWASP AISVS 1.0 (${c.chapterTitle}).`;
  const implementationIntro =
    "Enforce this requirement in deterministic application code or configuration, never in the model's own judgment. Keep reproducible evidence (logs, metrics, test results) for each enforcement point so an auditor can verify it.";
  const keyRules = [
    "Enforce the control in deterministic code or configuration, not through model behavior alone.",
    "Record reproducible evidence — logs, metrics, and test results — for every enforcement point.",
  ];
  return [
    "## What This Control Means",
    "",
    whatItMeans,
    "",
    "## Why This Matters",
    "",
    e.risk,
    "",
    "## Main Security Requirement",
    "",
    `> ${c.verify.replace(/\n/g, " ")}`,
    "",
    "## Common Failure Patterns",
    "",
    bullet(e.failures, ""),
    "",
    "## Secure Implementation",
    "",
    implementationIntro,
    "",
    bullet(e.rules, ""),
    "",
    "## Key Rules",
    "",
    bullet(keyRules, ""),
    "",
    "## Checklist for Code Review",
    "",
    bullet(e.checklist, ""),
    "",
  ].join("\n");
}

function frontmatterFor(c) {
  return [
    "---",
    `schemaVersion: "1.0.0"`,
    `standardVersion: ${q(VERSION)}`,
    `controlId: ${c.controlId}`,
    `canonicalId: ${c.canonicalId}`,
    `slug: ${c.slug}`,
    `title: ${q(c.title)}`,
    `summary: ${q(c.summary)}`,
    "chapter:",
    `  id: ${c.chapterId}`,
    `  title: ${q(c.chapterTitle)}`,
    "section:",
    `  id: ${c.sectionId}`,
    `  title: ${q(c.sectionTitle)}`,
    `levels: [${q(c.level)}]`,
    "tags:",
    ...c.tags.map((t) => `  - ${q(t)}`),
    "keywords: []",
    `difficulty: ${c.difficulty}`,
    `reviewStatus: draft`,
    "references:",
    yamlRefs(c.chapterId),
    "relatedControls:",
    ...c.related.map((r) => [
      `  - id: ${r.controlId}`,
      `    title: ${q(r.title)}`,
      `    href: /controls/${r.slug}/`,
    ]).flat(),
    "---",
  ].join("\n");
}

// [[EMIT2]]
const cats = CHAPTERS.map((c) => {
  const slug = `c${c.id.slice(1).toLowerCase()}-${kebab(c.title)}`;
  return `  {\n    id: ${q(c.id)},\n    slug: ${q(slug)},\n    title: ${q(c.title)},\n    description: ${q(c.objective)},\n    icon: ${q(c.icon)},\n    color: ${q(c.color)},\n    standardVersion: ${q(VERSION)},\n  },`;
}).join("\n");

const categoriesTs = `import type { Category } from "@/types/content";

export const categories: Category[] = [
${cats}
];

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getCategoryById(id: string) {
  return categories.find((category) => category.id === id);
}
`;

const secs = SECTIONS.map((s) => {
  const slug = `${s.id.toLowerCase().replace(".", "-")}-${kebab(s.title)}`;
  const chapterId = s.id.split(".")[0];
  return `  { id: ${q(s.id)}, slug: ${q(slug)}, title: ${q(s.title)}, description: ${q(s.description)}, chapterId: ${q(chapterId)}, standardVersion: ${q(VERSION)} },`;
}).join("\n");

const sectionsTs = `import type { Section } from "@/types/content";

/** AISVS 1.0 sections - official chapter/section hierarchy. */
export const sections: Section[] = [
${secs}
];

/** Lookup a section by its slug. */
export function getSectionBySlug(slug: string): Section | undefined {
  return sections.find((section) => section.slug === slug);
}

/** Return all sections belonging to a chapter. */
export function getSectionsByChapter(chapterId: string): Section[] {
  return sections.filter((section) => section.chapterId === chapterId);
}
`;

const outDir = path.join(ROOT, "content");
const controlsDir = path.join(outDir, "controls");

fs.writeFileSync(path.join(outDir, "categories.ts"), categoriesTs);
fs.writeFileSync(path.join(outDir, "sections.ts"), sectionsTs);

if (!fs.existsSync(controlsDir)) fs.mkdirSync(controlsDir, { recursive: true });
for (const file of fs.readdirSync(controlsDir)) {
  if (file.endsWith(".mdx")) fs.rmSync(path.join(controlsDir, file));
}

for (const c of controls) {
  const text = `${frontmatterFor(c)}\n\n${bodyFor(c)}\n`;
  fs.writeFileSync(path.join(controlsDir, `${c.slug}.mdx`), text);
}

console.log(`Wrote ${CHAPTERS.length} chapters, ${SECTIONS.length} sections, ${controls.length} controls.`);


