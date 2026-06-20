import { Playbook, PlaybookUsageEvent } from "./types";

export const MOCK_PLAYBOOKS: Playbook[] = [
  {
    id: "pb-sqli",
    name: "SQL Injection Response",
    category: "Web Attacks",
    severity: "critical",
    version: "v3.2",
    lastUpdated: "2026-06-01",
    status: "Published",
    purpose: "Standard Operating Procedure for handling active SQL injection probes and successful DB engine bypass attempts detected against internet-facing web portals and APIs.",
    estimatedTime: "25m",
    owner: "SecOps Core Team",
    detectionSources: ["WAF Logs (ModSecurity/Cloudflare)", "Database Audit Logs (pg_stat)", "Zeek HTTP Logs"],
    triageSteps: [
      "Verify the source IP addresses against known threat feeds and Tor exit node registries.",
      "Check HTTP request payload string indicators for signature matches like single quotes, UNION commands, or inline comments (--, #).",
      "Analyze target HTTP response codes: look for a high frequency of status 500 error traces compared to normal status 200/302."
    ],
    investigationSteps: [
      "Review DB queries processed during the event window looking for unauthorized schema alterations (DROP, ALTER) or data extraction queries (SELECT column_name).",
      "Look for indicators of blind SQL injections (e.g., timing fluctuations and unexpected delays introduced via pg_sleep).",
      "Evaluate Zeek transaction buffers to verify if database values were successfully exfiltrated in response payloads."
    ],
    containmentProcedures: [
      "Insert instant IP block rules on boundary edge WAF devices targeting the source attacker proxies.",
      "Engage rate limits restricting incoming API query parameters to 5 transactions per second per client ID.",
      "Redirect user endpoint requests to maintenance pages while vulnerabilities are researched."
    ],
    eradicationProcedures: [
      "Implement bound input parameters on application code databases using Prepared Statements.",
      "Remove raw SQL string concatenations within the Authentication gateway repository.",
      "Apply virtual signatures protecting vulnerable router ports."
    ],
    recoveryProcedures: [
      "Verify system database structural baseline integrity using database comparison scanners.",
      "Re-authenticate administrative panels with fresh access session tokens.",
      "Schedule automatic vulnerability regression scans to prove complete code clearance."
    ],
    lessonsLearnedTemplate: [
      "Enforce standard input sanitizer filters for all public form entries.",
      "Audit API query bindings in quarterly review sprint planning sessions.",
      "Instate dedicated alarms triggers for SQL syntax exceptions."
    ]
  },
  {
    id: "pb-xss",
    name: "XSS Response",
    category: "Web Attacks",
    severity: "medium",
    version: "v2.1",
    lastUpdated: "2026-05-18",
    status: "Published",
    purpose: "Procedure to identify, contain, and remediate Cross-Site Scripting (XSS) payload reflections or persistent injection events within web interfaces.",
    estimatedTime: "15m",
    owner: "Web Security Group",
    detectionSources: ["Application Payload Logs (CSP Reports)", "WAF Inbound Intercepts", "User Reports"],
    triageSteps: [
      "Review CSP violations logs for external script injections or inline script execution errors.",
      "Examine request parameter traces for typical HTML tag payloads (<script>, onload, onerror).",
      "Validate if payload reflections exist inside public rendering UI components (DOM-based, Stored, or Reflected)."
    ],
    investigationSteps: [
      "Scan web databases for unescaped HTML characters inside user input values.",
      "Analyze the scope of affected sessions that viewed the malicious payload to determine potential session exposure.",
      "Extract cookies scope properties to check if 'HttpOnly' flag was configured correctly."
    ],
    containmentProcedures: [
      "Disable the vulnerable database records or UI pages to prevent further client-side executions.",
      "Instate temporary Content Security Policy (CSP) headers restricting script evaluation scopes to self-only.",
      "Invalidate active user session tokens that recently loaded the affected pages."
    ],
    eradicationProcedures: [
      "Modify application templates to enforce contextual output HTML encoding.",
      "Deploy localized WAF pattern signatures to reject nested javascript: URI schemes.",
      "Cleanse active persistence database tables from stored script segments."
    ],
    recoveryProcedures: [
      "Redeploy patched frontend assets across edge CDN arrays.",
      "Run CSP Auditor tools to confirm strict header enforcement in live channels.",
      "Provide users safe re-authentication flows to swap compromised cookies."
    ],
    lessonsLearnedTemplate: [
      "Transition dynamic render operations away from raw dangerouslySetInnerHTML frameworks.",
      "Establish CSP logging ingestion alerts directly in the security operations queue.",
      "Ensure web developers complete OWASP Top 10 secure coding seminars."
    ]
  },
  {
    id: "pb-dos",
    name: "DoS Response",
    category: "Network Attacks",
    severity: "high",
    version: "v4.0",
    lastUpdated: "2026-06-03",
    status: "Published",
    purpose: "Emergency procedural blueprint for handling volumetric or application-layer Denial of Service attacks targeting corporate edge network gateways.",
    estimatedTime: "30m",
    owner: "Infrastructure Ops Unit",
    detectionSources: ["SNMP Link Saturation Gauges", "Nginx Request-per-Second Spikes", "Zeek conn.log Flood Alerts"],
    triageSteps: [
      "Check connection states ratio: look for anomalous unanswered half-open TCP handshakes (SYN flood).",
      "Confirm if attack is volumetric (saturating external link bandwidth) or protocol-based (resource exhaustion).",
      "Identify top source IP networks, autonomous system numbers (ASNs), or country codes involved in traffic ingress."
    ],
    investigationSteps: [
      "Check system cpu, memory, and connection pool saturation metrics on gateway clusters.",
      "Examine network flow logs (NetFlow/SFlow) to separate authentic consumer traffic from flood vectors.",
      "Trace intermediate routing pathways to check for packet drops on edge interface boundary drop segments."
    ],
    containmentProcedures: [
      "Trigger BGP Blackholing for extreme volumetric traffic to prevent core data center outages.",
      "Enable core kernel syn-cookie filters to handle large queues of half-open connections.",
      "Deploy Geo-IP blocks or request rate limiters on Cloud CDN/WAF edges."
    ],
    eradicationProcedures: [
      "Coordinate with upstream Tier-1 ISPs to apply boundary rate limiters and route scrubbing triggers.",
      "Implement caching rules protecting backends from expensive dynamic page render repetitions.",
      "Scale up backend cluster replicas using autoscaling container pools."
    ],
    recoveryProcedures: [
      "Gradually lift external rate limits while monitoring cluster resource metrics.",
      "Provide normal services routing structures after confirming flow volumes return to baseline.",
      "Verify integrity and synchronization across active cloud databases."
    ],
    lessonsLearnedTemplate: [
      "Establish native scrub capabilities on edge DNS configuration settings.",
      "Upgrade perimeter bandwidth boundaries to deal with future volumetric spikes.",
      "Develop fallback recovery architectures to serve cached landing pages."
    ]
  },
  {
    id: "pb-brute",
    name: "Brute Force Response",
    category: "Authentication Attacks",
    severity: "medium",
    version: "v3.0",
    lastUpdated: "2026-05-22",
    status: "Published",
    purpose: "Operational procedure to detect, analyze, and quarantine automated login attempt bursts targeting external authentication APIs.",
    estimatedTime: "20m",
    owner: "Identity Access Squad",
    detectionSources: ["IAM Authentication Failures logs", "Brute-force IDS signatures", "Zeek HTTP audit trails"],
    triageSteps: [
      "Verify failure ratios: locate accounts receiving over 50 failed attempts within a 5-minute period.",
      "Examine source workstation details, identifying user-agent indicators of automation tools (Hydra, Burp).",
      "Determine if the lockout safety protocols have successfully engaged on target account profiles."
    ],
    investigationSteps: [
      "Audit Okta or AD security logs to verify if lockouts were bypassed due to configuration quirks.",
      "Analyze authentication source IPs looking for massive rotating subnet structures (distributed attacks).",
      "Cross-check if any login attempts inside the attack window returned a success code."
    ],
    containmentProcedures: [
      "Temporarily lock out any affected usernames under attack, prompting manual reset procedures.",
      "Block the high-volume source IP addresses or network blocks on authentication routers.",
      "Deploy interactive CAPTCHAs protecting the active authentication entryways."
    ],
    eradicationProcedures: [
      "Enforce mandatory multi-factor authentication (MFA) validation on all administrative entry layouts.",
      "Refactor backend user-ID validations to introduce incremental retry delays (exponential backoff).",
      "Purge classic default passwords from current server credentials."
    ],
    recoveryProcedures: [
      "Direct compromised users through safe, multi-channel self-service password reset interfaces.",
      "Reinstate nominal account status settings and logging checks after 24 hours of zero alerts.",
      "Verify IAM database parameters replication consistency."
    ],
    lessonsLearnedTemplate: [
      "Implement adaptive lockout schedules in default user directories.",
      "Integrate behavioral sign-on analysis across API endpoints.",
      "Schedule periodic external auditing checks of identity repositories."
    ]
  },
  {
    id: "pb-portscan",
    name: "Port Scan Investigation",
    category: "Network Attacks",
    severity: "low",
    version: "v1.5",
    lastUpdated: "2026-04-10",
    status: "Published",
    purpose: "Operational guidelines for diagnosing network sweeps, vertical port scans, or vertical-horizontal host probes mapping corporate network perimeters.",
    estimatedTime: "15m",
    owner: "Core NetSec Engineers",
    detectionSources: ["Suricata Portscan Alerts", "Zeek conn.log Connection Scans", "Boundary Firewall Logs"],
    triageSteps: [
      "Examine scans type: locate probes mapping port ranges sequentially over a short duration (vertical) or multiple hosts on a single port (horizontal).",
      "Identify if target systems are internal assets or public-facing demilitarized zone (DMZ) gateways.",
      "Check if scanning source has completed active connections or merely triggered TCP RST packets."
    ],
    investigationSteps: [
      "Scan network topology logs looking for deeper reconnaissance paths mapping asset footprints.",
      "Audit target systems configuration settings to see if active services listening on targeted ports are fully updated.",
      "Investigate threat feeds to see if scanning source is a known benign scanner (Shodan, Censys) or dynamic exploit node."
    ],
    containmentProcedures: [
      "Instate drop rules on edge routers to block packets from scanning nodes.",
      "Halt unused network ports and close listener configurations on target machines.",
      "Disable ICMP echo responses on boundary host interfaces to hide active subnets."
    ],
    eradicationProcedures: [
      "Re-architect security groups and firewall templates to enforce least privilege access.",
      "Install Host Intrusion Prevention systems (HIPS) locally across server workloads.",
      "Implement port knocking access gates for administrative endpoints."
    ],
    recoveryProcedures: [
      "Conduct automated compliance port scanning sweeps to confirm server isolation.",
      "Restore normal firewall state settings after verifying scanning IP blocks remain active.",
      "Log detailed Recon incident traces in security reports indexes."
    ],
    lessonsLearnedTemplate: [
      "Establish strict baseline sweeps scheduling sequence routines.",
      "Conduct annual internal reviews of perimeter ingress requirements.",
      "Improve edge network obscurity by removing software header banners."
    ]
  },
  {
    id: "pb-stuffing",
    name: "Credential Stuffing Response",
    category: "Authentication Attacks",
    severity: "high",
    version: "v2.5",
    lastUpdated: "2026-05-30",
    status: "Published",
    purpose: "SOP for responding to high-volume distributed credential stuffing campaigns attempting to find valid credentials using third-party breach datasets.",
    estimatedTime: "25m",
    owner: "Identity Access Squad",
    detectionSources: ["SSO Gateway Exception Peaks", "Multi-Account Login Failures", "WAF User-Agent Anomaly Logs"],
    triageSteps: [
      "Identify the size of the attack: check the number of unique authentication attempts and distinct user profiles targeted.",
      "Verify if user-agents match standard browser headers or match scripted tools patterns (e.g., Sentry, Hydra).",
      "Check if authentication attempts are distributed across a wide IP range (such as residential proxies)."
    ],
    investigationSteps: [
      "Analyze gateway authentication attempts: locate and highlight any accounts where login was successful.",
      "Examine if targeted accounts are configured with multi-factor authentication (MFA) bypass overrides.",
      "Determine if user data or active API tokens were accessed immediately after a successful compromise."
    ],
    containmentProcedures: [
      "Initiate immediate credentials lockouts and revoke active session cookies across all targeted Accounts.",
      "Enforce dynamic rate-limiting controls on the SSO token endpoints targeting matching subnets.",
      "Engage strict CAPTCHA verification challenges across all login interfaces."
    ],
    eradicationProcedures: [
      "Disable credential combinations matching known third-party dark web breach repositories.",
      "Inject multi-factor authentication (MFA) requirements globally for all administrative authentication steps.",
      "Implement automatic system alerts matching high-frequency failing credentials lists."
    ],
    recoveryProcedures: [
      "Enable password reset triggers forcing users to set up new credentials via trusted communication channels.",
      "Review account change histories (e.g. email updates, profile changes) for affected users.",
      "Re-verify integrity across target directories databases."
    ],
    lessonsLearnedTemplate: [
      "Implement API integration checks comparing incoming logins against standard compromised credentials caches.",
      "Upgrade identity portal security logic to track credential stuffing attempts dynamically.",
      "Publish user guidelines emphasizing password uniqueness requirements."
    ]
  },
  {
    id: "pb-exfil",
    name: "Data Exfiltration Response",
    category: "Data Exposure",
    severity: "critical",
    version: "v3.5",
    lastUpdated: "2026-06-05",
    status: "Published",
    purpose: "High-priority response protocol for handling verified or potential data exfiltration events, cloud bucket exposures, or high-volume outbound network transfers.",
    estimatedTime: "40m",
    owner: "Data Governance & IR",
    detectionSources: ["CloudTrail Exgress Sikes", "Zeek conn.log Byte Sent Alerts", "DLP System Indicators"],
    triageSteps: [
      "Verify the byte transfer sizes: note outbound transactions exceeding standard internal metrics.",
      "Determine the category of data accessed: check database logs or file storage tags (e.g., PCI, PII, Source Code).",
      "Examine transfer protocols: locate if files were sent via HTTPS, SFTP, DNS tunneling, or public cloud buckets."
    ],
    investigationSteps: [
      "Identify the specific active credentials and API key profiles associated with the outbound exfiltration.",
      "Trace user account access history prior to the exfiltration to map out compromise pathways.",
      "Review adjacent logs for signs of data gathering and staging prior to transmission."
    ],
    containmentProcedures: [
      "Completely revoke the compromised user accounts, API keys, or access profiles immediately.",
      "Throttle outbound network bandwidth on perimeter gateways or block destination connections on firewalls.",
      "Put S3 cloud storage buckets and database endpoints into isolated private visibility modes."
    ],
    eradicationProcedures: [
      "Delete unauthorized persistence backdoors, scheduled tasks, or SSH keys on internal servers.",
      "Patch vulnerable entryways used to gain the initial access foothold.",
      "Enforce least-privilege IAM matrices on cloud asset repositories."
    ],
    recoveryProcedures: [
      "Restore database partitions from unaffected snapshots where applicable.",
      "Reinstate critical service operations under strict egress monitoring conditions.",
      "Formulate compliance reports documenting breach scope and compliance declarations."
    ],
    lessonsLearnedTemplate: [
      "Enforce standard data classification tags across all storage repositories.",
      "Implement strictly-supervised data egress monitoring policies.",
      "Conduct quarterly mock scenarios to test response speed during data exfiltration attacks."
    ]
  },
  {
    id: "pb-lateral",
    name: "Lateral Movement Investigation",
    category: "Insider Threat",
    severity: "high",
    version: "v2.0",
    lastUpdated: "2026-05-25",
    status: "Draft",
    purpose: "Guideline framework for tracking and intercepting internal network traversal, remote service abuse, or credentials hopping across network segments.",
    estimatedTime: "30m",
    owner: "SecOps Core Team",
    detectionSources: ["EDR Internal Probes alerts", "Active Directory Event Logs", "Zeek conn.log internal sweeps"],
    triageSteps: [
      "Analyze authentication hop patterns: locate standard accounts mapping login keys to unrelated servers.",
      "Verify anomalous uses of administrative utilities (WinRM, psexec, ssh, rdp) across internal network paths.",
      "Check if source host systems have recently logged security alert files or user-action violations."
    ],
    investigationSteps: [
      "Examine log trails on targeted endpoints looking for process executions directly preceding RDP or SSH accesses.",
      "Audit kerberos ticket handshakes to identify suspicious privilege elevation or pass-the-ticket actions.",
      "Map out the complete host compromise chain to isolate the original entry point."
    ],
    containmentProcedures: [
      "Isolate compromised workstation nodes utilizing EDR system locks.",
      "Suspend administrative sessions and temporary AD authorization credentials.",
      "Insert internal VLAN drop rules restricting communication pathways between affected subnets."
    ],
    eradicationProcedures: [
      "Purge unauthorized active processes, local user credentials, and scheduled services from workstations.",
      "Remove administrator group overrides from standard developer accounts.",
      "Update security configurations to restrict direct inter-workstation communications."
    ],
    recoveryProcedures: [
      "Rebuild compromised machines to restore system and application integrity.",
      "Enforce mandatory password resets on AD accounts linked to compromised nodes.",
      "Deploy localized audit rules to track lateral service authentications."
    ],
    lessonsLearnedTemplate: [
      "Implement deep Zero Trust logical segment boundaries between subnets.",
      "Adopt host-level firewalls to disable localized inter-workstation ping sweeps.",
      "Instate short-lived tokens for administrative user profiles."
    ]
  }
];

