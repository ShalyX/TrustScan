module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Downloads/TrustScan/lib/genlayer/client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    return ("TURBOPACK compile-time value", "0xbab6447741f3f7a6f93c92AC4470093562b771b4") || "0x9312Fdc35E76Cb6e4a9ec9F0D2548834ce525eC9";
}
function isMetaMaskInstalled() {
    if ("TURBOPACK compile-time truthy", 1) return false;
    //TURBOPACK unreachable
    ;
}
function getEthereumProvider() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
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
}),
"[project]/Downloads/TrustScan/lib/genlayer/WalletProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WalletProvider",
    ()=>WalletProvider,
    "useWallet",
    ()=>useWallet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/lib/genlayer/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const DISCONNECT_FLAG = "ts_wallet_disconnected";
const WalletContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function WalletProvider({ children }) {
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        address: null,
        chainId: null,
        isConnected: false,
        isLoading: true,
        isMetaMaskInstalled: false,
        isOnCorrectNetwork: false
    });
    // Init on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const initWallet = async ()=>{
            const installed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isMetaMaskInstalled"])();
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
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            try {
                const accounts = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAccounts"])();
                const chainId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCurrentChainId"])();
                const correctNetwork = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isOnGenLayerNetwork"])();
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
        };
        initWallet();
    }, []);
    // MetaMask event listeners
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const provider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEthereumProvider"])();
        if (!provider) return;
        const handleAccountsChanged = async (accounts)=>{
            const chainId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCurrentChainId"])();
            const correctNetwork = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isOnGenLayerNetwork"])();
            if (accounts.length > 0 && ("TURBOPACK compile-time value", "undefined") !== "undefined") //TURBOPACK unreachable
            ;
            setState((prev)=>({
                    ...prev,
                    address: accounts[0] || null,
                    chainId,
                    isConnected: accounts.length > 0,
                    isOnCorrectNetwork: correctNetwork
                }));
        };
        const handleChainChanged = async (chainId)=>{
            const correctNetwork = parseInt(chainId, 16) === __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GENLAYER_CHAIN_ID"];
            const accounts = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAccounts"])();
            setState((prev)=>({
                    ...prev,
                    chainId,
                    address: accounts[0] || null,
                    isConnected: accounts.length > 0,
                    isOnCorrectNetwork: correctNetwork
                }));
        };
        const handleDisconnect = ()=>{
            setState((prev)=>({
                    ...prev,
                    address: null,
                    isConnected: false
                }));
        };
        provider.on("accountsChanged", handleAccountsChanged);
        provider.on("chainChanged", handleChainChanged);
        provider.on("disconnect", handleDisconnect);
        return ()=>{
            provider.removeListener("accountsChanged", handleAccountsChanged);
            provider.removeListener("chainChanged", handleChainChanged);
            provider.removeListener("disconnect", handleDisconnect);
        };
    }, []);
    const connectWallet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            setState((prev)=>({
                    ...prev,
                    isLoading: true
                }));
            const address = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["connectMetaMask"])();
            const chainId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCurrentChainId"])();
            const correctNetwork = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isOnGenLayerNetwork"])();
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
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
            setState((prev)=>({
                    ...prev,
                    isLoading: false
                }));
            if (!err.message?.includes("rejected")) {
                __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error("Failed to connect wallet", {
                    description: err.message || "Check your MetaMask and try again."
                });
            }
            throw err;
        }
    }, []);
    const disconnectWallet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        setState((prev)=>({
                ...prev,
                address: null,
                isConnected: false
            }));
    }, []);
    const switchWalletAccount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            setState((prev)=>({
                    ...prev,
                    isLoading: true
                }));
            const newAddress = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["switchAccount"])();
            const chainId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCurrentChainId"])();
            const correctNetwork = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isOnGenLayerNetwork"])();
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
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
            setState((prev)=>({
                    ...prev,
                    isLoading: false
                }));
            if (!err.message?.includes("rejected")) {
                __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error("Failed to switch account", {
                    description: err.message || "Please try again."
                });
            }
            throw err;
        }
    }, []);
    const value = {
        ...state,
        connectWallet,
        disconnectWallet,
        switchWalletAccount
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(WalletContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/Downloads/TrustScan/lib/genlayer/WalletProvider.tsx",
        lineNumber: 239,
        columnNumber: 5
    }, this);
}
function useWallet() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}
}),
"[project]/Downloads/TrustScan/app/providers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$WalletProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Downloads/TrustScan/lib/genlayer/WalletProvider.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function Providers({ children }) {
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClient"]({
            defaultOptions: {
                queries: {
                    staleTime: 2000,
                    refetchOnWindowFocus: false
                }
            }
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$lib$2f$genlayer$2f$WalletProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["WalletProvider"], {
                children: children
            }, void 0, false, {
                fileName: "[project]/Downloads/TrustScan/app/providers.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Downloads$2f$TrustScan$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toaster"], {
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
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7ccaec90._.js.map