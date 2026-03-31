# TrustScan

**TrustScan** is an AI-powered security scanner for GenLayer. It allows users to scan wallet addresses, URLs, and token contracts to identify potential risks before interacting with them.

## Overview

TrustScan uses GenLayer's AI validator system to cross-reference multiple security data sources (Etherscan, GoPlus, Chainabuse) and provides a comprehensive risk score and easy-to-understand labels.

## Features

- **Wallet / URL / Token Scanning**: Instantly get a risk profile for any target.
- **AI-Powered Labels**: Clear labels (Safe, Suspicious, Dangerous) determined by AI consensus.
- **Batch Scanning**: Scan up to 10 targets in a single transaction for efficiency.
- **Flagging System**: Users can flag malicious actors with evidence, contributing to the global threat intelligence.
- **Premium UI**: Dark mode with glass-morphism, built on Next.js 16 and Tailwind CSS v4.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`.
   - Update `NEXT_PUBLIC_CONTRACT_ADDRESS` if you've deployed your own contract.

3. **Run for development:**
   ```bash
   npm run dev
   ```

## GenLayer Account Management

The app includes a built-in wallet management system:
- **Generate Private Key**: New users can generate a secure key.
- **Import Private Key**: Import an existing GenLayer account.
- **Persistent Sessions**: Your session is stored securely in the browser's local storage.

## Smart Contract

The core logic resides in the `TrustScan` intelligent contract on the GenLayer Studionet.

- **Contract Address**: `0x9312Fdc35E76Cb6e4a9ec9F0D2548834ce525eC9`
- **Network**: GenLayer Studionet (Chain ID: 61999)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Blockchain SDK**: `genlayer-js`
- **State Management**: TanStack Query (React Query)
- **UI Components**: shadcn/ui & Radix UI
