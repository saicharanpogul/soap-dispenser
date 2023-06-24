import { CloseIcon } from "@chakra-ui/icons";
import {
  Button,
  Flex,
  FormControl,
  FormControlProps,
  FormErrorMessage,
  Icon,
  Image,
  Input,
  InputGroup,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { acceptedFileTypesToTypeString } from "../utils";

interface Props extends FormControlProps {
  name: string;
  acceptedFileTypes?: string;
  defaultValue: any;
  fallbackImage?: string;
  value: any;
  error: string;
  onChange: (e: any) => void;
  reset: () => void;
}

const FileUpload: React.FC<Props> = ({
  name,
  acceptedFileTypes,
  defaultValue,
  fallbackImage,
  value,
  error,
  onChange,
  reset,
}) => {
  const [image, setImage] = useState<string | undefined>(undefined);
  const inputRef = useRef();
  useEffect(() => {
    if (value) {
      setImage(URL.createObjectURL(value));
    } else {
      setImage(undefined);
    }
  }, [value]);

  return (
    <FormControl isInvalid={!!error} w="initial">
      <InputGroup
        as="div"
        display={"flex"}
        flexDirection="column"
        justifyContent={"center"}
        alignItems="center"
        bg="background.100"
        p="10"
        borderRadius={"12"}
        h={["200px", "240px", "250px", "250px", "280px"]}
        w={["200px", "240px", "250px", "250px", "280px"]}
        overflow={"hidden"}
        cursor={"pointer"}
        // @ts-ignore
        onClick={() => !image && inputRef!.current?.click()}
      >
        {(image || fallbackImage) && (
          <Flex
            onClick={() => {
              reset();
              setImage(undefined);
              // @ts-ignore
              inputRef.current!.value = null;
            }}
            cursor={"pointer"}
            p="2"
            position={"absolute"}
            zIndex="9"
            top="3"
            right="3"
            _hover={{
              backgroundColor: "rgb(255,255,255, 10%)",
            }}
            bg="rgb(255,255,255, 40%)"
            borderRadius={"50%"}
          >
            <Icon as={CloseIcon} h="2" w="2" color="text.100" />
          </Flex>
        )}
        <Image
          position="absolute"
          alt="image"
          display={image || fallbackImage ? "initial" : "none"}
          src={image}
          fallbackSrc={fallbackImage}
          h={["200px", "240px", "250px", "250px", "280px"]}
          w={["200px", "240px", "250px", "250px", "280px"]}
          // objectFit={"contain"}
        />
        <input
          id={name}
          type="file"
          accept={acceptedFileTypes}
          // @ts-ignore
          ref={inputRef}
          style={{ display: "none" }}
          // @ts-ignore
          onChange={(e) => {
            onChange(e);
          }}
          defaultValue={defaultValue || ""}
        ></input>
        {!image && !fallbackImage && (
          <Text fontSize={"sm"} color="text.500" mb="4" textAlign={"center"}>
            {acceptedFileTypesToTypeString(acceptedFileTypes as string)}
          </Text>
        )}
        <Text
          color="text.900"
          display={image || fallbackImage ? "none" : "initial"}
          textAlign={"center"}
        >
          {"Choose image"}
        </Text>
        <Input
          id={name}
          type={"file"}
          // @ts-ignore
          onClick={() => inputRef!.current?.click()}
          // value={value.name}
          focusBorderColor="gray.500"
          cursor={"pointer"}
          color="text.500"
          display="none"
        />
      </InputGroup>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

export default FileUpload;
