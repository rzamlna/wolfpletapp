import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { ethers } from "ethers";
// alamat kontrak kamu
const NFT_CONTRACT = "0x8732a30ED4219a2593017E008294Af33B1B706D8";
// alamat USDC di Base mainnet
const USDC_CONTRACT = "0x833589fCD6eDb6E08f4c7C32D4f71b54BDA02913";
// ABI minimal
const USDC_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function approve(address spender, uint256 value) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];
const NFT_ABI = [
    "function mint(uint256 quantity) public"
];
function App() {
    const [status, setStatus] = useState("Connect your wallet to mint your Wolfplet NFT");
    const [isMinting, setIsMinting] = useState(false);
    async function mintNFT() {
        try {
            if (!window.ethereum)
                throw new Error("Wallet not detected — open in Warpcast or MetaMask");
            setIsMinting(true);
            setStatus("Connecting wallet...");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const userAddr = await signer.getAddress();
            const usdc = new ethers.Contract(USDC_CONTRACT, USDC_ABI, signer);
            const nft = new ethers.Contract(NFT_CONTRACT, NFT_ABI, signer);
            const amount = ethers.parseUnits("0.1", 6); // USDC punya 6 desimal
            // cek saldo
            const balance = await usdc.balanceOf(userAddr);
            if (balance < amount)
                throw new Error("Insufficient USDC balance");
            setStatus("Approving USDC spend...");
            const allowance = await usdc.allowance(userAddr, NFT_CONTRACT);
            if (allowance < amount) {
                const approveTx = await usdc.approve(NFT_CONTRACT, amount);
                await approveTx.wait();
            }
            setStatus("Minting Wolfplet NFT...");
            const mintTx = await nft.mint(1);
            await mintTx.wait();
            setStatus(`✅ Mint successful! TX: ${mintTx.hash}`);
        }
        catch (err) {
            console.error(err);
            setStatus(`❌ ${err.message || "Mint failed"}`);
        }
        finally {
            setIsMinting(false);
        }
    }
    return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-[#0A192F] text-white text-center px-4", children: [_jsx("img", { src: "https://i.ibb.co/fGFG1Gz4/ezgif-com-animated-gif-maker.gif", alt: "Wolfplet", className: "w-32 h-32 rounded-full mb-6 border-4 border-purple-600 shadow-lg" }), _jsx("h1", { className: "text-3xl font-bold mb-2", children: "Wolfplet NFT" }), _jsxs("p", { className: "text-gray-300 mb-6 max-w-md", children: ["Mint your Wolfplet NFT on Base for ", _jsx("b", { children: "0.1 USDC" }), " and join the pack."] }), _jsx("button", { onClick: mintNFT, disabled: isMinting, className: `px-8 py-3 rounded-xl font-semibold transition-all ${isMinting
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 active:scale-95"}`, children: isMinting ? "Minting..." : "Mint NFT" }), _jsx("p", { className: "mt-6 text-sm text-gray-400 max-w-md", children: status }), _jsx("a", { href: "https://warpcast.com/~/compose?text=I%20just%20minted%20my%20Wolfplet%20NFT%20on%20Base%20\uD83D\uDC3A%20join%20the%20pack", target: "_blank", rel: "noopener noreferrer", className: "mt-6 underline text-purple-400 hover:text-purple-300 text-sm", children: "Share your mint on Warpcast" })] }));
}
export default App;
