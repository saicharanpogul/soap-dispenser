import {
  Box,
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure,
  useMediaQuery,
  useToast,
} from "@chakra-ui/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletName } from "@solana/wallet-adapter-wallets";
import React, { useCallback, useEffect, useState } from "react";
import _ from "lodash";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import usePhantom from "@/hooks/usePhantom";
import useSignature from "@/hooks/useSignature";
import { NETWORK, truncateAddress } from "@/utils";
import { getAccessKey } from "@/api";
import { useDispatch } from "react-redux";
import { setSignature } from "@/state/signatureSlice";

interface WithChildren {
  children: React.ReactNode;
  onChildClick: () => void;
  style?: {};
}

interface WithoutChildren {}

type Props = XOR<WithChildren, WithoutChildren>;

const ConnectWalletButton: React.FC<Props> = ({
  children,
  onChildClick,
  style,
}) => {
  const isPhantom = usePhantom();
  const { connection } = useConnection();
  const { connected, connect, select, disconnect, publicKey, wallet } =
    useWallet();
  const [base58, setBase58] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const toast = useToast();
  const { onClose, isOpen, onOpen } = useDisclosure();
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const [isMobileOrTablet] = useMediaQuery("(min-width: 600px)");
  const { getSignature, signature } = useSignature();
  const isWindowContext = typeof window !== "undefined";
  const origin = isWindowContext && window.origin;
  const dispatch = useDispatch();

  useEffect(() => {}, [isPhantom]);

  // useEffect(() => {
  //   wallet?.adapter.addListener("error", (error) => {
  //     toast({
  //       title: error.name,
  //       description: error.message,
  //       duration: 5000,
  //       status: "error",
  //       isClosable: true,
  //     });
  //   });
  //   return () => {
  //     wallet?.adapter.removeListener("error");
  //   };
  // }, [wallet]);
  useEffect(() => {
    if (connected && publicKey) {
      setBase58(publicKey.toBase58());
    }
  }, [connected, publicKey]);
  const connectWallet = useCallback(async () => {
    if (!connected) {
      try {
        select(PhantomWalletName);
        await connect().catch(() => {});
        onClose();
        onModalOpen();
      } catch (error) {}
    } else {
      onChildClick && onChildClick();
    }
  }, [connected]);
  const disconnectWallet = useCallback(async () => {
    if (connected) {
      await disconnect();
      localStorage.removeItem("signature");
      localStorage.removeItem("access-key");
      dispatch(setSignature(""));
      onClose();
    }
  }, [connected]);
  const copyAddress = useCallback(async () => {
    if (connected) {
      await navigator.clipboard.writeText(base58);
      toast({
        title: "Copied Address",
        description: "Address copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      onClose();
    }
  }, [base58, connected, onClose, toast]);
  const changeNetwork = useCallback(async () => {
    toast({
      title: "Only devnet",
      description: "Currently only devnet is supported",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
    onClose();
  }, [onClose, toast]);
  const requestAirdrop = useCallback(async () => {
    try {
      if (connected) {
        await connection.requestAirdrop(
          publicKey as PublicKey,
          2 * LAMPORTS_PER_SOL
        );
        toast({
          title: "Airdrop successful",
          description: "Airdropped 2 SOL",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onClose();
      }
    } catch (error) {
      console.log(error);
    }
  }, [connected, connection, onClose, publicKey, toast]);
  const signAndSetAccessKey = useCallback(async () => {
    try {
      setIsSigning(true);
      if (!connected || !publicKey) return;
      const signature = await getSignature();
      const data = await getAccessKey(
        signature as string,
        publicKey?.toBase58() as string
      );
      localStorage.setItem("access-key", data.accessKey);
      onModalClose();
    } catch (error) {
      onModalClose();
      if (connected) {
        disconnectWallet();
      }
    } finally {
      setIsSigning(false);
    }
  }, [connected, disconnectWallet, getSignature, onModalClose, publicKey]);
  const network = _.capitalize(NETWORK);
  return (
    <Box {...style}>
      <Popover
        placement="bottom-end"
        onClose={onClose}
        isOpen={isOpen}
        onOpen={onOpen}
      >
        <PopoverTrigger>
          <Button
            w="40"
            backgroundColor="blackAlpha.900"
            color="text.900"
            _hover={{
              backgroundColor: "blackAlpha.900",
            }}
            _active={{
              backgroundColor: "blackAlpha.900",
            }}
            onClick={
              isPhantom
                ? connectWallet
                : () => {
                    if (!isMobileOrTablet) {
                      return window.open(
                        `https://phantom.app/ul/browse/${window.origin}`
                      );
                    }
                    return window.open("https://phantom.app");
                  }
            }
          >
            {children
              ? children
              : isPhantom
              ? connected
                ? truncateAddress(base58)
                : "Connect Wallet"
              : "Install Phantom"}
          </Button>
        </PopoverTrigger>
        {isPhantom && connected && !children && (
          <PopoverContent background={"background.100"} maxWidth={150}>
            <PopoverBody
              display={"flex"}
              justifyContent={"center"}
              flexDirection="column"
            >
              <Button
                width={"full"}
                variant="unstyled"
                color={"text.900"}
                onClick={disconnectWallet}
              >
                Disconnect
              </Button>
              <Divider />
              <Button
                width={"full"}
                variant="unstyled"
                color={"text.900"}
                onClick={changeNetwork}
              >
                {network}
              </Button>
              <Divider />
              <Button
                width={"full"}
                variant="unstyled"
                color={"text.900"}
                onClick={copyAddress}
              >
                Copy Address
              </Button>
              {(NETWORK === "devnet" || NETWORK === "localnet") && (
                <>
                  <Divider />
                  <Button
                    width={"full"}
                    variant="unstyled"
                    color={"text.900"}
                    onClick={requestAirdrop}
                  >
                    Airdrop SOL
                  </Button>
                </>
              )}
            </PopoverBody>
          </PopoverContent>
        )}
      </Popover>
      <Modal
        isOpen={isModalOpen}
        onClose={onModalClose}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Welcome to SOAP</ModalHeader>
          <ModalBody>
            <Text textAlign="center">
              By signing you are authenticating to connect your wallet to SOAP.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                onModalClose();
                if (connected) {
                  disconnectWallet();
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              onClick={signAndSetAccessKey}
              isLoading={isSigning}
              loadingText={"Signing..."}
            >
              Sign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ConnectWalletButton;
