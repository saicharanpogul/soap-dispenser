"use client";
import { Flex, Image, Text } from "@chakra-ui/react";
import React from "react";
import ConnectWalletButton from "./ConnectWalletButton";
import { useRouter } from "next/navigation";

const Navbar = () => {
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
      <ConnectWalletButton />
    </Flex>
  );
};

export default Navbar;
