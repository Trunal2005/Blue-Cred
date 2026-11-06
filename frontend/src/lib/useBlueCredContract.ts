"use client";

import { useWriteContract, useReadContract, useAccount, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";
import { useState } from "react";

export function useBlueCredContract() {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const ensureSafeWrite = () => {
    if (process.env.NEXT_PUBLIC_ENABLE_TESTNET_WRITES !== "true") throw new Error("Blockchain writes disabled in zero-cost local mode");
    if (![31337, 11155111, 80002].includes(chainId || 0)) throw new Error("Only explicitly enabled local/test networks are supported");
    if (!publicClient) throw new Error("No public client configured");
  };
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>();

  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: lastTxHash });

  // Submit a new carbon project on-chain
  const submitProjectOnChain = async (name: string, location: string) => {
    if (!isConnected) throw new Error("Wallet not connected");
    ensureSafeWrite();

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: "submitProject",
      args: [name, location],
    });

    setLastTxHash(hash);
    const receipt = await publicClient!.waitForTransactionReceipt({ hash, timeout: 120_000 });
    if (receipt.status !== "success") throw new Error("Transaction reverted");
    return hash;
  };

  // Mint carbon credits for a project
  const mintCreditsOnChain = async (
    projectId: number,
    toAddress: string,
    amount: number
  ) => {
    if (!isConnected) throw new Error("Wallet not connected");
    ensureSafeWrite();

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: "mintCredits",
      args: [BigInt(projectId), toAddress as `0x${string}`, BigInt(amount)],
    });

    setLastTxHash(hash);
    const receipt = await publicClient!.waitForTransactionReceipt({ hash, timeout: 120_000 });
    if (receipt.status !== "success") throw new Error("Transaction reverted");
    return hash;
  };

  // Read a project from the contract
  const useProject = (projectId: number) => {
    return useReadContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: "projects",
      args: [BigInt(projectId)],
    });
  };

  // Read the next project ID
  const useNextProjectId = () => {
    return useReadContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: "nextProjectId",
    });
  };

  // Freeze a project (admin only)
  const freezeProjectOnChain = async (projectId: number) => {
    if (!isConnected) throw new Error("Wallet not connected");
    ensureSafeWrite();

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: "freezeProject",
      args: [BigInt(projectId)],
    });

    setLastTxHash(hash);
    const receipt = await publicClient!.waitForTransactionReceipt({ hash, timeout: 120_000 });
    if (receipt.status !== "success") throw new Error("Transaction reverted");
    return hash;
  };

  return {
    // State
    address,
    isConnected,
    lastTxHash,
    isWritePending,
    isConfirming,
    isConfirmed,

    // Actions
    submitProjectOnChain,
    mintCreditsOnChain,
    freezeProjectOnChain,

    // Queries
    useProject,
    useNextProjectId,
  };
}
