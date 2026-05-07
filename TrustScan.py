# v0.5.0
# { "Depends": "py-genlayer:latest" }
from genlayer import *

import json


class TrustScan(gl.Contract):
    scores: TreeMap[str, str]      # target -> JSON string of scan result
    flags: TreeMap[str, str]       # target -> JSON string of flag list
    flag_counts: TreeMap[str, str] # target -> total flag count as string

    def __init__(self, contract_name: str = "TrustScan"):
        self.scores = TreeMap()
        self.flags = TreeMap()
        self.flag_counts = TreeMap()

    # ─────────────────────────────────────────
    # PUBLIC ENTRY POINT - SINGLE SCAN
    # ─────────────────────────────────────────

    @gl.public.write
    def submit_target(self, target: str, target_type: str, chain: str = "eth") -> None:
        """
        target      : wallet address, URL, or token contract address
        target_type : "wallet" | "url" | "token"
        chain       : "eth" | "bsc" | "base"
        """
        target = target.strip()
        target_type = target_type.lower().strip()
        chain = chain.lower().strip()

        assert target_type in ["wallet", "url", "token"], "target_type must be wallet, url, or token"
        assert chain in ["eth", "bsc", "base"], "chain must be eth, bsc, or base"

        if target_type == "wallet":
            self._scan_wallet(target)
        elif target_type == "url":
            self._scan_url(target)
        elif target_type == "token":
            self._scan_token(target, chain)

    # ─────────────────────────────────────────
    # PUBLIC ENTRY POINT - BATCH SCAN
    # ─────────────────────────────────────────

    @gl.public.write
    def scan_multiple(self, targets: list, target_type: str, chain: str = "eth") -> None:
        """
        Batch scan multiple targets of the same type.
        targets     : list of wallet addresses, URLs, or token contracts (max 10)
        target_type : "wallet" | "url" | "token"
        chain       : "eth" | "bsc" | "base"

        Designed for AI agents that need to verify multiple targets before interacting.
        Already-scanned targets are skipped to save API calls.
        """
        target_type = target_type.lower().strip()
        chain = chain.lower().strip()

        assert len(targets) >= 1, "At least one target required"
        assert len(targets) <= 10, "Maximum 10 targets per batch scan"
        assert target_type in ["wallet", "url", "token"], "target_type must be wallet, url, or token"
        assert chain in ["eth", "bsc", "base"], "chain must be eth, bsc, or base"

        for raw_target in targets:
            target = raw_target.strip()
            if not target:
                continue

            # Normalize address-based targets to lowercase
            normalized = target.lower() if target_type in ["wallet", "token"] else target

            # Skip already scanned targets — no point rescanning
            if normalized in self.scores:
                continue

            if target_type == "wallet":
                self._scan_wallet(normalized)
            elif target_type == "url":
                self._scan_url(normalized)
            elif target_type == "token":
                self._scan_token(normalized, chain)

    # ─────────────────────────────────────────
    # PUBLIC ENTRY POINT - FLAG
    # ─────────────────────────────────────────

    @gl.public.write
    def flag_target(self, target: str, evidence: str) -> None:
        """
        target   : wallet, URL, or token contract being flagged
        evidence : what the reporter observed (10-500 chars)
        reporter is auto-filled from the connected wallet
        """
        target = target.strip()
        evidence = evidence.strip()
        reporter = str(gl.message.sender_address).lower()

        assert len(evidence) >= 10, "Evidence must be at least 10 characters"
        assert len(evidence) <= 500, "Evidence must be under 500 characters"

        prompt = f"""
You are a Web3 security analyst reviewing a community-submitted scam report.

Target being flagged: {target}
Reporter wallet: {reporter}
Evidence provided: {evidence}

Assess whether the evidence is credible and classify severity.

Credibility signals:
- Mentions specific transaction hashes, amounts, or dates (high credibility)
- Describes a specific pattern of behavior (medium credibility)
- Vague claim with no details (low credibility)
- Contains links or references to external reports (high credibility)

Severity levels:
- "low"    : Vague or unverifiable claim
- "medium" : Plausible claim with some supporting detail
- "high"   : Specific, verifiable evidence of fraud or scam

Respond ONLY in this JSON format:
{{
  "credible": true | false,
  "severity": "low" | "medium" | "high",
  "summary": "1 sentence summarizing what was reported"
}}
"""

        def assess():
            r = gl.nondet.exec_prompt(prompt)
            return r.replace("```json", "").replace("```", "").strip()

        result = gl.eq_principle.prompt_comparative(
            assess,
            "The credible field and severity level must match across all outputs."
        )

        parsed = json.loads(result)
        assert parsed["severity"] in ["low", "medium", "high"]
        assert isinstance(parsed["credible"], bool)

        new_flag = {
            "reporter": reporter,
            "evidence": evidence,
            "severity": parsed["severity"],
            "credible": parsed["credible"],
            "summary": parsed.get("summary", evidence[:100]),
        }

        existing = json.loads(self.flags[target]) if target in self.flags else []
        existing.append(new_flag)
        self.flags[target] = json.dumps(existing)

        current_count = int(self.flag_counts[target]) if target in self.flag_counts else 0
        self.flag_counts[target] = str(current_count + 1)

        if target in self.scores:
            current = json.loads(self.scores[target])
            high_flags = sum(1 for f in existing if f["severity"] == "high" and f["credible"])
            medium_flags = sum(1 for f in existing if f["severity"] == "medium" and f["credible"])

            score_bump = (high_flags * 20) + (medium_flags * 10)
            new_score = min(100, current["score"] + score_bump)

            if new_score >= 71:
                new_label = "Dangerous"
            elif new_score >= 31:
                new_label = "Suspicious"
            else:
                new_label = current["label"]

            current["score"] = new_score
            current["label"] = new_label
            current["reason"] = current["reason"] + f" Additionally, {len(existing)} community flag(s) have been submitted against this target."
            self.scores[target] = json.dumps(current)

    # ─────────────────────────────────────────
    # WALLET SCANNER
    # ─────────────────────────────────────────

    def _scan_wallet(self, wallet: str) -> None:
        wallet = wallet.lower()

        api_key = "U2SM18WXVA2WPMMPXFAY3RMZFFJZIN52DM"
        base = "https://api.etherscan.io/api"

        prompt = f"""
You are a Web3 security analyst. Assess the risk level of this Ethereum wallet: {wallet}

Fetch and analyze ALL of the following data sources:

1. Transaction history:
   {base}?module=account&action=txlist&address={wallet}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey={api_key}

2. Internal transactions:
   {base}?module=account&action=txlistinternal&address={wallet}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey={api_key}

3. Token transfers:
   {base}?module=account&action=tokentx&address={wallet}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey={api_key}

4. ETH balance:
   {base}?module=account&action=balance&address={wallet}&tag=latest&apikey={api_key}

5. Chainabuse scam reports:
   https://www.chainabuse.com/api/reports/search?query={wallet}
   Note: If this returns an error or empty response, treat as zero reports and continue.

6. GoPlus Security address check:
   https://api.gopluslabs.io/api/v1/address_security/{wallet}?chain_id=1
   This returns: is_contract, malicious_address, phishing_activities, blacklist_doubt,
   stealing_attack, fake_token, honeypot_related_address, mixer, darkweb_transactions,
   cybercrime, money_laundering, financial_crime flags.
   Note: If this returns an error or empty response, treat all flags as 0 and continue.

SCORING RULES (combine signals from all sources):
- GoPlus malicious_address = 1: +40
- GoPlus phishing_activities = 1: +35
- GoPlus blacklist_doubt = 1: +25
- GoPlus mixer or darkweb_transactions = 1: +20 each
- GoPlus money_laundering or financial_crime = 1: +30
- Chainabuse reports: +20 per report (max 40)
- Flagged contract interactions from Etherscan: +15 each (max 30)
- Drain pattern (large inflow then rapid outflow): +20
- New wallet with large inflows: +10
- High failed tx ratio above 30 percent: +10
- Clean history across all sources: 0 to 10

Labels: 0-30 Safe, 31-70 Suspicious, 71-100 Dangerous

Respond ONLY in this JSON format:
{{
  "score": int,
  "label": "Safe" | "Suspicious" | "Dangerous",
  "reason": "1-2 plain English sentences",
  "signals_found": ["list", "of", "signals"]
}}

It is mandatory that you respond only using the JSON format above, nothing else.
Your output must be perfectly parseable by a JSON parser without errors.
"""

        def run():
            r = gl.nondet.exec_prompt(prompt)
            return r.replace("```json", "").replace("```", "").strip()

        result = gl.eq_principle.prompt_comparative(
            run,
            "The label must match: Safe, Suspicious, or Dangerous. Minor score or wording differences are acceptable."
        )

        parsed = json.loads(result)
        assert parsed["label"] in ["Safe", "Suspicious", "Dangerous"]
        assert 0 <= int(parsed["score"]) <= 100

        self.scores[wallet] = json.dumps({
            "type": "wallet",
            "chain": "eth",
            "score": parsed["score"],
            "label": parsed["label"],
            "reason": parsed["reason"],
            "signals_found": parsed.get("signals_found", []),
        })

    # ─────────────────────────────────────────
    # URL SCANNER
    # ─────────────────────────────────────────

    def _scan_url(self, url: str) -> None:

        prompt = f"""
You are a Web3 security analyst specializing in phishing sites. Assess the risk of this URL: {url}

Fetch and analyze ALL of the following data sources:

1. WHOIS domain age:
   https://api.whoisfreaks.com/v1.0/whois?whois=live&domainName={url}&apiKey=free
   Note: If unavailable, treat domain age as unknown and flag as mildly suspicious.

2. SSL certificate check:
   https://api.ssllabs.com/api/v3/analyze?host={url}&publish=off&startNew=on&all=done
   Note: If unavailable, treat SSL status as unknown.

3. Google Safe Browsing transparency report:
   https://transparencyreport.google.com/safe-browsing/search?url={url}

4. URLVoid reputation scan:
   https://www.urlvoid.com/scan/{url}/

5. PhishTank lookup:
   https://checkurl.phishtank.com/checkurl/

6. Chainabuse URL reports:
   https://www.chainabuse.com/api/reports/search?query={url}
   Note: If this returns an error or empty response, treat as zero reports and continue.

7. GoPlus phishing site check:
   https://api.gopluslabs.io/api/v1/phishing_site?url={url}
   This returns: is_phishing_site flag (1 = confirmed phishing).
   Note: If this returns an error or empty response, treat as not confirmed and continue.

SCORING RULES (combine signals from all sources):
- GoPlus is_phishing_site = 1: +45
- Listed on PhishTank as phishing: +40
- Google Safe Browsing flagged: +40
- Domain under 30 days old: +35
- Brand impersonation detected (misspelled known crypto project): +25
- Chainabuse reports: +20 per report (max 40)
- Domain under 90 days old: +20
- Homoglyph substitution in domain: +20
- Invalid or missing SSL: +15
- Suspicious keywords in URL (airdrop, claim, verify, connect-wallet, free-nft, reward): +10
- URLVoid flagged by multiple engines: +15
- Clean domain across all sources: 0 to 10

Labels: 0-30 Safe, 31-70 Suspicious, 71-100 Dangerous

Respond ONLY in this JSON format:
{{
  "score": int,
  "label": "Safe" | "Suspicious" | "Dangerous",
  "reason": "1-2 plain English sentences",
  "signals_found": ["list", "of", "signals"]
}}

It is mandatory that you respond only using the JSON format above, nothing else.
Your output must be perfectly parseable by a JSON parser without errors.
"""

        def run():
            r = gl.nondet.exec_prompt(prompt)
            return r.replace("```json", "").replace("```", "").strip()

        result = gl.eq_principle.prompt_comparative(
            run,
            "The label must match: Safe, Suspicious, or Dangerous. Minor score or wording differences are acceptable."
        )

        parsed = json.loads(result)
        assert parsed["label"] in ["Safe", "Suspicious", "Dangerous"]
        assert 0 <= int(parsed["score"]) <= 100

        self.scores[url] = json.dumps({
            "type": "url",
            "chain": "n/a",
            "score": parsed["score"],
            "label": parsed["label"],
            "reason": parsed["reason"],
            "signals_found": parsed.get("signals_found", []),
        })

    # ─────────────────────────────────────────
    # TOKEN SCANNER
    # ─────────────────────────────────────────

    def _scan_token(self, token: str, chain: str) -> None:
        token = token.lower()

        api_key = "U2SM18WXVA2WPMMPXFAY3RMZFFJZIN52DM"

        chain_ids = {"eth": "1", "bsc": "56", "base": "8453"}
        chainid = chain_ids[chain]
        explorer = "https://api.etherscan.io/v2/api"

        prompt = f"""
You are a Web3 security analyst specializing in token contract audits. Assess the risk of this token contract: {token} on chain ID {chainid}.

Fetch and analyze ALL of the following data sources:

1. Contract source code:
   {explorer}?chainid={chainid}&module=contract&action=getsourcecode&address={token}&apikey={api_key}

2. Token supply:
   {explorer}?chainid={chainid}&module=stats&action=tokensupply&contractaddress={token}&apikey={api_key}

3. Token holders:
   {explorer}?chainid={chainid}&module=token&action=tokenholderlist&contractaddress={token}&page=1&offset=10&apikey={api_key}

4. Contract transactions:
   {explorer}?chainid={chainid}&module=account&action=txlist&address={token}&startblock=0&endblock=99999999&page=1&offset=30&sort=desc&apikey={api_key}

5. Chainabuse reports:
   https://www.chainabuse.com/api/reports/search?query={token}
   Note: If this returns an error or empty response, treat as zero reports and continue.

6. GoPlus token security check:
   https://api.gopluslabs.io/api/v1/token_security/{chainid}?contract_addresses={token}
   This returns: is_honeypot, buy_tax, sell_tax, is_mintable, owner_address,
   can_take_back_ownership, owner_change_balance, hidden_owner, selfdestruct,
   external_call, is_blacklisted, is_whitelisted, is_proxy, is_open_source,
   lp_holders (liquidity lock info), holder_count flags.
   Note: If this returns an error or empty response, treat all flags as unknown and continue.

SCORING RULES (combine signals from all sources, GoPlus data is primary source of truth for token risks):
- GoPlus is_honeypot = 1: +50
- GoPlus sell_tax above 10 percent: +25
- GoPlus buy_tax above 10 percent: +15
- GoPlus is_mintable = 1 (unlimited mint): +30
- GoPlus can_take_back_ownership = 1: +25
- GoPlus owner_change_balance = 1: +25
- GoPlus hidden_owner = 1: +20
- GoPlus is_blacklisted = 1: +20
- GoPlus selfdestruct = 1: +30
- GoPlus is_open_source = 0 (not verified): +25
- GoPlus lp_holders show no locked liquidity: +20
- GoPlus holder_count under 10: +15
- Chainabuse reports: +20 per report (max 40)
- Contract not verified on Etherscan (cross-check with GoPlus): +25
- Verified, honeypot-free, locked liquidity, many holders, low tax: 0 to 10

Labels: 0-30 Safe, 31-70 Suspicious, 71-100 Dangerous

Respond ONLY in this JSON format:
{{
  "score": int,
  "label": "Safe" | "Suspicious" | "Dangerous",
  "reason": "1-2 plain English sentences",
  "signals_found": ["list", "of", "signals"]
}}

It is mandatory that you respond only using the JSON format above, nothing else.
Your output must be perfectly parseable by a JSON parser without errors.
"""

        def run():
            r = gl.nondet.exec_prompt(prompt)
            return r.replace("```json", "").replace("```", "").strip()

        result = gl.eq_principle.prompt_comparative(
            run,
            "The label must match: Safe, Suspicious, or Dangerous. Minor score or wording differences are acceptable."
        )

        parsed = json.loads(result)
        assert parsed["label"] in ["Safe", "Suspicious", "Dangerous"]
        assert 0 <= int(parsed["score"]) <= 100

        self.scores[token] = json.dumps({
            "type": "token",
            "chain": chain,
            "score": parsed["score"],
            "label": parsed["label"],
            "reason": parsed["reason"],
            "signals_found": parsed.get("signals_found", []),
        })

    # ─────────────────────────────────────────
    # READ METHODS
    # ─────────────────────────────────────────

    @gl.public.view
    def get_risk_score(self, target: str) -> dict:
        target = target.strip()
        if target not in self.scores:
            return {
                "type": "unknown",
                "chain": "n/a",
                "score": -1,
                "label": "Not Scanned",
                "reason": "This target has not been scanned yet. Call submit_target first.",
                "signals_found": []
            }
        return json.loads(self.scores[target])

    @gl.public.view
    def get_multiple_scores(self, targets: list) -> dict:
        """
        Batch read risk scores for multiple targets.
        Returns dict of target -> score result.
        Designed for AI agents checking multiple targets at once.
        """
        results = {}
        for raw_target in targets:
            target = raw_target.strip()
            if not target:
                continue
            if target in self.scores:
                results[target] = json.loads(self.scores[target])
            else:
                results[target] = {
                    "type": "unknown",
                    "chain": "n/a",
                    "score": -1,
                    "label": "Not Scanned",
                    "reason": "Not scanned yet.",
                    "signals_found": []
                }
        return results

    @gl.public.view
    def get_flags(self, target: str) -> list:
        target = target.strip()
        if target not in self.flags:
            return []
        return json.loads(self.flags[target])

    @gl.public.view
    def get_flag_count(self, target: str) -> int:
        target = target.strip()
        if target not in self.flag_counts:
            return 0
        return int(self.flag_counts[target])

    @gl.public.view
    def get_all_scanned(self) -> list:
        return list(self.scores.keys())
