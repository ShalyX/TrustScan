# TrustScan Contract Upgrade Guide

## What Changed & Why

The hackathon team correctly noted that the original contract **mentioned** sources like Etherscan and GoPlus in its prompt but didn't actually **fetch** from them. The AI was essentially guessing based on its training data.

The upgraded contract fixes this by:
1. **Fetching real-time data FIRST** using `gl.nondet.web.get` and `gl.nondet.web.render`
2. **Passing that fetched content** into the LLM prompt as grounded evidence
3. **Using `prompt_non_comparative`** for consensus (more appropriate than `strict_eq` since web content can vary slightly across validator nodes)

---

## Data Sources Used Per Target Type

| Type | Sources |
|------|---------|
| **Wallet** | Etherscan (balance + tx count) · GoPlus Address Security · Chainabuse |
| **Token** | GoPlus Token Security API · Etherscan Contract Verification · GoPlus Address flags |
| **URL** | URLScan.io · PhishTank · Direct page render via `gl.nondet.web.render` |

---

## How to Deploy

### Step 1: Open GenLayer Studio
Go to **https://studio.genlayer.com** and connect your wallet.

### Step 2: Paste the Contract
- Open a new contract file
- Copy the full contents of `contracts/trust_scan.py` and paste it in

### Step 3: Deploy to Bradbury Testnet
- Select **Bradbury** as your target network
- Click **Deploy**
- Save the new contract address

### Step 4: Update the Frontend
In `lib/genlayer/client.ts`, update the contract address:
```ts
export const TRUSTSCAN_CONTRACT_ADDRESS = "0xYOUR_NEW_ADDRESS_HERE";
```

### Step 5: Redeploy to Vercel
```bash
vercel --prod
```

---

## Key Design Decisions

### Why `prompt_non_comparative` instead of `strict_eq`?
`strict_eq` requires **byte-identical** results across all validators. Since different validator nodes may fetch slightly different snapshots of live web pages (or one might get a rate-limited response), `strict_eq` would cause too many consensus failures.

`prompt_non_comparative` lets validators check that the leader's JSON result is **valid and consistent** with the criteria — without needing to re-fetch and exactly match the same web data.

### Why are errors caught and included?
If a source like Etherscan is temporarily down, the fetch will fail gracefully and the LLM is told *"Etherscan: unavailable"*. This means:
- The scan **still completes** with the data that was available
- The LLM notes limited evidence in the `reason` field
- The user gets a result rather than an error

### Normalisation
The `_normalise()` helper strips protocols, `www.`, and trailing slashes so that `https://Google.com/`, `google.com`, and `GOOGLE.COM` all map to the same storage key.

---

## Replying to the Hackathon Team

Suggested response:
> "We've upgraded the contract to use `gl.nondet.web.get` for Etherscan, GoPlus, and Chainabuse for wallet/token scans, and `gl.nondet.web.render` + URLScan/PhishTank for URL scans. The LLM prompt now receives the raw fetched content as evidence and is instructed to cite specific data points in its reasoning. We use `prompt_non_comparative` for consensus since live web data can vary slightly across validator nodes. The new contract is deployed at [address]."
