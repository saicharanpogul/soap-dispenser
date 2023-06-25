"use client";
import { Flex, Image, Text } from "@chakra-ui/react";
import React from "react";
import ConnectWalletButton from "./ConnectWalletButton";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

const Navbar = () => {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  return (
    <Flex
      mt="4"
      mx="4"
      bg={"rgba(55, 56, 63, 0.4)"}
      backdropFilter="auto"
      backdropBlur="4px"
      p="4"
      borderRadius={"12"}
      justifyContent={"space-between"}
      w={["94%", "94%", "94%", "60%", "70%"]}
      pos={"fixed"}
      zIndex={99}
    >
      <Flex
        alignItems={"center"}
        userSelect={"none"}
        cursor={"pointer"}
        onClick={() => router.push("/")}
      >
        <Image alt="" src={"/soap.png"} w="8" h="8" />
        <Text color={"text.900"} fontSize={"20"} fontWeight={"bold"} ml="1">
          cSOAP
        </Text>
      </Flex>
      <Flex alignItems={"center"}>
        {connected && (
          <Text
            color={"text.900"}
            fontWeight={"semibold"}
            mr="4"
            display={["none", "none", "initial"]}
            onClick={() => router.push(`/dashboard/${publicKey?.toBase58()}`)}
            cursor={"pointer"}
            fontSize={"14"}
          >
            Dashboard
          </Text>
        )}
        <ConnectWalletButton />
      </Flex>
    </Flex>
  );
};

export default Navbar;
