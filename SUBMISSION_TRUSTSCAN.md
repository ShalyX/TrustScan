# DoraHacks Submission Guide: TrustScan

> [!IMPORTANT]
> Use this document to copy-paste directly into the DoraHacks "Create a new BUIDL" form.

---

### **1. BUIDL (Project) Name**
`TrustScan`

---

### **2. Vision**
> [!NOTE]
> Character count: 246 (Limit: 256)

TrustScan solves Web3's "black box" risk using GenLayer's AI consensus. While old scanners are rigid, TrustScan committees cross-reference Etherscan, GoPlus, & Chainabuse to reach subjective agreement on risk scores and plain-English safety labels.

---

### **3. Category**
- **Is this BUIDL an AI Agent?** 
  - [x] Yes (It is an Intelligent Contract that performs autonomous analysis)
- **Track:** 
  - `Subjective Consensus (Bradbury Special Track)`

---

### **4. Links**
- **GitHub Repo:** [Insert Your GitHub URL Here]
- **Project Website:** [Insert Vercel/Deployment URL Here]
- **Demo Video:** [Insert YouTube Link Here - See script below]

---

### **5. Details (Markdown Content)**

# TrustScan: AI-Native Security Oracle

**TrustScan** is a decentralized security scanner that bridges the gap between deterministic data and subjective risk assessment. Built on **GenLayer**, it leverages a committee of AI validators to reach consensus on the safety of wallet addresses, URLs, and token contracts.

## 🧠 The GenLayer Advantage: Subjective Consensus
Traditional security scanners rely on hardcoded rules or signature matching. They fail when faced with "socially engineered" threats like sophisticated phishing or new, unnamed drainers. 

TrustScan uses GenLayer's **Equivalence Principle** to allow AI validators (LLMs) to independently analyze various data signals and come to a consensus on:
1. **Risk Score (0-100):** A subjective but agreed-upon numerical value.
2. **Safety Labels:** "Safe", "Suspicious", or "Dangerous".
3. **Plain-English Explanations:** Explaining *why* a target is dangerous.

## 🛠️ Key Features
- **Multi-Source Intelligence:** Real-time data from Etherscan, GoPlus, and Chainabuse.
- **Batch Processing:** Scan up to 10 targets in a single GenLayer transaction.
- **Community-Driven Flags:** Users can submit evidence of malicious activity. This evidence is then fact-checked by the AI validator network to update the global security score.
- **Premium Interface:** A glassmorphic, high-performance dashboard that provides immediate feedback on the consensus state.

## 🏗️ Technical Architecture
- **Connected Frontend:** Built with Next.js 16 and Tailwind CSS v4 for a premium, responsive experience.
- **Intelligent Contract:** Written in Python and deployed on GenLayer Studionet, handling all analysis logic on-chain.
- **State Management:** Uses GenLayer's persistent `TreeMap` for storing risk histories and global threat feeds.

---

### **6. Social Links**
*Choose at least one (e.g., X/Twitter, Discord, or GitHub profile).*
