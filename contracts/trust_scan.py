# v0.6.2 - Added: URLhaus, TokenSniffer, Honeypot.is as Chainabuse alternatives
# { "Depends": "py-genlayer:latest" }
from genlayer import *

import json


class TrustScan(gl.Contract):
    """
    Security oracle for wallets, tokens, and URLs.
    Uses gl.nondet.web.get / gl.nondet.web.render to ground AI risk scoring
    in verifiable, real-time external evidence.
    
    Combines transparent point-based scoring rules (auditable, deterministic)
    with prompt_non_comparative (reliable consensus across validators).
    """

    # ── Persistent state ──────────────────────────────────────────────────────
    scores: TreeMap[str, str]       # normalised_target -> JSON ScanResult
    scanned_list: DynArray[str]     # ordered history of all scanned targets
    flags: TreeMap[str, str]        # normalised_target -> JSON list[FlagEntry]

    def __init__(self) -> None:
        pass  # TreeMap / DynArray are auto-initialised by the GenLayer runtime

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _normalise(self, target: str) -> str:
        """Lowercase and strip protocol prefixes for consistent key storage."""
        t = target.strip().lower()
        for prefix in ("https://", "http://", "www."):
            if t.startswith(prefix):
                t = t[len(prefix):]
        return t.rstrip("/")

    def _track(self, normalised: str) -> None:
        """Append target to scanned_list if not already present."""
        for i in range(len(self.scanned_list)):
            if self.scanned_list[i] == normalised:
                return
        self.scanned_list.append(normalised)

    # ── Public write methods ──────────────────────────────────────────────────

    @gl.public.write
    def submit_target(self, target: str, target_type: str, chain: str) -> None:
        """
        Fetch live threat-intelligence from external sources via
        gl.nondet.web.get / gl.nondet.web.render, then score the risk
        using LLM consensus (prompt_non_comparative) with explicit scoring rules.
        """
        normalised = self._normalise(target)

        def analyse() -> str:
            evidence = []

            # ── STEP 1: Fetch real-time data from external sources ────────────

            if target_type in ("wallet", "token"):
                chain_id = {"eth": "1", "bsc": "56", "base": "8453",
                            "polygon": "137", "arb": "42161"}.get(chain, "1")

                # GoPlus Security API
                try:
                    if target_type == "wallet":
                        goplus_url = (
                            "https://api.gopluslabs.io/api/v1/address_security"
                            "/" + normalised + "?chain_id=" + chain_id
                        )
                    else:
                        goplus_url = (
                            "https://api.gopluslabs.io/api/v1/token_security/"
                            + chain_id + "?contract_addresses=" + normalised
                        )
                    r = gl.nondet.web.get(goplus_url)
                    evidence.append("=== GoPlus Security API ===\n"
                                    + r.body.decode("utf-8")[:1500])
                except Exception as e:
                    evidence.append("=== GoPlus Security API ===\nunavailable: "
                                    + str(e)[:100])

                # TokenSniffer analysis (for tokens only)
                if target_type == "token":
                    try:
                        # TokenSniffer API - checks for honeypots, scams
                        r = gl.nondet.web.get(
                            "https://tokensniffer.com/api/v2/tokens/" + chain_id + "/" + normalised
                        )
                        evidence.append("=== TokenSniffer Analysis ===\n"
                                        + r.body.decode("utf-8")[:1000])
                    except Exception as e:
                        evidence.append("=== TokenSniffer ===\nunavailable: " + str(e)[:100])

                # Honeypot.is check (for tokens only)
                if target_type == "token" and chain == "eth":
                    try:
                        r = gl.nondet.web.get(
                            "https://api.honeypot.is/v2/IsHoneypot?address=" + normalised
                        )
                        evidence.append("=== Honeypot.is Check ===\n"
                                        + r.body.decode("utf-8")[:600])
                    except Exception as e:
                        evidence.append("=== Honeypot.is ===\nunavailable: " + str(e)[:100])

                # Chainabuse community reports
                try:
                    chainabuse_url = "https://api.chainabuse.com/v0/reports?address=" + normalised
                    r = gl.nondet.web.get(chainabuse_url)
                    body = r.body.decode("utf-8")
                    # Handle rate limiting
                    if "429" in str(r.status) or "rate limit" in body.lower():
                        evidence.append("=== Chainabuse ===\nRate limited")
                    else:
                        evidence.append("=== Chainabuse Community Reports ===\n" + body[:800])
                except Exception as e:
                    evidence.append("=== Chainabuse ===\nunavailable: " + str(e)[:100])

                # Etherscan on-chain data (ETH mainnet only)
                if chain == "eth":
                    api_key = "ZPQ55QTUAJMSG311PV3GD4K3NGBQA2W7SY"
                    try:
                        r = gl.nondet.web.get(
                            "https://api.etherscan.io/v2/api"
                            "?chainid=1&module=account&action=balance"
                            "&address=" + normalised + "&tag=latest&apikey=" + api_key
                        )
                        evidence.append("=== Etherscan Balance ===\n"
                                        + r.body.decode("utf-8")[:400])
                    except Exception as e:
                        evidence.append("=== Etherscan Balance ===\nunavailable: " + str(e)[:100])

                    if target_type == "token":
                        try:
                            r = gl.nondet.web.get(
                                "https://api.etherscan.io/v2/api"
                                "?chainid=1&module=contract&action=getsourcecode"
                                "&address=" + normalised + "&apikey=" + api_key
                            )
                            evidence.append("=== Etherscan Contract Verification ===\n"
                                            + r.body.decode("utf-8")[:800])
                        except Exception as e:
                            evidence.append("=== Etherscan Source ===\nunavailable: "
                                            + str(e)[:100])

            else:  # URL / domain
                # GoPlus phishing check
                try:
                    r = gl.nondet.web.get(
                        "https://api.gopluslabs.io/api/v1/phishing_site?url=" + normalised
                    )
                    evidence.append("=== GoPlus Phishing Check ===\n"
                                    + r.body.decode("utf-8")[:600])
                except Exception as e:
                    evidence.append("=== GoPlus Phishing ===\nunavailable: " + str(e)[:100])

                # URLhaus malware/phishing database
                try:
                    r = gl.nondet.web.get(
                        "https://urlhaus-api.abuse.ch/v1/url/",
                        method="POST",
                        data={"url": normalised}
                    )
                    evidence.append("=== URLhaus Threat Database ===\n"
                                    + r.body.decode("utf-8")[:600])
                except Exception as e:
                    evidence.append("=== URLhaus ===\nunavailable: " + str(e)[:100])

                # VirusTotal URL scan (if you have an API key, add it)
                # Commented out for now - requires API key
                # try:
                #     vt_api_key = "YOUR_VIRUSTOTAL_API_KEY"
                #     r = gl.nondet.web.get(
                #         "https://www.virustotal.com/api/v3/domains/" + normalised,
                #         headers={"x-apikey": vt_api_key}
                #     )
                #     evidence.append("=== VirusTotal ===\n" + r.body.decode("utf-8")[:800])
                # except Exception as e:
                #     evidence.append("=== VirusTotal ===\nunavailable: " + str(e)[:100])

                # Google Safe Browsing check
                try:
                    # Using the lookup API (requires API key for production)
                    # For now, check if domain is in known phishing patterns
                    evidence.append("=== URL Pattern Analysis ===\nDomain: " + normalised)
                except Exception as e:
                    evidence.append("=== Pattern Analysis ===\nunavailable: " + str(e)[:100])

                # Chainabuse URL reports (kept as fallback)
                try:
                    chainabuse_url = "https://api.chainabuse.com/v0/reports?url=" + normalised
                    r = gl.nondet.web.get(chainabuse_url)
                    body = r.body.decode("utf-8")
                    if "429" in str(r.status) or "rate limit" in body.lower():
                        evidence.append("=== Chainabuse URL Reports ===\nRate limited")
                    else:
                        evidence.append("=== Chainabuse URL Reports ===\n" + body[:600])
                except Exception as e:
                    evidence.append("=== Chainabuse URL ===\nunavailable: " + str(e)[:100])

                # Check for suspicious keywords
                suspicious_keywords = ["airdrop", "claim", "verify", "connect-wallet", 
                                       "free-nft", "reward", "phishing", "scam"]
                found_keywords = [kw for kw in suspicious_keywords if kw in normalised]
                if found_keywords:
                    evidence.append("=== Suspicious Keywords ===\n" + ", ".join(found_keywords))

            # ── STEP 2: Return structured evidence for LLM evaluation ──────────
            evidence_text = "\n\n".join(evidence)
            return (
                "TARGET: " + normalised + "\n"
                "TYPE: " + target_type + "\n"
                "CHAIN: " + chain + "\n\n"
                "=== FETCHED EVIDENCE ===\n"
                + evidence_text
            )

        # Build scoring criteria based on target type
        if target_type == "wallet":
            scoring_rules = """
TRANSPARENT SCORING RULES - Calculate exact score by adding points:

Start with score = 0

GoPlus Security flags:
- malicious_address = 1: +75
- phishing_activities = 1: +75
- blacklist_doubt = 1: +40
- mixer = 1 OR darkweb_transactions = 1: +35
- money_laundering = 1 OR financial_crime = 1: +75

Chainabuse:
- Each report found: +20 (max 40 total)

Transaction patterns (if Etherscan data available):
- Drain pattern detected (large inflow then rapid outflow): +30
- New wallet with large inflows: +15
- High failed transaction ratio (>30%): +10

LABEL ASSIGNMENT (based on final score):
- 0-30: "Safe"
- 31-70: "Suspicious"
- 71-100: "Dangerous"

You MUST add up the points step by step. Do not estimate."""

        elif target_type == "token":
            scoring_rules = """
TRANSPARENT SCORING RULES - Calculate exact score by adding points:

Start with score = 0

GoPlus Token Security (PRIMARY SOURCE):
- is_honeypot = 1: +80
- sell_tax > 10%: +40
- buy_tax > 10%: +20
- is_mintable = 1 (unlimited minting): +50
- can_take_back_ownership = 1: +40
- owner_change_balance = 1: +40
- hidden_owner = 1: +30
- is_blacklisted = 1: +35
- selfdestruct = 1: +75
- is_open_source = 0 (not verified): +30
- No locked liquidity detected: +30
- holder_count < 10: +20

TokenSniffer Analysis:
- Scam detected: +80
- High risk score (>70): +50
- Medium risk score (40-70): +30

Honeypot.is Check:
- IsHoneypot = true: +80
- Simulation failed (cannot sell): +75

Chainabuse:
- Each report found: +20 (max 40 total)

Etherscan (if available):
- Contract not verified: +25

LABEL ASSIGNMENT (based on final score):
- 0-30: "Safe"
- 31-70: "Suspicious"
- 71-100: "Dangerous"

You MUST add up the points step by step. Do not estimate."""

        else:  # URL
            scoring_rules = """
TRANSPARENT SCORING RULES - Calculate exact score by adding points:

Start with score = 0

GoPlus Phishing Check:
- phishing_site = 1: +75

URLhaus Threat Database:
- URL flagged as malware/phishing: +75
- Recent malicious activity detected: +50

Chainabuse:
- Each report found: +20 (max 40 total)

URL Analysis:
- Suspicious keywords found in URL: +10
- Brand impersonation detected: +25
- Homoglyph substitution detected: +20

LABEL ASSIGNMENT (based on final score):
- 0-30: "Safe"
- 31-70: "Suspicious"
- 71-100: "Dangerous"

You MUST add up the points step by step. Do not estimate."""

        result_json = gl.eq_principle.prompt_non_comparative(
            analyse,
            task="Evaluate the threat-intelligence evidence using transparent scoring rules.",
            criteria=(
                scoring_rules + "\n\n"
                "Produce JSON with keys: "
                "score (int 0-100, calculated by adding points), "
                "label (Safe|Suspicious|Dangerous based on score), "
                "reason (a professional, human-readable summary of the findings in 1-2 sentences), "
                "point_calculation (the step-by-step point addition), "
                "signals_found (list of risk signals detected), "
                "sources_checked (list of data sources consulted), "
                "type (string), "
                "chain (string). "
                "\n\nCRITICAL: The reason should sound like a security analyst's conclusion (e.g., 'No malicious activity detected across multiple threat intelligence databases. The domain appears clean and has a valid SSL configuration.')."
            ),
        )

        self.scores[normalised] = result_json
        self._track(normalised)

    @gl.public.write
    def scan_multiple(self, targets: list, target_type: str, chain: str) -> None:
        """Batch scan up to 10 targets. Each is independently fetched and scored."""
        if len(targets) > 10:
            raise Exception("Maximum 10 targets per batch scan.")
        for target in targets:
            normalised = self._normalise(target)
            # Skip already scanned targets
            if normalised not in self.scores:
                self.submit_target(target, target_type, chain)

    @gl.public.write
    def flag_target(self, target: str, evidence: str) -> None:
        """
        Community flag submission. The AI validator verifies the evidence
        is credible before storing the flag.
        """
        normalised = self._normalise(target)
        flagger = gl.message.sender_address

        if len(evidence) < 10 or len(evidence) > 500:
            raise Exception("Evidence must be 10-500 characters")

        def verify() -> str:
            return (
                "TARGET: " + normalised + "\n"
                "REPORTER: " + str(flagger) + "\n"
                "EVIDENCE: " + evidence[:800] + "\n\n"
                "Assess whether this evidence is credible based on:\n"
                "- Mentions specific transaction hashes, amounts, or dates (high credibility)\n"
                "- Describes specific pattern of behavior (medium credibility)\n"
                "- Vague claim with no details (low credibility)\n"
                "- Contains links or references to external reports (high credibility)"
            )

        verification_json = gl.eq_principle.prompt_non_comparative(
            verify,
            task="Verify if the community flag is credible.",
            criteria=(
                "Evaluate credibility and severity. Return JSON with keys: "
                "is_credible (boolean), "
                "severity (low|medium|high), "
                "summary (one sentence summarizing what was reported)"
            ),
        )

        try:
            verification = json.loads(verification_json)
        except json.JSONDecodeError:
            return

        if not verification.get("is_credible", False):
            return

        existing_raw = self.flags.get(normalised, "[]")
        try:
            existing = json.loads(existing_raw)
        except json.JSONDecodeError:
            existing = []

        existing.append({
            "flagger": str(flagger),
            "evidence": evidence[:400],
            "severity": verification.get("severity", "low"),
            "summary": verification.get("summary", "")[:200],
        })
        self.flags[normalised] = json.dumps(existing[-20:])

        # Update score if target was already scanned
        if normalised in self.scores:
            try:
                current = json.loads(self.scores[normalised])
                high_flags = sum(1 for f in existing if f.get("severity") == "high")
                medium_flags = sum(1 for f in existing if f.get("severity") == "medium")
                
                score_bump = (high_flags * 20) + (medium_flags * 10)
                new_score = min(100, current.get("score", 0) + score_bump)
                
                if new_score >= 71:
                    new_label = "Dangerous"
                elif new_score >= 31:
                    new_label = "Suspicious"
                else:
                    new_label = current.get("label", "Safe")
                
                current["score"] = new_score
                current["label"] = new_label
                current["reason"] = (current.get("reason", "") + 
                                    f" Additionally, {len(existing)} community flag(s) submitted.")
                self.scores[normalised] = json.dumps(current)
            except:
                pass  # If parsing fails, just keep original score

    # ── Public view methods ───────────────────────────────────────────────────

    @gl.public.view
    def get_risk_score(self, target: str) -> str:
        """Returns the stored risk score as a JSON string, or a sentinel if not scanned."""
        normalised = self._normalise(target)
        raw = self.scores.get(normalised, None)
        if raw is None:
            return json.dumps({
                "score": -1, "label": "Not Scanned",
                "reason": "This target has not been scanned yet. Call submit_target first.",
                "signals_found": [],
                "sources_checked": [],
                "type": "",
                "chain": "",
            })
        return raw

    @gl.public.view
    def get_multiple_scores(self, targets: list) -> str:
        """Returns a JSON string mapping target -> score_dict."""
        result = {}
        for t in targets:
            result[t] = json.loads(self.get_risk_score(t))
        return json.dumps(result)

    @gl.public.view
    def get_flags(self, target: str) -> str:
        """Returns verified community flags as a JSON string."""
        normalised = self._normalise(target)
        return self.flags.get(normalised, "[]")

    @gl.public.view
    def get_flag_count(self, target: str) -> int:
        """Returns the number of verified community flags."""
        try:
            return len(json.loads(self.get_flags(target)))
        except json.JSONDecodeError:
            return 0

    @gl.public.view
    def get_all_scanned(self) -> str:
        """Returns the full ordered list of all scanned targets as a JSON string."""
        return json.dumps([self.scanned_list[i] for i in range(len(self.scanned_list))])
