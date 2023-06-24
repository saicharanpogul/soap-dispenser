import React from "react";
import { Select, ChakraStylesConfig, components } from "chakra-react-select";
import { Control, Controller, FieldValues } from "react-hook-form";
import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  Image,
} from "@chakra-ui/react";
import { colors } from "@/styles/theme";

const { Option } = components;

const chakraStyles: ChakraStylesConfig = {
  control: (styles) => ({
    ...styles,
    backgroundColor: colors.background[100],
    color: colors.text[900],
    boxShadow: `0 0 0 1px ${colors.background[100]}`,
    borderColor: colors.text[900],
    ":active": {
      borderColor: colors.text[100],
    },
    ":hover": {
      borderColor: colors.text[900],
    },
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => ({
    ...styles,
    padding: "0 6px",
    backgroundColor: isSelected
      ? colors.background[100]
      : colors.background[500],
    color: colors.text[500],
    ":hover": {
      backgroundColor: colors.background[900],
    },
    borderColor: colors.text[100],
  }),
  input: (styles) => ({
    ...styles,
    color: colors.text[900],
  }),
  placeholder: (styles) => ({ ...styles, color: "#718096" }),
  menuList: (styles) => ({
    ...styles,
    backgroundColor: colors.background[500],
  }),
  singleValue: (styles) => ({ ...styles, color: colors.text[900] }),
  dropdownIndicator: (styles) => ({
    ...styles,
    backgroundColor: colors.background[500],
  }),
};

const CustomOption = (props: any) => {
  const { icon, label } = props?.data;
  return (
    <Option {...props} getStyles={chakraStyles.option}>
      <Flex justifyContent={"space-between"} alignItems="center" py="2" px="1">
        <span>{label}</span>
        {icon && (
          <Image
            alt="icon"
            src={icon}
            width="4"
            height="4"
            borderRadius={"full"}
          />
        )}
      </Flex>
    </Option>
  );
};

interface Props {
  options: any;
  name: string;
  placeholder: string;
  error: string;
  control: Control<FieldValues, any> | undefined;
  selectProps: any;
  defaultValueIndex?: number;
}

// eslint-disable-next-line react/display-name
const CustomSelect: React.FC<Props> = React.forwardRef(
  ({
    options,
    control,
    name,
    placeholder,
    error,
    selectProps,
    defaultValueIndex,
    ...props
  }) => {
    return (
      <Box {...props}>
        <Controller
          control={control}
          name={name}
          render={({
            field: { onChange, onBlur, value, name },
            fieldState: { error },
          }) => (
            <FormControl isInvalid={!!error}>
              <Select
                name={name}
                // @ts-ignore
                onChange={(val) => onChange(val?.value)}
                onBlur={onBlur}
                value={value.value}
                defaultValue={options[defaultValueIndex as number]}
                placeholder={placeholder}
                closeMenuOnSelect={true}
                options={options}
                components={{ Option: CustomOption }}
                chakraStyles={chakraStyles}
                {...selectProps}
              />

              <FormErrorMessage>{error && error.message}</FormErrorMessage>
            </FormControl>
          )}
        />
      </Box>
    );
  }
);

export default CustomSelect;
