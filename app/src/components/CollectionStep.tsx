import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import FileUpload from "./FileUpload";
import { useWallet } from "@solana/wallet-adapter-react";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  symbol: yup.string().required("Symbol is required"),
  description: yup.string().required("Description is required"),
  image: yup.mixed().test("required", "Image is required", (file) => {
    if (file) return true;
    return false;
  }),
});

interface Props {
  data: any;
  setData: (data: any) => void;
  setActiveStep: any;
}

const CollectionStep: React.FC<Props> = ({ data, setData, setActiveStep }) => {
  const { connected } = useWallet();
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    resetField,
    reset,
    watch,
    clearErrors,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: data?.name || "",
      symbol: data?.symbol || "",
      description: data?.description || "",
      image: data?.image || "",
    },
  });
  const onSubmit = (data: any) => {
    setData(data);
    setActiveStep(1);
  };
  return (
    <>
      <Flex
        mt="4"
        flexDir={["column", "column", "row", "row", "row"]}
        // alignItems={"center"}
        justifyContent={"space-between"}
        w={"full"}
      >
        <Flex w="full" flexDir={"column"}>
          <FormControl isInvalid={!!errors.name}>
            <Input
              color={"text.900"}
              placeholder="Collection Name"
              w="full"
              {...register("name")}
              autoComplete="off"
            />
          </FormControl>
          <FormControl isInvalid={!!errors.symbol}>
            <Input
              color={"text.900"}
              placeholder="Collection Symbol"
              w="full"
              mt="4"
              {...register("symbol")}
              autoComplete="off"
            />
          </FormControl>
          <FormControl isInvalid={!!errors.description}>
            <Textarea
              color={"text.900"}
              placeholder="Collection Description"
              mt="4"
              h={["initial", "initial", "136px", "136px", "160px"]}
              {...register("description")}
            />
          </FormControl>
        </Flex>
        <Flex
          w={["full", "full", "sm", "md"]}
          mt={["4", "4", "0"]}
          justifyContent={[
            "center",
            "center",
            "flex-end",
            "flex-end",
            "flex-end",
          ]}
        >
          <Controller
            name={"image"}
            control={control}
            defaultValue=""
            render={({ field: { name, value } }) => (
              <FileUpload
                acceptedFileTypes={"image/png,image/jpg"}
                error={errors.image?.message as string}
                name={name}
                value={value}
                defaultValue=""
                onChange={(e) => setValue("image", e.target.files[0])}
                reset={() => {
                  resetField("image");
                  setValue("image", undefined);
                }}
              />
            )}
          />
        </Flex>
      </Flex>
      <Button
        isDisabled={!connected}
        cursor={connected ? "pointer" : "not-allowed"}
        mt="6"
        w="full"
        variant={"primary"}
        onClick={connected ? handleSubmit(onSubmit) : () => {}}
      >
        {connected ? `Next` : "Connect Wallet"}
      </Button>
    </>
  );
};

export default CollectionStep;
