(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Downloads/TrustScan/lib/genlayer/client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GENLAYER_CHAIN_ID",
    ()=>GENLAYER_CHAIN_ID,
    "GENLAYER_CHAIN_ID_HEX",
    ()=>GENLAYER_CHAIN_ID_HEX,
    "GENLAYER_NETWORK",
    ()=>GENLAYER_NETWORK,
    "addGenLayerNetwork",
    ()=>addGenLayerNetwork,
    "connectMetaMask",
    ()=>connectMetaMask,
    "getAccounts",
    ()=>getAccounts,
    "getContractAddress",
    ()=>getContractAddress,
    "getCurrentChainId",
    ()=>getCurrentChainId,
    "getEthereumProvider",
    ()=>getEthereumProvider,
    "getStudioUrl",
    ()=>getStudioUrl,
    "isMetaMaskInstalled",
    ()=>isMetaMaskInstalled,
    "isOnGenLayerNetwork",
    ()=>isOnGenLayerNetwork,
    "requestAccounts",
    ()=>requestAccounts,
    "switchAccount",
    ()=>switchAccount,
    "switchToGenLayerNetwork",
    ()=>switchToGenLayerNetwork
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use client";
const GENLAYER_CHAIN_ID = parseInt(("TURBOPACK compile-time value", "61999") || "61999");
const GENLAYER_CHAIN_ID_HEX = `0x${GENLAYER_CHAIN_ID.toString(16).toUpperCase()}`;
const GENLAYER_NETWORK = {
    chainId: GENLAYER_CHAIN_ID_HEX,
    chainName: ("TURBOPACK compile-time value", "GenLayer Studio") || "GenLayer Studio",
    nativeCurrency: {
        name: ("TURBOPACK compile-time value", "GEN") || "GEN",
        symbol: ("TURBOPACK compile-time value", "GEN") || "GEN",
        decimals: 18
    },
    rpcUrls: [
        ("TURBOPACK compile-time value", "https://studio.genlayer.com/api") || "https://studio.genlayer.com/api"
    ],
    blockExplorerUrls: []
};
function getStudioUrl() {
    return ("TURBOPACK compile-time value", "https://studio.genlayer.com/api") || "https://studio.genlayer.com/api";
}
function getContractAddress() {
    return ("TURBOPACK compile-time value", "0x9312Fdc35E76Cb6e4a9ec9F0D2548834ce525eC9") || "0x9312Fdc35E76Cb6e4a9ec9F0D2548834ce525eC9";
}
function isMetaMaskInstalled() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return !!window.ethereum?.isMetaMask;
}
function getEthereumProvider() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return window.ethereum || null;
}
async function requestAccounts() {
    const provider = getEthereumProvider();
    if (!provider) throw new Error("MetaMask is not installed");
    try {
        return await provider.request({
            method: "eth_requestAccounts"
        });
    } catch (error) {
        if (error.code === 4001) throw new Error("User rejected the connection request");
        throw new Error(`Failed to connect to MetaMask: ${error.message}`);
    }
}
async function getAccounts() {
    const provider = getEthereumProvider();
    if (!provider) return [];
    try {
        return await provider.request({
            method: "eth_accounts"
        });
    } catch  {
        return [];
    }
}
async function getCurrentChainId() {
    const provider = getEthereumProvider();
    if (!provider) return null;
    try {
        return await provider.request({
            method: "eth_chainId"
        });
    } catch  {
        return null;
    }
}
async function addGenLayerNetwork() {
    const provider = getEthereumProvider();
    if (!provider) throw new Error("MetaMask is not installed");
    try {
        await provider.request({
            method: "wallet_addEthereumChain",
            params: [
                GENLAYER_NETWORK
            ]
        });
    } catch (error) {
        if (error.code === 4001) throw new Error("User rejected adding the network");
        throw new Error(`Failed to add GenLayer network: ${error.message}`);
    }
}
async function switchToGenLayerNetwork() {
    const provider = getEthereumProvider();
    if (!provider) throw new Error("MetaMask is not installed");
    try {
        await provider.request({
            method: "wallet_switchEthereumChain",
            params: [
                {
                    chainId: GENLAYER_CHAIN_ID_HEX
                }
            ]
        });
    } catch (error) {
        if (error.code === 4902) {
            await addGenLayerNetwork();
        } else if (error.code === 4001) {
            throw new Error("User rejected switching the network");
        } else {
            throw new Error(`Failed to switch network: ${error.message}`);
        }
    }
}
async function isOnGenLayerNetwork() {
    const chainId = await getCurrentChainId();
    if (!chainId) return false;
    return parseInt(chainId, 16) === GENLAYER_CHAIN_ID;
}
async function connectMetaMask() {
    if (!isMetaMaskInstalled()) throw new Error("MetaMask is not installed");
    const accounts = await requestAccounts();
    if (!accounts || accounts.length === 0) throw new Error("No accounts found");
    const onCorrectNetwork = await isOnGenLayerNetwork();
    if (!onCorrectNetwork) await switchToGenLayerNetwork();
    return accounts[0];
}
async function switchAccount() {
    const provider = getEthereumProvider();
    if (!provider) throw new Error("MetaMask is not installed");
    try {
        await provider.request({
            method: "wallet_requestPermissions",
            params: [
                {
                    eth_accounts: {}
                }
            ]
        });
        const accounts = await provider.request({
            method: "eth_accounts"
        });
        if (!accounts || accounts.length === 0) {
            throw new Error("No account selected");
        }
        return accounts[0];
    } catch (err) {
        const e = err;
        if (e.code === 4001) throw new Error("User rejected account switch");
        if (e.code === -32002) throw new Error("Account switch request already pending");
        throw new Error(`Failed to switch account: ${e.message}`);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Downloads/TrustScan/lib/genlayer/WalletProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WalletProvider",
    ()=>WalletProvider,
    "useWallet",
    ()=>useWallet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/lib/genlayer/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
const DISCONNECT_FLAG = "ts_wallet_disconnected";
const WalletContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function WalletProvider({ children }) {
    _s();
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        address: null,
        chainId: null,
        isConnected: false,
        isLoading: true,
        isMetaMaskInstalled: false,
        isOnCorrectNetwork: false
    });
    // Init on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WalletProvider.useEffect": ()=>{
            const initWallet = {
                "WalletProvider.useEffect.initWallet": async ()=>{
                    const installed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isMetaMaskInstalled"])();
                    if (!installed) {
                        setState({
                            address: null,
                            chainId: null,
                            isConnected: false,
                            isLoading: false,
                            isMetaMaskInstalled: false,
                            isOnCorrectNetwork: false
                        });
                        return;
                    }
                    if ("TURBOPACK compile-time truthy", 1) {
                        const wasDisconnected = localStorage.getItem(DISCONNECT_FLAG) === "true";
                        if (wasDisconnected) {
                            setState({
                                address: null,
                                chainId: null,
                                isConnected: false,
                                isLoading: false,
                                isMetaMaskInstalled: true,
                                isOnCorrectNetwork: false
                            });
                            return;
                        }
                    }
                    try {
                        const accounts = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAccounts"])();
                        const chainId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentChainId"])();
                        const correctNetwork = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isOnGenLayerNetwork"])();
                        setState({
                            address: accounts[0] || null,
                            chainId,
                            isConnected: accounts.length > 0,
                            isLoading: false,
                            isMetaMaskInstalled: true,
                            isOnCorrectNetwork: correctNetwork
                        });
                    } catch (e) {
                        console.error("Error initializing wallet:", e);
                        setState({
                            address: null,
                            chainId: null,
                            isConnected: false,
                            isLoading: false,
                            isMetaMaskInstalled: true,
                            isOnCorrectNetwork: false
                        });
                    }
                }
            }["WalletProvider.useEffect.initWallet"];
            initWallet();
        }
    }["WalletProvider.useEffect"], []);
    // MetaMask event listeners
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WalletProvider.useEffect": ()=>{
            const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEthereumProvider"])();
            if (!provider) return;
            const handleAccountsChanged = {
                "WalletProvider.useEffect.handleAccountsChanged": async (accounts)=>{
                    const chainId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentChainId"])();
                    const correctNetwork = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isOnGenLayerNetwork"])();
                    if (accounts.length > 0 && ("TURBOPACK compile-time value", "object") !== "undefined") {
                        localStorage.removeItem(DISCONNECT_FLAG);
                    }
                    setState({
                        "WalletProvider.useEffect.handleAccountsChanged": (prev)=>({
                                ...prev,
                                address: accounts[0] || null,
                                chainId,
                                isConnected: accounts.length > 0,
                                isOnCorrectNetwork: correctNetwork
                            })
                    }["WalletProvider.useEffect.handleAccountsChanged"]);
                }
            }["WalletProvider.useEffect.handleAccountsChanged"];
            const handleChainChanged = {
                "WalletProvider.useEffect.handleChainChanged": async (chainId)=>{
                    const correctNetwork = parseInt(chainId, 16) === __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GENLAYER_CHAIN_ID"];
                    const accounts = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAccounts"])();
                    setState({
                        "WalletProvider.useEffect.handleChainChanged": (prev)=>({
                                ...prev,
                                chainId,
                                address: accounts[0] || null,
                                isConnected: accounts.length > 0,
                                isOnCorrectNetwork: correctNetwork
                            })
                    }["WalletProvider.useEffect.handleChainChanged"]);
                }
            }["WalletProvider.useEffect.handleChainChanged"];
            const handleDisconnect = {
                "WalletProvider.useEffect.handleDisconnect": ()=>{
                    setState({
                        "WalletProvider.useEffect.handleDisconnect": (prev)=>({
                                ...prev,
                                address: null,
                                isConnected: false
                            })
                    }["WalletProvider.useEffect.handleDisconnect"]);
                }
            }["WalletProvider.useEffect.handleDisconnect"];
            provider.on("accountsChanged", handleAccountsChanged);
            provider.on("chainChanged", handleChainChanged);
            provider.on("disconnect", handleDisconnect);
            return ({
                "WalletProvider.useEffect": ()=>{
                    provider.removeListener("accountsChanged", handleAccountsChanged);
                    provider.removeListener("chainChanged", handleChainChanged);
                    provider.removeListener("disconnect", handleDisconnect);
                }
            })["WalletProvider.useEffect"];
        }
    }["WalletProvider.useEffect"], []);
    const connectWallet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WalletProvider.useCallback[connectWallet]": async ()=>{
            try {
                setState({
                    "WalletProvider.useCallback[connectWallet]": (prev)=>({
                            ...prev,
                            isLoading: true
                        })
                }["WalletProvider.useCallback[connectWallet]"]);
                const address = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["connectMetaMask"])();
                const chainId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentChainId"])();
                const correctNetwork = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isOnGenLayerNetwork"])();
                if ("TURBOPACK compile-time truthy", 1) {
                    localStorage.removeItem(DISCONNECT_FLAG);
                }
                setState({
                    address,
                    chainId,
                    isConnected: true,
                    isLoading: false,
                    isMetaMaskInstalled: true,
                    isOnCorrectNetwork: correctNetwork
                });
                return address;
            } catch (err) {
                setState({
                    "WalletProvider.useCallback[connectWallet]": (prev)=>({
                            ...prev,
                            isLoading: false
                        })
                }["WalletProvider.useCallback[connectWallet]"]);
                if (!err.message?.includes("rejected")) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to connect wallet", {
                        description: err.message || "Check your MetaMask and try again."
                    });
                }
                throw err;
            }
        }
    }["WalletProvider.useCallback[connectWallet]"], []);
    const disconnectWallet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WalletProvider.useCallback[disconnectWallet]": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                localStorage.setItem(DISCONNECT_FLAG, "true");
            }
            setState({
                "WalletProvider.useCallback[disconnectWallet]": (prev)=>({
                        ...prev,
                        address: null,
                        isConnected: false
                    })
            }["WalletProvider.useCallback[disconnectWallet]"]);
        }
    }["WalletProvider.useCallback[disconnectWallet]"], []);
    const switchWalletAccount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WalletProvider.useCallback[switchWalletAccount]": async ()=>{
            try {
                setState({
                    "WalletProvider.useCallback[switchWalletAccount]": (prev)=>({
                            ...prev,
                            isLoading: true
                        })
                }["WalletProvider.useCallback[switchWalletAccount]"]);
                const newAddress = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["switchAccount"])();
                const chainId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCurrentChainId"])();
                const correctNetwork = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isOnGenLayerNetwork"])();
                if ("TURBOPACK compile-time truthy", 1) {
                    localStorage.removeItem(DISCONNECT_FLAG);
                }
                setState({
                    address: newAddress,
                    chainId,
                    isConnected: true,
                    isLoading: false,
                    isMetaMaskInstalled: true,
                    isOnCorrectNetwork: correctNetwork
                });
                return newAddress;
            } catch (err) {
                setState({
                    "WalletProvider.useCallback[switchWalletAccount]": (prev)=>({
                            ...prev,
                            isLoading: false
                        })
                }["WalletProvider.useCallback[switchWalletAccount]"]);
                if (!err.message?.includes("rejected")) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to switch account", {
                        description: err.message || "Please try again."
                    });
                }
                throw err;
            }
        }
    }["WalletProvider.useCallback[switchWalletAccount]"], []);
    const value = {
        ...state,
        connectWallet,
        disconnectWallet,
        switchWalletAccount
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WalletContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/Downloads/TrustScan/lib/genlayer/WalletProvider.tsx",
        lineNumber: 239,
        columnNumber: 5
    }, this);
}
_s(WalletProvider, "LJTUpcgdGXu5qNdyRzPHlR7GzmU=");
_c = WalletProvider;
function useWallet() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}
_s1(useWallet, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "WalletProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Downloads/TrustScan/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$WalletProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/lib/genlayer/WalletProvider.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function Providers({ children }) {
    _s();
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Providers.useState": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClient"]({
                defaultOptions: {
                    queries: {
                        staleTime: 2000,
                        refetchOnWindowFocus: false
                    }
                }
            })
    }["Providers.useState"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$WalletProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WalletProvider"], {
                children: children
            }, void 0, false, {
                fileName: "[project]/Downloads/TrustScan/app/providers.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {
                position: "bottom-center",
                theme: "dark",
                richColors: true,
                closeButton: true,
                toastOptions: {
                    style: {
                        background: 'oklch(0.08 0.02 220)',
                        border: '1px solid oklch(0.14 0.03 220)',
                        color: 'oklch(0.92 0.02 210)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        boxShadow: '0 8px 32px oklch(0 0 0 / 0.6)'
                    }
                }
            }, void 0, false, {
                fileName: "[project]/Downloads/TrustScan/app/providers.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Downloads/TrustScan/app/providers.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
_s(Providers, "nronjb1nhk+hnzJ7GVJ2OctVHxM=");
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Downloads_TrustScan_67ebe8bc._.js.map