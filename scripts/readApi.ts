import axios from "axios";

export async function getAsset(
  assetId: any,
  rpcUrl = process.env.HELIUS_API_KEY
): Promise<any> {
  try {
    const axiosInstance = axios.create({
      baseURL: rpcUrl,
    });
    const response = await axiosInstance.post(rpcUrl, {
      jsonrpc: "2.0",
      method: "getAsset",
      id: "rpd-op-123",
      params: {
        id: assetId,
      },
    });
    return response.data.result;
  } catch (error) {
    console.error(error);
  }
}

export async function getAssetProof(
  assetId: any,
  rpcUrl = process.env.HELIUS_API_KEY
): Promise<any> {
  try {
    const axiosInstance = axios.create({
      baseURL: rpcUrl,
    });
    const response = await axiosInstance.post(rpcUrl, {
      jsonrpc: "2.0",
      method: "getAssetProof",
      id: "rpd-op-123",
      params: {
        id: assetId,
      },
    });
    return response.data.result;
  } catch (error) {
    console.error(error);
  }
}
