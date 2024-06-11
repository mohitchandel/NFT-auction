"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import lighthouse from "@lighthouse-web3/sdk";
import { publicClient, walletClient } from "@/app/helpers/viemconfig";
import abi from "@/app/helpers/abi.json";
import { Address, parseEther } from "viem";
import toast from "react-hot-toast";
import { formatEther } from "viem";

const CONTRACT_ADDRESS = "0x43bA70c605fF68101d5eC64ac3E546E4bb70fbb9";

export default function Auctions() {
  const { address, isConnected } = useAccount();
  const [nftId, setNftId] = useState<string>("");
  const [auctionAmount, setAuctionAmount] = useState<string>("");
  const [allAuctions, setAllAuctions] = useState<any>([]);
  const [userBid, setUserBid] = useState<string>("");

  const createAuction = async () => {
    if (!nftId || !auctionAmount) {
      toast.error("Please enter all the fields");
      return;
    }
    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: abi,
      functionName: "createAuction",
      account: (address as Address) || "",
      args: [nftId, parseEther(auctionAmount)],
      value: parseEther(auctionAmount),
    });
    await walletClient.writeContract(request);
  };

  const bid = async (id: any) => {
    if (!userBid) {
      toast.error("Please enter your bid");
      return;
    }
    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: abi,
      functionName: "placeBid",
      account: (address as Address) || "",
      args: [id],
      value: parseEther(userBid),
    });
    await walletClient.writeContract(request);
  };

  const getAllAuctions = async () => {
    const data: any = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: abi,
      functionName: "getAllAuctions",
    });
    setAllAuctions(data);
  };

  useEffect(() => {
    getAllAuctions();
  }, []);

  return (
    <>
      {!address && !isConnected ? (
        <div className="flex justify-center items-center h-screen">
          <h1>Please connect your wallet first</h1>
        </div>
      ) : (
        <>
          <div className="flex justify-center items-center gap-4 mt-8">
            {allAuctions && allAuctions.length > 0 ? (
              <>
                {allAuctions.map((items: any) => (
                  <div className="card w-96 bg-base-100 shadow-xl">
                    <div className="card-body items-center text-center">
                      <h2 className="card-title">{items[0]}</h2>
                      <p>Heights Bid: {items[3]}</p>
                      <input
                        min={0}
                        type="number"
                        placeholder="your bid"
                        onChange={(e) => setUserBid(e.target.value)}
                      />
                      <button
                        className="btn btn-info mt-6 "
                        onClick={() => bid(items.id)}
                      >
                        Bid
                      </button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <h1>No auction yet</h1>
            )}
          </div>

          <div className="flex items-center flex-col mt-8 gap-2">
            <h2>Create Auction</h2>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">NFT Id</span>
              </div>
              <input
                type="number"
                min={0}
                onChange={(e) => setNftId(e.target.value)}
                placeholder="Type here"
                className="input input-bordered w-full max-w-xs"
              />
            </label>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Min Amount</span>
              </div>
              <input
                type="number"
                min={0}
                onChange={(e) => setAuctionAmount(e.target.value)}
                className="input input-bordered w-full max-w-xs"
                placeholder="Description"
              />
            </label>

            <button className="btn btn-info mt-6 " onClick={createAuction}>
              Create Auction
            </button>
          </div>
        </>
      )}
    </>
  );
}
