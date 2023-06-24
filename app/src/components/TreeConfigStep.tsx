import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import CustomSelect from "./CustomSelect";
import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { treeDetails } from "@/constants";
import FileUpload from "./FileUpload";
import isEqual from "lodash/isEqual";

interface Props {
  data: any;
  setData: (data: any) => void;
  setActiveStep: any;
}

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  symbol: yup.string().required("Symbol is required"),
  description: yup.string().required("Description is required"),
  image: yup.mixed().test("required", "Image is required", (file) => {
    if (file) return true;
    return false;
  }),
  tree: yup
    .object()
    .shape({
      maxDepth: yup.number().required(""),
      maxBufferSize: yup.number().required(""),
    })
    .typeError("Select the tree config.")
    .required("Tree Config is required."),
});

const TreeConfigStep: React.FC<Props> = ({ data, setData, setActiveStep }) => {
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
      tree: {
        maxBufferSize: data?.tree?.maxBufferSize || undefined,
        maxDepth: data?.tree?.maxDepth || undefined,
      },
    },
  });
  const onSubmit = (data: any) => {
    setData(data);
    setActiveStep(2);
  };
  return (
    <Box mb="20" w="full">
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
              placeholder="SOAP Name"
              w="full"
              {...register("name")}
              autoComplete="off"
            />
          </FormControl>
          <FormControl isInvalid={!!errors.symbol}>
            <Input
              color={"text.900"}
              placeholder="SOAP Symbol"
              w="full"
              mt="4"
              {...register("symbol")}
              autoComplete="off"
            />
          </FormControl>
          <FormControl isInvalid={!!errors.description}>
            <Textarea
              color={"text.900"}
              placeholder="SOAP Description"
              mt="4"
              h={["initial", "initial", "136px", "136px", "160px"]}
              {...register("description")}
            />
          </FormControl>
          <CustomSelect
            placeholder="Tree Size"
            w="full"
            mt="4"
            {...register("tree")}
            // @ts-ignore
            control={control}
            options={treeDetails.map((tree) => ({
              value: {
                maxDepth: tree.maxDepth,
                maxBufferSize: tree.maxBufferSize,
              },
              label: `mints: ${tree.mints} | Max Depth: ${tree.maxDepth} | Max Buffer Size: ${tree.maxBufferSize} | Size: ${tree.size}`,
            }))}
            defaultValueIndex={(() => {
              const options = treeDetails.map((tree) => ({
                value: {
                  maxDepth: tree.maxDepth,
                  maxBufferSize: tree.maxBufferSize,
                },
                label: `mints: ${tree.mints} | Max Depth: ${tree.maxDepth} | Max Buffer Size: ${tree.maxBufferSize} | Size: ${tree.size}`,
              }));
              const index = options.findIndex((option) =>
                isEqual(
                  {
                    maxBufferSize: option.value.maxBufferSize,
                    maxDepth: option.value.maxDepth,
                  },
                  {
                    maxBufferSize: data?.tree?.maxBufferSize,
                    maxDepth: data?.tree?.maxDepth,
                  }
                )
              );
              console.log("aa", options[index]);
              return index;
            })()}
          />
          <Flex justifyContent={"space-between"} w="full">
            <Text
              color="gray.500"
              mt="2"
              fontSize={"12"}
            >{`Don't know which to choose?`}</Text>
            <Text
              color="primary.500"
              mt="2"
              fontSize={"12"}
              textDecoration={"underline"}
              cursor={"pointer"}
              onClick={() => window.open("https://compressed.app/")}
            >{`Check here`}</Text>
          </Flex>
          <Text color="gray.500" mt="2" fontSize={"12"}>
            {"Start Date & End Date Config Coming Soon..."}
          </Text>
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
          alignItems={"center"}
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
      <Flex justifyContent={"space-between"} w="full">
        <Button
          mt="6"
          w="46%"
          variant={"primary"}
          onClick={() => setActiveStep(0)}
        >
          Previous
        </Button>
        <Button
          mt="6"
          w="46%"
          variant={"primary"}
          onClick={handleSubmit(onSubmit)}
        >
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default TreeConfigStep;
