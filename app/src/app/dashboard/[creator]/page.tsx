"use client";
import Navbar from "@/components/Navbar";
import useDispenser from "@/hooks/useDispenser";
import {
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import { useRouter } from "next/navigation";
import axios from "axios";
import { SERVER } from "@/utils";
import useMetaplex from "@/hooks/useMetaplex";
import { PublicKey } from "@solana/web3.js";
import { Nft, NftWithToken, Sft, SftWithToken } from "@metaplex-foundation/js";

interface DispenserProps {
  name: string;
  symbol: string;
  address: string;
  uri: string;
  collection: string;
}

const Dispenser: React.FC<DispenserProps> = ({
  name,
  symbol,
  address,
  uri,
  collection,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  //   const [details, setDetails] = useState<any>({});
  const [collectionMetadata, setCollectionMetadata] = useState<
    Sft | SftWithToken | Nft | NftWithToken
  >();
  const router = useRouter();
  const toast = useToast();
  const { metaplex } = useMetaplex();
  const fetchDetails = useCallback(async () => {
    try {
      //   const { data } = await axios.get(uri);
      //   setDetails(data);
      const _collection = await metaplex.nfts().findByMint({
        mintAddress: new PublicKey(collection),
      });
      setCollectionMetadata(_collection);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [collection, metaplex]);
  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);
  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(`${SERVER}/${address}`);
    toast({
      title: "Copied Shareable Link",
      description: "Shareable Link copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  }, [address, toast]);
  return (
    <Flex
      alignItems={"center"}
      justifyContent={"space-between"}
      px="4"
      py="3"
      bg="background.100"
      borderRadius={"8"}
      my="2"
    >
      <Flex
        alignItems={"center"}
        onClick={() => router.push(`/${address}`)}
        cursor={"pointer"}
      >
        <Image
          alt=""
          src={collectionMetadata?.json?.image}
          w="16"
          h="16"
          borderRadius={"8"}
          fallback={
            <Flex
              w="16"
              h="16"
              borderRadius={"8"}
              justifyContent={"center"}
              alignItems={"center"}
              bg="gray.700"
            >
              {isLoading ? (
                <Spinner color="text.900" size={"md"} />
              ) : (
                <Text color="gray.400" fontSize={"20"}>{`😮`}</Text>
              )}
            </Flex>
          }
        />
        <Flex flexDir={"column"} ml="2">
          <Text color={"primary.500"} fontWeight={"semibold"}>
            {collectionMetadata?.name}
          </Text>
          <Text color={"gray.300"} fontWeight={"semibold"} fontSize={"12"}>
            {collectionMetadata?.symbol}
          </Text>
        </Flex>
      </Flex>
      {/* <Icon
        as={FiMoreVertical}
        color={"text.900"}
        w="6"
        h="6"
        cursor={"pointer"}
        onClick={() => {}}
      /> */}
      <Button
        bg="background.900"
        color="text.900"
        size={"sm"}
        _hover={{
          backgroundColor: "background.900",
        }}
        _active={{
          backgroundColor: "background.900",
        }}
        onClick={copyToClipboard}
        isLoading={isLoading}
      >
        Share
      </Button>
    </Flex>
  );
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dispensers, setDispensers] = useState<any>([]);

  const { fetchDispensers } = useDispenser();

  const getDispensers = useCallback(async () => {
    try {
      const _dispensers = await fetchDispensers();
      setDispensers(_dispensers);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchDispensers]);

  useEffect(() => {
    getDispensers();
  }, [getDispensers]);
  return (
    <Flex alignItems={"center"} flexDir={"column"} w="full">
      <Navbar />
      <Flex
        mt="28"
        flexDir={"column"}
        w={["94%", "94%", "94%", "60%", "70%"]}
        alignItems={"center"}
      >
        <Text color={"text.900"} fontSize={"20"} fontWeight={"semibold"}>
          Your Soap Dispensers
        </Text>
        <Box mt="4" w="full">
          {dispensers?.length > 0 &&
            dispensers.map((dispenser: any, index: number) => (
              <Dispenser
                key={index}
                name={dispenser?.account?.soapDetails?.name}
                symbol={dispenser?.account?.soapDetails?.symbol}
                address={dispenser?.publicKey?.toBase58()}
                uri={dispenser?.account?.soapDetails?.uri}
                collection={dispenser?.account?.collectionMint?.toBase58()}
              />
            ))}
          {dispensers?.length === 0 && (
            <Flex mt="20" w="full">
              <Text
                opacity={0.5}
                color={"gray.300"}
                fontSize={"14"}
                fontWeight={"semibold"}
                textAlign={"center"}
                w="full"
              >
                No dispenser found
              </Text>
            </Flex>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export default Dashboard;
