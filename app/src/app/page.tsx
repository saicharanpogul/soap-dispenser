"use client";

import Navbar from "@/components/Navbar";
import {
  Box,
  Button,
  Flex,
  FormControl,
  Heading,
  Input,
  Select,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Text,
  Textarea,
  useSteps,
  useToast,
} from "@chakra-ui/react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import FileUpload from "@/components/FileUpload";
import { treeDetails } from "@/constants";
import CustomSelect from "@/components/CustomSelect";
import { colors } from "@/styles/theme";
import CollectionStep from "@/components/CollectionStep";
import { useState } from "react";
import TreeConfigStep from "@/components/TreeConfigStep";
import ReviewStep from "@/components/ReviewStep";
import useDispenser from "@/hooks/useDispenser";

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

const initialState = {
  collection: {
    name: "",
    symbol: "",
    description: "",
    image: "",
  },
  treeConfig: {
    name: "",
    symbol: "",
    description: "",
    image: "",
    tree: {
      maxDepth: 0,
      maxBufferSize: 0,
    },
  },
};

export default function Home() {
  const [initConfig, setInitConfig] = useState(initialState);
  const toast = useToast();
  const { init } = useDispenser();

  const {
    activeStep,
    isActiveStep,
    isCompleteStep,
    isIncompleteStep,
    setActiveStep,
  } = useSteps({
    index: 0,
    count: 3,
  });

  const initSoap = async () => {
    try {
      console.log(initConfig);
      const result = await init({
        maxDepth: initConfig.treeConfig.tree.maxDepth,
        maxBufferSize: initConfig.treeConfig.tree.maxBufferSize,
        endDate: null,
        startDate: null,
        isPublic: false,
      });
      return result?.dispenser;
    } catch (error: any) {
      throw error;
    }
  };

  const reset = () => {
    setInitConfig(initialState);
  };

  const steps = [
    {
      title: "Collection",
      component: (
        <CollectionStep
          data={initConfig.collection}
          setData={(data) => setInitConfig({ ...initConfig, collection: data })}
          setActiveStep={setActiveStep}
        />
      ),
    },
    {
      title: "Config",
      component: (
        <TreeConfigStep
          data={initConfig.treeConfig}
          setData={(data) => setInitConfig({ ...initConfig, treeConfig: data })}
          setActiveStep={setActiveStep}
        />
      ),
    },
    {
      title: "Review",
      component: (
        <ReviewStep
          data={initConfig}
          create={initSoap}
          setActiveStep={setActiveStep}
          reset={reset}
        />
      ),
    },
  ];

  return (
    <Flex alignItems={"center"} flexDir={"column"}>
      <Navbar />
      <Flex
        w={["94%", "94%", "94%", "60%", "70%"]}
        alignItems={"center"}
        flexDir={"column"}
        mt="24"
      >
        <Text fontSize={"20"} color="text.500" fontWeight={"semibold"}>
          Create Soap Dispenser
        </Text>

        <Stepper
          index={activeStep}
          size={["xs", "sm"]}
          mt="4"
          colorScheme="white"
        >
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator color={"white"} borderColor={"gray"}>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle
                  style={{
                    color: "white",
                  }}
                >
                  {step.title}
                </StepTitle>
              </Box>
              <StepSeparator
                style={{ backgroundColor: "gray", width: "20px" }}
              />
            </Step>
          ))}
        </Stepper>
        <Flex flexDirection="column" width={"full"} alignItems={"center"}>
          {steps[activeStep].component}
        </Flex>
      </Flex>
    </Flex>
  );
}
