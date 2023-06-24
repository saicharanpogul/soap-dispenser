"use client";
import useDispenser from "@/hooks/useDispenser";
import useMetaplex from "@/hooks/useMetaplex";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import {
  Metadata,
  Nft,
  NftWithToken,
  Sft,
  SftWithToken,
} from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createQR } from "@solana/pay";
import { SERVER } from "@/utils";

interface Props {
  params: any;
}

const Dispenser: React.FC<Props> = ({ params }) => {
  const { dispenser } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [dispenserAccount, setDispenserAccount] = useState<any>({});
  const [collection, setCollection] = useState<
    Sft | SftWithToken | Nft | NftWithToken
  >();
  const { fetctDispenser } = useDispenser();
  const { metaplex } = useMetaplex();

  const fetchData = useCallback(async () => {
    try {
      if (!dispenser || !metaplex) return;
      const _dispenserAccount = await fetctDispenser(new PublicKey(dispenser));
      setDispenserAccount(_dispenserAccount);
      const _collection = await metaplex.nfts().findByMint({
        mintAddress: _dispenserAccount?.collectionMint as PublicKey,
      });
      setCollection(_collection);
      //   console.log(_dispenserAccount);
      //   console.log(_collection);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [dispenser, fetctDispenser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const urlEncoded = encodeURIComponent(
    `?collection=${collection?.address?.toBase58()}&authority=${dispenserAccount?.creator?.toBase58()}`
  );

  const qr = createQR(
    `solana:${SERVER}/api/mint${urlEncoded}`,
    250,
    "white",
    "black"
  );

  const qrRef = useRef<HTMLDivElement>();
  if (qrRef.current) {
    qrRef.current.innerHTML = "";
    qr.append(qrRef.current);
  }
  return (
    <Flex>
      <Flex
        position={"absolute"}
        overflow={"hidden"}
        zIndex={0}
        bgImage={
          "https://nftstorage.link/ipfs/bafybeid27xtt5lbdo2vmxar34lgsvxvmdvhalmq6ojuw4xuhs7zcbau6hi/6432.png"
        }
        // bgImage={collection?.json?.image}
        bgPosition={"center"}
        backgroundSize={"cover"}
        backgroundRepeat={"no-repeat"}
        backdropFilter="auto"
        backdropBlur="4px"
        w="100vw"
        h="40vh"
        objectFit="cover"
        objectPosition="center bottom"
        filter="blur(70px)"
      />
      <Flex
        pos={"absolute"}
        backgroundImage={
          "linear-gradient(rgba(18, 18, 18, 0.35) 0%, rgb(18, 18, 18) 82.05%)"
        }
        inset={"0px"}
        w="100vw"
        h="100vh"
        zIndex={1}
      />
      <Flex
        h="100vh"
        w="100vw"
        justifyContent={"center"}
        alignItems={"center"}
        flexDir={"column"}
        zIndex={999999}
      >
        <Flex
          // @ts-ignore
          ref={qrRef}
          borderRadius={"12"}
          overflow={"hidden"}
        />
        <Flex mt="4" alignItems={"center"} flexDir={"column"}>
          <Text fontSize={"18"} color="text.900" fontWeight={"semibold"}>
            cSOAPs
          </Text>
          <Text fontSize={"12"} color="gray.500" fontWeight={"semibold"} my="2">
            by
          </Text>
          <Text fontSize={"18"} color="text.900" fontWeight={"semibold"}>
            {collection?.name}
          </Text>
        </Flex>
        <Flex alignItems={"center"} pos="absolute" bottom={"10"}>
          <Text fontSize={"12"} mr="2" color="gray.300" fontWeight={"medium"}>
            Powered By
          </Text>
          <Image alt="" src="/soap.png" w="5" h="5" />
          <Text fontSize={"14"} ml="1" color="text.900" fontWeight={"semibold"}>
            cSOAP
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Dispenser;
