import {
  ALL_DEPTH_SIZE_PAIRS,
  getConcurrentMerkleTreeAccountSize,
} from "@solana/spl-account-compression";
import { connection } from ".";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const getTreePrices = async (maxProofSize: number) => {
  try {
    ALL_DEPTH_SIZE_PAIRS.map(async (pair) => {
      const canopy = pair.maxDepth > maxProofSize ? pair.maxDepth : 0;
      const size = getConcurrentMerkleTreeAccountSize(
        pair.maxDepth,
        pair.maxBufferSize,
        canopy
      );
      const rent = await connection.getMinimumBalanceForRentExemption(size);
      // console.log(
      //   `Size: ${size} bytes | Max Depth: ${pair.maxDepth} | Max Buffer Size: ${
      //     pair.maxBufferSize
      //   } | Price: ${(rent as number) / LAMPORTS_PER_SOL} SOL`
      // );
      console.log({
        size,
        maxDepth: pair.maxDepth,
        maxBufferSize: pair.maxBufferSize,
        price: rent / LAMPORTS_PER_SOL,
        mints: 2 ** pair.maxDepth,
      });
    });
  } catch (error) {
    throw error;
  }
};

getTreePrices(1);
