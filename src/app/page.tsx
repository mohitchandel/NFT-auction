"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import lighthouse from "@lighthouse-web3/sdk";
import { publicClient, walletClient } from "./helpers/viemconfig";
import abi from "@/app/helpers/abi.json";
import { Address } from "viem";
import toast from "react-hot-toast";
import Moralis from "moralis";

const CONTRACT_ADDRESS = "0x43bA70c605fF68101d5eC64ac3E546E4bb70fbb9";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [nftName, setNftName] = useState<string>("");
  const [nftDescription, setNftDescription] = useState<string>("");
  const [nftImage, setNftImage] = useState<string>("");
  const [nftMetaData, setNftMetaData] = useState<string>("");
  const [userNft, setUserNft] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const progressCallback = (progressData: any) => {
    let percentageDone =
      100 - +(progressData?.total / progressData?.uploaded)?.toFixed(2);
    console.log(percentageDone);
  };

  const uploadFile = async (file: any) => {
    const output = await lighthouse.upload(
      file,
      "5f06dacf.6c0e340f84834317a3482bd691fe28f1",
      false,
      null,
      progressCallback
    );
    setNftImage(`https://gateway.lighthouse.storage/ipfs/${output.data.Hash}`);
    console.log("File Status:", output);
    console.log(
      "Visit at https://gateway.lighthouse.storage/ipfs/" + output.data.Hash
    );
  };

  const createMetaData = async () => {
    const response = await lighthouse.uploadText(
      JSON.stringify({ nftName, nftDescription, nftImage }),
      "5f06dacf.6c0e340f84834317a3482bd691fe28f1",
      nftName
    );
    console.log(response);
    setNftMetaData(`https://gateway.lighthouse.storage/ipfs/${response}`);
  };

  const mintNft = async () => {
    if (!nftName || !nftImage || !nftDescription) {
      toast.error("Please fill all the fields");
      return;
    }
    setLoading(true);
    await createMetaData();
    try {
      const { request } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESS as Address,
        abi: abi,
        functionName: "mint",
        args: [nftMetaData],
        account: address,
      });
      await walletClient.writeContract(request);
      toast.success("NFT minted successfully");
      setLoading(false);
    } catch (error) {
      toast.error("something went wrong");
      console.log(error);
      setLoading(false);
    }
  };

  const getUserNft = async () => {
    const data: any = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: abi,
      functionName: "getOwnersTokenId",
      args: [address],
    });
    console.log(data);
    data.forEach(async (item: any) => {
      const metadata: any = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: abi,
        functionName: "tokenURI",
        args: [item],
      });
      console.log(metadata);
    });
  };

  useEffect(() => {
    if (address && isConnected) {
      getUserNft();
    }
  }, [address, userNft]);

  return (
    <>
      {!address && !isConnected ? (
        <div className="flex justify-center items-center h-screen">
          <h1>Please connect your wallet first</h1>
        </div>
      ) : (
        <>
          <div className="flex justify-center items-center gap-4 mt-8">
            {userNft && userNft.length > 0 ? (
              <>
                {userNft.map((item: any) => (
                  <div className="card w-96 bg-base-100 shadow-xl">
                    <figure className="px-10 pt-10">
                      <img
                        src={item.metadata.nftImage}
                        alt="Image"
                        className="rounded-xl"
                      />
                    </figure>
                    <div className="card-body items-center text-center">
                      <h2 className="card-title">{item.metadata.nftName}</h2>
                      <p>{item.metadata.Description}</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <h1>You Don't have any NFT please mint</h1>
            )}
          </div>

          <div className="flex items-center flex-col mt-8 gap-2">
            <h2>Mint a new NFT</h2>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">NFT Name</span>
              </div>
              <input
                type="text"
                onChange={(e) => setNftName(e.target.value)}
                placeholder="Type here"
                className="input input-bordered w-full max-w-xs"
              />
            </label>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Description</span>
              </div>
              <textarea
                onChange={(e) => setNftDescription(e.target.value)}
                className="textarea textarea-bordered h-24 "
                placeholder="Description"
              ></textarea>
            </label>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">NFT Image</span>
              </div>
              <input
                onChange={(e) => uploadFile(e.target.files)}
                type="file"
                className="file-input file-input-bordered w-full max-w-xs"
              />
            </label>

            <button
              disabled={loading}
              className="btn btn-info mt-6 "
              onClick={mintNft}
            >
              {loading ? "loading" : "Mint NFT"}
            </button>
          </div>
        </>
      )}
    </>
  );
}