export const MOCK_USAGES: PlaybookUsageEvent[] = [
  {
    id: "EV-1024",
    timestamp: "2026-06-09 12:45:00 UTC",
    playbookName: "SQL Injection Response",
    relatedCase: "CASE-1024",
    analyst: "phutd0212@gmail.com",
    status: "ACTIVE"
  },
  {
    id: "EV-3310",
    timestamp: "2026-06-09 11:15:30 UTC",
    playbookName: "DoS Response",
    relatedCase: "CASE-1057",
    analyst: "lead.arch@fcaj.internal",
    status: "COMPLETED"
  },
  {
    id: "EV-9400",
    timestamp: "2026-06-09 09:12:00 UTC",
    playbookName: "Credential Stuffing Response",
    relatedCase: "CASE-9488",
    analyst: "phutd0212@gmail.com",
    status: "COMPLETED"
  },
  {
    id: "EV-2091",
    timestamp: "2026-06-08 14:22:10 UTC",
    playbookName: "Lateral Movement Investigation",
    relatedCase: "CASE-9421",
    analyst: "compliance.bot@fcaj.internal",
    status: "APPLIED"
  },
  {
    id: "EV-4412",
    timestamp: "2026-06-08 08:30:00 UTC",
    playbookName: "Port Scan Investigation",
    relatedCase: "CASE-9490",
    analyst: "junior.sec@fcaj.internal",
    status: "COMPLETED"
  },
  {
    id: "EV-5510",
    timestamp: "2026-06-07 10:45:00 UTC",
    playbookName: "Data Exfiltration Response",
    relatedCase: "CASE-9492",
    analyst: "cloud.sec@fcaj.internal",
    status: "APPLIED"
  }
];
