import {
  createMultiStyleConfigHelpers,
  defineStyleConfig,
} from "@chakra-ui/react";

const helpers = createMultiStyleConfigHelpers([
  "dialog",
  "overlay",
  "dialogContainer",
  "header",
  "closeButton",
  "body",
  "footer",
]);

export default helpers.defineMultiStyleConfig({
  // Styles for the base style
  baseStyle: {
    dialog: {
      backgroundColor: "background.100",
      color: "text.900",
    },
    footer: {
      button: {
        backgroundColor: "background.500",
        color: "text.900",
        _hover: {
          backgroundColor: "background.500",
        },
      },
    },
  },
  // Styles for the size variations
  sizes: {},
  // Styles for the visual style variations
  variants: {},
  // The default `size` or `variant` values
  defaultProps: {},
});
