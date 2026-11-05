"use client";

import { useWriteContract, useReadContract, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";
import { useState } from "react";

export function useBlueCredContract() {
  const { address, isConnected } = useAccount();
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>();

  const { writeContractAsync, isPending: isWritePending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: lastTxHash });

  // Submit a new carbon project on-chain
  const submitProjectOnChain = async (name: string, location: string) => {
    if (!isConnected) throw new Error("Wallet not connected");

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: "submitProject",
      args: [name, location],
    });

    setLastTxHash(hash);
    return hash;
  };

  // Mint carbon credits for a project
  const mintCreditsOnChain = async (
    projectId: number,
    toAddress: string,
    amount: number
  ) => {
    if (!isConnected) throw new Error("Wallet not connected");

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: "mintCredits",
      args: [BigInt(projectId), toAddress as `0x${string}`, BigInt(amount)],
    });

    setLastTxHash(hash);
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

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: "freezeProject",
      args: [BigInt(projectId)],
    });

    setLastTxHash(hash);
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
