import { defineStyleConfig } from "@chakra-ui/react";

const Button = defineStyleConfig({
  // Styles for the base style
  baseStyle: {},
  // Styles for the size variations
  sizes: {},
  // Styles for the visual style variations
  variants: {
    primary: {
      backgroundColor: "background.100",
      color: "text.900",
      _hover: {
        backgroundColor: "background.100",
      },
      _active: {
        backgroundColor: "background.100",
      },
    },
  },
  // The default `size` or `variant` values
  defaultProps: {},
});

export default Button;
