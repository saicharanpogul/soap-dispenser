import {
  Button,
  Flex,
  Image,
  Spinner,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { toBigNumber } from "@metaplex-foundation/js";
import { getConcurrentMerkleTreeAccountSize } from "@solana/spl-account-compression";
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

interface Props {
  data: any;
  create: () => Promise<PublicKey | undefined>;
  setActiveStep: any;
  reset: () => void;
}

interface InfoPairProps {
  title: string;
  value?: string;
  image?: any;
  isLoading?: boolean;
}

const InfoPair: React.FC<InfoPairProps> = ({
  title,
  value,
  image,
  isLoading,
}) => {
  return (
    <Flex
      justifyContent={"space-between"}
      my="1"
      w="full"
      alignItems={"flex-start"}
    >
      <Text color="text.900" opacity={0.5} fontWeight={"light"}>
        {title}
      </Text>
      {value && (
        <Tooltip label={value} display={value.length > 24 ? "flex" : "none"}>
          {isLoading ? (
            <Spinner size={"sm"} color="white" />
          ) : (
            <Text
              color="text.900"
              fontWeight={"semibold"}
              noOfLines={1}
              alignSelf={"flex-end"}
              w="48"
              textAlign={"right"}
            >
              {value}
            </Text>
          )}
        </Tooltip>
      )}
      {image && (
        <Image
          alt=""
          src={URL.createObjectURL(image)}
          w="10"
          h="10"
          borderRadius={"8"}
        />
      )}
    </Flex>
  );
};

const ReviewStep: React.FC<Props> = ({
  data,
  create,
  setActiveStep,
  reset,
}) => {
  const [price, setPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { connection } = useConnection();
  const toast = useToast();
  const router = useRouter();

  const fetchPrice = useCallback(async () => {
    try {
      if (!connection) return;
      const space = getConcurrentMerkleTreeAccountSize(
        data?.treeConfig?.tree?.maxDepth,
        data?.treeConfig?.tree?.maxBufferSize
      );
      let _price = await connection.getMinimumBalanceForRentExemption(space);
      setPrice(_price / LAMPORTS_PER_SOL);
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Unable to fetch price",
        status: "error",
        duration: 5000,
        description: error.message,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    connection,
    data?.treeConfig?.tree?.maxBufferSize,
    data?.treeConfig?.tree?.maxDepth,
    toast,
  ]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  const createhandler = useCallback(async () => {
    try {
      setCreating(true);
      const dispenser = await create();
      toast({
        title: "Soap Dispenser Created!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      router.push(`/${dispenser}`);
      reset();
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Something went wrong",
        status: "error",
        duration: 5000,
        description: error.message,
        isClosable: true,
      });
    } finally {
      setCreating(false);
    }
  }, [create, toast, reset, router]);

  return (
    <Flex flexDir={"column"} w="full" mb="10">
      <Flex flexDir={"column"} w="full" mt="4">
        <Text color="primary.500" fontSize={"14"} fontWeight={"semibold"}>
          Collection
        </Text>
        <InfoPair title="Name" value={data?.collection?.name} />
        <InfoPair title="Symbol" value={data?.collection?.symbol} />
        <InfoPair title="Description" value={data?.collection?.description} />
        <InfoPair title="Image" image={data?.collection?.image} />
      </Flex>
      <Flex flexDir={"column"} w="full" mt="2">
        <Text color="primary.500" fontSize={"14"} fontWeight={"semibold"}>
          Config
        </Text>
        <InfoPair title="Name" value={data?.treeConfig?.name} />
        <InfoPair title="Symbol" value={data?.treeConfig?.symbol} />
        <InfoPair title="Description" value={data?.treeConfig?.description} />
        <InfoPair title="Image" image={data?.treeConfig?.image} />
        <InfoPair
          title="Max Depth (Merkle Tree Height)"
          value={data?.treeConfig?.tree?.maxDepth}
        />
        <InfoPair
          title="Max Buffer Size"
          value={data?.treeConfig?.tree?.maxBufferSize}
        />
        <InfoPair
          title="Total Mints"
          value={(2 ** data?.treeConfig?.tree?.maxDepth).toString()}
        />
        <InfoPair
          title="Tree Cost"
          value={`~${price} SOL`}
          isLoading={isLoading}
        />
        <InfoPair
          title="Transfer"
          value={`~${
            (2 ** data?.treeConfig?.tree?.maxDepth * 5000) / LAMPORTS_PER_SOL
          } SOL`}
          isLoading={isLoading}
        />
      </Flex>
      <Flex justifyContent={"space-between"} w="full">
        <Button
          mt="6"
          w="46%"
          variant={"primary"}
          onClick={() => setActiveStep(1)}
        >
          Previous
        </Button>
        <Button
          mt="6"
          w="46%"
          variant={"primary"}
          onClick={createhandler}
          isLoading={creating}
          loadingText={"Creating..."}
        >
          Create
        </Button>
      </Flex>
    </Flex>
  );
};

export default ReviewStep;
